// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile menu
const toggle = document.getElementById('mobileToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('nav')) links.classList.remove('open');
});

// Scroll reveal with stagger support
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Stat count-up animation when in view
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const formatCount = (value, opts) => {
  const { decimals, raw, suffix } = opts;
  let s = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  if (!raw) {
    const parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    s = parts.join('.');
  }
  return s + (suffix || '');
};
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const opts = {
    decimals: parseInt(el.dataset.decimals, 10) || 0,
    raw: el.dataset.format === 'raw',
    suffix: el.dataset.suffix || ''
  };
  if (prefersReducedMotion) { el.textContent = formatCount(target, opts); return; }
  const duration = parseInt(el.dataset.duration, 10) || 1400;
  const startTime = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = formatCount(target * eased, opts);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = formatCount(target, opts);
  };
  requestAnimationFrame(tick);
};
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.animated) {
      e.target.dataset.animated = 'true';
      animateCount(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stat-number[data-count], .spotlight-metric-value[data-count]').forEach(el => statObserver.observe(el));

// Smooth scroll for anchor links (fallback for browsers without CSS scroll-padding)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const pos = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
  });
});

// Spotlight lightbox
(() => {
  const photos = [
    { src: 'bourbon-facility.webp', caption: 'Fort Scott, KS · Iconic Build' },
    { src: 'spotlight/spotlight-00-planning.jpg', caption: 'Pre-Construction · Reviewing the Blueprints' },
    { src: 'spotlight/spotlight-01-jul2025.jpg', caption: 'Jul 2025 · Site Prep' },
    { src: 'spotlight/spotlight-02-jul2025.jpg', caption: 'Jul 2025 · Early Work' },
    { src: 'spotlight/spotlight-03-sep2025.jpg', caption: 'Sep 2025 · Steel Going Up' },
    { src: 'spotlight/spotlight-04-sep2025.jpg', caption: 'Sep 2025 · Construction' },
    { src: 'spotlight/spotlight-05-sep2025.jpg', caption: 'Sep 2025 · Construction' },
    { src: 'spotlight/spotlight-06-sep2025.jpg', caption: 'Sep 2025 · Construction' },
    { src: 'spotlight/spotlight-07-sep2025.jpg', caption: 'Sep 2025 · Construction' },
    { src: 'spotlight/spotlight-08-dec2025.jpg', caption: 'Dec 2025 · Signage Installed' },
    { src: 'spotlight/spotlight-09-dec2025.jpg', caption: 'Dec 2025 · Grand Opening' },
    { src: 'spotlight/spotlight-10-dec2025.jpg', caption: 'Dec 2025 · Finished Facility' },
    { src: 'spotlight/spotlight-11-jun2026.jpg', caption: 'Jun 2026 · Operating' },
    { src: 'spotlight/spotlight-12-jun2026.jpg', caption: 'Jun 2026 · Operating' }
  ];
  const lightbox = document.getElementById('spotlightLightbox');
  if (!lightbox) return;
  const img = document.getElementById('spotlightLightboxImg');
  const caption = document.getElementById('spotlightLightboxCaption');
  const counter = document.getElementById('spotlightLightboxCounter');
  let idx = 0;
  const render = () => {
    const p = photos[idx];
    img.src = p.src;
    img.alt = p.caption;
    caption.textContent = p.caption;
    counter.textContent = (idx + 1) + ' / ' + photos.length;
  };
  const open = (startIdx) => {
    idx = (typeof startIdx === 'number' && startIdx >= 0 && startIdx < photos.length) ? startIdx : 0;
    render();
    lightbox.classList.add('is-open');
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  };
  const next = () => { idx = (idx + 1) % photos.length; render(); };
  const prev = () => { idx = (idx - 1 + photos.length) % photos.length; render(); };

  document.querySelectorAll('.spotlight-hero-tile').forEach(tile => {
    tile.addEventListener('click', (e) => {
      if (e.target.closest('.spotlight-show-all-btn')) return;
      const i = parseInt(tile.dataset.photoIndex, 10);
      open(isNaN(i) ? 0 : i);
    });
  });
  document.getElementById('spotlightShowAll')?.addEventListener('click', (e) => {
    e.stopPropagation();
    open(0);
  });
  document.getElementById('spotlightLightboxClose')?.addEventListener('click', close);
  document.getElementById('spotlightLightboxNext')?.addEventListener('click', next);
  document.getElementById('spotlightLightboxPrev')?.addEventListener('click', prev);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  });
})();
