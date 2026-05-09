import { detectMoodFromText, computeRecommendationScore, normalizeMovie, saveUserInteraction, MoodLabels } from './recommendation-engine.js';

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const pageName = () => (document.body.dataset.page || location.pathname.split('/').pop().replace('.html','') || 'index').toLowerCase();
const esc = (v='') => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const movies = () => (window.MOVIES_DATA || window.MOVIES || []).map((m,i)=>normalizeMovie(m,i));

function toast(msg){
  let host = $('.iim-toast-host');
  if(!host){ host=document.createElement('div'); host.className='iim-toast-host'; document.body.appendChild(host); }
  const n=document.createElement('div'); n.className='iim-toast'; n.textContent=msg; host.appendChild(n); setTimeout(()=>n.remove(),2600);
}
window.iimToast = window.iimToast || toast;

function setPageDataset(){
  const map = { '':'index', '/':'index' };
  let p = pageName();
  if (p === 'film(1)') p = 'film';
  if (p === 'mood(2)') p = 'mood';
  document.body.dataset.page = document.body.dataset.page || p;
  document.body.classList.add('iim-enhanced');
  if (p === 'artikel') document.body.classList.add('iim-article-dark');
}

function ensureNavArtikel(){
  $$('.nav').forEach(nav=>{
    if(!nav.querySelector('a[href="artikel.html"]')){
      const info = nav.querySelector('a[href="info.html"]');
      const a = document.createElement('a'); a.href='artikel.html'; a.textContent='Artikel';
      info ? info.insertAdjacentElement('beforebegin', a) : nav.appendChild(a);
    }
    const current = location.pathname.split('/').pop() || 'index.html';
    $$('a', nav).forEach(a=>a.classList.toggle('active', a.getAttribute('href')===current || (current==='index.html' && a.getAttribute('href')==='#main')));
  });
  const toggles = ['#menuToggle','#moodMenuToggle'];
  toggles.forEach(sel=>{
    const btn=$(sel); const nav=$('#mainNav') || $('#navMenu') || $('.nav') || $('#moodButtons');
    if(!btn || !nav || btn.dataset.iimNavReady) return;
    btn.dataset.iimNavReady='1';
    btn.addEventListener('click',()=>{ nav.classList.toggle('open'); btn.setAttribute('aria-expanded', nav.classList.contains('open')?'true':'false'); });
  });
}

function setupReveal(){
  const items = $$('.article-card,.card,.movie-card,.feature,.how-card,.mood-btn,.hero-card');
  items.forEach(el=>el.classList.add('iim-reveal'));
  if(!('IntersectionObserver' in window)){ items.forEach(el=>el.classList.add('iim-show')); return; }
  const obs = new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('iim-show'); obs.unobserve(e.target); } }),{threshold:.12});
  items.forEach((el,i)=>{ el.style.transitionDelay=`${Math.min(i*25,180)}ms`; obs.observe(el); });
}

function getMovieFromCard(card){
  const rawId = card?.id;
  const data = movies();
  if(rawId !== undefined && rawId !== '' && !Number.isNaN(Number(rawId))) return data[Number(rawId)];
  const title = $('.movie-title,h3,h4', card)?.textContent?.trim() || $('.info h3', card)?.textContent?.trim();
  return data.find(m=>m.title===title || m.original?.title_asli===title);
}

function isSaved(type, id){
  try{return JSON.parse(localStorage.getItem(`iim_${type}`)||'[]').some(x=>String(x.id)===String(id));}catch{return false;}
}
function toggleSave(type, payload){
  const key=`iim_${type}`; let arr=[]; try{arr=JSON.parse(localStorage.getItem(key)||'[]')}catch{}
  const id=String(payload.id); const exists=arr.some(x=>String(x.id)===id);
  arr = exists ? arr.filter(x=>String(x.id)!==id) : [{...payload, at:Date.now()}, ...arr].slice(0,80);
  localStorage.setItem(key, JSON.stringify(arr));
  toast(exists?'Dihapus dari simpanan.':'Tersimpan di perangkat kamu.');
  return !exists;
}

function enhanceMovieCards(){
  const p = pageName(); if(!['film','mood','index'].includes(p)) return;
  const all = movies(); if(!all.length) return;
  $$('.card,.movie-card').forEach(card=>{
    if(card.dataset.iimTools) return;
    const movie = getMovieFromCard(card); if(!movie) return;
    card.dataset.iimTools='1';
    const selectedMood = $('#mood')?.value || localStorage.getItem('iman_last_mood') || movie.mood || 'bahagia';
    const score = computeRecommendationScore(movie, { mood:selectedMood, query:$('#q')?.value || $('#searchInput')?.value || '', history:{} }).score;
    const target = $('.info,.movie-info', card) || card;
    const id = movie.id || movie.title;
    const saved = isSaved('watchlist', id);
    target.insertAdjacentHTML('beforeend', `<div class="iim-card-tools"><span class="iim-score-pill">AI Match ${Math.round(score*100)}%</span><button type="button" class="iim-small-btn ${saved?'saved':''}" data-iim-save="watchlist">${saved?'Tersimpan':'Simpan'}</button><a class="iim-small-btn" href="artikel.html?q=${encodeURIComponent(movie.title)}">Fakta film</a></div>`);
    $('[data-iim-save]', target)?.addEventListener('click',(e)=>{ e.stopPropagation(); const now=toggleSave('watchlist',{id,title:movie.title,poster:movie.poster_url,mood:movie.mood}); e.currentTarget.classList.toggle('saved',now); e.currentTarget.textContent=now?'Tersimpan':'Simpan'; saveUserInteraction('like',{id,title:movie.title}); });
  });
}

function addSmartMoodBar(){
  if(!['film','mood'].includes(pageName())) return;
  const toolbar = $('.toolbar'); if(!toolbar || $('.iim-smartbar')) return;
  toolbar.insertAdjacentHTML('afterbegin', `<div class="iim-smartbar"><strong>Smart Mood Search aktif</strong><p>Ketik bebas seperti “lagi sedih dan overthinking”, nanti sistem bantu baca mood dan nyambungin ke filter film.</p><div class="iim-chiprow"><button data-smart="Aku lagi sedih">Sedih</button><button data-smart="Aku sedang gelisah">Gelisah</button><button data-smart="Aku butuh hidayah">Hidayah</button><button data-smart="Aku sedang rindu">Rindu</button></div></div>`);
  $('.iim-smartbar')?.addEventListener('click',e=>{ const b=e.target.closest('[data-smart]'); if(!b) return; const q=$('#q')||$('#searchInput'); if(q){ q.value=b.dataset.smart; q.dispatchEvent(new Event('input',{bubbles:true})); } });
  const q = $('#q') || $('#searchInput'); const moodSel = $('#mood');
  q?.addEventListener('input',()=>{
    const text=q.value.trim(); if(text.length<4) return;
    const detected=detectMoodFromText(text).mood;
    localStorage.setItem('iman_last_mood', detected);
    if(moodSel && [...moodSel.options].some(o=>o.value===detected)){ moodSel.value=detected; moodSel.dispatchEvent(new Event('change',{bubbles:true})); }
  });
}

function enhanceArticlePage(){
  if(pageName()!=='artikel') return;
  const heroCard=$('.hero-card');
  
  $$('.article-card').forEach(card=>{
    if(card.dataset.iimArticleTools) return; card.dataset.iimArticleTools='1';
    const title=$('.article-title',card)?.textContent?.trim() || 'Artikel';
    const id=card.querySelector('[id]')?.id || title;
    const body=$('.article-body',card) || card;
    const saved=isSaved('articles',id);
    body.insertAdjacentHTML('beforeend',`<div class="iim-card-tools"><span class="iim-score-pill">Fakta Film</span><button type="button" class="iim-small-btn ${saved?'saved':''}" data-iim-save-article>${saved?'Tersimpan':'Simpan artikel'}</button></div>`);
    $('[data-iim-save-article]',body)?.addEventListener('click',e=>{ const now=toggleSave('articles',{id,title}); e.currentTarget.classList.toggle('saved',now); e.currentTarget.textContent=now?'Tersimpan':'Simpan artikel'; });
  });
}

function enhanceAimanPage(){
  if(pageName()!=='aiman') return;
  const form=$('#chatForm'); const input=$('#promptInput'); if(!form || !input || form.dataset.iimFriendReady) return;
  form.dataset.iimFriendReady='1';
  const wrap=document.createElement('div'); wrap.className='iim-chiprow'; wrap.style.margin='0 auto 10px'; wrap.style.maxWidth='768px';
  wrap.innerHTML=['Temani aku pelan-pelan','Aku lagi overthinking','Kasih langkah kecil','Rekomendasi film sesuai mood'].map(x=>`<button type="button" data-prompt="${esc(x)}">${esc(x)}</button>`).join('');
  form.parentElement.insertBefore(wrap, form);
  wrap.addEventListener('click',e=>{ const b=e.target.closest('[data-prompt]'); if(!b) return; input.value=b.dataset.prompt; input.focus(); });
}

function observeRenders(){
  const root=$('#grid')||$('#movieGrid')||$('#articleList')||document.body;
  let t; const run=()=>{ clearTimeout(t); t=setTimeout(()=>{ enhanceMovieCards(); enhanceArticlePage(); setupReveal(); },120); };
  new MutationObserver(run).observe(root,{childList:true,subtree:true});
  run();
}

function init(){
  setPageDataset(); ensureNavArtikel(); addSmartMoodBar(); enhanceArticlePage(); enhanceAimanPage(); enhanceMovieCards(); setupReveal(); observeRenders();
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded',init) : init();
