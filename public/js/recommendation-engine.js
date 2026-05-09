const MOODS = ['sedih', 'gelisah', 'hidayah', 'bahagia', 'marah', 'rindu'];
const DISPLAY_LABELS = { sedih:'Sedih', gelisah:'Gelisah', hidayah:'Hidayah', bahagia:'Bahagia', marah:'Marah', rindu:'Rindu' };
const RELATED = {
  sedih:['hidayah','rindu','gelisah'],
  gelisah:['sedih','hidayah'],
  hidayah:['sedih','gelisah','bahagia'],
  bahagia:['hidayah','rindu'],
  marah:['gelisah','hidayah'],
  rindu:['sedih','bahagia','hidayah']
};
const MOOD_KEYWORDS = {
  sedih:['sedih','galau','down','nangis','hampa','kecewa','patah hati','sendiri','lelah','capek hati','terluka','mellow','luka'],
  gelisah:['gelisah','cemas','takut','khawatir','overthinking','stress','stres','panik','bingung','resah','tidak tenang','anxiety'],
  hidayah:['hidayah','hijrah','berubah','taubat','tobat','kembali ke allah','iman','dosa','sholat','salat','doa','arah hidup','spiritual','religi','religion','dakwah','allah','quran'],
  bahagia:['bahagia','senang','happy','syukur','alhamdulillah','lega','semangat','ceria','bersyukur','comedy','warm','friendship'],
  marah:['marah','kesal','emosi','kecewa berat','dendam','kesel','muak','jengkel','tersinggung','anger'],
  rindu:['rindu','kangen','kehilangan','jauh','kenangan','orang tua','keluarga','rumah','masa lalu','sahabat lama','nostalgia','home','memory','parents','distance','longing']
};
const STOP = new Set('aku,kamu,yang,dan,atau,di,ke,dari,ini,itu,lagi,film,butuh,ingin,untuk,dengan,ada,karena,the,and,of,a,to,in,is,on'.split(','));

const clean = (value='') => String(value || '').toLowerCase().replace(/[^a-z0-9\s\-']/gi, ' ').replace(/\s+/g, ' ').trim();
const tokens = (value='') => clean(value).split(' ').filter((t) => t && t.length > 2 && !STOP.has(t));
const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));
const labelMood = (mood) => DISPLAY_LABELS[normalizeMood(mood)] || 'Bahagia';

function textBlob(movie={}) {
  return [movie.title, movie.title_asli, movie.overview, movie.genres, movie.genre, movie.mood, movie.category, ...(movie.keywords || []), ...(movie.tags || [])]
    .filter(Boolean).join(' ');
}
function hasAny(text, words=[]) {
  const source = clean(text);
  return words.some((word) => source.includes(clean(word)));
}

export function normalizeMood(rawMood='', movie={}) {
  const raw = clean(rawMood || movie.mood || movie.category || '');
  const text = textBlob(movie);
  if (MOODS.includes(raw)) return raw;
  if (raw.includes('tenang')) {
    if (hasAny(text, MOOD_KEYWORDS.rindu)) return 'rindu';
    if (hasAny(text, MOOD_KEYWORDS.hidayah)) return 'hidayah';
    if (hasAny(text, ['comedy','komedi','warm','friendship','keluarga'])) return 'bahagia';
    return 'gelisah';
  }
  if (raw.includes('inspiratif')) return hasAny(text, MOOD_KEYWORDS.hidayah) ? 'hidayah' : 'bahagia';
  if (hasAny(raw, ['spiritual','religi','dakwah','hijrah'])) return 'hidayah';
  if (hasAny(raw, ['galau','mellow','luka'])) return 'sedih';
  if (hasAny(raw, ['anxiety','cemas','takut'])) return 'gelisah';
  if (hasAny(raw, ['anger','emosi'])) return 'marah';
  if (hasAny(raw, ['nostalgia','kangen'])) return 'rindu';
  if (hasAny(text, MOOD_KEYWORDS.hidayah)) return 'hidayah';
  return 'bahagia';
}

export function normalizeMovie(movie={}, index=0) {
  const title = movie.title_asli || movie.title || `Film ${index + 1}`;
  const genres = movie.genres || movie.genre || '';
  const overview = movie.overview || '';
  const keywords = [...new Set([...tokens(title), ...tokens(genres), ...tokens(overview)].slice(0, 42))];
  return {
    id: movie.id || movie.tmdb_id || `${clean(title).replace(/\s+/g, '-')}-${movie.year || index}`,
    title,
    year: movie.year || '',
    genres,
    poster_url: movie.poster_url || movie.poster || '',
    backdrop_url: movie.backdrop_url || movie.backdrop || movie.poster_url || movie.poster || '',
    overview,
    rating: Number(movie.rating || movie.vote_average || 0) || 0,
    mood: normalizeMood(movie.mood || movie.category, movie),
    rawMood: movie.mood || movie.category || '',
    keywords,
    tags: Array.isArray(movie.tags) ? movie.tags : [],
    original: movie
  };
}

export function detectMoodFromText(text='') {
  const source = clean(text);
  const scores = Object.fromEntries(MOODS.map((mood) => [mood, 0]));
  const hits = [];
  for (const mood of MOODS) {
    for (const keyword of MOOD_KEYWORDS[mood]) {
      const key = clean(keyword);
      if (!key) continue;
      if (source.includes(key)) {
        const weight = key.includes(' ') ? 3 : 2;
        scores[mood] += weight;
        hits.push(keyword);
      }
    }
  }
  if (source.includes('nenangin') || source.includes('menenangkan')) scores.gelisah += 1.5;
  if (source.includes('semangat') && source.includes('sedih')) scores.hidayah += 1.2;
  const ranked = Object.entries(scores).sort((a,b) => b[1] - a[1]);
  const top = ranked[0];
  const total = Object.values(scores).reduce((a,b) => a + b, 0);
  const mood = top && top[1] > 0 ? top[0] : 'bahagia';
  const normalizedScores = Object.fromEntries(Object.entries(scores).map(([m,s]) => [m, total ? Number((s / total).toFixed(2)) : 0]));
  return { mood, confidence: total ? normalizedScores[mood] : 0.35, scores: normalizedScores, keywords: [...new Set(hits)] };
}

function textSimilarity(movie, context={}) {
  const query = [context.query, context.text, ...(context.keywords || [])].filter(Boolean).join(' ');
  const qTokens = [...new Set(tokens(query))];
  if (!qTokens.length) return 0.35;
  const docTokens = new Set(tokens(`${movie.title} ${movie.overview} ${movie.genres} ${movie.keywords?.join(' ')} ${movie.tags?.join(' ')} ${movie.mood}`));
  let matched = 0;
  qTokens.forEach((token) => { if (docTokens.has(token) || [...docTokens].some((d) => d.includes(token) || token.includes(d))) matched += 1; });
  return clamp01(matched / Math.max(qTokens.length, 1));
}
function ratingScore(movie) { return movie.rating ? clamp01(movie.rating / 10) : 0.5; }
function recencyScore(movie) {
  const year = Number(movie.year || 0);
  if (!year) return 0.45;
  const normalized = Math.min(Math.max((year - 1970) / 60, 0), 1);
  return 0.35 + normalized * 0.65;
}
function personalizationScore(movie, history=getUserHistory()) {
  const selected = history.selectedMoods || [];
  const opened = history.openedMovies || [];
  const searched = (history.searchTerms || []).join(' ');
  let score = 0;
  if (selected.slice(-8).includes(movie.mood)) score += 0.45;
  if (opened.some((item) => item.id === movie.id || item.title === movie.title)) score += 0.2;
  if (searched && textSimilarity(movie, { query: searched }) > 0.35) score += 0.25;
  return clamp01(score);
}
function moodMatchScore(movieMood, targetMood) {
  if (movieMood === targetMood) return 1;
  if ((RELATED[targetMood] || []).includes(movieMood)) return 0.7;
  if ((RELATED[movieMood] || []).includes(targetMood)) return 0.3;
  return 0;
}

export function computeRecommendationScore(movie, context={}) {
  const targetMood = normalizeMood(context.mood || detectMoodFromText(context.text || context.query || '').mood);
  const normalized = movie.title ? movie : normalizeMovie(movie);
  const parts = {
    moodMatchScore: moodMatchScore(normalized.mood, targetMood),
    textSimilarityScore: textSimilarity(normalized, context),
    ratingScore: ratingScore(normalized),
    recencyScore: recencyScore(normalized),
    diversityScore: clamp01(context.diversityScore ?? 0.7),
    personalizationScore: personalizationScore(normalized, context.history || getUserHistory())
  };
  const score = parts.moodMatchScore * 0.35
    + parts.textSimilarityScore * 0.25
    + parts.ratingScore * 0.15
    + parts.recencyScore * 0.10
    + parts.diversityScore * 0.10
    + parts.personalizationScore * 0.05;
  return { score: Number(score.toFixed(4)), parts };
}

function primaryGenre(movie) { return String(movie.genres || '').split('|')[0].trim().toLowerCase() || 'unknown'; }
function rerankDiverse(scored, limit) {
  const selected = [];
  const pool = [...scored];
  const genreCount = new Map();
  const moodCount = new Map();
  while (pool.length && selected.length < limit) {
    pool.sort((a,b) => {
      const aPenalty = (genreCount.get(primaryGenre(a)) || 0) * 0.045 + (moodCount.get(a.mood) || 0) * 0.035;
      const bPenalty = (genreCount.get(primaryGenre(b)) || 0) * 0.045 + (moodCount.get(b.mood) || 0) * 0.035;
      return (b.__score - bPenalty) - (a.__score - aPenalty);
    });
    const next = pool.shift();
    selected.push(next);
    genreCount.set(primaryGenre(next), (genreCount.get(primaryGenre(next)) || 0) + 1);
    moodCount.set(next.mood, (moodCount.get(next.mood) || 0) + 1);
  }
  return selected;
}

export function buildRecommendationReason(movie, context={}) {
  const mood = normalizeMood(context.mood || movie.mood);
  const label = labelMood(mood);
  const genre = primaryGenre(movie);
  if (movie.mood === mood && mood === 'rindu') return `Cocok untuk ${label} karena ceritanya dekat dengan kenangan, keluarga, dan hubungan emosional.`;
  if (movie.mood === mood && mood === 'hidayah') return 'Direkomendasikan karena punya nuansa hidayah, perjalanan batin, dan pesan spiritual yang kuat.';
  if (movie.mood === mood) return `Cocok karena mood ${label} kamu terdeteksi dan tema ${genre} di film ini terasa selaras.`;
  if ((RELATED[mood] || []).includes(movie.mood)) return `Tetap relevan karena mood ${label} beririsan dengan nuansa ${labelMood(movie.mood)} dan memberi variasi tontonan.`;
  return `Dipilih karena rating, tema cerita, dan kata kunci film ini paling mendekati kebutuhanmu.`;
}

export function getRecommendations({ mood, query='', text='', movies=[], history=getUserHistory(), limit=12 }={}) {
  const detected = mood ? { mood: normalizeMood(mood), keywords: [] } : detectMoodFromText(`${query} ${text}`);
  const context = { mood: detected.mood, query, text, keywords: detected.keywords, history };
  let normalized = movies.map((movie, index) => normalizeMovie(movie, index));
  let scored = normalized.map((movie) => {
    const result = computeRecommendationScore(movie, context);
    return { ...movie, score: result.score, __score: result.score, scoreParts: result.parts, reason: buildRecommendationReason(movie, context) };
  }).sort((a,b) => b.__score - a.__score);
  let results = rerankDiverse(scored.slice(0, Math.max(limit * 4, 24)), limit);
  if (!results.length) results = normalized.filter((m) => m.mood === context.mood).slice(0, limit);
  if (!results.length) results = normalized.sort((a,b) => ratingScore(b) - ratingScore(a)).slice(0, limit);
  return { mood: context.mood, recommendations: results.slice(0, limit), detected };
}

function readArray(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
export function getUserHistory() {
  if (typeof localStorage === 'undefined') return { selectedMoods: [], openedMovies: [], searchTerms: [], likedMovies: [] };
  return {
    selectedMoods: readArray('iim_selected_moods'),
    openedMovies: readArray('iim_opened_movies'),
    searchTerms: readArray('iim_search_terms'),
    likedMovies: readArray('iim_liked_movies')
  };
}
export function saveUserInteraction(type, payload={}) {
  if (typeof localStorage === 'undefined') return;
  const map = { mood:'iim_selected_moods', detail:'iim_opened_movies', search:'iim_search_terms', like:'iim_liked_movies' };
  const key = map[type] || type;
  const arr = readArray(key);
  arr.push({ ...payload, at: Date.now() });
  localStorage.setItem(key, JSON.stringify(arr.slice(-60)));
}

export const MoodLabels = DISPLAY_LABELS;
export const MoodKeywords = MOOD_KEYWORDS;

if (typeof window !== 'undefined') {
  window.IIMRecommendationEngine = { normalizeMood, normalizeMovie, detectMoodFromText, computeRecommendationScore, getRecommendations, buildRecommendationReason, getUserHistory, saveUserInteraction, MoodLabels };
}