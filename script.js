// Page transitions, optional custom cursor (fine pointer + motion OK), spotlight coords
document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const useCustomCursor = !reducedMotion && finePointer;

    /* --- Page transition --- */
    if (!reducedMotion) {
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

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    transitionEl.classList.add('reveal');
                });
            });

            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (
                    link &&
                    link.href &&
                    !link.hasAttribute('target') &&
                    !link.href.includes('#') &&
                    link.hostname === window.location.hostname
                ) {
                    e.preventDefault();

                    transitionEl.classList.remove('reveal');
                    transitionEl.classList.add('cover');

                    void transitionEl.offsetWidth;

                    transitionEl.classList.add('active');

                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 600);
                }
            });
        }
    }

    /* --- Custom cursor + card hover polish (matches ui-ux-pro-max: motion only) --- */
    if (!document.getElementById('hover-effect-style')) {
        const style = document.createElement('style');
        style.id = 'hover-effect-style';
        const hideSystemCursor =
            useCustomCursor ?
                `body, a, button, input, select, textarea, .pillar-card, .info-card, .form-card, .social-btn {
            cursor: none !important;
        }`
            :   '';

        style.textContent = `
        ${hideSystemCursor}
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

        .pillar-card, .info-card, .form-card, .stat-item, .story-img-wrap, .glass-card {
            position: relative;
            z-index: 1;
            transition: transform 240ms cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 240ms cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .pillar-card:hover, .info-card:hover, .form-card:hover, .stat-item:hover, .story-img-wrap:hover, .glass-card:hover {
            transform: translateY(-4px) scale(1.01);
            box-shadow: 0 16px 40px rgba(15, 164, 175, 0.15);
        }
        .pillar-card::after, .info-card::after, .form-card::after, .glass-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: radial-gradient(
                600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                rgba(15, 164, 175, 0.12),
                transparent 40%
            ) fixed;
            opacity: 0;
            transition: opacity 240ms ease;
            pointer-events: none;
            z-index: 10;
            border-radius: inherit;
        }
        .pillar-card:hover::after, .info-card:hover::after, .form-card:hover::after, .glass-card:hover::after {
            opacity: 1;
        }
        `;
        document.head.appendChild(style);
    }

    if (useCustomCursor) {
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);

        let mouseX = 0,
            mouseY = 0;
        let cursorX = 0,
            cursorY = 0;

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

        const addHover = () => cursor.classList.add('hover');
        const removeHover = () => cursor.classList.remove('hover');

        document.querySelectorAll('a, button, input, select, textarea, .pillar-card, .info-card, .form-card, .social-btn').forEach((el) => {
            el.addEventListener('mouseenter', addHover);
            el.addEventListener('mouseleave', removeHover);
        });
    }

    /* --- Hero rotating headline word (index) --- */
    const heroRotatingWordEl = document.getElementById('hero-rotating-word');
    if (heroRotatingWordEl) {
        const words = ['Scents.', 'Perfumes.', 'Fragrances.'];
        let wordIndex = 0;

        if (reducedMotion) {
            heroRotatingWordEl.textContent = words[0];
        } else {
            const cycleMs = 1400;
            const fadeMs = 420;

            window.setInterval(() => {
                heroRotatingWordEl.classList.add('hero-rotating-word--hide');
                window.setTimeout(() => {
                    wordIndex = (wordIndex + 1) % words.length;
                    heroRotatingWordEl.textContent = words[wordIndex];
                    heroRotatingWordEl.classList.remove('hero-rotating-word--hide');
                }, fadeMs);
            }, cycleMs);
        }
    }

    /* --- Hero / carousel slides (other pages) --- */
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0 && !reducedMotion) {
        let currentSlide = 0;

        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        setInterval(nextSlide, 1000);
    }
});

document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});
