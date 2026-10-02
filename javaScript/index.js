document.addEventListener('DOMContentLoaded', () => {
            const track = document.getElementById('carouselTrack');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');

            function scrollCarousel(direction) {
                const card = track.querySelector('.carousel-card');
                if (!card) return;

                // Liest den aktuellen Abstand (gap) aus den CSS-Variablen aus
                const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap')) || 20;
                
                // Berechnung der Scroll-Distanz: Kartenbreite + Gap
                const scrollAmount = card.offsetWidth + gap;

                track.scrollBy({
                    left: direction === 'next' ? scrollAmount : -scrollAmount,
                    behavior: 'smooth'
                });
            }

            prevBtn.addEventListener('click', () => scrollCarousel('prev'));
            nextBtn.addEventListener('click', () => scrollCarousel('next'));
        });


const generateCodeButton = document.getElementById('generateCodeButton');

generateCodeButton.addEventListener('click', () => {
    window.location.href = "finalyzeqrcode.html";
});
