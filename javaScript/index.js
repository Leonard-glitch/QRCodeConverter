
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

    function safeGetLocal(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function safeSetLocal(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    function safeRemoveLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }


    const historyEnabled = () => safeGetLocal('linqr_history') !== 'false';

    function getHistory() {
        try {
            const list = JSON.parse(safeGetLocal(HISTORY_KEY) || '[]');
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }

    function setHistory(list) {
        safeSetLocal(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
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
        try {
            sessionStorage.setItem(CURRENT_KEY, result.link);
        } catch {
            showError('Your browser blocks session storage. Please enable it and try again.');
            return;
        }

        window.location.href = './finalyzeqrcode.html';
    }

    generateBtn.addEventListener('click', function(){
        const result=normalizeLink(input.value);
        generate(result);
    });
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') generateBtn?.click(); });
    input?.addEventListener('input', () => showError(''));

    deleteHistoryBtn?.addEventListener('click', () => {
        safeRemoveLocal(HISTORY_KEY);
        renderHistory();
    });

    // Wird der Verlauf in den Settings deaktiviert -> löschen & ausblenden
    historyToggle?.addEventListener('change', e => {
        if (!e.target.checked) {
            safeRemoveLocal(HISTORY_KEY);
        }
        renderHistory();
    });

    showError('');
    renderHistory();
};


// =====================================================
// Feature-Carousel (unendlicher Auto-Scroll)
// Pfeil-Klick / Antippen: Karte komplett zeigen, kurz warten, dann weiterlaufen
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!track) return;

    const originals = Array.from(track.children);
    // Karten klonen für nahtlosen Loop (Klone für Screenreader/Tab unsichtbar)
    originals.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('inert', '');
        track.appendChild(clone);
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SPEED = 40;          // Pixel pro Sekunde – unabhängig von 60/120/144 Hz
    const PAUSE_MS = 5000;     // Wartezeit nach Pfeil-Klick / Antippen
    let hover = false, touch = false, holdUntil = 0;
    let position = 0;
    let lastTime = null;

    // Breite einer Hälfte (Originale + Gap) – exakt, damit der Loop nicht springt
    const loopWidth = () => {
        const cards = track.children;
        return cards[cards.length / 2].offsetLeft - cards[0].offsetLeft;
    };
    const stepWidth = () => {
        const cards = track.children;
        return cards[1].offsetLeft - cards[0].offsetLeft;
    };

    const isHolding = () => performance.now() < holdUntil;
    function hold(ms = PAUSE_MS) {
        holdUntil = Math.max(holdUntil, performance.now() + ms);
    }

    function step(time) {
        const paused = reducedMotion || hover || touch || isHolding() || document.hidden;
        track.classList.toggle('is-paused', paused && !reducedMotion);
        if (lastTime !== null && !paused) {
            const dt = Math.min(time - lastTime, 50) / 1000;
            position += SPEED * dt;
            const w = loopWidth();
            if (position >= w) position -= w;
            track.scrollLeft = position;
        } else if (paused) {
            position = track.scrollLeft;
        }
        if (!isHolding()) clearActive();
        lastTime = time;
        requestAnimationFrame(step);
    }

    // Desktop: Hover pausiert, beim Verlassen kurz nachlaufen lassen
    track.addEventListener('mouseenter', () => hover = true);
    track.addEventListener('mouseleave', () => { hover = false; hold(800); });
    track.addEventListener('focusin', () => hover = true);
    track.addEventListener('focusout', () => hover = false);

    // Handy: Wischen pausiert, danach Wartezeit
    track.addEventListener('touchstart', () => touch = true, { passive: true });
    track.addEventListener('touchend', () => { touch = false; hold(); }, { passive: true });

    // Antippen einer Karte: hervorheben und komplett ins Bild holen
    function clearActive() {
        track.querySelectorAll('.carousel-card.is-active').forEach(c => c.classList.remove('is-active'));
    }
    track.addEventListener('click', e => {
        const card = e.target.closest('.carousel-card');
        if (!card) return;
        clearActive();
        card.classList.add('is-active');
        const left = card.offsetLeft - track.children[0].offsetLeft;
        const right = left + card.offsetWidth;
        // Nur scrollen, wenn die Karte angeschnitten ist
        if (left < track.scrollLeft || right > track.scrollLeft + track.clientWidth) {
            const target = Math.min(left, Math.max(track.scrollLeft, right - track.clientWidth));
            track.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : 'smooth' });
        }
        hold();
    });

    // Pfeile: auf die nächste/vorherige Karte EXAKT einrasten, dann warten
    function manualScroll(dir) {
        const w = loopWidth();
        const s = stepWidth();
        let cur = track.scrollLeft;
        // Unsichtbar in die "sichere" Hälfte springen (Klone sind identisch)
        if (dir > 0 && cur + s > w) { cur -= w; track.scrollLeft = cur; }
        if (dir < 0 && cur - s < 0) { cur += w; track.scrollLeft = cur; }

        // Ist die erste Karte nur angeschnitten, zählt das Einrasten darauf schon als Schritt zurück
        const idx = dir > 0 ? Math.floor(cur / s + 0.05) + 1 : Math.ceil(cur / s - 0.05) - 1;
        clearActive();
        track.scrollTo({ left: idx * s, behavior: reducedMotion ? 'auto' : 'smooth' });
        hold();
    }

    nextBtn?.addEventListener('click', () => manualScroll(1));
    prevBtn?.addEventListener('click', () => manualScroll(-1));

    // Bei Größenänderung Position im gültigen Bereich halten
    window.addEventListener('resize', () => {
        const w = loopWidth();
        position = ((track.scrollLeft % w) + w) % w;
        track.scrollLeft = position;
    });

    requestAnimationFrame(step);
});