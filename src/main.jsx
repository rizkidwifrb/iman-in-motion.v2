import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { BookOpen, Film as FilmIcon, Home as HomeIcon, Info as InfoIcon, MessageCircle, Moon, Settings, SmilePlus, Sun, UserRound, X } from 'lucide-react';
import Home from './pages/Home';
import Mood from './pages/Mood';
import Film from './pages/Film';
import FilmDetail from './pages/FilmDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Aiman from './pages/Aiman';
import Info from './pages/Info';
import { movies as splashMovies } from './data/movies';


const firebaseConfig = {
  apiKey: 'AIzaSyDi3zOmx6tf9MSCMp7HDlCk4-5QY4nZK7E',
  authDomain: 'uwiberani-project.firebaseapp.com',
  projectId: 'uwiberani-project',
  storageBucket: 'uwiberani-project.appspot.com',
  messagingSenderId: '735078024592',
  appId: '1:735078024592:web:8e15bb85b0448402425f15'
};

let firebaseAuthCache = null;
let firebaseFnsCache = null;

async function loadFirebaseAuth() {
  if (firebaseAuthCache && firebaseFnsCache) return { auth: firebaseAuthCache, ...firebaseFnsCache };
  const appModule = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
  const authModule = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
  const app = appModule.initializeApp(firebaseConfig);
  const auth = authModule.getAuth(app);
  const provider = new authModule.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  firebaseAuthCache = auth;
  firebaseFnsCache = { ...authModule, provider };
  return { auth, ...firebaseFnsCache };
}

function storeFirebaseUser(user) {
  if (!user) {
    localStorage.removeItem('iman_user');
    window.IMAN_AUTH = { currentUser: null };
    window.dispatchEvent(new Event('iman-auth-change'));
    return null;
  }
  const name = user.displayName || user.email?.split('@')[0] || 'Kak';
  const payload = {
    uid: user.uid,
    name,
    email: user.email || '',
    photoURL: user.photoURL || ''
  };
  localStorage.setItem('iman_user', JSON.stringify(payload));
  window.IMAN_AUTH = { currentUser: user };
  window.dispatchEvent(new Event('iman-auth-change'));
  return payload;
}

const routes = {
  '/': Home,
  '/mood': Mood,
  '/film': Film,
  '/articles': Articles,
  '/artikel': Articles,
  '/aiman': Aiman,
  '/info': Info
};

function getPath() {
  const hash = window.location.hash.replace('#', '') || '/';
  const clean = hash.split('?')[0];
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function Link({ to, children, className = '', onClick }) {
  return <a href={`#${to}`} onClick={onClick} className={className}>{children}</a>;
}

function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-iim-brown/15 bg-white/65 text-iim-coffee transition hover:-translate-y-0.5 hover:border-iim-gold dark:border-white/10 dark:bg-white/10 dark:text-iim-cream"
      aria-label="Ganti tema"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function AuthModal({ mode, setMode, close }) {
  const [tab, setTab] = useState('masuk');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedUser, setSavedUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('iman_user') || 'null'); } catch { return null; }
  });

  useEffect(() => {
    if (mode === 'auth') {
      setTab('masuk');
      setError('');
    }
  }, [mode]);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    loadFirebaseAuth().then(({ auth, onAuthStateChanged }) => {
      if (!active) return;
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        const stored = storeFirebaseUser(firebaseUser);
        setSavedUser(stored);
      });
    }).catch(() => {});
    return () => { active = false; unsubscribe(); };
  }, []);

  if (!mode) return null;

  function readableError(err) {
    const code = err?.code || '';
    const map = {
      'auth/email-already-in-use': 'Email sudah terdaftar. Silakan masuk.',
      'auth/invalid-email': 'Format email belum valid.',
      'auth/weak-password': 'Password minimal 6 karakter.',
      'auth/user-not-found': 'Akun tidak ditemukan. Coba daftar terlebih dahulu.',
      'auth/wrong-password': 'Password salah.',
      'auth/invalid-credential': 'Email atau password salah.',
      'auth/popup-blocked': 'Popup Google diblokir browser. Izinkan popup lalu coba lagi.'
    };
    return map[code] || 'Login belum berhasil. Coba beberapa saat lagi.';
  }

  async function loginWithGoogle() {
    setError('');
    setLoading(true);
    try {
      const { auth, signInWithPopup, provider } = await loadFirebaseAuth();
      const result = await signInWithPopup(auth, provider);
      storeFirebaseUser(result.user);
      close();
    } catch (err) {
      if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err?.code)) {
        setError(readableError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitEmail(e) {
    e.preventDefault();
    setError('');
    if (tab === 'daftar' && !name.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim() || password.length < 6) {
      setError('Email dan password minimal 6 karakter wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      let credential;
      if (tab === 'daftar') {
        const { auth, createUserWithEmailAndPassword, updateProfile } = await loadFirebaseAuth();
        credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credential.user, { displayName: name.trim() });
      } else {
        const { auth, signInWithEmailAndPassword } = await loadFirebaseAuth();
        credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      storeFirebaseUser(credential.user);
      close();
    } catch (err) {
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      const { auth, signOut } = await loadFirebaseAuth();
      await signOut(auth);
      storeFirebaseUser(null);
      setSavedUser(null);
      close();
    } finally {
      setLoading(false);
    }
  }

  function goInfo(tab) {
    window.location.hash = `#/info?tab=${tab}`;
    close();
  }

  const settingMenus = [
    { title: 'Pengaturan', icon: '⚙', action: () => { localStorage.removeItem('iman_last_mood'); localStorage.removeItem('iman_chat_history'); }, actionLabel: 'Hapus riwayat' },
    { title: 'Akun', icon: '👤', action: () => setMode('auth'), actionLabel: savedUser ? 'Kelola' : 'Masuk' },
    { title: 'Tentang IMAN IN MOTION', icon: 'ℹ', action: () => goInfo('about'), actionLabel: 'Buka' },
    { title: 'Team UIKA-Berani Project', icon: '👥', action: () => goInfo('team'), actionLabel: 'Lihat' },
    { title: 'Hak Cipta', icon: '©', action: () => goInfo('copyright'), actionLabel: 'Soon' },
    { title: 'Bantuan', icon: '💬', action: () => goInfo('help'), actionLabel: 'Kontak' }
  ];

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-white/10 bg-iim-cream p-4 shadow-premium dark:bg-[#19140f] sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-eyebrow">{mode === 'settings' ? 'Menu' : 'Akun IMAN'}</p>
            <h2 className="mt-1 text-xl font-black text-iim-coffee dark:text-iim-cream sm:text-2xl">{mode === 'settings' ? 'IMAN IN MOTION' : 'Masuk atau daftar'}</h2>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-2xl border border-iim-brown/15 dark:border-white/10" onClick={close} aria-label="Tutup"><X size={18} /></button>
        </div>

        {mode === 'settings' ? (
          <div className="mt-5 space-y-2">
            {settingMenus.map((item) => (
              <button key={item.title} type="button" onClick={item.action} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-iim-brown/10 bg-white/60 px-3.5 py-3 text-left transition hover:border-iim-gold hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-iim-gold/20 text-sm font-black text-iim-gold">{item.icon}</span>
                  <span className="truncate text-sm font-black text-iim-coffee dark:text-iim-cream">{item.title}</span>
                </span>
                <span className="shrink-0 rounded-full bg-iim-gold px-3 py-1.5 text-[11px] font-black text-iim-charcoal">{item.actionLabel}</span>
              </button>
            ))}
            {savedUser && (
              <button type="button" disabled={loading} onClick={logout} className="mt-3 w-full rounded-2xl bg-iim-coffee px-4 py-3 text-sm font-extrabold text-iim-cream dark:bg-iim-gold dark:text-iim-charcoal">Keluar akun</button>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <div className="grid grid-cols-2 rounded-2xl bg-white/65 p-1 dark:bg-white/10">
              <button className={`rounded-xl px-4 py-3 text-sm font-extrabold ${tab === 'masuk' ? 'bg-iim-coffee text-iim-cream dark:bg-iim-gold dark:text-iim-charcoal' : ''}`} onClick={() => { setTab('masuk'); setError(''); }}>Masuk</button>
              <button className={`rounded-xl px-4 py-3 text-sm font-extrabold ${tab === 'daftar' ? 'bg-iim-coffee text-iim-cream dark:bg-iim-gold dark:text-iim-charcoal' : ''}`} onClick={() => { setTab('daftar'); setError(''); }}>Daftar</button>
            </div>

            <button id="authGoogleBtn" type="button" disabled={loading} onClick={loginWithGoogle} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-iim-brown/15 bg-white px-4 py-3 font-extrabold text-iim-coffee shadow-sm transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-iim-cream">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm text-iim-coffee">G</span>
              {loading ? 'Memproses...' : 'Masuk dengan Google'}
            </button>

            <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-iim-brown/70 dark:text-iim-sand/70"><span className="h-px flex-1 bg-iim-brown/15 dark:bg-white/10" />atau email<span className="h-px flex-1 bg-iim-brown/15 dark:bg-white/10" /></div>

            <form onSubmit={submitEmail} className="space-y-3">
              {tab === 'daftar' && <input className="input-premium" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" required />}
              <input className="input-premium" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
              <input className="input-premium" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} />
              {error && <p className="rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-200">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:cursor-wait disabled:opacity-60">{loading ? 'Memproses...' : tab === 'daftar' ? 'Buat Akun' : 'Masuk'}</button>
            </form>
            <p className="mt-4 text-center text-xs leading-6 text-iim-brown dark:text-iim-sand">Akun digunakan untuk menyimpan preferensi mood dan pengalaman membaca di IMAN IN MOTION.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Navbar({ path, theme, setTheme }) {
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('iman_user') || 'null'); } catch { return null; }
  });
  const desktopLinks = [
    ['/', 'Home', HomeIcon],
    ['/mood', 'Mood', SmilePlus],
    ['/film', 'Film', FilmIcon],
    ['/articles', 'Artikel', BookOpen],
    ['/aiman', 'AIMAN', MessageCircle],
    ['/info', 'Info', InfoIcon]
  ];
  const mobileLinks = [
    ['/', 'Home', HomeIcon],
    ['/mood', 'Mood', SmilePlus],
    ['/film', 'Film', FilmIcon],
    ['/articles', 'Artikel', BookOpen],
    ['/aiman', 'AIMAN', MessageCircle]
  ];
  const isActive = (to) => path === to || (to === '/articles' && path.startsWith('/article/')) || (to === '/film' && path.startsWith('/film/'));

  async function handleGoogleNav() {
    if (user) {
      setModal('settings');
      return;
    }
    try {
      const { auth, signInWithPopup, provider } = await loadFirebaseAuth();
      const result = await signInWithPopup(auth, provider);
      setUser(storeFirebaseUser(result.user));
    } catch (err) {
      if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err?.code)) {
        setModal('auth');
      }
    }
  }

  useEffect(() => {
    const refresh = () => { try { setUser(JSON.parse(localStorage.getItem('iman_user') || 'null')); } catch { setUser(null); } };
    window.addEventListener('storage', refresh);
    window.addEventListener('iman-auth-change', refresh);
    let unsub = () => {};
    loadFirebaseAuth().then(({ auth, onAuthStateChanged }) => {
      unsub = onAuthStateChanged(auth, (firebaseUser) => setUser(storeFirebaseUser(firebaseUser)));
    }).catch(() => {});
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('iman-auth-change', refresh); unsub(); };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-iim-brown/10 bg-iim-cream/86 backdrop-blur-2xl dark:border-white/10 dark:bg-iim-charcoal/86">
        <div className="desktop-header-grid container-page hidden h-20 items-center justify-between gap-3 md:grid">
          <Link to="/" className="desktop-brand flex items-center gap-3">
            <img src="/logo.png" alt="IMAN IN MOTION" className="h-12 w-12 rounded-2xl object-contain shadow-glow" />
            <div>
              <p className="text-sm font-extrabold tracking-[0.22em] text-iim-coffee dark:text-iim-cream">IMAN IN MOTION</p>
              <p className="text-xs font-semibold text-iim-brown dark:text-iim-sand">Rekomendasi film dakwah berbasis mood</p>
            </div>
          </Link>

          <nav className="desktop-menu hidden items-center gap-1 md:flex">
            {desktopLinks.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className={`desktop-menu-link rounded-2xl px-4 py-2 text-sm font-bold transition ${isActive(to) ? 'bg-iim-coffee text-iim-cream shadow-glow dark:bg-iim-gold dark:text-iim-charcoal' : 'text-iim-coffee hover:bg-white/60 dark:text-iim-cream dark:hover:bg-white/10'}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="desktop-actions flex items-center gap-2">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <button type="button" id="settingsBtn" onClick={() => setModal('settings')} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-iim-brown/15 bg-white/65 text-iim-coffee transition hover:-translate-y-0.5 hover:border-iim-gold dark:border-white/10 dark:bg-white/10 dark:text-iim-cream" aria-label="Settings"><Settings size={18} /></button>
            <button type="button" id="loginGoogle" onClick={handleGoogleNav} className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-iim-gold px-4 text-sm font-extrabold leading-none text-iim-charcoal transition hover:-translate-y-0.5">
              <UserRound size={16} />
              <span>{user?.name?.split(' ')[0] || 'Google'}</span>
            </button>
            <button type="button" id="loginEmail" onClick={() => setModal('auth')} className="inline-flex h-11 items-center justify-center rounded-2xl border border-iim-brown/15 bg-white/65 px-4 text-sm font-extrabold leading-none text-iim-coffee transition hover:-translate-y-0.5 hover:border-iim-gold dark:border-white/10 dark:bg-white/10 dark:text-iim-cream">
              {user ? 'Akun' : 'Masuk'}
            </button>
          </div>
        </div>

        <div className="mobile-app-topbar md:hidden">
          <Link to="/" className="mobile-brand-lockup" aria-label="IMAN IN MOTION Home">
            <img src="/logo.png" alt="IMAN IN MOTION" />
            <div>
              <p><span>IMAN IN</span><span>MOTION</span></p>
            </div>
          </Link>
          <div className="mobile-account-actions">
            <button type="button" onClick={handleGoogleNav} className="mobile-google-btn" aria-label="Login Google">
              G
            </button>
            <button type="button" onClick={() => setModal('auth')} className="mobile-login-btn">
              {user ? 'Akun' : 'Masuk'}
            </button>
            <button type="button" onClick={() => setModal('settings')} className="mobile-setting-btn" aria-label="Pengaturan">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      <nav className="mobile-bottom-nav md:hidden" aria-label="Navigasi utama mobile">
        {mobileLinks.map(([to, label, Icon]) => (
          <Link
            key={to}
            to={to}
            className={`mobile-bottom-nav-item ${isActive(to) ? 'active' : ''}`}
            aria-label={label}
            title={label}
          >
            <Icon size={20} strokeWidth={2.2} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <AuthModal mode={modal} setMode={setModal} close={() => setModal(null)} />
    </>
  );
}

function SplashScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const finishRef = React.useRef(false);
  const splashPosters = useMemo(() => splashMovies.filter((movie) => movie.poster_url).slice(0, 30), []);

  function finish() {
    if (finishRef.current) return;
    finishRef.current = true;
    setLeaving(true);
    window.setTimeout(() => {
      sessionStorage.setItem('iim_splash_seen', 'yes');
      onDone?.();
    }, 520);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => finish(), 4600);
    const keyHandler = (event) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') finish();
    };
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  return (
    <button
      type="button"
      className={`splash-screen ${leaving ? 'leaving' : ''}`}
      onClick={finish}
      aria-label="Klik di mana saja untuk melanjutkan ke IMAN IN MOTION"
    >
      <span className="splash-3d-stage" aria-hidden="true">
        {[0, 1, 2].map((row) => (
          <span key={row} className={`splash-poster-row row-${row + 1}`}>
            {[...splashPosters, ...splashPosters.slice(0, 12)].map((movie, index) => (
              <span className="splash-poster-tile" key={`${row}-${movie.title_asli}-${index}`}>
                <img src={movie.poster_url} alt="" loading="eager" />
              </span>
            ))}
          </span>
        ))}
      </span>
      <span className="splash-orb splash-orb-one" />
      <span className="splash-orb splash-orb-two" />
      <span className="splash-orb splash-orb-three" />
      <span className="splash-film-line line-a" />
      <span className="splash-film-line line-b" />
      <span className="splash-film-line line-c" />
      <span className="splash-mood-dot dot-a" />
      <span className="splash-mood-dot dot-b" />
      <span className="splash-mood-dot dot-c" />
      <span className="splash-spark spark-a">✦</span>
      <span className="splash-spark spark-b">✧</span>
      <span className="splash-spark spark-c">•</span>

      <span className="splash-center">
        <span className="splash-logo-wrap">
          <img src="/logo.png" alt="IMAN IN MOTION" className="splash-logo" />
          <span className="splash-logo-shadow" />
        </span>
        <span className="splash-copy">
          <span className="splash-eyebrow">Mood • Film • Refleksi</span>
          <span className="splash-title">IMAN IN MOTION</span>
          <span className="splash-subtitle">Temukan tontonan yang menyentuh hati dan menguatkan iman.</span>
        </span>
        <span className="splash-continue">Klik di mana saja untuk melanjutkan</span>
      </span>
    </button>
  );
}

function App() {
  const [path, setPath] = useState(getPath());
  const [theme, setThemeState] = useState(() => localStorage.getItem('iim-theme') || 'dark');
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem('iim_splash_seen') !== 'yes');

  useEffect(() => {
    const handler = () => setPath(getPath());
    window.addEventListener('hashchange', handler);
    if (!window.location.hash) window.location.hash = '/';
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('iim-theme', theme);
  }, [theme]);

  const Page = useMemo(() => {
    if (path.startsWith('/film/')) return FilmDetail;
    if (path.startsWith('/article/')) return ArticleDetail;
    return routes[path] || Home;
  }, [path]);

  const isAimanRoute = path === '/aiman';

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <div className={`min-h-screen text-iim-coffee dark:text-iim-cream ${isAimanRoute ? 'is-aiman-route' : ''}`}>
      <Navbar path={path} theme={theme} setTheme={setThemeState} />
      <main className="fade-in">
        <Page path={path} />
      </main>
      {!isAimanRoute && <footer className="mt-16 border-t border-iim-brown/10 py-8 dark:border-white/10">
        <div className="container-page flex flex-col gap-3 text-sm text-iim-brown dark:text-iim-sand md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">© {new Date().getFullYear()} IMAN IN MOTION. Model literasi dakwah berbasis mood.</p>
          <p>Because we move with iman, story, and reflection.</p>
        </div>
      </footer>}
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
