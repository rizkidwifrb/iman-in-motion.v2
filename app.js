// app.js - IMAN IN MOTION + AIMAN Friend-RAG Upgrade
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const GROQ_KEY = process.env.GROQ_API_KEY;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'public');

// Serve React build first when available. Keep old public folder as fallback/assets.
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.use(express.static(publicPath));

// =========================
// Film database
// =========================
let FILMS = [];
const csvPath = path.join(__dirname, 'df_processed.csv');
if (fs.existsSync(csvPath)) {
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      if (row.title_asli || row.title || row.title_en) {
        FILMS.push({
          title: row.title_asli || row.title || row.title_en,
          title_en: row.title_en || '',
          year: row.year || '',
          genres: row.genres || '',
          cast: row.cast || '',
          poster: row.poster_url || row.poster || '',
          overview: row.overview || '',
          rating: Number(row.rating || 0),
          mood: (row.mood || '').toLowerCase(),
          reason: row.reason || 'Film yang menenangkan hati'
        });
      }
    })
    .on('end', () => console.log(`[OK] ${FILMS.length} film loaded`))
    .on('error', (e) => console.error('[ERROR] CSV:', e.message));
} else {
  console.warn('[WARN] df_processed.csv tidak ditemukan');
}

// =========================
// RAG Meta: Quran/Hadith/Text retrieval
// =========================
let RAG_DOCS = [];
const ragJsonPath = path.join(__dirname, 'data', 'rag_meta.json');
try {
  if (fs.existsSync(ragJsonPath)) {
    RAG_DOCS = JSON.parse(fs.readFileSync(ragJsonPath, 'utf8')).map((d) => ({
      ref: d.ref || '',
      type: d.type || 'text',
      arab: d.arab || '',
      text: d.text || '',
      search: normalize(`${d.ref || ''} ${d.type || ''} ${d.text || ''}`)
    }));
    console.log(`[OK] ${RAG_DOCS.length} RAG documents loaded`);
  } else {
    console.warn('[WARN] data/rag_meta.json tidak ditemukan. AIMAN tetap jalan tanpa RAG.');
  }
} catch (e) {
  console.error('[ERROR] RAG load:', e.message);
}

const STOPWORDS = new Set([
  'aku','saya','gue','gw','lagi','banget','bgt','yang','dan','atau','di','ke','dari','ini','itu','untuk','buat','dengan','karena','kalo','kalau','kok','ya','dong','deh','aja','nih','sih','pun','adalah','jadi','dalam','pada','sebagai','mau','ingin','pengen','butuh'
]);


const RAG_ANCHORS = {
  gelisah: ["QS. Ar-Ra'd 13:28", 'QS. Al-Baqarah 2:38', 'QS. Az-Zumar 39:23'],
  sedih: ['QS. At-Taubah 9:40', 'QS. Yusuf 12:86', 'QS. Fussilat 41:30', 'QS. Al-Baqarah 2:153'],
  hidayah: ['QS. Az-Zumar 39:53', 'QS. Al-Baqarah 2:2', 'QS. Al-Fatihah 1:6'],
  marah: ["QS. Ali 'Imran 3:134", 'Bukhari 5649', 'Abu Dawud 4151'],
  bahagia: ['QS. Ibrahim 14:7', 'QS. Ad-Duha 93:11'],
  rindu: ['QS. Al-Baqarah 2:156', "QS. Ar-Ra'd 13:28"]
};

const MOOD_PROFILES = {
  sedih: {
    keywords: ['sedih','galau','down','nangis','menangis','kecewa','hancur','capek','lelah','sendiri','sepi','patah','terpuruk','sakit hati'],
    rag: ['sabar','kesedihan','rahmat','jangan bersedih','pertolongan allah','tenang']
  },
  gelisah: {
    keywords: ['gelisah','cemas','takut','khawatir','overthinking','panik','stress','stres','resah','pikiran','tak tenang','tidak tenang'],
    rag: ['zikir','hati tenang','tawakal','takut','cemas','perlindungan']
  },
  hidayah: {
    keywords: ['hidayah','hijrah','taubat','tobat','dosa','berubah','dekat allah','shalat','ibadah','iman','bingung arah'],
    rag: ['ampunan','taubat','petunjuk','hidayah','rahmat','kembali']
  },
  bahagia: {
    keywords: ['bahagia','senang','happy','syukur','alhamdulillah','lega','bersyukur','nikmat','tenang'],
    rag: ['syukur','nikmat','alhamdulillah','karunia','kebaikan']
  },
  marah: {
    keywords: ['marah','kesal','emosi','benci','jengkel','dongkol','muak','tersinggung','sakit hati'],
    rag: ['menahan marah','sabar','memaafkan','lemah lembut','amarah']
  },
  rindu: {
    keywords: ['rindu','kangen','kehilangan','jauh','ditinggal','angen','kangen banget'],
    rag: ['doa','cinta','pertemuan','sabar','kehilangan']
  }
};

function normalize(s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function tokensOf(text) {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 28);
}

function detectMood(message = '') {
  const n = normalize(message);
  let best = { mood: 'tenang', score: 0 };
  for (const [mood, profile] of Object.entries(MOOD_PROFILES)) {
    let score = 0;
    for (const kw of profile.keywords) {
      if (n.includes(normalize(kw))) score += kw.includes(' ') ? 3 : 1;
    }
    if (score > best.score) best = { mood, score };
  }
  return best.mood;
}

function moodIntensity(message = '') {
  const n = normalize(message);
  let score = 1;
  if (/banget|bgt|parah|hancur|tak kuat|ga kuat|gak kuat|cape banget|capek banget/.test(n)) score += 1;
  if (/nangis|panik|takut|sendiri|kosong|putus asa/.test(n)) score += 1;
  return Math.min(score, 3);
}

function isCrisis(message = '') {
  const n = normalize(message);
  return /(bunuh diri|mengakhiri hidup|akhiri hidup|pengen mati|ingin mati|mau mati|self harm|nyakitin diri|menyakiti diri|hidup ga ada arti|hidup gak ada arti)/.test(n);
}

function isDalilIntent(message = '') {
  const n = normalize(message);
  return /(dalil|ayat|quran|alquran|al quran|surat|surah|hadis|hadits|hadith|sabda|doa|dzikir|zikir|hukum islam|pandangan islam)/.test(n);
}

function isHadithIntent(message = '') {
  const n = normalize(message);
  return /(hadis|hadits|hadith|sabda|rasul|nabi)/.test(n);
}

function buildDalilReferenceBlock(ragDocs = []) {
  if (!ragDocs.length) return 'Belum ada dalil yang cocok dari basis data RAG.';
  return ragDocs.map((d, i) => {
    const label = d.type === 'hadith' ? 'Hadits' : d.type === 'quran' ? 'Ayat' : 'Referensi';
    return `${i + 1}. ${label}: ${d.ref || '-'}\nArab: ${d.arab || '-'}\nArti/teks: ${d.text || '-'}`;
  }).join('\n\n');
}

function retrieveRag(message = '', mood = 'tenang', limit = 5) {
  if (!RAG_DOCS.length) return [];
  const baseTokens = tokensOf(message);
  const moodTerms = MOOD_PROFILES[mood]?.rag || [];
  const expanded = [...new Set([...baseTokens, ...moodTerms.map(normalize).flatMap((x) => x.split(' ')).filter(Boolean)])]
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 34);

  const scored = [];
  for (const doc of RAG_DOCS) {
    let score = 0;
    for (const t of expanded) {
      if (doc.search.includes(t)) score += 1;
    }
    if (mood === 'gelisah' && /(tenang|tenteram|tawakal|zikir|takut)/.test(doc.search)) score += 2;
    if (mood === 'sedih' && /(sedih|sabar|rahmat|pertolongan|jangan bersedih)/.test(doc.search)) score += 2;
    if (mood === 'hidayah' && /(taubat|ampunan|petunjuk|hidayah|kembali)/.test(doc.search)) score += 2;
    if (mood === 'marah' && /(marah|sabar|memaafkan|menahan)/.test(doc.search)) score += 2;
    const anchors = RAG_ANCHORS[mood] || [];
    const anchorIndex = anchors.indexOf(doc.ref);
    if (anchorIndex !== -1) score += 80 - anchorIndex;
    if (doc.type === 'quran') score += 2;
    if (isDalilIntent(message) && doc.type === 'quran') score += 3;
    if (isHadithIntent(message) && doc.type === 'hadith') score += 10;
    if (score > 0) scored.push({ doc, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc }) => ({
      ref: doc.ref,
      type: doc.type,
      arab: doc.arab,
      text: doc.text.length > 420 ? `${doc.text.slice(0, 420)}...` : doc.text
    }));
}

function recommendedFilms(mood) {
  const related = {
    sedih: ['sedih', 'hidayah', 'rindu'],
    gelisah: ['gelisah', 'hidayah', 'sedih'],
    hidayah: ['hidayah', 'sedih', 'gelisah'],
    bahagia: ['bahagia', 'hidayah'],
    marah: ['marah', 'hidayah', 'gelisah'],
    rindu: ['rindu', 'sedih', 'hidayah'],
    tenang: ['hidayah', 'bahagia', 'sedih']
  }[mood] || ['hidayah'];

  return FILMS
    .map((f) => {
      const fm = normalize(f.mood || '');
      const moodScore = related.some((r) => fm.includes(r)) ? 3 : fm.includes(mood) ? 4 : 0;
      const ratingScore = Math.min(Number(f.rating || 0), 10) / 10;
      const posterScore = f.poster ? 0.35 : -0.35;
      const overviewScore = f.overview ? 0.15 : 0;
      return { ...f, _score: moodScore + ratingScore + posterScore + overviewScore };
    })
    .filter((f) => f._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 3)
    .map(({ _score, ...f }) => f);
}

function buildFallbackReply(message, mood, ragDocs, films) {
  const opener = {
    sedih: 'Aku dengerin, ya. Sedih itu nggak harus buru-buru hilang. Kadang hati cuma butuh ditemani dulu sebelum bisa kuat lagi.',
    gelisah: 'Aku paham. Kalau pikiran lagi rame, semuanya bisa terasa numpuk. Kita pelanin dulu, satu napas demi satu napas.',
    hidayah: 'MasyaAllah, keinginan buat berubah itu sudah langkah yang berharga. Nggak harus langsung sempurna, yang penting mulai pelan-pelan.',
    bahagia: 'Alhamdulillah, ikut senang dengernya. Rasa bahagia juga bisa jadi pintu syukur kalau kita sadar dari mana nikmat itu datang.',
    marah: 'Wajar kalau emosi naik. Tapi sebelum bereaksi, kita kasih jeda dulu supaya keputusanmu nggak dikendalikan amarah.',
    rindu: 'Rindu memang bisa terasa hangat sekaligus nyesek. Kadang ia datang karena ada hal yang pernah sangat berarti buat kita.',
    tenang: 'Aku di sini. Cerita aja pelan-pelan, nggak perlu dirapikan dulu.'
  }[mood] || 'Aku di sini. Cerita aja pelan-pelan.';

  const dalil = ragDocs[0]
    ? `\n\nYang bisa jadi penguat: ${ragDocs[0].ref} — ${ragDocs[0].text}`
    : '';

  const step = {
    gelisah: 'Untuk sekarang, coba tarik napas pelan, sebut satu hal yang paling mengganggu pikiranmu, lalu pisahkan mana yang bisa kamu lakukan hari ini dan mana yang perlu kamu serahkan dulu.',
    marah: 'Untuk sekarang, jangan balas apa pun dulu. Ambil jeda sebentar, minum air, lalu tanya ke diri sendiri: respons apa yang tetap bikin aku tenang setelah ini?',
    sedih: 'Untuk sekarang, cukup lakukan satu hal kecil yang membuat tubuhmu sedikit lebih aman: minum, duduk, atau hubungi satu orang yang kamu percaya.',
    hidayah: 'Untuk sekarang, pilih satu langkah kecil yang realistis: shalat tepat waktu, baca satu ayat, atau minta maaf pada satu hal yang selama ini tertunda.',
    bahagia: 'Untuk sekarang, coba ucapkan syukur dengan sadar, lalu bagikan sedikit kebaikan dari rasa lapang itu.',
    rindu: 'Untuk sekarang, jadikan rindu sebagai doa. Sebut nama yang kamu rindukan, lalu titipkan rasa itu kepada Allah.'
  }[mood] || 'Untuk sekarang, mulai dari satu langkah kecil yang bisa kamu lakukan tanpa memaksa diri.';

  const filmLine = films[0]
    ? `\n\nKalau kamu mau lanjut lewat tontonan, aku kepikiran ${films[0].title}. Film itu bisa jadi teman refleksi untuk mood kamu sekarang.`
    : '';

  return `${opener}${dalil}\n\n${step}${filmLine}`;
}

async function askGroq({ message, mood, intensity, ragDocs, films, history = [] }) {
  if (!GROQ_KEY) return null;

  const safeHistory = Array.isArray(history)
    ? history.slice(-8).map((h) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: String(h.content || '').slice(0, 600)
      }))
    : [];

  const ragContext = ragDocs.length
    ? ragDocs.map((d, i) => `${i + 1}. ${d.ref} [${d.type}]\nArab: ${d.arab || '-'}\nMakna/teks: ${d.text}`).join('\n\n')
    : 'Tidak ada konteks RAG yang relevan.';

  const filmContext = films.length
    ? films.map((f, i) => `${i + 1}. ${f.title} (${f.year || '-'}) mood=${f.mood || '-'} alasan=${f.reason || '-'}`).join('\n')
    : 'Belum ada film yang cocok.';

  const dalilIntent = isDalilIntent(message);
  const hadithIntent = isHadithIntent(message);
  const dalilReferenceBlock = buildDalilReferenceBlock(ragDocs);

  const system = `Kamu adalah AIMAN, teman ngobrol Islami dari web app IMAN IN MOTION.
Gaya bicara: bahasa Indonesia santai, hangat, responsif, seperti teman refleksi yang memahami dakwah. Boleh pakai "aku" dan "kamu". Jangan terdengar seperti template atau mesin.

Tugas utama:
1) Validasi perasaan user dulu, jangan langsung menggurui.
2) Jawab natural, rapi, dan mudah dipahami.
3) Gunakan konteks RAG hanya jika relevan. Jangan mengarang nomor ayat, hadits, atau lafaz Arab. Kalau menyebut dalil, ambil dari konteks RAG.
4) Beri pemahaman dakwah: jelaskan bagaimana ayat/hadits itu mengajak pada kebaikan, perubahan sikap, akhlak, kesabaran, syukur, tawakal, atau pengendalian diri.
5) Kalau cocok, rekomendasikan 1 film dari konteks film sebagai ruang refleksi, bukan sebagai dalil.
6) Jangan memberi fatwa berat. Untuk hukum detail, sarankan bertanya ke ustadz/ahli.
7) Kalau user menunjukkan niat menyakiti diri, utamakan keselamatan dan minta user menghubungi orang terdekat/layanan darurat.

ATURAN KHUSUS KETIKA USER MEMINTA DALIL/AYAT/HADITS/DOA/DZIKIR/PANDANGAN ISLAM:
- Wajib tampilkan jawaban dengan struktur berikut:
  **Dalil yang nyambung**
  **Ayat Arab / Hadits Arab**
  **Arti**
  **Penjelasan singkat**
  **Pemahaman dakwah**
  **Langkah kecil**
- Pada bagian "Penjelasan singkat" dan "Pemahaman dakwah", perluas makna dalil: jelaskan konteks hati user, nilai iman yang diajarkan, sikap yang perlu dibangun, dan contoh penerapannya dalam kehidupan sehari-hari.
- Jika user meminta hadits, utamakan hadits bila tersedia. Jika user meminta ayat, utamakan ayat. Bila keduanya relevan, ayat boleh menjadi penguat utama dan hadits sebagai pelengkap.
- Kalau konteks berisi ayat Arab, tampilkan lafaz Arabnya.
- Kalau konteks berisi hadits, boleh jadikan penguat setelah ayat.
- Kalau tidak ada hadits yang tepat, jangan mengarang. Cukup bilang bahwa penguat utama yang tersedia adalah ayat tersebut.
- Penjelasan jangan terlalu kaku: hubungkan dalil dengan kondisi hati user.

Mood terdeteksi: ${mood}. Intensitas: ${intensity}/3.
User sedang minta dalil/teks Islam: ${dalilIntent ? 'ya' : 'tidak'}. User sedang minta hadits: ${hadithIntent ? 'ya' : 'tidak'}.

Konteks dalil RAG yang boleh digunakan:
${dalilReferenceBlock}

Konteks film:
${filmContext}

Akhiri respons dengan tag metadata persis: [MOOD:${mood}] [FILM:${films[0]?.title || ''}]`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: system },
        ...safeHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.82,
      top_p: 0.9,
      max_tokens: 650
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Groq ${response.status}: ${text.slice(0, 120)}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

// =========================
// Routes
// =========================
function sendFrontend(req, res) {
  const reactIndex = path.join(distPath, 'index.html');
  if (fs.existsSync(reactIndex)) return res.sendFile(reactIndex);
  return res.sendFile(path.join(publicPath, 'index.html'));
}

app.get('/', sendFrontend);
app.get('/aiman', sendFrontend);
app.get('/aiman.html', (req, res) => res.redirect('/aiman'));
app.get('/api/movies', (req, res) => res.json(FILMS));
app.get('/api/rag/search', (req, res) => {
  const q = String(req.query.q || '');
  const mood = detectMood(q);
  res.json({ mood, results: retrieveRag(q, mood, 8) });
});
app.get('/health', (req, res) => res.json({ status: 'ok', films: FILMS.length, rag: RAG_DOCS.length, groq: !!GROQ_KEY }));

// AIMAN chat v2
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body || {};
  const cleanMessage = String(message || '').trim().slice(0, 2000);
  if (!cleanMessage) return res.status(400).json({ reply: 'Pesan kosong', mood: 'tenang', films: [] });

  const mood = detectMood(cleanMessage);
  const intensity = moodIntensity(cleanMessage);
  const ragDocs = retrieveRag(cleanMessage, mood, 5);
  const films = recommendedFilms(mood);

  if (isCrisis(cleanMessage)) {
    return res.json({
      mood,
      intensity,
      rag: ragDocs,
      films,
      reply: `Aku serius dengerin kamu, dan aku nggak mau kamu sendirian di titik ini. Tolong hubungi orang terdekat sekarang, misalnya keluarga, teman, guru, atau ustadz yang bisa datang/telepon kamu. Kalau ada risiko kamu menyakiti diri, segera hubungi layanan darurat setempat atau pergi ke IGD terdekat.\n\nSambil nunggu bantuan, jauhkan dulu benda yang bisa membahayakan, duduk di tempat yang ramai/terang, dan kirim satu pesan singkat ke orang terdekat: “Aku lagi nggak aman sendirian, tolong temani aku sekarang.” Aku tetap di sini nemenin kamu ngobrol pelan-pelan. [MOOD:${mood}] [FILM:]`
    });
  }

  let reply = '';
  try {
    reply = await askGroq({ message: cleanMessage, mood, intensity, ragDocs, films, history });
  } catch (e) {
    console.error('[WARN] Groq fallback:', e.message);
  }

  if (!reply) {
    if (isDalilIntent(cleanMessage) && ragDocs.length) {
      const main = ragDocs[0];
      const hadith = ragDocs.find((d) => d.type === 'hadith');
      const hadithLine = hadith && hadith.ref !== main.ref
        ? `\n\n**Penguat hadits**\n${hadith.ref}\n${hadith.arab || ''}\n${hadith.text || ''}`
        : '';
      reply = `**Dalil yang nyambung**\n${main.ref}\n\n**Ayat Arab / Hadits Arab**\n${main.arab || '-'}\n\n**Arti**\n${main.text || '-'}\n\n**Penjelasan singkat**\nDalil ini mengarahkan hati untuk melihat keadaan yang kamu ceritakan dengan lebih tenang. Islam tidak hanya memberi nasihat, tapi juga mengajak kita mengelola rasa dengan iman, sabar, syukur, tawakal, dan akhlak yang baik.\n\n**Pemahaman dakwah**\nDalam dakwah, dalil seperti ini bisa menjadi jembatan: bukan memaksa orang langsung kuat, tapi menuntun pelan-pelan agar hati kembali dekat kepada Allah dan tindakan kita tetap terarah.\n\n**Langkah kecil**\nAmbil satu langkah yang ringan dulu: tenangkan napas, baca ulang maknanya, lalu pilih satu amal kecil yang bisa kamu lakukan hari ini.${hadithLine} [MOOD:${mood}] [FILM:${films[0]?.title || ''}]`;
    } else {
      reply = `${buildFallbackReply(cleanMessage, mood, ragDocs, films)} [MOOD:${mood}] [FILM:${films[0]?.title || ''}]`;
    }
  }

  res.json({
    reply,
    mood,
    intensity,
    rag: ragDocs,
    films
  });
});

// React SPA fallback. API routes above stay untouched.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') return next();
  return sendFrontend(req, res);
});

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
  console.log(`[OK] Groq ready: ${!!GROQ_KEY}`);
});
