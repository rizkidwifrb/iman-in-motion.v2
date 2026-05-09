import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Copy, ExternalLink, Instagram, X } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';

const sharedBio = [
  ['Prodi', 'Komunikasi dan Penyiaran Islam'],
  ['Fakultas', 'Fakultas Agama Islam'],
  ['Kampus', 'Universitas Ibn Khaldun Bogor']
];

const team = [
  {
    name: 'Rizki Dwi Febriansyah',
    shortName: 'Dwi',
    role: 'Fullstack Developer',
    image: '/dwi.jpg',
    imagePosition: 'center 18%',
    instagram: '@uwiberani',
    instagramUrl: 'https://www.instagram.com/uwiberani/',
    summary: 'Mengembangkan alur aplikasi, antarmuka, backend, AIMAN, dan integrasi fitur utama.',
    jobdesk: 'Bertanggung jawab pada pengembangan aplikasi secara menyeluruh, mulai dari tampilan antarmuka, navigasi halaman, integrasi login, sistem rekomendasi, sampai koneksi AIMAN dengan layanan AI. Peran ini memastikan pengalaman pengguna tetap nyaman di desktop maupun mobile, serta menjaga agar fitur mood, film, artikel, dan chat dapat berjalan sebagai satu kesatuan aplikasi.'
  },
  {
    name: 'Muhammad Fidri Takhrimsyah',
    shortName: 'Fidri',
    role: 'Data Engineer',
    image: '/fidri.jpg',
    imagePosition: 'center 6%',
    instagram: '@mfyyd.ry',
    instagramUrl: 'https://www.instagram.com/mfyyd.ry/',
    summary: 'Mengolah sumber data film, scraping pelengkap, filtering, dan pemetaan mood.',
    jobdesk: 'Bertanggung jawab pada pengolahan data film. Data awal diambil dari MovieLens, kemudian dilengkapi melalui proses scraping untuk memperoleh informasi tambahan seperti poster, sinopsis, genre, tahun, dan rating. Setelah itu, data dibersihkan, disaring, dan dipetakan ke enam kategori mood agar bisa digunakan oleh sistem rekomendasi IMAN IN MOTION.'
  },
  {
    name: 'Faris All Farizki',
    shortName: 'Faris',
    role: 'Database Administrator',
    image: '/faris.jpg',
    imagePosition: 'center 8%',
    instagram: '@faris.alrzz',
    instagramUrl: 'https://www.instagram.com/faris.alrzz/',
    summary: 'Menata struktur data film, artikel, genre, rating, poster, dan tag mood.',
    jobdesk: 'Bertanggung jawab pada perapihan dan pengelolaan struktur data agar mudah dipanggil oleh aplikasi. Peran ini meliputi penataan metadata film, konsistensi genre, rating, poster, mood, dan artikel, sehingga data yang telah diolah dapat ditampilkan dengan stabil pada halaman film, mood, artikel, dan detail rekomendasi.'
  }
];

const tabs = [
  ['about', 'Tentang IMAN IN MOTION'],
  ['team', 'Team UIKA-Berani Project'],
  ['copyright', 'Hak Cipta'],
  ['help', 'Bantuan']
];

function getTab() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const value = params.get('tab') || 'about';
  return tabs.some(([key]) => key === value) ? value : 'about';
}

function copyText(text, setCopied) {
  navigator.clipboard?.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }).catch(() => {
    setCopied(false);
  });
}

export default function Info() {
  const [activeTab, setActiveTab] = useState(getTab());
  const [activeMember, setActiveMember] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sync = () => setActiveTab(getTab());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeMember ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeMember]);

  const title = useMemo(() => {
    return tabs.find(([key]) => key === activeTab)?.[1] || 'Tentang IMAN IN MOTION';
  }, [activeTab]);

  function setTab(tab) {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#/info?tab=${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section className="container-page py-12 md:py-16">
      <SectionTitle eyebrow="Info Project" title={title} description="Pusat informasi IMAN IN MOTION: konsep aplikasi, tim pengembang, catatan hak cipta, dan bantuan penggunaan." />

      <div className="info-mobile-picker mb-8 md:hidden">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-iim-brown dark:text-iim-gold">Pilih informasi</p>
        <div className="info-select-shell">
          <select
            value={activeTab}
            onChange={(e) => setTab(e.target.value)}
            aria-label="Pilih informasi IMAN IN MOTION"
          >
            <option value="about">Tentang</option>
            <option value="team">Team</option>
            <option value="copyright">Hak Cipta</option>
            <option value="help">Bantuan</option>
          </select>
          <ChevronDown size={18} className="info-select-icon" />
        </div>
      </div>

      <div className="info-desktop-tabs mb-8 hidden gap-2 overflow-x-auto rounded-[1.75rem] border border-iim-brown/10 bg-white/50 p-2 dark:border-white/10 dark:bg-white/10 md:flex">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-black transition ${activeTab === key ? 'bg-iim-coffee text-iim-cream dark:bg-iim-gold dark:text-iim-charcoal' : 'text-iim-coffee hover:bg-white/70 dark:text-iim-cream dark:hover:bg-white/10'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="premium-card p-6 md:p-8">
              <h2 className="text-2xl font-black">Apa itu IMAN IN MOTION?</h2>
              <p className="mt-4 leading-8 text-iim-brown dark:text-iim-sand">
                IMAN IN MOTION adalah aplikasi rekomendasi film dakwah berbasis mood yang membantu pengguna menemukan tontonan sesuai kondisi hati. Aplikasi ini tidak hanya menyajikan daftar film, tetapi juga menghubungkan film dengan dalil, artikel reflektif, dan percakapan AIMAN sebagai ruang pemahaman dakwah yang lebih personal.
              </p>
            </div>
            <div className="premium-card p-6 md:p-8">
              <h2 className="text-2xl font-black">Tujuan aplikasi</h2>
              <p className="mt-4 leading-8 text-iim-brown dark:text-iim-sand">
                Tujuan utama IMAN IN MOTION adalah menghadirkan literasi dakwah dalam bentuk yang dekat dengan kebiasaan audiens digital. Pengguna memulai dari mood, lalu diarahkan pada film, nilai pesan, artikel, dan percakapan yang membantu membaca makna di balik cerita.
              </p>
            </div>
          </div>

          <div className="premium-card p-6 md:p-8">
            <h2 className="text-2xl font-black">Model literasi dakwah berbasis mood</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-5">
              {[
                ['1', 'Mood', 'Pengguna memilih kondisi hati yang paling dekat.'],
                ['2', 'Film', 'Sistem menampilkan film yang sesuai dengan mood.'],
                ['3', 'Dalil', 'Penguatan nilai Islam diberikan sesuai konteks rasa.'],
                ['4', 'Artikel', 'Cerita film dibaca sebagai bahan refleksi dakwah.'],
                ['5', 'AIMAN', 'Chat membantu pengguna memahami rasa secara lebih personal.']
              ].map(([num, head, desc]) => (
                <div key={num} className="rounded-3xl bg-white/60 p-4 dark:bg-white/10">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-iim-gold text-sm font-black text-iim-charcoal">{num}</div>
                  <h3 className="mt-4 font-black">{head}</h3>
                  <p className="mt-2 text-sm leading-6 text-iim-brown dark:text-iim-sand">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ['Komunikasi Interpersonal', 'Aplikasi menyapa pengguna dari kondisi perasaan sehingga pengalaman terasa lebih dekat dan tidak menghakimi.'],
              ['Komunikasi Dakwah', 'Pesan dakwah disampaikan secara lembut melalui cerita, refleksi, dan dalil yang relevan dengan suasana hati.'],
              ['Komunikasi Digital', 'Film, artikel, dan chat AI dipadukan agar dakwah hadir dalam format yang akrab dengan kebiasaan audiens muda.']
            ].map(([head, desc]) => (
              <div key={head} className="premium-card p-6">
                <h3 className="text-xl font-black">{head}</h3>
                <p className="mt-3 leading-7 text-iim-brown dark:text-iim-sand">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <section>
          <SectionTitle centered eyebrow="Our Team" title="UIKA-Berani Project" description="Tim pengembang IMAN IN MOTION dari Program Studi Komunikasi dan Penyiaran Islam, Fakultas Agama Islam, Universitas Ibn Khaldun Bogor." />
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <article key={member.name} className="team-card premium-card relative flex h-full cursor-pointer flex-col p-5" role="button" tabIndex={0} onClick={() => setActiveMember(member)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveMember(member)}>
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-iim-gold/20">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: member.imagePosition || 'center 22%' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-black leading-tight text-iim-coffee dark:text-iim-cream">{member.shortName}</h3>
                    <p className="mt-1 text-sm font-extrabold text-iim-brown dark:text-iim-gold">{member.role}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-iim-brown/75 dark:text-iim-sand"><Instagram size={13} /> {member.instagram}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 min-h-[5.25rem] text-sm leading-7 text-iim-brown dark:text-iim-sand">{member.summary}</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMember(member); }} className="relative z-10 mt-auto inline-flex w-fit rounded-2xl bg-iim-gold px-4 py-2 text-sm font-black text-iim-charcoal transition hover:-translate-y-0.5">Lihat detail</button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'copyright' && (
        <div className="premium-card grid min-h-[260px] place-items-center p-8 text-center">
          <div>
            <p className="section-eyebrow">Hak Cipta</p>
            <h2 className="mt-3 text-4xl font-black text-iim-coffee dark:text-iim-cream">Soon</h2>
            <p className="mt-3 text-iim-brown dark:text-iim-sand">Informasi hak cipta akan ditambahkan pada tahap berikutnya.</p>
          </div>
        </div>
      )}

      {activeTab === 'help' && (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="premium-card p-6 md:p-8">
            <h2 className="text-2xl font-black">Bantuan penggunaan</h2>
            <div className="mt-5 grid gap-3">
              {[
                ['Pilih mood', 'Mulai dari suasana hati yang paling dekat, lalu aplikasi akan menampilkan dalil dan film yang sesuai.'],
                ['Cari film', 'Gunakan menu Film untuk mencari judul, genre, tahun, rating, dan rekomendasi berdasarkan mood.'],
                ['Baca artikel', 'Artikel membantu menghubungkan cerita film dengan pesan moral, refleksi, dan nilai dakwah.'],
                ['Gunakan AIMAN', 'Ceritakan kondisi hati, minta dalil, atau minta rekomendasi film yang lebih personal.']
              ].map(([head, desc]) => (
                <div key={head} className="rounded-3xl bg-white/60 p-4 dark:bg-white/10">
                  <p className="font-black">{head}</p>
                  <p className="mt-1 text-sm leading-6 text-iim-brown dark:text-iim-sand">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="premium-card p-6 md:p-8">
            <h2 className="text-2xl font-black">Kontak</h2>
            <div className="mt-5 rounded-3xl bg-iim-gold/15 p-5">
              <p className="text-sm font-bold text-iim-brown dark:text-iim-sand">Nama</p>
              <p className="mt-1 text-xl font-black">Dwi</p>
              <p className="mt-4 text-sm font-bold text-iim-brown dark:text-iim-sand">WhatsApp</p>
              <p className="mt-1 text-xl font-black">+62 896 8221 8382</p>
              <button type="button" onClick={() => copyText('+62 896 8221 8382', setCopied)} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-iim-coffee px-4 py-3 text-sm font-black text-iim-cream transition hover:-translate-y-0.5 dark:bg-iim-gold dark:text-iim-charcoal">
                <Copy size={16} /> {copied ? 'Nomor tersalin' : 'Salin nomor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeMember && (
        <div className="team-modal-overlay fixed inset-0 z-[200] grid place-items-center bg-black/85 p-4 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) setActiveMember(null); }}>
          <div className="team-modal-sheet max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-iim-cream p-5 shadow-premium dark:bg-[#18130f]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl bg-iim-gold/20">
                  <img
                    src={activeMember.image}
                    alt={activeMember.name}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: activeMember.imagePosition || 'center 22%' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="section-eyebrow">Detail Tim</p>
                  <h3 className="mt-2 text-2xl font-black text-iim-coffee dark:text-iim-cream">{activeMember.name}</h3>
                  <p className="mt-1 font-extrabold text-iim-brown dark:text-iim-gold">{activeMember.role}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-iim-brown dark:text-iim-sand"><Instagram size={14} /> {activeMember.instagram}</p>
                </div>
              </div>
              <button className="rounded-2xl border border-iim-brown/15 p-3 dark:border-white/10" onClick={() => setActiveMember(null)} aria-label="Tutup detail"><X size={18} /></button>
            </div>

            <div className="mt-5 grid gap-3 rounded-3xl bg-white/60 p-4 text-sm leading-7 dark:bg-white/10 sm:grid-cols-2">
              <p><b>Nama:</b> {activeMember.name}</p>
              {sharedBio.map(([label, value]) => <p key={label}><b>{label}:</b> {value}</p>)}
            </div>
            <div className="mt-4 rounded-3xl border border-iim-gold/20 bg-iim-gold/10 p-5">
              <p className="text-xs font-extrabold uppercase tracking-widest text-iim-brown dark:text-iim-gold">Penjelasan tugas</p>
              <p className="mt-3 leading-8 text-iim-brown dark:text-iim-sand">{activeMember.jobdesk}</p>
              <a href={activeMember.instagramUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-iim-gold px-4 py-3 text-sm font-black text-iim-charcoal transition hover:-translate-y-0.5">
                <ExternalLink size={16} /> Kunjungi Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
