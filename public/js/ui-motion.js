export function initUiMotion() {
  const splash = document.getElementById('splash');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav') || document.querySelector('.nav');
  const heroCtas = document.querySelectorAll('[data-scroll-target]');

  window.setTimeout(() => {
    splash?.classList.add('hidden');
    splash?.classList.add('hide');
  }, 1200);

  if (menuToggle && !menuToggle.dataset.motionReady) {
    menuToggle.dataset.motionReady = 'true';
    menuToggle.addEventListener('click', () => {
      nav?.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', nav?.classList.contains('open') ? 'true' : 'false');
    });
  }

  heroCtas.forEach((btn) => {
    if (btn.dataset.scrollReady === 'true') return;
    btn.dataset.scrollReady = 'true';
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.scrollTarget);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

export function initActiveSectionState() {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sectionIds = links.map((link) => link.getAttribute('href').slice(1));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
    });
  }, { threshold: 0.4 });

  sections.forEach((section) => observer.observe(section));
}