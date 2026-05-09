
    const $ = s => document.querySelector(s);
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const ARTICLES = Array.isArray(window.IMAN_ARTICLES) ? window.IMAN_ARTICLES : [];
    const state = { page: 1, perPage: 12 };
    const listEl = $('#articleList');
    const pageEl = $('#pagination');
    const statsEl = $('#stats');
    const nav = $('#mainNav');
    const modal = $('#modal');
    const modalCard = $('#modalCard');

    $('#menuToggle')?.addEventListener('click', () => {
      nav.classList.toggle('open');
      $('#menuToggle').setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
    document.addEventListener('click', e => { if(!e.target.closest('.header')) nav.classList.remove('open'); });

    function splitGenres(v){ return String(v || '').split(',').map(x => x.trim()).filter(Boolean); }
    function fillFilters(){
      const moods = [...new Set(ARTICLES.map(a => a.mood).filter(Boolean))].sort();
      const genres = [...new Set(ARTICLES.flatMap(a => splitGenres(a.genres)))].sort();
      $('#mood').innerHTML += moods.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('');
      $('#genre').innerHTML += genres.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
      $('#totalArticles').textContent = ARTICLES.length.toLocaleString('id-ID');
      const params = new URLSearchParams(location.search);
      if(params.get('q')) $('#q').value = params.get('q');
    }
    function isDakwahArticle(a){
      const text = [a.title,a.movieTitle,a.excerpt,a.fact,a.content,a.overview,a.genres,a.mood,a.country,a.language,(a.tags||[]).join(' ')].join(' ').toLowerCase();
      const words = ['islam','muslim','dakwah','iman','hidayah','faith','religion','religious','quran','qur\'an','allah','masjid','mosque','ramadan','ramadhan','prayer','doa','shalat','sufi','rumi','prophet','nabi','muhammad','spiritual','god'];
      return words.some(w => text.includes(w));
    }
    function stableShuffleScore(a){
      const seed = `${a.id||''}-${a.movieTitle||''}-${a.year||''}-${a.title||''}`;
      let hash = 0;
      for(let i=0;i<seed.length;i++){ hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0; }
      return Math.abs(hash);
    }
    function getFiltered(){
      const q = $('#q').value.trim().toLowerCase();
      const mood = $('#mood').value;
      const genre = $('#genre').value;
      const sort = $('#sort').value;
      let data = ARTICLES.filter(a => {
        const hay = [a.title,a.movieTitle,a.excerpt,a.fact,a.content,a.overview,a.genres,a.mood,a.country,a.language,(a.tags||[]).join(' ')].join(' ').toLowerCase();
        const okQ = !q || hay.includes(q);
        const okMood = !mood || a.mood === mood;
        const okGenre = !genre || String(a.genres||'').toLowerCase().includes(genre.toLowerCase());
        return okQ && okMood && okGenre;
      });
      data.sort((a,b) => {
        if(sort === 'rating') return (b.rating||0) - (a.rating||0);
        if(sort === 'az') return String(a.movieTitle||a.title||'').localeCompare(String(b.movieTitle||b.title||''));
        if(sort === 'oldest') return (a.year||9999) - (b.year||9999);
        const dakwahDiff = Number(isDakwahArticle(b)) - Number(isDakwahArticle(a));
        if(dakwahDiff !== 0) return dakwahDiff;
        const movieGap = String(a.movieTitle||'').localeCompare(String(b.movieTitle||''));
        return (stableShuffleScore(a)%997) - (stableShuffleScore(b)%997) || movieGap;
      });
      return data;
    }
    window.render = function render(){
      const data = getFiltered();
      const pages = Math.max(1, Math.ceil(data.length / state.perPage));
      if(state.page > pages) state.page = 1;
      const start = (state.page - 1) * state.perPage;
      const current = data.slice(start, start + state.perPage);
      statsEl.textContent = `${data.length.toLocaleString('id-ID')} artikel ditemukan • halaman ${state.page} dari ${pages}`;
      listEl.innerHTML = current.map(a => `
        <article class="article-card">
          <div class="thumb"><img src="${esc(a.poster || 'logo.png')}" alt="${esc(a.movieTitle)}" loading="lazy" onerror="this.src='logo.png'"></div>
          <div class="article-body">
            <a class="article-title" href="artikel-detail.html?id=${encodeURIComponent(a.id)}" id="article-title-${a.id}">${esc(a.title)}</a>
            <p class="excerpt">“${esc(a.excerpt)}”</p>
            <div class="meta"><span class="cal">🗓️</span><span>${esc(a.date)}</span></div>
            <div class="tag-row">${(a.tags||[]).slice(0,4).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
            <button class="read-btn" data-id="${a.id}" data-open="fact">LIHAT FAKTA →</button>
          </div>
        </article>`).join('') || `<div class="empty">Belum ada artikel yang cocok dengan filter ini.</div>`;
      pageEl.innerHTML = pages <= 1 ? '' : makePagination(pages);
    }
    function makePagination(pages){
      const max = Math.min(pages, 7);
      let buttons = `<button class="page-btn" data-page="${Math.max(1,state.page-1)}">‹</button>`;
      for(let i=1;i<=max;i++){
        const p = pages <= 7 ? i : Math.max(1, Math.min(pages-6, state.page-3)) + i - 1;
        buttons += `<button class="page-btn ${p===state.page?'active':''}" data-page="${p}">${p}</button>`;
      }
      buttons += `<button class="page-btn" data-page="${Math.min(pages,state.page+1)}">›</button>`;
      return buttons;
    }
    function findArticle(id){ return ARTICLES.find(x => Number(x.id) === Number(id)); }
    function openFact(id){
      const a = findArticle(id); if(!a) return;
      modalCard.className = 'modal-card fact-mode';
      $('#detail').innerHTML = `
        <div class="detail">
          <img src="${esc(a.poster || 'logo.png')}" alt="${esc(a.movieTitle)}" onerror="this.src='logo.png'">
          <div>
            <span class="badge">Fakta #${esc(a.id)}</span>
            <h2 id="modalTitle">${esc(a.title)}</h2>
            <p style="color:var(--muted);line-height:1.8">${esc(a.excerpt)}</p>
            <div class="fact-box"><b>Fakta menarik:</b><br>${esc(a.fact)}</div>
            <div class="movie-data">
              <p><b>Film</b><br>${esc(a.movieTitle)} ${a.year ? `(${esc(a.year)})` : ''}</p>
              <p><b>Genre</b><br>${esc(a.genres || '-')}</p>
              <p><b>Mood</b><br>${esc(a.mood || '-')}</p>
              <p><b>Rating</b><br>★ ${esc(a.rating || '-')}</p>
              <p><b>Bahasa</b><br>${esc(a.language || '-')}</p>
              <p><b>Negara</b><br>${esc(a.country || '-')}</p>
            </div>
          </div>
        </div>`;
      openModal();
    }

    function openModal(){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
    function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
    ['q','mood','genre','sort'].forEach(id => $('#'+id).addEventListener('input', () => { state.page = 1; render(); }));
    listEl.addEventListener('click', e => {
      const el = e.target.closest('[data-id][data-open="fact"]');
      if(!el) return;
      openFact(el.dataset.id);
    });
    pageEl.addEventListener('click', e => { const btn = e.target.closest('[data-page]'); if(btn){ state.page = Number(btn.dataset.page); render(); window.scrollTo({top:0,behavior:'smooth'}); }});
    $('#close').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if(e.target.id === 'modal') closeModal(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
    fillFilters(); render();
  