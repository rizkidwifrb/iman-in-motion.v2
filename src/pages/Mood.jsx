import { useEffect, useMemo, useState } from 'react';
import FilmCard from '../components/FilmCard';
import { MOODS, getGenres, getMoodByKey, searchMovies } from '../services/recommendationService';

function getInitialMood() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  return (params.get('mood') || localStorage.getItem('iman_last_mood') || 'sedih').toLowerCase();
}

export default function Mood() {
  const [currentMood, setCurrentMood] = useState(getInitialMood());
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('recommended');
  const [menuOpen, setMenuOpen] = useState(false);
  const genres = useMemo(() => getGenres(), []);
  const mood = getMoodByKey(currentMood);

  useEffect(() => {
    const syncFromHash = () => {
      const next = getInitialMood();
      if (next && next !== currentMood) setCurrentMood(next);
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [currentMood]);

  const moodStyle = {
    '--mood-accent': mood.color,
    '--mood-accent-2': mood.color2,
    '--mood-soft': mood.glow,
    '--mood-bg': `radial-gradient(900px 520px at 20% -10%, ${mood.color}55, transparent 62%), radial-gradient(760px 480px at 96% 6%, ${mood.color2}22, transparent 58%), #030505`
  };

  const movies = useMemo(() => {
    return searchMovies({ query, mood: currentMood, genre, sort }).slice(0, 80);
  }, [query, currentMood, genre, sort]);

  function chooseMood(key) {
    setCurrentMood(key);
    setMenuOpen(false);
    localStorage.setItem('iman_last_mood', key);
    window.history.replaceState(null, '', `#/mood?mood=${encodeURIComponent(key)}`);
    requestAnimationFrame(() => {
      const target = document.querySelector('.mood-dalil-box');
      const top = (target?.getBoundingClientRect().top || 0) + window.scrollY - 94;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  }

  return (
    <section className="mood-shell" style={moodStyle}>
      <aside className="mood-sidebar">
        <div className="mood-sidebar-top">
          <div className="flex items-center gap-2 text-sm font-extrabold text-white/70">
            <a href="#/" className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 transition hover:border-[var(--mood-accent)] hover:text-[var(--mood-accent)]">← Kembali</a>
            <a href="#/articles" className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 transition hover:border-[var(--mood-accent)] hover:text-[var(--mood-accent)]">Artikel</a>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              className="mood-menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Buka menu mood"
            >
              {menuOpen ? '×' : '☰'}
            </button>
            <a href="#/" className="flex min-w-0 items-center gap-3">
              <img src="/logo.png" alt="IMAN IN MOTION" className="h-11 w-11 rounded-2xl bg-white object-contain p-1" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-[0.18em] text-white">IMAN IN MOTION</p>
                <p className="truncate text-xs font-semibold text-white/55">Mood → Dalil → Film</p>
              </div>
            </a>
          </div>
        </div>

        <div className={`mood-button-list ${menuOpen ? 'open' : ''}`}>
          {MOODS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => chooseMood(item.key)}
              className={`mood-side-button ${item.key === currentMood ? 'active' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="mood-button-copy">
                <strong>{item.label}</strong>
                <small>{item.message}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className="mood-main">
        <section className="mood-dalil-box">
          <span className="mood-badge">Dalil Untukmu</span>
          <h1>{mood.title}</h1>
          <p className="max-w-3xl text-base font-semibold leading-8 text-white/62">{mood.description}</p>
          <div className="mood-arabic">{mood.arabic}</div>
          <p className="mt-4 max-w-4xl text-lg font-semibold leading-8 text-white/72">
            {mood.dalilText} <span className="font-black text-[var(--mood-accent)]">({mood.dalil})</span>
          </p>
        </section>

        <section className="mood-toolbar">
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Cari film, genre, atau sinopsis..." />
          <select className="select-premium" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recommended">Rekomendasi terbaik</option>
            <option value="rating">Rating tertinggi</option>
            <option value="year">Terbaru</option>
            <option value="title">Judul A-Z</option>
          </select>
          <select className="select-premium" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">Semua genre</option>
            {genres.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <a href={`#/aiman?mood=${currentMood}`} className="mood-aiman-link">Tanya AIMAN</a>
        </section>

        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--mood-accent)]">Rekomendasi Film</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">Untuk mood {mood.label}</h2>
          </div>
          <p className="text-sm font-bold text-white/55">Menampilkan {movies.length} film</p>
        </div>

        {movies.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {movies.map((movie) => <FilmCard key={movie.id} movie={movie} mood={currentMood} />)}
          </div>
        ) : (
          <div className="mood-empty">
            <h3>Film tidak ditemukan.</h3>
            <p>Coba ubah keyword atau pilih genre lain.</p>
          </div>
        )}
      </main>
    </section>
  );
}
