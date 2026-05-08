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
