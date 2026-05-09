import { filterAndSortMovies, movieCardTemplate, skeletonTemplate, emptyTemplate } from './recommendation.js';
import { initAimanWidget } from './aiman-widget.js';
import { initUiMotion, initActiveSectionState } from './ui-motion.js';

const MOODS = [
  { key: 'sedih', label: 'Sedih', icon: 'Sedih', desc: 'Reflektif dan menenangkan' },
  { key: 'gelisah', label: 'Gelisah', icon: 'Gelisah', desc: 'Pelan, teduh, dan stabil' },
  { key: 'hidayah', label: 'Hidayah', icon: 'Hidayah', desc: 'Iman, taubat, dan petunjuk' },
  { key: 'bahagia', label: 'Bahagia', icon: 'Bahagia', desc: 'Syukur, hangat, dan ringan' },
  { key: 'marah', label: 'Marah', icon: 'Marah', desc: 'Reda, adil, dan terkendali' },
  { key: 'rindu', label: 'Rindu', icon: 'Rindu', desc: 'Kenangan, cinta, dan pulang' }
];

let selectedMood = 'sedih';
let allMovies = [];

const byId = (id) => document.getElementById(id);
const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function moodLabel(key) {
  return MOODS.find((m) => m.key === key)?.label || key;
}

function canonicalMood(input = '') {
  const m = String(input).toLowerCase().trim();
  if (MOODS.some((x) => x.key === m)) return m;
  if (m === 'mencari-hidayah' || m === 'inspiratif') return 'hidayah';
  if (m === 'semangat') return 'bahagia';
  if (m === 'tenang') return 'gelisah';
  return 'sedih';
}

function toast(message) {
  const root = byId('toastContainer');
  if (!root) return;
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  root.appendChild(node);
  setTimeout(() => node.remove(), 2200);
}
window.toast = window.toast || toast;

function updateMoodButtons() {
  document.querySelectorAll('[data-mood]').forEach((btn) => {
    const active = btn.dataset.mood === selectedMood;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function renderMoodMessage() {
  const info = byId('reco-heading');
  if (info) info.textContent = `Mood terdeteksi: ${moodLabel(selectedMood)}. Ini rekomendasi film yang bisa menemani dan menenangkan hati.`;
}

function openModal(id) { byId(id)?.classList.remove('hidden'); }
function closeModal(id) { byId(id)?.classList.add('hidden'); }

function renderMovies() {
  const grid = byId('movieGrid');
  if (!grid) return;

  const search = byId('searchInput')?.value || '';
  const sort = byId('sortSelect')?.value || 'score';
  grid.innerHTML = skeletonTemplate(8);

  const movies = filterAndSortMovies(allMovies, selectedMood, search, sort).slice(0, 24);
  if (!movies.length) {
    grid.innerHTML = emptyTemplate();
    return;
  }

  grid.innerHTML = movies.map((m) => movieCardTemplate(m, moodLabel(selectedMood))).join('');
  grid.querySelectorAll('.movie-card').forEach((card, idx) => {
    const movie = movies[idx];
    card.addEventListener('click', () => openDetail(movie));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openDetail(movie); });
  });
}

function openDetail(movie) {
  const body = byId('detailBody');
  if (!body) return;

  const title = movie.title_asli || movie.title || 'Tanpa Judul';
  const poster = movie.poster_url || movie.poster || 'https://placehold.co/400x600/0d1413/b9d4ce?text=Poster';
  const meta = [movie.year || '-', movie.genres || movie.genre || 'Drama', `Rating ${Number(movie.rating || 0).toFixed(1)}`].join(' | ');

  body.innerHTML = `
    <div class="detail-grid">
      <img src="${escapeHtml(poster)}" alt="Poster ${escapeHtml(title)}" loading="lazy">
      <div>
        <h3 style="margin:0 0 8px">${escapeHtml(title)}</h3>
        <p style="margin:0 0 10px;color:var(--muted)">${escapeHtml(meta)}</p>
        <p style="line-height:1.65">${escapeHtml(movie.overview || 'Belum ada sinopsis.')}</p>
        <p class="reason"><strong>Kenapa direkomendasikan?</strong> ${escapeHtml(movie.reason || `Temanya sesuai dengan suasana ${moodLabel(selectedMood)} dan cocok untuk refleksi.`)}</p>
      </div>
    </div>
  `;
  openModal('detailModal');
}

async function loadMovies() {
  try {
    const r = await fetch('/api/movies');
    if (!r.ok) throw new Error('api unavailable');
    allMovies = await r.json();
  } catch (e) {
    allMovies = window.MOVIES_DATA || [];
    toast('Mode offline: memakai dataset lokal.');
  }
  renderMovies();
}

function initMoodUI() {
  const box = byId('quickMood');
  if (!box) return;
  box.innerHTML = MOODS.map((m) => `
    <button type="button" data-mood="${m.key}" aria-label="Pilih mood ${m.label}">
      <div style="font-weight:700">${m.icon}</div>
      <span class="mood-desc">${m.desc}</span>
    </button>
  `).join('');
  box.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedMood = btn.dataset.mood;
      updateMoodButtons();
      renderMoodMessage();
      renderMovies();
    });
  });
  updateMoodButtons();
}

function initSettings() {
  byId('settingsBtn')?.addEventListener('click', () => openModal('settingsModal'));
  byId('themeToggle')?.addEventListener('change', (e) => {
    document.documentElement.dataset.theme = e.target.checked ? 'light' : 'dark';
  });
  byId('fontSize')?.addEventListener('change', (e) => {
    document.documentElement.dataset.font = e.target.value;
  });
}

function initAuthModalHelpers() {
  window.closeAuth = () => closeModal('authModal');
  byId('loginEmail')?.addEventListener('click', () => openModal('authModal'));
}

function initModalClose() {
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal:not(.hidden)').forEach((modal) => modal.classList.add('hidden'));
  });
}

function initSearchSort() {
  byId('searchInput')?.addEventListener('input', renderMovies);
  byId('sortSelect')?.addEventListener('change', renderMovies);
}

function initMoodQuery() {
  const moodParam = new URLSearchParams(window.location.search).get('mood');
  if (moodParam) selectedMood = canonicalMood(moodParam);
}

function initA11y() {
  byId('miniChatInput')?.setAttribute('aria-label', 'Input chat AIMAN');
  byId('searchInput')?.setAttribute('aria-label', 'Cari film');
  byId('menuToggle')?.setAttribute('aria-label', 'Buka navigasi');
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.__IMAN_MODULAR_APP_READY__) return;
  window.__IMAN_MODULAR_APP_READY__ = true;

  initMoodQuery();
  initUiMotion();
  initActiveSectionState();
  initMoodUI();
  initSettings();
  initAuthModalHelpers();
  initModalClose();
  initSearchSort();
  initA11y();
  renderMoodMessage();
  initAimanWidget({
    onMoodDetected: (detectedMood) => {
      selectedMood = canonicalMood(detectedMood);
      updateMoodButtons();
      renderMoodMessage();
      renderMovies();
    }
  });
  loadMovies();
});