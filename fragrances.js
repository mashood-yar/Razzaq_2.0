const PERFUMES = [
  { name: 'Noir Essence', price: 'Rs.2,300', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=500&auto=format&fit=crop' },
  { name: 'Royal Oud', price: 'Rs.4,200', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop' },
  { name: 'Elite Gold', price: 'Rs.4,900', img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=500&auto=format&fit=crop' },
  { name: 'Velvet Mist', price: 'Rs.3,600', img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=500&auto=format&fit=crop' },
  { name: 'Shadow Ice', price: 'Rs.2,950', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=500&auto=format&fit=crop' },
  { name: 'Midnight Rose', price: 'Rs.3,200', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=500&auto=format&fit=crop' },
  { name: 'Amber Dream', price: 'Rs.4,100', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop' },
  { name: 'Ocean Breeze', price: 'Rs.3,450', img: 'https://images.unsplash.com/photo-1595991209266-5e0428bfb0c4?w=800&q=82&fm=webp&fit=crop&crop=center' },
  { name: 'Jasmine Joy', price: 'Rs.2,800', img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=500&auto=format&fit=crop' },
  { name: 'Vanilla Musk', price: 'Rs.2,650', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=500&auto=format&fit=crop' },
];

const VISIBLE = 5;
const CENTER_SLOT = 2;

function mod(n, m) {
  return ((n % m) + m) % m;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('page-transition-style')) {
    const transitionStyle = document.createElement('style');
    transitionStyle.id = 'page-transition-style';
    transitionStyle.textContent = `
    #page-transition {
      position: fixed; inset: 0;
      background-color: #024950;
      z-index: 999999;
      pointer-events: none;
      transform: translateY(0);
      transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
    }
    #page-transition.reveal { transform: translateY(-100%); }
    #page-transition.cover { transition: none; transform: translateY(100%); }
    #page-transition.cover.active {
      transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
      transform: translateY(0);
    }
  `;
    document.head.appendChild(transitionStyle);
  }

  let transitionEl = document.getElementById('page-transition');
  if (!transitionEl) {
    transitionEl = document.createElement('div');
    transitionEl.id = 'page-transition';
    document.body.appendChild(transitionEl);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => transitionEl.classList.add('reveal'));
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link?.href && !link.hasAttribute('target') && !link.href.includes('#') && link.hostname === window.location.hostname) {
      e.preventDefault();
      transitionEl.classList.remove('reveal');
      transitionEl.classList.add('cover');
      void transitionEl.offsetWidth;
      transitionEl.classList.add('active');
      setTimeout(() => { window.location.href = link.href; }, 600);
    }
  });

  if (!document.getElementById('hover-effect-style')) {
  const hoverStyle = document.createElement('style');
  hoverStyle.id = 'hover-effect-style';
  hoverStyle.textContent = `
    body, a, button, input, select, textarea, .frag-slot, .frag-nav-btn {
      cursor: none !important;
    }
    .custom-cursor {
      position: fixed; top: 0; left: 0;
      width: 8px; height: 8px;
      background-color: #0FA4AF;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transition: width 0.2s, height 0.2s, background-color 0.2s;
    }
    .custom-cursor.hover { width: 0; height: 0; }
  `;
  document.head.appendChild(hoverStyle);
  }

  const cursor = document.createElement('div');
  cursor.classList.add('custom-cursor');
  document.body.appendChild(cursor);

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function cursorLoop() {
    cursorX += (mouseX - cursorX) * 0.5;
    cursorY += (mouseY - cursorY) * 0.5;
    cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
    requestAnimationFrame(cursorLoop);
  }
  requestAnimationFrame(cursorLoop);

  const addHover = () => cursor.classList.add('hover');
  const removeHover = () => cursor.classList.remove('hover');
  document.querySelectorAll('a, button, input, select, textarea, .frag-slot, .frag-nav-btn').forEach((el) => {
    el.addEventListener('mouseenter', addHover);
    el.addEventListener('mouseleave', removeHover);
  });

  document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });

  initCarousel();
});

function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('fragDots');

  if (!track || !dotsWrap || PERFUMES.length === 0) return;

  const n = PERFUMES.length;
  let centerIndex = mod(2, n);

  for (let s = 0; s < VISIBLE; s++) {
    const slot = document.createElement('article');
    slot.className = 'frag-slot';
    slot.setAttribute('role', 'listitem');
    slot.dataset.slot = String(s);

    slot.innerHTML = `
      <div class="frag-slot-img-wrap"><img alt="" decoding="async" loading="lazy"></div>
      <div class="frag-slot-body">
        <h2></h2>
        <p class="frag-slot-price"></p>
        <button type="button" class="frag-slot-btn">BUY NOW</button>
      </div>
    `;
    track.appendChild(slot);

    slot.querySelector('.frag-slot-btn')?.addEventListener('click', (e) => e.stopPropagation());

    slot.addEventListener('click', () => {
      const s = Number(slot.dataset.slot);
      if (s === CENTER_SLOT) return;
      centerIndex = mod(centerIndex - CENTER_SLOT + s, n);
      render();
    });
  }

  dotsWrap.innerHTML = '';
  PERFUMES.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'frag-dot';
    b.dataset.index = String(i);
    b.setAttribute('aria-label', `Show fragrance ${i + 1}`);
    b.addEventListener('click', () => {
      centerIndex = i;
      render();
    });
    dotsWrap.appendChild(b);
  });

  function perfumeAt(slot) {
    return PERFUMES[mod(centerIndex - CENTER_SLOT + slot, n)];
  }

  function render() {
    centerIndex = mod(centerIndex, n);

    track.querySelectorAll('.frag-slot').forEach((slotEl) => {
      const s = Number(slotEl.dataset.slot);
      const data = perfumeAt(s);
      const active = s === CENTER_SLOT;

      slotEl.classList.toggle('frag-slot--active', active);
      slotEl.classList.remove('frag-slot--d0', 'frag-slot--d1', 'frag-slot--d2', 'frag-slot--d3', 'frag-slot--d4');
      const dist = Math.abs(s - CENTER_SLOT);
      slotEl.classList.add(`frag-slot--d${dist}`);

      const img = slotEl.querySelector('img');
      if (img) {
        img.src = data.img;
        img.alt = data.name;
      }
      slotEl.querySelector('h2').textContent = data.name.toUpperCase();
      slotEl.querySelector('.frag-slot-price').textContent = data.price;
    });

    dotsWrap.querySelectorAll('.frag-dot').forEach((d, i) => {
      d.classList.toggle('frag-dot--active', i === centerIndex);
    });
  }

  /* ← previous fragrance | next fragrance → (matches arrow direction) */
  prevBtn?.addEventListener('click', () => {
    centerIndex = mod(centerIndex - 1, n);
    render();
  });

  nextBtn?.addEventListener('click', () => {
    centerIndex = mod(centerIndex + 1, n);
    render();
  });

  render();
}

/* ── Scroll-reveal (unused on this page unless elements get .reveal) ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement?.querySelectorAll('.reveal') ?? [];
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
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}
