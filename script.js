document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length === 0) return;

    function nextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        
        // Move to the next slide, looping back to 0 at the end
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
    }

    // Change slide every 1 second (1000 milliseconds)
    setInterval(nextSlide, 1000);
});
