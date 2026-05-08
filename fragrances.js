// Custom Cursor JS
document.addEventListener('DOMContentLoaded', () => {
    // --- Page Transition Logic ---
    if (!document.getElementById('page-transition-style')) {
        const transitionStyle = document.createElement('style');
        transitionStyle.id = 'page-transition-style';
        transitionStyle.textContent = `
          #page-transition {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #024950;
            z-index: 999999;
            pointer-events: none;
            transform: translateY(0);
            transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
          }
          #page-transition.reveal {
            transform: translateY(-100%);
          }
          #page-transition.cover {
            transition: none;
            transform: translateY(100%);
          }
          #page-transition.cover.active {
            transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
            transform: translateY(0);
          }
        `;
        document.head.appendChild(transitionStyle);
    }

    if (!document.getElementById('page-transition')) {
        const transitionEl = document.createElement('div');
        transitionEl.id = 'page-transition';
        document.body.appendChild(transitionEl);

        // Animate out on load (reveal the page)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                transitionEl.classList.add('reveal');
            });
        });

        // Animate in on link click (cover the page)
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.hasAttribute('target') && !link.href.includes('#') && link.hostname === window.location.hostname) {
                e.preventDefault();
                
                // Reset to bottom
                transitionEl.classList.remove('reveal');
                transitionEl.classList.add('cover');
                
                // Force reflow
                void transitionEl.offsetWidth;
                
                // Animate up to cover
                transitionEl.classList.add('active');
                
                setTimeout(() => {
                    window.location.href = link.href;
                }, 600);
            }
        });
    }

    // Add CSS dynamically
    if (!document.getElementById('hover-effect-style')) {
        const style = document.createElement('style');
        style.id = 'hover-effect-style';
        style.textContent = `
        body, a, button, input, select, textarea, .ff-card, .pillar-card, .info-card, .form-card, .social-btn {
            cursor: none !important;
        }
        .custom-cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: 8px;
            height: 8px;
            background-color: #0FA4AF;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transition: width 0.2s, height 0.2s, background-color 0.2s;
        }
        .custom-cursor.hover {
            width: 0px;
            height: 0px;
        }

        /* Global Content Hover Glow */
        .ff-card, .pillar-card, .info-card, .form-card, .stat-item, .story-img-wrap, .glass-card {
            position: relative;
            z-index: 1;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .ff-card:hover, .pillar-card:hover, .info-card:hover, .form-card:hover, .stat-item:hover, .story-img-wrap:hover, .glass-card:hover {
            transform: translateY(-4px) scale(1.01);
            box-shadow: 0 16px 40px rgba(15, 164, 175, 0.15);
        }
        .ff-card::after, .pillar-card::after, .info-card::after, .form-card::after, .glass-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(
                600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                rgba(15, 164, 175, 0.12),
                transparent 40%
            ) fixed;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 10;
            border-radius: inherit;
        }
        .ff-card:hover::after, .pillar-card:hover::after, .info-card:hover::after, .form-card:hover::after, .glass-card:hover::after {
            opacity: 1;
        }
        `;
        document.head.appendChild(style);
    }

    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function loop() {
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;
        
        cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
        
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    const addHover = () => {
        cursor.classList.add('hover');
    };
    const removeHover = () => {
        cursor.classList.remove('hover');
    };

    document.querySelectorAll('a, button, input, select, textarea, .ff-card, .pillar-card, .info-card, .form-card, .social-btn').forEach(el => {
        el.addEventListener('mouseenter', addHover);
        el.addEventListener('mouseleave', removeHover);
    });
});

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

// Spotlight Hover Effect
document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});

// Custom Cursor JS
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const cursorFollower = document.createElement('div');
    cursorFollower.classList.add('custom-cursor-follower');
    document.body.appendChild(cursorFollower);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function loop() {
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
        cursorFollower.style.transform = `translate(${followerX - 16}px, ${followerY - 16}px)`;
        
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    const addHover = () => {
        cursor.classList.add('hover');
        cursorFollower.classList.add('hover');
    };
    const removeHover = () => {
        cursor.classList.remove('hover');
        cursorFollower.classList.remove('hover');
    };

    document.querySelectorAll('a, button, input, select, textarea, .ff-card, .pillar-card, .info-card, .form-card, .social-btn').forEach(el => {
        el.addEventListener('mouseenter', addHover);
        el.addEventListener('mouseleave', removeHover);
    });
});

/* ── Carousel Logic (2D Staggered Demo Layout) ── */
document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.perfume-card'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentIndex = 2; // Center card index initially
    const totalCards = cards.length;

    function updateCarousel() {
        cards.forEach((card, i) => {
            // Remove existing classes
            card.classList.remove('card-center', 'card-inner', 'card-outer');
            
            // Re-apply classes based on distance from currentIndex
            let diff = i - currentIndex;
            
            // Handle wrapping
            if (diff > 2) diff -= totalCards;
            if (diff < -2) diff += totalCards;

            if (diff === 0) {
                card.classList.add('card-center');
                // Ensure only the center card has an h1 and "Buy Now"
                const title = card.querySelector('h1, h2');
                if (title) {
                    title.outerHTML = `<h1>${title.textContent}</h1>`;
                }
                const btn = card.querySelector('button');
                if (btn) {
                    btn.className = 'buy-now-btn';
                    btn.textContent = 'Buy Now';
                }
                // Add center-rays if not present
                if (!card.querySelector('.center-rays')) {
                    const rays = document.createElement('div');
                    rays.className = 'center-rays';
                    card.insertBefore(rays, card.firstChild);
                }
            } else if (Math.abs(diff) === 1) {
                card.classList.add('card-inner');
                // Ensure side cards have h2 and "Buy"
                const title = card.querySelector('h1, h2');
                if (title) {
                    title.outerHTML = `<h2>${title.textContent}</h2>`;
                }
                const btn = card.querySelector('button');
                if (btn) {
                    btn.className = 'buy-btn';
                    btn.textContent = 'Buy';
                }
                // Remove center-rays if present
                const rays = card.querySelector('.center-rays');
                if (rays) card.removeChild(rays);
            } else if (Math.abs(diff) === 2) {
                card.classList.add('card-outer');
                // Ensure side cards have h2 and "Buy"
                const title = card.querySelector('h1, h2');
                if (title) {
                    title.outerHTML = `<h2>${title.textContent}</h2>`;
                }
                const btn = card.querySelector('button');
                if (btn) {
                    btn.className = 'buy-btn';
                    btn.textContent = 'Buy';
                }
                // Remove center-rays if present
                const rays = card.querySelector('.center-rays');
                if (rays) card.removeChild(rays);
            }
        });
    }

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalCards;
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCarousel();
    });

    cards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            if (currentIndex !== idx) {
                currentIndex = idx;
                updateCarousel();
            }
        });
    });

    // Initialize
    updateCarousel();

    // Mobile nav toggle
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

    // Spotlight Hover Effect
    document.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    });
});
