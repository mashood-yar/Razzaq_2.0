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

/* contact.js — interaction logic for the Contact page */

// ── Mobile nav toggle ─────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
}

// ── Contact Form ──────────────────────────────────────────
const form        = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const successMsg  = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      field.classList.remove('invalid');
      if (!field.value.trim()) {
        field.classList.add('invalid');
        valid = false;
      }
    });

    // Email format check
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
      emailField.classList.add('invalid');
      valid = false;
    }

    if (!valid) return;

    // Simulate submission
    submitBtn.classList.add('loading');
    const btnText = submitBtn.querySelector('.submit-text');
    if (btnText) btnText.textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1400));

    submitBtn.style.display = 'none';
    if (successMsg) {
      successMsg.hidden = false;
    }

    form.reset();
  });

  // Remove invalid state on input
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('invalid'));
  });
}

// ── Scroll-in animation on info items ────────────────────
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.info-item, .form-group, .form-card, .info-card').forEach((el, i) => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = `opacity 0.55s ease ${i * 0.07}s, transform 0.55s ease ${i * 0.07}s`;
  observer.observe(el);
});

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
