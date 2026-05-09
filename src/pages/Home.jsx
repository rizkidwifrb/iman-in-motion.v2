import SectionTitle from '../components/SectionTitle';
import MoodCard from '../components/MoodCard';
import FilmCard from '../components/FilmCard';
import ArticleCard from '../components/ArticleCard';
import { MOODS, recommendMovies } from '../services/recommendationService';
import articles from '../data/articles';

export default function Home() {
  const featured = recommendMovies('hidayah', 6);
  const featuredArticles = articles.slice(0, 3);

  return (
    <div>
      <section className="home-hero container-page grid items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <div>
          <p className="section-eyebrow">Web rekomendasi film dakwah</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight tracking-[-0.04em] text-iim-coffee dark:text-iim-cream md:text-7xl">
            Temukan film dakwah sesuai suasana hatimu.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-iim-brown dark:text-iim-sand">
            IMAN IN MOTION membantu pengguna memilih tontonan yang bukan cuma menghibur, tapi juga membuka ruang refleksi, nilai dakwah, dalil, dan percakapan batin lewat AIMAN.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#/mood" className="btn-primary">Mulai dari Mood</a>
            <a href="#/film" className="btn-secondary">Buka Rekomendasi Film</a>
          </div>
          <div className="home-stats mt-8 grid gap-3 sm:grid-cols-3">
            {['696+ data film', '6 mood final', 'Dalil + AIMAN chat'].map((item) => (
              <div key={item} className="rounded-3xl border border-iim-brown/10 bg-white/50 p-4 text-sm font-extrabold text-iim-coffee dark:border-white/10 dark:bg-white/10 dark:text-iim-cream">{item}</div>
            ))}
          </div>
        </div>

        <div className="home-preview-card premium-card relative overflow-hidden p-3 lg:p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-iim-gold/25 via-transparent to-iim-brown/20" />
          <div className="relative z-10 rounded-[1.75rem] bg-iim-charcoal p-4 text-iim-cream shadow-premium md:p-5">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="h-14 w-14 shrink-0 rounded-3xl bg-iim-cream object-contain p-1 shadow-glow" />
              <div>
                <p className="text-xs font-extrabold tracking-[0.24em] text-iim-gold">IMAN IN MOTION</p>
                <p className="mt-1 text-lg font-black md:text-xl">Mood → Film → Refleksi</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-white/5 p-3">
              <p className="mb-3 px-1 text-xs font-extrabold uppercase tracking-[0.24em] text-iim-gold">Pilih mood langsung</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MOODS.map((mood) => <MoodCard key={mood.key} mood={mood} mini />)}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-iim-gold/20 bg-iim-gold/10 p-4">
              <p className="text-sm font-extrabold text-iim-gold">Dalil mode aktif</p>
              <p className="mt-2 text-xs leading-6 text-iim-sand">Pilih suasana hati, lalu temukan dalil singkat, ruang refleksi, dan film yang lebih nyambung dengan kondisi kamu.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <SectionTitle eyebrow="Model literasi dakwah" title="Bukan sekadar rekomendasi, tapi perjalanan memahami pesan." description="Aplikasi ini menghubungkan kondisi emosional pengguna dengan pilihan film, artikel reflektif, dalil, dan AIMAN agar literasi dakwah terasa lebih dekat dengan pengalaman sehari-hari." />
        <div className="grid gap-5 md:grid-cols-4">
          {[
            ['1', 'Mood Mapping', 'Pengguna memilih kondisi emosi awal sebagai pintu masuk literasi.'],
            ['2', 'Film Matching', 'Sistem mencocokkan mood dengan genre, sinopsis, rating, dan tag film.'],
            ['3', 'Dalil & Nilai', 'Setiap mood diberi penguatan pesan dakwah dan dalil singkat.'],
            ['4', 'Dakwah Reflection', 'Artikel dan AIMAN membantu pengguna membaca makna di balik tontonan.']
          ].map(([num, title, desc]) => (
            <div key={num} className="premium-card p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-iim-coffee text-lg font-black text-iim-cream dark:bg-iim-gold dark:text-iim-charcoal">{num}</div>
              <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
              <p className="mt-3 leading-7 text-iim-brown dark:text-iim-sand">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <SectionTitle eyebrow="Pilih suasana hati" title="Mulai dari kondisi hati yang paling dekat." description="Setiap mood menghubungkan kamu dengan dalil, refleksi, dan rekomendasi film yang sesuai." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {MOODS.map((mood) => <MoodCard key={mood.key} mood={mood} compact />)}
        </div>
      </section>

      <section className="container-page py-10">
        <SectionTitle eyebrow="Rekomendasi awal" title="Film pilihan untuk membuka refleksi." description="Preview ini diambil dari rekomendasi mood hidayah. Pilih mood lain untuk hasil yang lebih personal." />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {featured.map((movie) => <FilmCard key={movie.id} movie={movie} mood="hidayah" />)}
        </div>
      </section>

      <section className="container-page py-10">
        <SectionTitle eyebrow="Artikel literasi" title="Baca makna di balik tontonan." description="Tulisan reflektif yang membantu menghubungkan cerita film dengan nilai dakwah dan pengalaman sehari-hari." />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredArticles.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
        <div className="mt-6 text-center">
          <a href="#/articles" className="btn-secondary">Lihat selengkapnya</a>
        </div>
      </section>
    </div>
  );
}
