/* about.js — interactions for the About page */

// ── Mobile nav toggle ─────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

// ── Scroll-reveal ─────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings inside the same parent
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        siblings.forEach((el, idx) => {
          el.style.transitionDelay = `${idx * 80}ms`;
        });
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Parallax hero orbs on mouse move ─────────
const hero = document.getElementById('hero');
if (hero) {
  hero.addEventListener('mousemove', (e) => {
    const { innerWidth: w, innerHeight: h } = window;
    const dx = (e.clientX / w - 0.5) * 18;
    const dy = (e.clientY / h - 0.5) * 18;
    document.querySelectorAll('.hero-orb').forEach((orb, i) => {
      const factor = (i + 1) * 0.6;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });
}

// ── Stat counter animation ─────────────────────
function animateCounter(el) {
  const target = el.dataset.target;
  const isNum  = /^\d+$/.test(target);
  if (!isNum) return; // skip labels like "PK-Wide"

  let start = 0;
  const end = parseInt(target, 10);
  const duration = 1400;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * end).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = end.toLocaleString() + (el.dataset.suffix || '');
  }
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statObserver.observe(el));
