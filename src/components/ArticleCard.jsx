function normalizeMood(mood = '') {
  const value = String(mood || '').toLowerCase();
  const map = { tenang: 'gelisah' };
  return map[value] || value || 'hidayah';
}

function prettyMood(mood = '') {
  const value = normalizeMood(mood);
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Refleksi';
}

function splitGenres(genres = '') {
  return String(genres || '')
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function makeArticleCopy(article) {
  const title = article.movieTitle || article.title || 'Film pilihan';
  const mood = prettyMood(article.mood);
  const genres = splitGenres(article.genres).slice(0, 3).join(', ') || 'drama kehidupan';
  const overview = article.overview && article.overview !== 'Sinopsis belum tersedia di dataset.'
    ? article.overview
    : `${title} menghadirkan perjalanan tokoh yang dapat dibaca sebagai bahan renungan tentang pilihan, emosi, dan cara manusia kembali menemukan arah.`;

  return {
    title: `${title}: bacaan reflektif untuk mood ${mood.toLowerCase()}`,
    excerpt: `${title} menghadirkan nuansa ${genres}. Melalui cerita dan perjalanan tokohnya, film ini dapat menjadi bahan renungan untuk memahami perasaan, mengambil jeda, lalu melihat kembali pesan kebaikan yang dekat dengan kehidupan sehari-hari.`,
    preview: overview
  };
}

export { makeArticleCopy, prettyMood };

export default function ArticleCard({ article }) {
  const id = article.id || article.movieId || article.title;
  const copy = makeArticleCopy(article);
  return (
    <article className="premium-card group overflow-hidden p-3 transition hover:-translate-y-1 hover:shadow-glow">
      <div className="flex gap-4">
        <a href={`#/article/${encodeURIComponent(id)}`} className="block h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-iim-sand/30 sm:h-32 sm:w-28">
          {article.poster ? (
            <img src={article.poster} alt={copy.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="grid h-full place-items-center p-2 text-center text-xs font-bold text-iim-brown dark:text-iim-sand">IMAN</div>
          )}
        </a>
        <div className="min-w-0 flex-1 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-iim-gold/20 px-2.5 py-1 text-[10px] font-extrabold uppercase text-iim-brown dark:text-iim-gold">{prettyMood(article.mood)}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-iim-brown/70 dark:text-iim-sand/75">{article.date || 'Artikel IMAN'}</span>
          </div>
          <a href={`#/article/${encodeURIComponent(id)}`}>
            <h3 className="mt-2 line-clamp-2 text-base font-extrabold leading-6 text-iim-coffee transition group-hover:text-iim-brown dark:text-iim-cream dark:group-hover:text-iim-gold">{copy.title}</h3>
          </a>
          <p className="mt-2 line-clamp-2 text-xs leading-6 text-iim-brown dark:text-iim-sand">{copy.excerpt}</p>
          <a href={`#/article/${encodeURIComponent(id)}`} className="mt-3 inline-flex text-xs font-extrabold text-iim-brown underline-offset-4 hover:underline dark:text-iim-gold">Lihat selengkapnya →</a>
        </div>
      </div>
    </article>
  );
}
