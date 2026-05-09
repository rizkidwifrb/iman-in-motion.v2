(function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const splitGenres = v => String(v || '').split(/[,|]/).map(x => x.trim()).filter(Boolean);
  const dakwahWords = ['islam','muslim','dakwah','faith','iman','hidayah','religion','religious','quran','qur\'an','allah','mosque','masjid','ramadan','prayer','doa','shalat','ustadz','pesantren','hijrah','spiritual','god','prophet','nabi','muhammad','sufi','rumi','al-azhar','qur’an'];
  const state = { page: 1, perPage: 12 };
  function textOf(a){ return [a.title,a.movieTitle,a.excerpt,a.fact,a.content,a.overview,a.genres,a.mood,a.country,a.language,(a.tags||[]).join(' ')].join(' ').toLowerCase(); }
  function isDakwah(a){ const t=textOf(a); return dakwahWords.some(w => t.includes(w)); }
  function score(a){ const seed = `${a.id||''}-${a.movieTitle||''}-${a.title||''}-${a.year||''}`; let h=0; for(let i=0;i<seed.length;i++){ h=((h<<5)-h)+seed.charCodeAt(i); h|=0; } return Math.abs(h); }
  function loadScript(src){ return new Promise((res,rej)=>{ if(document.querySelector(`script[src="${src}"]`)) return setTimeout(res,80); const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
  async function ensureData(){
    if(Array.isArray(window.IMAN_ARTICLES) && window.IMAN_ARTICLES.length) return window.IMAN_ARTICLES;
    for(const src of ['js/articles-data.js','./js/articles-data.js','articles-data.js','./articles-data.js','/js/articles-data.js','/articles-data.js']){
      try{ await loadScript(src); if(Array.isArray(window.IMAN_ARTICLES) && window.IMAN_ARTICLES.length) return window.IMAN_ARTICLES; }catch(e){}
    }
    return [];
  }
  function humanize(a){
    const title = a.movieTitle || a.title || 'Film ini';
    let excerpt = String(a.excerpt || '').trim();
    excerpt = excerpt
      .replace(/Dari data film kamu,?\s*/gi,'')
      .replace(/Dataset Iman in Motion menandai\s*/gi,'')
      .replace(/Di dataset,?\s*/gi,'')
      .replace(/di data kamu/gi,'')
      .replace(/metadata/gi,'detail film')
      .replace(/kolom overview dataset/gi,'sinopsis film')
      .replace(/Mood dataset/gi,'Nuansa cerita');
    if(!excerpt || /dataset|data kamu|metadata/i.test(excerpt)){
      const genres = splitGenres(a.genres).slice(0,3).join(', ') || 'drama yang kuat';
      const mood = a.mood ? ` dengan nuansa ${a.mood}` : '';
      excerpt = `${title} menawarkan pengalaman menonton${mood} lewat perpaduan ${genres}. Ceritanya bisa jadi pilihan menarik saat kamu ingin menemukan tontonan yang punya emosi, konflik, dan pesan yang terasa dekat.`;
    }
    return excerpt;
  }
  function filters(articles){
    const mood = $('#mood'), genre = $('#genre'), total = $('#totalArticles');
    if(total) total.textContent = articles.length.toLocaleString('id-ID');
    if(mood && mood.options.length <= 1){
      [...new Set(articles.map(a => a.mood).filter(Boolean))].sort().forEach(m => mood.insertAdjacentHTML('beforeend', `<option value="${esc(m)}">${esc(m)}</option>`));
    }
    if(genre && genre.options.length <= 1){
      [...new Set(articles.flatMap(a => splitGenres(a.genres)))].sort().forEach(g => genre.insertAdjacentHTML('beforeend', `<option value="${esc(g)}">${esc(g)}</option>`));
    }
    const params = new URLSearchParams(location.search);
    if(params.get('q') && $('#q')) $('#q').value = params.get('q');
  }
  function getFiltered(articles){
    const q = ($('#q')?.value || '').trim().toLowerCase();
    const mood = $('#mood')?.value || '';
    const genre = $('#genre')?.value || '';
    const sort = $('#sort')?.value || 'latest';
    let data = articles.filter(a => {
      const hay = textOf(a);
      return (!q || hay.includes(q)) && (!mood || a.mood === mood) && (!genre || String(a.genres||'').toLowerCase().includes(genre.toLowerCase()));
    });
    data.sort((a,b)=>{
      if(sort === 'rating') return (b.rating||0) - (a.rating||0) || score(a)-score(b);
      if(sort === 'az') return String(a.movieTitle||a.title||'').localeCompare(String(b.movieTitle||b.title||''));
      if(sort === 'oldest') return (a.year||9999) - (b.year||9999) || score(a)-score(b);
      const dd = Number(isDakwah(b)) - Number(isDakwah(a));
      if(dd) return dd;
      return (score(a)%997) - (score(b)%997);
    });
    // Anti-dempet: sebar artikel dengan judul film yang sama.
    const out = [];
    const pool = data.slice();
    while(pool.length){
      let idx = pool.findIndex(x => !out.length || x.movieTitle !== out[out.length-1].movieTitle);
      if(idx < 0) idx = 0;
      out.push(pool.splice(idx,1)[0]);
    }
    return out;
  }
  function card(a){
    const tags = [a.mood, ...splitGenres(a.genres).slice(0,2), ...(a.tags||[]).slice(0,2)].filter(Boolean).slice(0,5);
    return `<article class="article-card">
      <a class="thumb" href="artikel-detail.html?id=${encodeURIComponent(a.id)}" aria-label="Baca ${esc(a.title)}"><img src="${esc(a.poster || '')}" alt="${esc(a.movieTitle || a.title)}" loading="lazy" onerror="this.style.opacity=.15"></a>
      <div class="article-body">
        <a class="article-title" href="artikel-detail.html?id=${encodeURIComponent(a.id)}">${esc(a.title || a.movieTitle || 'Artikel Film')}</a>
        <p class="excerpt">${esc(humanize(a))}</p>
        <div class="meta"><span class="cal">▦</span><span>${esc(a.date || 'Update terbaru')}</span></div>
        <div class="tag-row">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        <button class="read-btn" type="button" data-fact="${esc(a.id)}">LIHAT FAKTA →</button>
      </div>
    </article>`;
  }
  function render(articles){
    const list = $('#articleList'), pages = $('#pagination'), stats = $('#stats');
    if(!list) return;
    const data = getFiltered(articles);
    const totalPages = Math.max(1, Math.ceil(data.length / state.perPage));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page-1)*state.perPage;
    const items = data.slice(start, start + state.perPage);
    if(stats) stats.textContent = data.length ? `Menampilkan ${start+1}-${Math.min(start+state.perPage,data.length)} dari ${data.length.toLocaleString('id-ID')} artikel.` : 'Belum ada artikel yang cocok.';
    list.innerHTML = items.length ? items.map(card).join('') : `<div class="empty">Artikel belum ketemu. Coba kata kunci atau filter lain.</div>`;
    if(pages){
      const btns = [];
      const begin = Math.max(1, state.page-2), end = Math.min(totalPages, state.page+2);
      if(state.page > 1) btns.push(`<button class="page-btn" data-page="${state.page-1}">‹</button>`);
      for(let i=begin;i<=end;i++) btns.push(`<button class="page-btn ${i===state.page?'active':''}" data-page="${i}">${i}</button>`);
      if(state.page < totalPages) btns.push(`<button class="page-btn" data-page="${state.page+1}">›</button>`);
      pages.innerHTML = btns.join('');
    }
  }
  function openFact(articles,id){
    const a = articles.find(x => String(x.id) === String(id)); if(!a) return;
    const modal = $('#modal'), detail = $('#detail'), modalCard = $('#modalCard');
    if(!modal || !detail) return;
    modalCard?.classList.add('fact-mode');
    detail.innerHTML = `<div class="detail">
      <img src="${esc(a.poster || '')}" alt="${esc(a.movieTitle || a.title)}">
      <div><span class="badge">Fakta #${esc(a.id)}</span><h2 id="modalTitle">${esc(a.title || a.movieTitle)}</h2>
      <div class="fact-box">${esc(a.fact || humanize(a))}</div>
      <div class="movie-data">
        <p><b>Film</b>${esc(a.movieTitle || '-')} (${esc(a.year || '-')})</p>
        <p><b>Genre</b>${esc(a.genres || '-')}</p>
        <p><b>Mood</b>${esc(a.mood || '-')}</p>
        <p><b>Rating</b>★ ${esc(a.rating || '-')}</p>
        <p><b>Bahasa</b>${esc(a.language || '-')}</p>
        <p><b>Negara</b>${esc(a.country || '-')}</p>
      </div></div></div>`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  }
  async function init(){
    const articles = await ensureData();
    if(!articles.length){ const list=$('#articleList'); if(list) list.innerHTML='<div class="empty">Data artikel belum kebaca. Pastikan file <b>js/articles-data.js</b> ikut ter-upload.</div>'; return; }
    filters(articles); render(articles);
    ['q','mood','genre','sort'].forEach(id => $('#'+id)?.addEventListener('input', () => { state.page=1; render(articles); }));
    $('#pagination')?.addEventListener('click', e => { const b=e.target.closest('[data-page]'); if(!b) return; state.page=Number(b.dataset.page)||1; render(articles); scrollTo({top:0,behavior:'smooth'}); });
    $('#articleList')?.addEventListener('click', e => { const b=e.target.closest('[data-fact]'); if(!b) return; openFact(articles,b.dataset.fact); });
    $('#close')?.addEventListener('click', () => { $('#modal')?.classList.remove('open'); $('#modal')?.setAttribute('aria-hidden','true'); });
    $('#modal')?.addEventListener('click', e => { if(e.target.id === 'modal') { $('#modal')?.classList.remove('open'); $('#modal')?.setAttribute('aria-hidden','true'); }});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
