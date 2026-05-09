import { buildReason } from '../services/recommendationService';

export default function FilmCard({ movie, mood }) {
  const rating = movie.rating?.toFixed ? movie.rating.toFixed(1) : movie.rating;

  return (
    <a
      href={`#/film/${encodeURIComponent(movie.id)}${mood ? `?mood=${mood}` : ''}`}
      className="film-card premium-card group overflow-hidden hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-iim-sand/30">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center p-4 text-center text-xs font-bold text-iim-brown dark:text-iim-sand">Poster belum tersedia</div>
        )}
        <div className="film-rating absolute left-2 top-2 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-extrabold text-white backdrop-blur">★ {rating}</div>
        {movie.mood && <div className="film-mood absolute bottom-2 left-2 rounded-full bg-iim-gold px-2.5 py-1 text-[10px] font-extrabold text-iim-charcoal">{movie.mood}</div>}
      </div>
      <div className="film-card-body p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="film-title line-clamp-2 text-base font-extrabold text-iim-coffee dark:text-iim-cream">{movie.title}</h3>
          <span className="film-year shrink-0 text-xs font-bold text-iim-brown dark:text-iim-sand">{movie.year || '-'}</span>
        </div>
        <p className="film-genre mt-2 line-clamp-2 text-xs font-semibold text-iim-brown dark:text-iim-sand">{movie.genres || 'Drama'}</p>
        <p className="film-reason mt-3 line-clamp-3 text-sm leading-6 text-iim-brown/85 dark:text-iim-sand/85">{buildReason(movie, mood || movie.mood)}</p>
      </div>
    </a>
  );
}
