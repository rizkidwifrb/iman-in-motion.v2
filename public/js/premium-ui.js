import { detectMoodFromText, getRecommendations, normalizeMovie, saveUserInteraction, getUserHistory, MoodLabels } from './recommendation-engine.js';

const MOODS = [
  { key:'sedih', label:'Sedih', icon:'☔', tone:'#60a5fa', desc:'Blue, soft rain, calming', text:'Untuk hati yang sedang pelan dan butuh ditemani.' },
  { key:'gelisah', label:'Gelisah', icon:'◌', tone:'#a78bfa', desc:'Violet/teal, calming breath', text:'Untuk pikiran ramai yang perlu ruang bernapas.' },
  { key:'hidayah', label:'Hidayah', icon:'✦', tone:'#d4af37', desc:'Gold/light, spiritual clarity', text:'Untuk perjalanan batin, hijrah, dan arah hidup.' },
  { key:'bahagia', label:'Bahagia', icon:'✺', tone:'#14b8a6', desc:'Emerald/warm, gratitude', text:'Untuk syukur, kehangatan, dan energi baik.' },
  { key:'marah', label:'Marah', icon:'◆', tone:'#f97316', desc:'Red/orange, controlled emotion', text:'Untuk emosi kuat yang ingin diredakan dengan bijak.' },
  { key:'rindu', label:'Rindu', icon:'♡', tone:'#fb7185', desc:'Rose/gold, nostalgic warmth', text:'Untuk kenangan, jarak, keluarga, dan rasa pulang.' }
];
const QUICK = ['Aku lagi sedih','Aku butuh hidayah','Aku lagi gelisah','Aku sedang rindu','Aku ingin film yang menenangkan'];
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const esc = (value='') => String(value ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
let movies = [];
let currentMood = localStorage.getItem('iman_last_mood') || 'bahagia';
let lastFocused = null;

function toast(message) {
  if (typeof window.toast === 'function') return window.toast(message);
  const root = $('#toastContainer'); if (!root) return;
  const item = document.createElement('div'); item.className = 'toast'; item.textContent = message; root.appendChild(item); setTimeout(() => item.remove(), 2600);
}
function fallbackPoster(title='Film') { return `https://placehold.co/500x750/07120f/d4af37?text=${encodeURIComponent(title)}`; }
function moodLabel(mood) { return MoodLabels?.[mood] || MOODS.find((m) => m.key === mood)?.label || 'Bahagia'; }

function cleanNavigation() {
  const nav = $('.nav'); if (!nav) return;
  nav.innerHTML = '<a href="#main">Home</a><a href="#mood-selector">Mood</a><a href="#rekomendasi">Film</a><a href="artikel.html">Artikel</a><a href="#cara-aiman">Cara AIMAN</a><a href="info.html">Info</a>';
  nav.id = nav.id || 'mainNav';
  $('#menuToggle')?.setAttribute('aria-expanded', 'false');
  $('#menuToggle')?.addEventListener('click', () => {
    nav.classList.toggle('open');
    $('#menuToggle')?.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  }, true);
  $$('a[href^="#"]', nav).forEach((a) => a.addEventListener('click', (event) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    event.preventDefault(); nav.classList.remove('open'); $('#menuToggle')?.setAttribute('aria-expanded', 'false');
    target.scrollIntoView({ behavior:'smooth', block:'start' });
  }));
}
function enhanceHero() {
  const hero = $('.hero-content-centered'); if (!hero) return;
  const title = $('#heroTitle'); const sub = $('.subheadline');
  if (title) title.textContent = 'Temukan film dakwah yang cocok dengan suasana hatimu.';
  if (sub) sub.textContent = 'Ceritakan perasaanmu, lalu AIMAN akan membantu memilih rekomendasi film yang menenangkan, menguatkan, dan bermakna.';
  if (!$('.hero-kicker', hero)) hero.insertAdjacentHTML('afterbegin', '<div class="hero-kicker">Film dakwah berbasis mood</div>');
  if (!$('.hero-actions-premium', hero)) {
    sub?.insertAdjacentHTML('afterend', `<div class="hero-actions-premium"><button class="iim-btn iim-btn-primary" data-focus-chat>Ceritakan Mood</button><button class="iim-btn iim-btn-gold" data-scroll-mood>Pilih Mood Cepat</button><button class="iim-btn" data-scroll-reco>Lihat Rekomendasi</button></div>`);
  }
  $('[data-focus-chat]')?.addEventListener('click', () => $('#miniChatInput')?.focus());
  $('[data-scroll-mood]')?.addEventListener('click', () => $('#mood-selector')?.scrollIntoView({ behavior:'smooth', block:'center' }));
  $('[data-scroll-reco]')?.addEventListener('click', () => $('#rekomendasi')?.scrollIntoView({ behavior:'smooth', block:'start' }));
}
function enhanceMiniChat() {
  const chat = $('#miniChat'); const bubbles = $('#miniChatBubbles'); const form = $('#miniChatForm'); const input = $('#miniChatInput');
  if (!chat || !bubbles || !form || !input) return;
  chat.classList.add('iim-chat-shell');
  input.placeholder = 'Tulis perasaanmu hari ini...';
  input.setAttribute('aria-label', 'Tulis perasaanmu hari ini');
  $('#micBtn')?.setAttribute('aria-label', 'Input suara AIMAN');
  if (!$('.mini-chat-title', chat)) chat.insertAdjacentHTML('afterbegin', '<div class="mini-chat-title"><div><strong>AIMAN menemani mood kamu</strong><span>AIMAN akan memahami mood kamu dan memilihkan film yang cocok.</span></div><span aria-hidden="true">✦</span></div>');
  if (!$('.quick-replies', chat)) {
    const quick = document.createElement('div'); quick.className = 'quick-replies';
    quick.innerHTML = QUICK.map((q) => `<button type="button">${esc(q)}</button>`).join('');
    bubbles.insertAdjacentElement('beforebegin', quick);
    quick.addEventListener('click', (e) => { const btn = e.target.closest('button'); if (!btn) return; input.value = btn.textContent; form.requestSubmit(); });
  }
  form.addEventListener('submit', handleMiniChatSubmit, true);
}
function addBubble(type, html, asHtml=false) {
  const bubbles = $('#miniChatBubbles'); if (!bubbles) return null;
  const node = document.createElement('div'); node.className = `iim-bubble ${type}`;
  if (asHtml) node.innerHTML = html; else node.textContent = html;
  bubbles.appendChild(node); bubbles.scrollTo({ top:bubbles.scrollHeight, behavior:'smooth' }); return node;
}
async function handleMiniChatSubmit(event) {
  event.preventDefault(); event.stopImmediatePropagation();
  const input = $('#miniChatInput'); const text = input?.value.trim(); if (!input || !text) return;
  addBubble('user', text); input.value = '';
  const typing = addBubble('bot', '<span class="iim-typing"><i></i><i></i><i></i></span>', true);
  try {
    const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ message:text }) });
    const data = await res.json(); typing?.remove();
    const mood = data.mood || detectMoodFromText(text).mood; currentMood = mood; localStorage.setItem('iman_last_mood', mood); saveUserInteraction('mood', mood);
    const reply = String(data.reply || 'Aku mendengarmu.').replace(/\[MOOD:.*?\]|\[FILM:.*?\]/gi, '').trim();
    addBubble('bot', `${reply}\n\nAku juga sudah siapkan rekomendasi film di bawah.`, false);
    selectMood(mood, false); renderRecommendations({ mood, query:text });
    $('#rekomendasi')?.scrollIntoView({ behavior:'smooth', block:'start' });
  } catch (_) {
    typing?.remove(); addBubble('bot', 'AIMAN lagi sulit merespons, tapi kamu tetap bisa pilih mood secara manual.');
  }
}
function buildMoodSelector() {
  let section = $('#mood-selector');
  if (!section) {
    section = document.createElement('section'); section.id = 'mood-selector'; section.className = 'mood-selector-premium';
    $('.hero')?.insertAdjacentElement('afterend', section);
  }
  section.innerHTML = `<div class="mood-grid-premium">${MOODS.map((m) => `<button type="button" class="mood-card-premium" data-mood="${m.key}" style="--tone:${m.tone}" aria-label="Pilih mood ${m.label}"><div class="mood-icon">${m.icon}</div><strong>${m.label}</strong><p>${m.text}</p><p>${m.desc}</p></button>`).join('')}</div><div class="mood-explanation" id="moodExplanation" aria-live="polite"></div>`;
  section.addEventListener('click', (e) => { const card = e.target.closest('[data-mood]'); if (!card) return; selectMood(card.dataset.mood, true); });
  selectMood(currentMood, false);
}
function selectMood(mood, userAction=false) {
  currentMood = MOODS.some((m) => m.key === mood) ? mood : 'bahagia';
  localStorage.setItem('iman_last_mood', currentMood); if (userAction) saveUserInteraction('mood', currentMood);
  $$('.mood-card-premium').forEach((card) => card.classList.toggle('active', card.dataset.mood === currentMood));
  const msg = `Mood terdeteksi: ${moodLabel(currentMood)}. Ini rekomendasi film yang bisa menemani dan menenangkan hati.`;
  $('#moodExplanation') && ($('#moodExplanation').textContent = msg);
  $('#reco-heading') && ($('#reco-heading').dataset.label = msg);
  renderRecommendations({ mood:currentMood, query:$('#searchInput')?.value || '' });
  if (userAction) setTimeout(() => $('#rekomendasi')?.scrollIntoView({ behavior:'smooth', block:'start' }), 120);
}
function enhanceRecommendationHeader() {
  const head = $('.section-head'); const search = $('#searchInput'); if (!head || !search) return;
  if (!$('.reco-copy', head)) $('#reco-heading')?.insertAdjacentHTML('afterend', '<p class="reco-copy">Dipilih berdasarkan mood, tema cerita, rating, dan kecocokan pesan.</p>');
  if (!$('.reco-controls', head)) {
    const controls = document.createElement('div'); controls.className = 'reco-controls';
    search.insertAdjacentElement('beforebegin', controls); controls.appendChild(search);
    controls.insertAdjacentHTML('beforeend', '<select id="sortSelect" aria-label="Urutkan film"><option value="relevance">Relevansi</option><option value="rating">Rating</option><option value="year">Tahun terbaru</option></select>');
  }
  search.placeholder = 'Cari judul, tema, atau suasana...';
  search.addEventListener('input', () => { saveUserInteraction('search', search.value); setTimeout(() => renderRecommendations({ mood:currentMood, query:search.value }), 0); });
  $('#sortSelect')?.addEventListener('change', () => renderRecommendations({ mood:currentMood, query:search.value }));
}
function renderRecommendations({ mood=currentMood, query='' }={}) {
  const grid = $('#movieGrid'); if (!grid) return;
  grid.innerHTML = Array.from({ length: 8 }).map(() => '<div class="skeleton" aria-hidden="true"></div>').join('');
  requestAnimationFrame(() => {
    let result = getRecommendations({ mood, query, movies, history:getUserHistory(), limit:24 });
    let recs = [...result.recommendations];
    const sort = $('#sortSelect')?.value;
    if (sort === 'rating') recs.sort((a,b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'year') recs.sort((a,b) => Number(b.year || 0) - Number(a.year || 0));
    if (!recs.length) { grid.innerHTML = '<div class="empty-state"><h3>Belum ada rekomendasi yang cocok.</h3><p>Coba pilih mood lain atau cari kata kunci yang lebih umum.</p></div>'; return; }
    grid.innerHTML = recs.map(movieCard).join('');
    $$('.movie-card', grid).forEach((card, index) => {
      card.addEventListener('click', (e) => { if (!e.target.closest('button')) openDetail(recs[index]); });
      card.querySelector('.detail-btn')?.addEventListener('click', () => openDetail(recs[index]));
    });
    revealSoon();
  });
}
function movieCard(movie) {
  const poster = movie.poster_url || fallbackPoster(movie.title); const genre = String(movie.genres || 'Drama').split('|')[0].trim();
  return `<article class="movie-card revealable" tabindex="0" role="button" aria-label="Lihat detail ${esc(movie.title)}"><div class="movie-poster-wrap"><img src="${esc(poster)}" alt="Poster ${esc(movie.title)}" loading="lazy" onerror="this.src='${fallbackPoster(movie.title)}'"><div class="poster-overlay"></div><div class="card-badges"><span class="badge badge-mood">${esc(moodLabel(movie.mood))}</span><span class="badge">★ ${Number(movie.rating || 0).toFixed(1)}</span></div></div><div class="movie-info"><h3 class="movie-title">${esc(movie.title)}</h3><div class="movie-meta"><span>${esc(movie.year || '-')}</span><span>${esc(genre)}</span></div><p class="fit-reason"><b>Kenapa cocok?</b> ${esc(movie.reason)}</p><div class="movie-actions"><button class="detail-btn" type="button">Lihat detail</button></div></div></article>`;
}
function openDetail(movie) {
  const modal = $('#detailModal'); const body = $('#detailBody'); if (!modal || !body) return;
  saveUserInteraction('detail', { id:movie.id, title:movie.title, mood:movie.mood }); lastFocused = document.activeElement;
  const poster = movie.poster_url || fallbackPoster(movie.title); const backdrop = movie.backdrop_url || poster;
  body.innerHTML = `<div class="detail-grid-premium"><div><img class="detail-poster" src="${esc(poster)}" alt="Poster ${esc(movie.title)}"></div><div><h2 id="detailTitle">${esc(movie.title)}</h2><div class="detail-meta"><span class="badge badge-mood">${esc(moodLabel(movie.mood))}</span><span class="badge">${esc(movie.year || '-')}</span><span class="badge">${esc(movie.genres || 'Drama')}</span><span class="badge">★ ${Number(movie.rating || 0).toFixed(1)}</span></div><p>${esc(movie.overview || 'Belum ada sinopsis.')}</p><p class="fit-reason"><b>Kenapa cocok?</b> ${esc(movie.reason)}</p></div></div>`;
  modal.style.setProperty('--detail-backdrop', `url("${backdrop}")`); modal.classList.remove('hidden'); modal.style.display = 'grid'; $('.close', modal)?.focus();
}
function closeModal(modal) { modal?.classList.add('hidden'); if (modal?.id === 'authModal') modal.style.display = 'none'; lastFocused?.focus?.(); }
function enhanceModals() {
  $$('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
    $('.close', modal)?.addEventListener('click', () => closeModal(modal));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.modal:not(.hidden)').forEach(closeModal); });
  $('#authModal h2') && ($('#authModal h2').textContent = 'Masuk ke IMAN IN MOTION');
  $('#authModal p') && ($('#authModal p').textContent = 'Simpan riwayat mood dan akses pengalaman yang lebih personal.');
}
function addExplanationSection() {
  if ($('#cara-aiman')) return;
  $('#rekomendasi')?.insertAdjacentHTML('beforeend', `<section id="cara-aiman" class="iim-explain"><h3>Cara AIMAN Memilih Film</h3><p class="reco-copy">Penjelasan singkat untuk presentasi dan demo sistem rekomendasi.</p><div class="iim-explain-grid"><div class="iim-explain-card"><b>1. Deteksi mood</b><p>AIMAN membaca kata kunci dan konteks perasaan pengguna.</p></div><div class="iim-explain-card"><b>2. Kecocokan tema</b><p>Sistem mencocokkan mood dengan tema, genre, dan sinopsis film.</p></div><div class="iim-explain-card"><b>3. Skor rating</b><p>Film dengan rating baik mendapat sedikit prioritas.</p></div><div class="iim-explain-card"><b>4. Variasi rekomendasi</b><p>Sistem menghindari rekomendasi yang terlalu mirip.</p></div><div class="iim-explain-card"><b>5. Riwayat lokal</b><p>Pilihan mood dan film yang dibuka membantu personalisasi ringan.</p></div><div class="iim-explain-card"><b>6. Fallback</b><p>Jika AI tidak tersedia, rekomendasi tetap berjalan berdasarkan mood dan data film.</p></div></div></section>`);
}
function setupRevealObserver() {
  if (!('IntersectionObserver' in window)) return;
  window.__iimRevealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); window.__iimRevealObserver.unobserve(entry.target); } }), { threshold:.12 });
}
function revealSoon() { const obs = window.__iimRevealObserver; $$('.mood-card-premium,.movie-card,.iim-explain-card').forEach((el, i) => { el.style.transitionDelay = `${Math.min(i * 35, 220)}ms`; obs ? obs.observe(el) : el.classList.add('is-revealed'); }); }
async function loadMovies() {
  try { const res = await fetch('/api/movies'); if (!res.ok) throw new Error('api'); movies = (await res.json()).map(normalizeMovie); }
  catch { movies = (window.MOVIES_DATA || []).map(normalizeMovie); toast('Mode offline: memakai dataset lokal.'); }
}
function fixVisibleText() {
  $('#menuToggle') && ($('#menuToggle').textContent = '☰'); $('#settingsBtn') && ($('#settingsBtn').textContent = '⚙'); $('#micBtn') && ($('#micBtn').textContent = '🎙');
  $('.copyright') && ($('.copyright').textContent = '© 2026 IMAN IN MOTION - All Rights Reserved');
}

document.addEventListener('DOMContentLoaded', async () => {
  fixVisibleText(); cleanNavigation(); enhanceHero(); enhanceMiniChat(); buildMoodSelector(); enhanceRecommendationHeader(); enhanceModals(); addExplanationSection(); setupRevealObserver();
  await loadMovies(); selectMood(currentMood, false); renderRecommendations({ mood:currentMood }); revealSoon();
  setTimeout(() => { const splash = $('#splash'); splash?.classList.add('hide'); setTimeout(() => splash?.remove(), 380); }, document.readyState === 'complete' ? 350 : 900);
});