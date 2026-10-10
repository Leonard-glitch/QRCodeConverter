document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track) return;

    // 1. Klonen der Karten für nahtlosen unendlichen Loop
    const originalCards = Array.from(track.children);
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    // Variablen für Auto-Scroll
    let scrollSpeed = 0.8; // Geschwindigkeit (Pixel pro Frame)
    let isPaused = false;

    // 2. Continuous Auto-Scroll Loop
    function autoScroll() {
        if (!isPaused) {
            track.scrollLeft += scrollSpeed;

            // Sobald die Hälfte (Originalkarten) durchgescrollt ist, unbemerkt auf 0 zurückspringen
            if (track.scrollLeft >= track.scrollWidth / 2) {
                track.scrollLeft = 0;
            }
        }
        requestAnimationFrame(autoScroll);
    }

    // 3. Pausieren bei Hover & Touch
    track.addEventListener('mouseenter', () => isPaused = true);
    track.addEventListener('mouseleave', () => isPaused = false);
    track.addEventListener('touchstart', () => isPaused = true, { passive: true });
    track.addEventListener('touchend', () => isPaused = false, { passive: true });

    // 4. Hilfsfunktion: Breite einer Karte inkl. Gap berechnen
    function getScrollAmount() {
        const firstCard = track.querySelector('.carousel-card');
        const gap = parseInt(window.getComputedStyle(track).gap) || 20;
        return firstCard.offsetWidth + gap;
    }

    // 5. Button Steuerung
    nextBtn.addEventListener('click', () => {
        const step = getScrollAmount();
        if (track.scrollLeft >= track.scrollWidth / 2) {
            track.scrollLeft -= track.scrollWidth / 2;
        }
        track.scrollBy({ left: step, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        const step = getScrollAmount();
        if (track.scrollLeft <= 0) {
            track.scrollLeft += track.scrollWidth / 2;
        }
        track.scrollBy({ left: -step, behavior: 'smooth' });
    });

    // Starten
    autoScroll();
});

