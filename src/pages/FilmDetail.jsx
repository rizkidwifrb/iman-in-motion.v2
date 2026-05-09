import { buildDalilNote, buildReason, getMovieById, getMoodByKey } from '../services/recommendationService';

export default function FilmDetail({ path }) {
  const [rawId, search = ''] = path.replace('/film/', '').split('?');
  const params = new URLSearchParams(search);
  const moodKey = params.get('mood') || '';
  const movie = getMovieById(decodeURIComponent(rawId || ''));
  const mood = getMoodByKey(moodKey || movie?.mood);

  if (!movie) {
    return (
      <section className="container-page py-16">
        <div className="premium-card p-8 text-center">
          <h1 className="text-3xl font-black">Film tidak ditemukan</h1>
          <a href="#/film" className="btn-primary mt-6">Kembali ke Film</a>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="premium-card overflow-hidden p-3">
          {movie.poster ? (
            <img src={movie.poster} alt={movie.title} className="h-full min-h-[520px] w-full rounded-[1.6rem] object-cover" />
          ) : (
            <div className="grid min-h-[520px] place-items-center rounded-[1.6rem] bg-iim-coffee/10 text-5xl">🎬</div>
          )}
        </div>

        <div>
          <p className="section-eyebrow">Detail film</p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{movie.title}</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            {movie.year && <span className="rounded-full bg-white/60 px-4 py-2 text-sm font-extrabold text-iim-brown dark:bg-white/10 dark:text-iim-sand">{movie.year}</span>}
            {movie.rating > 0 && <span className="rounded-full bg-iim-gold px-4 py-2 text-sm font-extrabold text-iim-charcoal">★ {movie.rating}</span>}
            <span className="rounded-full bg-white/60 px-4 py-2 text-sm font-extrabold text-iim-brown dark:bg-white/10 dark:text-iim-sand">{movie.mood || mood.label}</span>
          </div>

          <div className="premium-card mt-7 p-6">
            <h2 className="text-xl font-black">Sinopsis</h2>
            <p className="mt-3 leading-8 text-iim-brown dark:text-iim-sand">{movie.overview}</p>
          </div>

          <div className="premium-card mt-5 p-6">
            <h2 className="text-xl font-black">Alasan rekomendasi</h2>
            <p className="mt-3 leading-8 font-semibold">{buildReason(movie, mood.key)}</p>
            <div className="mt-5 rounded-3xl bg-iim-gold/15 p-5">
              <p className="text-sm font-extrabold text-iim-brown dark:text-iim-gold">Dalil/refleksi mood {mood.label}</p>
              <p className="mt-2 leading-7 font-bold">{buildDalilNote(mood.key)}</p>
              <p className="mt-2 text-sm leading-7 text-iim-brown dark:text-iim-sand">{mood.reflection}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={`#/aiman?film=${encodeURIComponent(movie.title)}&mood=${mood.key}`} className="btn-primary">Tanya AIMAN tentang film ini</a>
            <a href="#/film" className="btn-secondary">Kembali ke daftar film</a>
          </div>
        </div>
      </div>
    </section>
  );
}
