import { useMemo, useState } from 'react';
import FilmCard from '../components/FilmCard';
import SectionTitle from '../components/SectionTitle';
import { MOODS, buildDalilNote, getGenres, getMoodByKey, searchMovies } from '../services/recommendationService';

function getInitialMood() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  return params.get('mood') || '';
}

export default function Film() {
  const [query, setQuery] = useState('');
  const [mood, setMood] = useState(getInitialMood());
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('recommended');
  const genres = useMemo(() => getGenres(), []);
  const movies = useMemo(() => searchMovies({ query, mood, genre, sort }).slice(0, 72), [query, mood, genre, sort]);
  const selectedMood = mood ? getMoodByKey(mood) : null;

  return (
    <section className="container-page py-12 md:py-16">
      <SectionTitle eyebrow="Film Recommendation" title="Temukan film yang cocok dengan suasana hatimu." description="Cari film, filter mood, dan lihat alasan kenapa film tersebut bisa menjadi bahan refleksi dakwah." />

      <div className="film-filter-card premium-card mb-8 grid gap-3 p-4 md:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr]">
        <input className="input-premium" placeholder="Cari judul, genre, atau sinopsis..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input-premium select-premium" value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="">Semua mood</option>
          {MOODS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
        <select className="input-premium select-premium" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Semua genre</option>
          {genres.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="input-premium select-premium" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recommended">Rekomendasi</option>
          <option value="rating">Rating</option>
          <option value="year">Tahun</option>
          <option value="title">Judul</option>
        </select>
      </div>

      {selectedMood && (
        <div className="film-mood-note premium-card mb-8 grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-iim-gold/20 text-3xl">{selectedMood.icon}</div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-iim-brown dark:text-iim-gold">Mood {selectedMood.label}</p>
            <p className="mt-2 font-bold leading-7">{buildDalilNote(selectedMood.key)}</p>
            <p className="mt-1 text-sm leading-7 text-iim-brown dark:text-iim-sand">{selectedMood.reflection}</p>
          </div>
          <a href={`#/aiman?mood=${selectedMood.key}`} className="btn-primary">Tanya AIMAN</a>
        </div>
      )}

      <div className="film-result-bar mb-6 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-iim-brown dark:text-iim-sand">Menampilkan {movies.length} film</p>
        {mood && <a href={`#/mood`} className="btn-secondary">Ganti mood</a>}
      </div>

      {movies.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {movies.map((movie) => <FilmCard key={movie.id} movie={movie} mood={mood} />)}
        </div>
      ) : (
        <div className="premium-card p-10 text-center">
          <p className="text-2xl font-extrabold">Film tidak ditemukan.</p>
          <p className="mt-3 text-iim-brown dark:text-iim-sand">Coba ubah kata kunci, mood, atau genre.</p>
        </div>
      )}
    </section>
  );
}
