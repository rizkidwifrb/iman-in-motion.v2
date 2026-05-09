import movies from '../data/movies';

export const MOODS = [
  {
    key: 'sedih',
    label: 'Sedih',
    title: 'Saat Sedih',
    icon: '🌧️',
    accent: 'from-blue-500/20 to-slate-500/10',
    color: '#60a5fa',
    color2: '#3b82f6',
    glow: 'rgba(96,165,250,.18)',
    description: 'Untuk hati yang sedang lelah, kecewa, atau butuh dikuatkan pelan-pelan.',
    message: 'Pelan-pelan, Allah tidak meninggalkan hamba-Nya.',
    arabic: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
    dalil: 'QS. At-Taubah: 40',
    dalilText: 'Janganlah engkau bersedih, sesungguhnya Allah bersama kita.',
    reflection: 'Mood sedih diarahkan ke film yang menenangkan, menguatkan sabar, dan membuka ruang penerimaan.'
  },
  {
    key: 'gelisah',
    label: 'Gelisah',
    title: 'Saat Gelisah',
    icon: '🌙',
    accent: 'from-indigo-500/20 to-sky-500/10',
    color: '#c084fc',
    color2: '#9333ea',
    glow: 'rgba(192,132,252,.18)',
    description: 'Untuk pikiran yang ramai, overthinking, dan ingin kembali tenang.',
    message: 'Tenangkan napas. Hati yang mengingat Allah akan menemukan ruang untuk reda.',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    dalil: 'QS. Ar-Ra’d: 28',
    dalilText: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
    reflection: 'Mood gelisah diarahkan ke tontonan yang memberi jeda, rasa aman, dan cara melihat masalah dengan lebih jernih.'
  },
  {
    key: 'hidayah',
    label: 'Hidayah',
    title: 'Mencari Hidayah',
    icon: '✨',
    accent: 'from-emerald-400/20 to-green-200/10',
    color: '#4ade80',
    color2: '#22c55e',
    glow: 'rgba(74,222,128,.18)',
    description: 'Untuk momen ingin berubah, belajar, dan mendekat kepada kebaikan.',
    message: 'Setiap langkah menuju kebaikan adalah awal yang indah.',
    arabic: 'وَاللَّهُ يَهْدِي مَنْ يَشَاءُ إِلَىٰ صِرَاطٍ مُسْتَقِيمٍ',
    dalil: 'QS. Al-Baqarah: 213',
    dalilText: 'Allah memberi petunjuk kepada siapa yang Dia kehendaki menuju jalan yang lurus.',
    reflection: 'Mood hidayah diarahkan ke film bertema perubahan diri, perjalanan iman, dan keputusan untuk menjadi lebih baik.'
  },
  {
    key: 'bahagia',
    label: 'Bahagia',
    title: 'Saat Bahagia',
    icon: '☀️',
    accent: 'from-yellow-400/25 to-orange-300/10',
    color: '#fbbf24',
    color2: '#f59e0b',
    glow: 'rgba(251,191,36,.18)',
    description: 'Untuk rasa syukur, hangat, ringan, dan ingin menikmati kebaikan.',
    message: 'Syukuri rasa lapang hari ini dengan tontonan yang hangat dan uplifting.',
    arabic: 'لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    dalil: 'QS. Ibrahim: 7',
    dalilText: 'Jika kamu bersyukur, niscaya Aku akan menambah nikmat kepadamu.',
    reflection: 'Mood bahagia diarahkan ke film keluarga, persahabatan, komedi hangat, dan cerita yang menguatkan rasa syukur.'
  },
  {
    key: 'marah',
    label: 'Marah',
    title: 'Saat Marah',
    icon: '🔥',
    accent: 'from-red-500/20 to-orange-400/10',
    color: '#f87171',
    color2: '#ef4444',
    glow: 'rgba(248,113,113,.18)',
    description: 'Untuk emosi yang perlu jeda, kontrol diri, dan ruang menenangkan diri.',
    message: 'Ambil jeda. Cerita yang tepat bisa membantu hati kembali jernih.',
    arabic: 'وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ',
    dalil: 'QS. Ali Imran: 134',
    dalilText: 'Orang-orang yang menahan amarahnya dan memaafkan manusia.',
    reflection: 'Mood marah diarahkan ke film yang membantu membaca konflik, konsekuensi pilihan, dan pentingnya pengendalian diri.'
  },
  {
    key: 'rindu',
    label: 'Rindu',
    title: 'Saat Rindu',
    icon: '🕊️',
    accent: 'from-teal-400/20 to-cyan-200/10',
    color: '#2dd4bf',
    color2: '#14b8a6',
    glow: 'rgba(45,212,191,.18)',
    description: 'Untuk rasa kangen, kehilangan, pulang, keluarga, atau memori yang masih hangat.',
    message: 'Rindu bisa menjadi ruang refleksi. Cari film yang hangat dan dekat di hati.',
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
    dalil: 'QS. Al-Baqarah: 152',
    dalilText: 'Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu.',
    reflection: 'Mood rindu diarahkan ke film tentang keluarga, cinta yang baik, kehilangan, dan makna pulang secara batin.'
  }
];

const moodKeywords = {
  sedih: ['sedih', 'sad', 'grief', 'loss', 'depression', 'sabar', 'drama', 'healing'],
  gelisah: ['gelisah', 'anxiety', 'fear', 'overthinking', 'thriller', 'tenang', 'calm'],
  hidayah: ['hidayah', 'faith', 'religion', 'spiritual', 'islam', 'taubat', 'inspiratif', 'inspirational'],
  bahagia: ['bahagia', 'happy', 'family', 'comedy', 'friendship', 'syukur'],
  marah: ['marah', 'anger', 'revenge', 'conflict', 'crime', 'action', 'sabar'],
  rindu: ['rindu', 'love', 'romance', 'family', 'memory', 'missing', 'loss']
};

export function normalizeMovie(movie) {
  return {
    id: movie.id || movie.movieId || `${movie.title_asli || movie.title || movie.title_en}-${movie.year}`,
    title: movie.title_asli || movie.title || movie.title_en || 'Tanpa Judul',
    year: movie.year || '',
    genres: movie.genres || movie.genre || '',
    poster: movie.poster_url || movie.poster || '',
    backdrop: movie.backdrop_url || movie.backdrop || movie.poster_url || movie.poster || '',
    overview: movie.overview || movie.description || 'Belum ada sinopsis.',
    rating: Number(movie.rating || movie.vote_average || 0),
    mood: String(movie.mood || '').toLowerCase(),
    raw: movie
  };
}

export const allMovies = movies.map(normalizeMovie);

export function getMoodByKey(key) {
  return MOODS.find((mood) => mood.key === String(key || '').toLowerCase()) || MOODS[0];
}

export function getMovieById(id) {
  return allMovies.find((movie) => String(movie.id) === String(id));
}

export function getGenres() {
  const set = new Set();
  allMovies.forEach((movie) => {
    String(movie.genres || '')
      .split(/[|,]/)
      .map((g) => g.trim())
      .filter(Boolean)
      .forEach((g) => set.add(g));
  });
  return Array.from(set).sort().slice(0, 40);
}

export function scoreMovie(movie, selectedMood = '') {
  const mood = String(selectedMood || '').toLowerCase();
  const text = `${movie.title} ${movie.genres} ${movie.overview} ${movie.mood}`.toLowerCase();
  let score = 0;

  if (!mood) score += 2;
  if (movie.mood.includes(mood)) score += 80;
  if (movie.mood === mood) score += 35;

  for (const keyword of moodKeywords[mood] || []) {
    if (text.includes(keyword)) score += 10;
  }

  if (movie.poster) score += 4;
  if (movie.overview && movie.overview.length > 80) score += 3;
  score += Math.min(movie.rating || 0, 10) * 2;
  if (Number(movie.year) >= 2020) score += 2;
  return score;
}

export function recommendMovies(selectedMood, limit = 24) {
  return allMovies
    .map((movie) => ({ ...movie, score: scoreMovie(movie, selectedMood) }))
    .filter((movie) => movie.score > 10)
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .slice(0, limit);
}

export function searchMovies({ query = '', mood = '', genre = '', sort = 'recommended' } = {}) {
  const q = query.trim().toLowerCase();
  const results = allMovies
    .map((movie) => ({ ...movie, score: scoreMovie(movie, mood) }))
    .filter((movie) => {
      const text = `${movie.title} ${movie.genres} ${movie.overview} ${movie.mood}`.toLowerCase();
      const queryMatch = !q || text.includes(q);
      const moodMatch = !mood || movie.mood.includes(mood) || scoreMovie(movie, mood) > 20;
      const genreMatch = !genre || String(movie.genres || '').toLowerCase().includes(genre.toLowerCase());
      return queryMatch && moodMatch && genreMatch;
    });

  if (sort === 'rating') return results.sort((a, b) => b.rating - a.rating);
  if (sort === 'year') return results.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
  if (sort === 'title') return results.sort((a, b) => a.title.localeCompare(b.title));
  return results.sort((a, b) => b.score - a.score || b.rating - a.rating);
}

export function buildReason(movie, selectedMood) {
  const mood = getMoodByKey(selectedMood || movie?.mood);
  if (!movie) return '';
  const genre = movie.genres ? `Genre ${movie.genres}` : 'Tema film ini';
  return `${genre} dan nuansa ceritanya cocok untuk mood ${mood.label}. Film ini dipilih karena memiliki kedekatan emosi dengan kondisi pengguna serta dapat menjadi bahan refleksi nilai dakwah secara ringan.`;
}

export function buildDalilNote(selectedMood) {
  const mood = getMoodByKey(selectedMood);
  return `${mood.dalil}: “${mood.dalilText}”`;
}
