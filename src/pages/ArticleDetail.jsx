import articles from '../data/articles';
import { makeArticleCopy, prettyMood } from '../components/ArticleCard';

const moodCopy = {
  sedih: {
    label: 'Sedih',
    dalil: 'QS. At-Taubah: 40',
    ayat: 'Janganlah engkau bersedih, sesungguhnya Allah bersama kita.',
    fokus: 'sabar, penerimaan, dan kekuatan untuk tetap berjalan pelan-pelan'
  },
  gelisah: {
    label: 'Gelisah',
    dalil: 'QS. Ar-Ra’d: 28',
    ayat: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
    fokus: 'ketenangan, tawakal, dan kemampuan menata pikiran'
  },
  hidayah: {
    label: 'Hidayah',
    dalil: 'QS. Al-Baqarah: 213',
    ayat: 'Allah memberi petunjuk kepada siapa yang Dia kehendaki menuju jalan yang lurus.',
    fokus: 'perubahan diri, keberanian kembali, dan kemauan memperbaiki arah hidup'
  },
  bahagia: {
    label: 'Bahagia',
    dalil: 'QS. Ibrahim: 7',
    ayat: 'Jika kamu bersyukur, niscaya Aku akan menambah nikmat kepadamu.',
    fokus: 'syukur, kehangatan, dan kesadaran bahwa kebahagiaan juga perlu dijaga'
  },
  marah: {
    label: 'Marah',
    dalil: 'QS. Ali Imran: 134',
    ayat: 'Orang-orang yang menahan amarahnya dan memaafkan manusia.',
    fokus: 'pengendalian diri, jeda, dan keberanian memilih respons yang lebih baik'
  },
  rindu: {
    label: 'Rindu',
    dalil: 'QS. Al-Baqarah: 152',
    ayat: 'Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu.',
    fokus: 'makna pulang, doa, kehilangan, dan hubungan yang tetap hidup dalam ingatan'
  }
};

function splitGenres(genres = '') {
  return String(genres).split(/[,|]/).map((item) => item.trim()).filter(Boolean);
}

function buildLongArticle(article) {
  const moodKey = String(article.mood || 'hidayah').toLowerCase();
  const mood = moodCopy[moodKey] || moodCopy.hidayah;
  const title = article.movieTitle || article.title || 'film ini';
  const year = article.year || '-';
  const genres = splitGenres(article.genres).slice(0, 4);
  const genreText = genres.length ? genres.join(', ') : 'drama dan refleksi kehidupan';
  const ratingText = article.rating ? ` Film ini juga memiliki penilaian penonton yang cukup menarik, yaitu ${article.rating}, sehingga dapat menjadi salah satu pilihan ketika penonton ingin mencari tontonan yang tidak hanya menghibur, tetapi juga menyisakan ruang pikir.` : '';
  const overview = article.overview && article.overview !== 'Sinopsis belum tersedia di dataset.'
    ? article.overview
    : 'Cerita film ini dapat dibaca sebagai ruang untuk melihat manusia ketika berhadapan dengan pilihan, kehilangan, harapan, dan konsekuensi dari tindakan yang ia ambil.';

  return [
    {
      heading: `Membaca ${title} sebagai ruang refleksi`,
      body: `${title} (${year}) dapat dipahami sebagai film yang membuka ruang perenungan melalui nuansa ${genreText}. Ceritanya tidak hanya dapat dinikmati sebagai hiburan, tetapi juga sebagai bahan untuk melihat kembali cara manusia menghadapi tekanan, pilihan, harapan, dan perubahan hidup.${ratingText} Dalam pengalaman menonton, seseorang sering kali tidak hanya mencari alur cerita yang menarik, tetapi juga mencari rasa yang dekat dengan keadaan batinnya. Karena itu, film ini dapat menjadi pintu masuk untuk merenungkan suasana hati, memahami emosi yang sedang bergerak, dan menemukan pesan kebaikan yang relevan dengan kehidupan sehari-hari.`
    },
    {
      heading: 'Sinopsis dan arah emosi cerita',
      body: `${overview} Dari gambaran cerita tersebut, penonton diajak masuk ke dalam situasi yang tidak selalu sederhana. Ada tokoh, konflik, pilihan, dan konsekuensi yang dapat dibaca sebagai cermin dari kehidupan manusia. Film seperti ini dapat membantu penonton mengambil jarak dari perasaannya sendiri. Ketika seseorang sedang lelah, marah, rindu, bahagia, gelisah, atau sedang mencari arah, cerita film dapat menjadi bahasa yang lebih lembut untuk memahami diri. Ia tidak langsung menggurui, tetapi menghadirkan pengalaman emosional yang perlahan membuka ruang renungan.`
    },
    {
      heading: `Keterkaitan dengan mood ${mood.label.toLowerCase()}`,
      body: `${title} dapat dikaitkan dengan mood ${mood.label.toLowerCase()} karena nuansa ceritanya dekat dengan ${mood.fokus}. Mood bukan hanya label perasaan, melainkan tanda bahwa seseorang sedang membutuhkan cara tertentu untuk ditemani. Ketika pengguna memilih mood ${mood.label.toLowerCase()}, rekomendasi film diarahkan agar sesuai dengan kebutuhan batin tersebut. Film yang dipilih kemudian tidak berhenti sebagai tontonan, tetapi menjadi bahan awal untuk membaca keadaan hati. Dari sana, penonton dapat bertanya: apa yang sedang aku rasakan, apa yang perlu aku kendalikan, dan nilai apa yang bisa aku bawa setelah menonton cerita ini?`
    },
    {
      heading: 'Nilai dakwah yang dapat dibaca',
      body: `Nilai dakwah dalam film tidak selalu harus muncul melalui simbol keagamaan yang terang-terangan. Kadang nilai itu hadir melalui perjuangan tokoh, keberanian mengakui kesalahan, kemampuan memaafkan, kesabaran menghadapi kehilangan, atau keputusan untuk tetap memilih jalan yang benar meskipun tidak mudah. Dalam ${title}, penonton dapat membaca bagaimana manusia diuji oleh keadaan dan bagaimana respons terhadap ujian itu membentuk arah hidupnya. Di titik inilah film dapat menjadi media dakwah yang lembut, sebab pesan kebaikan hadir melalui cerita yang dekat dengan pengalaman manusia.`
    },
    {
      heading: 'Dalil sebagai penguat refleksi',
      body: `Untuk mood ${mood.label.toLowerCase()}, refleksi ini dikuatkan dengan ${mood.dalil}: “${mood.ayat}” Dalil ini dapat dibaca sebagai pengingat bahwa setiap perasaan tetap memiliki ruang untuk diarahkan kepada Allah. Saat sedih, manusia tidak ditinggalkan. Saat gelisah, hati bisa kembali tenang melalui zikir. Saat marah, ada kemuliaan dalam menahan diri. Saat bahagia, ada syukur yang perlu dijaga. Saat rindu, ada doa yang menghidupkan ingatan. Saat mencari hidayah, ada harapan bahwa perubahan diri selalu mungkin terjadi.`
    },
    {
      heading: 'Film sebagai media literasi dakwah',
      body: `Literasi dakwah tidak hanya berbicara tentang kemampuan membaca teks agama, tetapi juga kemampuan membaca pesan, nilai, dan tanda kebaikan dalam kehidupan. Film dapat menjadi media literasi karena ia menghadirkan cerita yang bisa dilihat, dirasakan, dan didiskusikan. Melalui film, pesan dakwah dapat hadir dalam bentuk yang lebih dekat dengan budaya digital. Penonton tidak hanya diberi nasihat, tetapi diajak melihat contoh, konflik, dan perjalanan tokoh. Dengan demikian, pengalaman menonton dapat berkembang menjadi pengalaman memahami nilai.`
    },
    {
      heading: 'Relevansi bagi penonton muda',
      body: `Bagi penonton muda, pilihan tontonan sering dipengaruhi oleh mood, rekomendasi, visual, dan kedekatan cerita dengan kehidupan pribadi. Pendekatan berbasis mood membuat proses memilih film terasa lebih personal. Seseorang yang sedang gelisah tidak harus langsung membaca uraian panjang; ia dapat memulai dari memilih suasana hati, menonton film yang sesuai, lalu membaca pesan reflektif yang menyertainya. Cara ini membuat dakwah hadir melalui jalur yang lebih komunikatif, akrab, dan tidak terasa jauh dari keseharian.`
    },
    {
      heading: 'Penutup',
      body: `Pada akhirnya, ${title} dapat menjadi teman refleksi bagi penonton yang ingin menikmati film sekaligus mengambil makna. Cerita film mungkin tidak selalu memberikan jawaban final, tetapi ia dapat membuka pertanyaan yang penting: bagaimana manusia menghadapi keadaan, bagaimana hati ditata kembali, dan bagaimana nilai kebaikan tetap dijaga dalam situasi yang berubah. Jika dibaca dengan kesadaran seperti ini, film tidak hanya menjadi hiburan, tetapi juga ruang untuk memperhalus rasa, memperkuat pikiran, dan mendekatkan diri pada nilai dakwah yang lebih hidup.`
    }
  ];
}

export default function ArticleDetail({ path }) {
  const id = decodeURIComponent(path.replace('/article/', ''));
  const article = articles.find((item) => String(item.id || item.movieId || item.title) === String(id));

  if (!article) {
    return (
      <section className="container-page py-16">
        <div className="premium-card p-10 text-center">
          <h1 className="text-3xl font-black">Artikel tidak ditemukan</h1>
          <a href="#/articles" className="btn-primary mt-6">Kembali ke Artikel</a>
        </div>
      </section>
    );
  }

  const copy = makeArticleCopy(article);
  const paragraphs = buildLongArticle(article);
  const moodKey = String(article.mood || 'hidayah').toLowerCase();
  const mood = moodCopy[moodKey] || moodCopy.hidayah;

  return (
    <section className="container-page max-w-6xl py-10 md:py-14">
      <a href="#/articles" className="btn-secondary mb-6">← Kembali ke Artikel</a>
      <article className="premium-card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-iim-brown/10 p-5 dark:border-white/10 lg:border-b-0 lg:border-r">
            {article.poster && (
              <img src={article.poster} alt={copy.title} className="mx-auto aspect-[2/3] w-full max-w-[250px] rounded-3xl object-cover shadow-premium" />
            )}
            <div className="mt-5 space-y-3 text-sm leading-7 text-iim-brown dark:text-iim-sand">
              <p><b className="text-iim-coffee dark:text-iim-cream">Film:</b> {article.movieTitle || article.title}</p>
              <p><b className="text-iim-coffee dark:text-iim-cream">Tahun:</b> {article.year || '-'}</p>
              <p><b className="text-iim-coffee dark:text-iim-cream">Genre:</b> {article.genres || '-'}</p>
              <p><b className="text-iim-coffee dark:text-iim-cream">Mood:</b> {mood.label}</p>
              <p><b className="text-iim-coffee dark:text-iim-cream">Dalil:</b> {mood.dalil}</p>
            </div>
          </aside>

          <div className="p-6 md:p-10">
            <p className="section-eyebrow">{mood.label} • {article.date || 'Artikel IMAN IN MOTION'}</p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-iim-brown dark:text-iim-sand">{copy.excerpt}</p>

            <div className="mt-7 rounded-3xl border border-iim-gold/20 bg-iim-gold/10 p-5">
              <p className="text-sm font-extrabold uppercase tracking-widest text-iim-brown dark:text-iim-gold">Penguat refleksi</p>
              <p className="mt-3 text-lg font-semibold leading-8">{mood.dalil}: “{mood.ayat}”</p>
            </div>

            <div className="article-body mt-9 space-y-8">
              {paragraphs.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {(article.tags || []).slice(0, 12).map((tag) => <span key={tag} className="rounded-full bg-iim-gold/20 px-3 py-1 text-xs font-bold text-iim-brown dark:text-iim-sand">#{tag}</span>)}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
