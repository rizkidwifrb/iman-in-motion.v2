(function(){
  'use strict';
  const ITEMS = [
    ['index.html','Home'],
    ['film.html','Film'],
    ['artikel.html','Artikel'],
    ['info.html','Info'],
    ['aiman.html','AIMAN']
  ];
  const clean = (href='') => String(href).split('#')[0].split('?')[0].split('/').pop() || 'index.html';
  const bodyPage = () => {
    const data = (document.body?.dataset?.page || '').toLowerCase();
    if (data === 'index' || data === 'home') return 'index.html';
    if (data === 'film') return 'film.html';
    if (data === 'artikel') return 'artikel.html';
    if (data === 'info') return 'info.html';
    if (data === 'aiman') return 'aiman.html';
    const path = clean(location.pathname);
    return path || 'index.html';
  };
  function ensureNav(nav){
    if(!nav) return;
    const links = [...nav.querySelectorAll('a')];
    if(links.length < 5 || links.every(a => !a.textContent.trim())){
      nav.innerHTML = ITEMS.map(([href,label]) => `<a href="${href}">${label}</a>`).join('');
    }
  }
  function setActive(nav){
    if(!nav) return;
    const current = bodyPage();
    [...nav.querySelectorAll('a')].forEach(a => {
      const href = a.getAttribute('href') || '';
      const page = href === '#home' ? 'index.html' : clean(href);
      a.classList.toggle('active', page === current);
      if(current === 'index.html' && page === 'artikel.html') a.classList.remove('active');
    });
  }
  function syncOneHeader(header){
    if(!header) return;
    const nav = header.querySelector('.nav') || document.querySelector('#mainNav') || document.querySelector('.nav');
    ensureNav(nav);
    setActive(nav);
    let btn = header.querySelector('.menu-toggle') || document.querySelector('#menuToggle');
    if(!btn){
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'menu-toggle';
      btn.id = 'menuToggle';
      btn.setAttribute('aria-label','Buka menu');
      btn.textContent = '☰';
      header.appendChild(btn);
    }
    btn.setAttribute('aria-expanded', nav?.classList.contains('open') ? 'true' : 'false');
    btn.dataset.iimBound = '1';
  }
  function closeAll(){
    document.querySelectorAll('.nav.open').forEach(nav => nav.classList.remove('open'));
    document.querySelectorAll('.menu-toggle').forEach(btn => { btn.setAttribute('aria-expanded','false'); btn.textContent = '☰'; });
  }
  function toggleFromButton(btn){
    const header = btn.closest('.header, .iim-unified-header') || document.querySelector('.header, .iim-unified-header');
    const nav = header?.querySelector('.nav') || document.querySelector('#mainNav') || document.querySelector('.nav');
    if(!nav) return;
    ensureNav(nav); setActive(nav);
    const opened = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
    btn.textContent = opened ? '×' : '☰';
  }
  function init(){
    document.querySelectorAll('.header, .iim-unified-header').forEach(syncOneHeader);
    document.querySelectorAll('.nav').forEach(nav => { ensureNav(nav); setActive(nav); });
    document.addEventListener('click', e => {
      const btn = e.target.closest('.menu-toggle');
      if(!btn) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      toggleFromButton(btn);
    }, true);
    document.addEventListener('click', e => { if(!e.target.closest('.header') && !e.target.closest('.nav')) closeAll(); });
    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', closeAll));
    window.addEventListener('resize', () => { if(innerWidth > 860) closeAll(); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
