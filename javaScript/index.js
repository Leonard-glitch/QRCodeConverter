
const HISTORY_KEY = 'linqr_entries';
const CURRENT_KEY = 'linqr_current';
const MAX_HISTORY = 5; 

loadPage();

function loadPage(){
    const input = document.getElementById('linkInputField');
    const generateBtn = document.getElementById('generateCodeButton');
    const errorBox = document.getElementById('errorBox');
    const historyMain = document.querySelector('.historyDivMain');
    const historyContainer = document.getElementById('historyContainer');
    const deleteHistoryBtn = document.getElementById('deleteHistoryButton');
    const historyToggle = document.getElementById('historyToggle');

    // ---------- Hilfsfunktionen ----------
    const historyEnabled = () => localStorage.getItem('linqr_history') !== 'false';

    function getHistory() {
        try {
            const list = JSON.parse(localStorage.getItem(HISTORY_KEY));
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }

    function setHistory(list) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
    }

    function addToHistory(link) {
        if (!historyEnabled()) return;
        const list = getHistory().filter(l => l !== link);
        list.unshift(link);
        setHistory(list);
    }

    // Prüft den Link und gibt eine bereinigte URL zurück (oder null)
    function normalizeLink(raw) {
        let value = raw.trim();
        if (!value) return { error: 'Please enter a link.' };
        if (/\s/.test(value)) return { error: 'A link must not contain spaces.' };
        if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = 'https://' + value;
        try {
            const url = new URL(value);
            if (['http:', 'https:'].includes(url.protocol)) {
                const host = url.hostname;
                const isValidHost = host === 'localhost' || /^[^.]+(\.[^.]+)+$/.test(host);
                if (!isValidHost) return { error: 'This doesn\'t look like a valid link.' };
            }
            if (value.length > 2000) return { error: 'This link is too long for a QR code.' };
            return { link: value };
        } catch {
            return { error: 'This doesn\'t look like a valid link.' };
        }
    }

    function showError(msg) {
        if (!errorBox) return;
        errorBox.textContent = msg;
        errorBox.style.display = msg ? 'block' : 'none';
        input?.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    // ---------- Verlauf rendern ----------
    function renderHistory() {
        if (!historyContainer || !historyMain) return;
        const list = historyEnabled() ? getHistory() : [];
        historyContainer.innerHTML = '';

        list.forEach(link => {
            const entry = document.createElement('div');
            entry.className = 'historyEntryElement';

            const linkBtn = document.createElement('button');
            linkBtn.className = 'historyEntryLinkBtn';
            linkBtn.textContent = link;
            linkBtn.title = link;
            linkBtn.addEventListener('click', () => {
                const result=normalizeLink(link);
                showError('');
                generate(result);
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'historyEntryDeleteBtn';
            delBtn.innerHTML = '&#10006;';
            delBtn.setAttribute('aria-label', 'Delete entry');
            delBtn.addEventListener('click', () => {
                setHistory(getHistory().filter(l => l !== link));
                renderHistory();
            });

            entry.append(linkBtn, delBtn);
            historyContainer.appendChild(entry);
        });

        historyMain.style.display = list.length ? '' : 'none';
    }

    // ---------- Generieren ----------
    function generate(result) {

        if (result.error) {
            showError(result.error);
            input.focus();
            return;
        }
        showError('');
        addToHistory(result.link);
        localStorage.setItem(CURRENT_KEY, result.link);
        window.location.href = './finalyzeqrcode.html?link=' + encodeURIComponent(result.link);
    }

    generateBtn?.addEventListener('click', function(){
        const result=normalizeLink(input.value);
        generate(result);
    });
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') generate(); });
    input?.addEventListener('input', () => showError(''));

    deleteHistoryBtn?.addEventListener('click', () => {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    });

    // Wird der Verlauf in den Settings deaktiviert -> löschen & ausblenden
    historyToggle?.addEventListener('change', e => {
        if (!e.target.checked) localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    });

    showError('');
    renderHistory();
};


// =====================================================
// Feature-Carousel (unendlicher Auto-Scroll)
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track) return;

    // Karten klonen für nahtlosen Loop
    Array.from(track.children).forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollSpeed = 0.8;
    let isPaused = reducedMotion;
    let position = 0; // eigene Kommazahl, da scrollLeft gerundet wird

    function autoScroll() {
        if (!isPaused) {
            position += scrollSpeed;
            if (position >= track.scrollWidth / 2) position = 0;
            track.scrollLeft = position;
        } else {
            position = track.scrollLeft;
        }
        requestAnimationFrame(autoScroll);
    }

    track.addEventListener('mouseenter', () => isPaused = true);
    track.addEventListener('mouseleave', () => isPaused = reducedMotion);
    track.addEventListener('touchstart', () => isPaused = true, { passive: true });
    track.addEventListener('touchend', () => isPaused = reducedMotion, { passive: true });

    function getScrollAmount() {
        const firstCard = track.querySelector('.carousel-card');
        const gap = parseInt(window.getComputedStyle(track).gap) || 20;
        return firstCard.offsetWidth + gap;
    }

    // Während der Smooth-Scroll-Animation Auto-Scroll kurz anhalten
    function manualScroll(dir) {
        const wasPaused = isPaused;
        isPaused = true;
        const half = track.scrollWidth / 2;
        if (dir > 0 && track.scrollLeft >= half) track.scrollLeft -= half;
        if (dir < 0 && track.scrollLeft <= 0) track.scrollLeft += half;
        track.scrollBy({ left: dir * getScrollAmount(), behavior: 'smooth' });
        setTimeout(() => {
            position = track.scrollLeft;
            isPaused = wasPaused;
        }, 500);
    }

    nextBtn?.addEventListener('click', () => manualScroll(1));
    prevBtn?.addEventListener('click', () => manualScroll(-1));

    autoScroll();
});