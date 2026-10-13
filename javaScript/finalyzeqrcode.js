// =====================================================
// linqr – QR-Code finalisieren (finalyzeqrcode.html)
// Live-Vorschau, Designs, Rahmen, Muster, Ecken, Symbol,
// Farben, Größe, PNG-/SVG-Download & Drucken
// =====================================================

// QR-Encoder (kazuhikoarase/qrcode-generator) wird dynamisch geladen,
// damit das HTML nicht angepasst werden muss.
const QR_LIB_URL = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';

const colors = {
    codeColors: {
        color1: '#0b0f17',
        color2: '#000000',
        color3: '#0e5a4d',
        color4: '#13326b',
        color5: '#7b1d3d'
    },
    bgColors: {
        color1: '#ffffff',
        color2: '#eff2f5',
        color3: '#fff7e6',
        color4: '#e0fcf6'
    }
};

const preDesigns = {
    classic: { name: 'Classic', frame: 'none',    pattern: 'squares', corners: 'sharp',   symbol: 'none',  codeColor: 'color2', bgColor: 'color1', size: 'web' },
    soft:    { name: 'Soft',    frame: 'none',    pattern: 'round',   corners: 'rounded', symbol: 'none',  codeColor: 'color1', bgColor: 'color1', size: 'web' },
    scanme:  { name: 'Scan me', frame: 'bars',    pattern: 'round',   corners: 'rounded', symbol: 'none',  codeColor: 'color1', bgColor: 'color1', size: 'web' },
    points:  { name: 'Points',  frame: 'bubble',  pattern: 'dots',    corners: 'circle',  symbol: 'none',  codeColor: 'color4', bgColor: 'color3', size: 'web' },
    lines:   { name: 'Lines',   frame: 'bars',    pattern: 'lines',   corners: 'rounded', symbol: 'none',  codeColor: 'color3', bgColor: 'color4', size: 'web' },
    brand:   { name: 'Brand',   frame: 'none',    pattern: 'round',   corners: 'circle',  symbol: 'brand', codeColor: 'color1', bgColor: 'color1', size: 'web' }
};

// Größen-Presets -> Sliderwert (Slider * 25.6 = Pixel, 40 = 1024 px)
const sizePresets = { businessCard: 12, web: 40, poster: 100 };
const PX_PER_STEP = 25.6;
const PRINT_DPI = 300;

// Eingebaute Mittelsymbole (24x24 viewBox, Linien-Icons)
const symbolIcons = {
    link:  '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    star:  '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" data-fill="1"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" data-fill="1"/>'
};

// ---------- Zustand ----------
const state = {
    link: '',
    design: 'classic',
    frame: 'none',
    frameText: 'Scan me',
    pattern: 'squares',
    corners: 'sharp',
    symbol: 'none',
    uploadedImage: null,  // DataURL
    brandImage: null,     // DataURL des Logos
    codeColor: colors.codeColors.color2,
    bgColor: colors.bgColors.color1,
    sliderValue: sizePresets.web
};

let qrMatrix = null; // { n, isDark(r,c) }

// =====================================================
// Initialisierung
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    state.link = getLinkFromPage();
    if (!state.link) {
        window.location.href = './index.html';
        return;
    }

    const currentLinkDiv = document.getElementById('currentLinkDiv');
    if (currentLinkDiv) {
        currentLinkDiv.textContent = state.link;
        currentLinkDiv.title = state.link;
    }

    loadColors();
    buildDesignButtons();
    bindOptionGroups();
    bindColorGroups();
    bindFrameText();
    bindUpload();
    bindSize();
    bindExport();

    loadBrandImage();
    applyDesign('classic', false);

    try {
        await loadScript(QR_LIB_URL);
        renderDesignPreviews();
        render();
    } catch {
        setPreviewMessage('The QR code could not be generated. Please check your internet connection and reload the page.');
    }
});

function getLinkFromPage() {
    const param = new URLSearchParams(window.location.search).get('link');
    const link = (param || localStorage.getItem('linqr_current') || '').trim();
    if (link) localStorage.setItem('linqr_current', link);
    return link;
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (window.qrcode) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

// Logo als DataURL laden, damit es auch im SVG/PNG-Export funktioniert
async function loadBrandImage() {
    try {
        const res = await fetch('./images/logoQRCode.svg');
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        state.brandImage = await blobToDataURL(blob);
        renderDesignPreviews();
        if (state.symbol === 'brand') render();
    } catch {
        state.brandImage = null; // Fallback: Link-Icon
    }
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
    });
}

// =====================================================
// UI: Farben, Designs, Optionen
// =====================================================
function loadColors() {
    document.querySelectorAll('.colorsOption-group').forEach(group => {
        const colorObj = colors[group.dataset.category];
        if (!colorObj) return;
        group.querySelectorAll('.settingsColorOptionButton').forEach(button => {
            const value = colorObj[button.dataset.id];
            if (value) {
                button.style.backgroundColor = value;
                button.setAttribute('aria-label', value);
                button.title = value;
            }
        });
    });
}

// Uses the existing HTML container; no HTML or CSS changes required.
function buildDesignButtons() {
    const container = document.getElementById('designsContainerDiv');
    if (!container) return;
    installDesignStyles();
    container.classList.add('settingsOptionButtonDiv');
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'QR code designs');
    container.replaceChildren();
    Object.entries(preDesigns).forEach(([id, d]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'settingsOptionButton linqr-design-card';
        btn.dataset.id = id;
        btn.setAttribute('aria-label', d.name + ' design');
        btn.setAttribute('aria-pressed', 'false');
        const preview = document.createElement('span');
        preview.className = 'linqr-design-preview';
        preview.setAttribute('aria-hidden', 'true');
        preview.textContent = 'Loading…';
        const label = document.createElement('span');
        label.className = 'linqr-design-label';
        label.textContent = d.name;
        btn.append(preview, label);
        btn.addEventListener('click', () => applyDesign(id));
        container.appendChild(btn);
    });
}

function installDesignStyles() {
    if (document.getElementById('linqr-design-styles')) return;
    const style = document.createElement('style');
    style.id = 'linqr-design-styles';
    style.textContent = `
        #designsContainerDiv {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: .45rem;
            width: 100%;
        }
        #designsContainerDiv .linqr-design-card {
            display: flex; flex-direction: column; align-items: center;
            justify-content: space-between; min-width: 0; width: 100%;
            padding: .45rem .4rem .5rem; gap: .35rem;
            border-radius: 8px; font-family: inherit;
            background: var(--background-color-secondary);
            border: 1px solid var(--border-color-secondary);
            color: var(--text-color-secondary); cursor: pointer;
            transition: border-color .15s, background-color .15s;
        }
        #designsContainerDiv .linqr-design-card:hover {
            border-color: var(--text-color-primary);
            color: var(--text-color-primary);
        }
        #designsContainerDiv .linqr-design-card.active {
            border-color: var(--cyan-highlight);
            background: var(--cyan-highlight-shimmer);
            color: var(--cyan-highlight);
        }
        #designsContainerDiv .linqr-design-card:focus-visible {
            outline: 2px solid var(--cyan-highlight); outline-offset: 3px;
        }
        #designsContainerDiv .linqr-design-preview {
            display: flex; align-items: center; justify-content: center;
            width: 100%; aspect-ratio: 1 / 1.2; min-width: 0;
            overflow: hidden; font-size: .6rem;
        }
        #designsContainerDiv .linqr-design-preview svg {
            display: block; width: 100%; height: 100%;
        }
        #designsContainerDiv .linqr-design-label {
            font-size: .6rem; line-height: 1.4; text-align: center;
            overflow-wrap: anywhere; letter-spacing: 0;
        }
        @media (prefers-reduced-motion: reduce) {
            #designsContainerDiv .linqr-design-card { transition: none; }
        }
    `;
    document.head.appendChild(style);
}

function designOptions(id) {
    const d = preDesigns[id];
    return {
        ...state, ...d,
        frameText: id === 'lines' ? 'Scan now' : 'Scan me',
        codeColor: colors.codeColors[d.codeColor],
        bgColor: colors.bgColors[d.bgColor]
    };
}

// Render each real QR preset independently, without changing the live selection.
function renderDesignPreviews() {
    if (!window.qrcode) return;
    document.querySelectorAll('#designsContainerDiv .linqr-design-card').forEach(btn => {
        const preview = btn.querySelector('.linqr-design-preview');
        if (!preview) return;
        try {
            const options = designOptions(btn.dataset.id);
            const matrix = buildMatrix(options);
            preview.innerHTML = buildSVG(undefined, options, matrix).svg;
        } catch {
            preview.textContent = 'Preview unavailable';
        }
    });
}

function setActive(container, selector, id) {
    container?.querySelectorAll(selector).forEach(b => {
        const active = b.dataset.id === id;
        b.classList.toggle('active', active);
        if (b.classList.contains('linqr-design-card')) b.setAttribute('aria-pressed', String(active));
    });
}

function groupEl(category) {
    return document.querySelector(`[data-category="${category}"]`);
}

function applyDesign(id, doRender = true) {
    const d = preDesigns[id];
    if (!d) return;
    state.design = id;
    state.frame = d.frame;
    state.pattern = d.pattern;
    state.corners = d.corners;
    state.symbol = d.symbol;
    state.frameText = designOptions(id).frameText;
    const frameInput = document.getElementById('textToInputField');
    if (frameInput) frameInput.value = state.frameText;
    document.getElementById('uploadImageButton')?.classList.remove('active');
    state.codeColor = colors.codeColors[d.codeColor];
    state.bgColor = colors.bgColors[d.bgColor];
    state.sliderValue = sizePresets[d.size];

    setActive(document.getElementById('designsContainerDiv'), '.settingsOptionButton', id);
    setActive(groupEl('frame'), '.settingsOptionButton', d.frame);
    setActive(groupEl('pattern'), '.settingsOptionButton', d.pattern);
    setActive(groupEl('corners'), '.settingsOptionButton', d.corners);
    setActive(groupEl('symbolCenter'), '.settingsOptionButton', d.symbol);
    setActive(groupEl('codeColors'), '.settingsColorOptionButton', d.codeColor);
    setActive(groupEl('bgColors'), '.settingsColorOptionButton', d.bgColor);
    setActive(groupEl('size'), '.settingsOptionButton', d.size);

    syncPickers();
    syncFrameInput();
    syncSlider();
    if (doRender) render();
}

// Jede manuelle Änderung hebt die Design-Auswahl auf
function clearDesign() {
    state.design = null;
    setActive(document.getElementById('designsContainerDiv'), '.settingsOptionButton', null);
}

function bindOptionGroups() {
    ['frame', 'pattern', 'corners', 'symbolCenter'].forEach(category => {
        const group = groupEl(category);
        group?.querySelectorAll('.settingsOptionButton[data-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = category === 'symbolCenter' ? 'symbol' : category;
                state[key] = btn.dataset.id;
                setActive(group, '.settingsOptionButton', btn.dataset.id);
                clearDesign();
                if (category === 'frame') syncFrameInput();
                render();
            });
        });
    });
}

function bindColorGroups() {
    document.querySelectorAll('.colorsOption-group').forEach(group => {
        const category = group.dataset.category;
        const key = category === 'codeColors' ? 'codeColor' : 'bgColor';
        const picker = group.querySelector('.color-picker-input');

        group.querySelectorAll('.settingsColorOptionButton').forEach(btn => {
            btn.addEventListener('click', () => {
                state[key] = colors[category][btn.dataset.id];
                setActive(group, '.settingsColorOptionButton', btn.dataset.id);
                clearDesign();
                syncPickers();
                render();
            });
        });

        // Eigene Farbe: keine Vorgabe mehr aktiv
        picker?.addEventListener('input', e => {
            state[key] = e.target.value;
            setActive(group, '.settingsColorOptionButton', null);
            clearDesign();
            render();
        });
    });
}

function syncPickers() {
    const codePicker = document.getElementById('codePicker');
    const bgPicker = document.getElementById('bgPicker');
    if (codePicker) codePicker.value = state.codeColor;
    if (bgPicker) bgPicker.value = state.bgColor;
}

function bindFrameText() {
    const field = document.getElementById('textToInputField');
    if (!field) return;
    field.value = state.frameText;
    field.maxLength = 24;
    field.placeholder = 'Frame text';
    field.addEventListener('input', () => {
        state.frameText = field.value;
        clearDesign();
        render();
    });
}

function syncFrameInput() {
    const field = document.getElementById('textToInputField');
    if (!field) return;
    const hasFrame = state.frame !== 'none';
    field.disabled = !hasFrame;
    field.parentElement.style.display = hasFrame ? '' : 'none';
}

// ---------- Eigenes Bild hochladen ----------
function bindUpload() {
    const uploadBtn = document.getElementById('uploadImageButton');
    const holder = document.getElementById('ownSymbolinCenterDiv');
    if (!uploadBtn) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    uploadBtn.addEventListener('click', () => {
        if (state.uploadedImage) {
            selectUpload();
        } else {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        fileInput.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) return showInfo('Please choose an image file.', 'error');
        if (file.size > 2 * 1024 * 1024) return showInfo('The image is too large (max. 2 MB).', 'error');
        state.uploadedImage = await blobToDataURL(file);
        renderUploadPreview();
        selectUpload();
    });

    function selectUpload() {
        state.symbol = 'upload';
        setActive(groupEl('symbolCenter'), '.settingsOptionButton', null);
        uploadBtn.classList.add('active');
        clearDesign();
        render();
    }

    function renderUploadPreview() {
        if (!holder) return;
        holder.innerHTML = '';
        if (!state.uploadedImage) return;
        holder.style.cssText = 'display:flex;align-items:center;gap:.6rem;margin-top:.6rem;';

        const img = document.createElement('img');
        img.src = state.uploadedImage;
        img.alt = 'Uploaded symbol';
        img.style.cssText = 'width:40px;height:40px;object-fit:contain;border-radius:8px;background:#fff;padding:4px;';

        const change = document.createElement('button');
        change.className = 'settingsOptionButton';
        change.textContent = 'Change';
        change.addEventListener('click', () => fileInput.click());

        const remove = document.createElement('button');
        remove.className = 'settingsOptionButton';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
            state.uploadedImage = null;
            holder.innerHTML = '';
            uploadBtn.classList.remove('active');
            if (state.symbol === 'upload') {
                state.symbol = 'none';
                setActive(groupEl('symbolCenter'), '.settingsOptionButton', 'none');
            }
            render();
        });

        holder.append(img, change, remove);
    }

    // Upload-Button verliert "active", sobald anderes Symbol gewählt wird
    groupEl('symbolCenter')?.querySelectorAll('.settingsOptionButton[data-id]').forEach(b => {
        b.addEventListener('click', () => uploadBtn.classList.remove('active'));
    });
}

// ---------- Größe ----------
function bindSize() {
    const slider = document.getElementById('sizeSlider');
    const group = groupEl('size');
    if (!slider) return;

    slider.addEventListener('input', () => {
        state.sliderValue = Number(slider.value);
        const preset = Object.keys(sizePresets).find(k => sizePresets[k] === state.sliderValue) || null;
        setActive(group, '.settingsOptionButton', preset);
        syncSlider();
    });

    group?.querySelectorAll('.settingsOptionButton').forEach(btn => {
        btn.addEventListener('click', () => {
            state.sliderValue = sizePresets[btn.dataset.id];
            setActive(group, '.settingsOptionButton', btn.dataset.id);
            syncSlider();
        });
    });
}

function getPixelSize() {
    return Math.round(state.sliderValue * PX_PER_STEP);
}

function syncSlider() {
    const slider = document.getElementById('sizeSlider');
    const out = document.getElementById('pxAndUnitOutputSpan');
    if (!slider) return;
    slider.value = state.sliderValue;

    const min = Number(slider.min) || 0;
    const max = Number(slider.max) || 100;
    const pct = ((state.sliderValue - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--cyan-highlight) ${pct}%, var(--background-color-secondary) ${pct}%)`;

    const px = getPixelSize();
    const cm = (px / PRINT_DPI * 2.54).toFixed(1);
    if (out) out.textContent = `${px} px ~ ${cm} cm`;
}

// =====================================================
// QR-Matrix & SVG-Aufbau
// =====================================================
function buildMatrix(options = state) {
    const ecc = options.symbol !== 'none' ? 'H' : 'M'; // Symbol verdeckt Module -> höhere Fehlerkorrektur
    const qr = window.qrcode(0, ecc);
    qr.addData(unescape(encodeURIComponent(options.link))); // UTF-8
    qr.make();
    const n = qr.getModuleCount();
    return { n, isDark: (r, c) => qr.isDark(r, c) };
}

const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

function isFinder(r, c, n) {
    return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
}

function getSymbolSize(n) {
    // ca. 22 % der Codebreite, ungerade Modulanzahl damit es zentriert ist
    let s = Math.round(n * 0.22);
    if (s % 2 === 0) s += 1;
    return s;
}

function modulesSVG(m, ox, oy, color, options = state) {
    const { n } = m;
    const hasSymbol = options.symbol !== 'none' && getSymbolContent(options) !== '';
    const sym = hasSymbol ? getSymbolSize(n) + 2 : 0;
    const sStart = Math.floor((n - sym) / 2);
    const inSymbol = (r, c) => hasSymbol && r >= sStart && r < sStart + sym && c >= sStart && c < sStart + sym;
    const dark = (r, c) => r >= 0 && c >= 0 && r < n && c < n && m.isDark(r, c) && !isFinder(r, c, n) && !inSymbol(r, c);

    let out = '';
    if (options.pattern === 'lines') {
        // Horizontale Module zu Linien zusammenfassen
        for (let r = 0; r < n; r++) {
            let c = 0;
            while (c < n) {
                if (dark(r, c)) {
                    let len = 1;
                    while (dark(r, c + len)) len++;
                    out += `<rect x="${ox + c + 0.1}" y="${oy + r + 0.15}" width="${len - 0.2}" height="0.7" rx="0.35"/>`;
                    c += len;
                } else c++;
            }
        }
    } else {
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (!dark(r, c)) continue;
                const x = ox + c, y = oy + r;
                if (options.pattern === 'dots') {
                    out += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.42"/>`;
                } else if (options.pattern === 'round') {
                    out += `<rect x="${x + 0.04}" y="${y + 0.04}" width="0.92" height="0.92" rx="0.38"/>`;
                } else {
                    // leicht überlappend, damit keine Haarlinien entstehen
                    out += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
                }
            }
        }
    }
    return `<g fill="${color}">${out}</g>`;
}

function finderSVG(x, y, color, bg, options = state) {
    const style = options.corners;
    if (style === 'circle') {
        return `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="3" fill="none" stroke="${color}" stroke-width="1"/>` +
               `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5" fill="${color}"/>`;
    }
    const outerR = style === 'rounded' ? 1.6 : 0;
    const innerR = style === 'rounded' ? 0.8 : 0;
    return `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="${outerR}" fill="none" stroke="${color}" stroke-width="1"/>` +
           `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${innerR}" fill="${color}"/>`;
}

function getSymbolContent(options = state) {
    if (options.symbol === 'upload') return options.uploadedImage ? 'img' : '';
    if (options.symbol === 'brand') return 'brand';
    return symbolIcons[options.symbol] ? 'icon' : '';
}

function symbolSVG(n, ox, oy, color, bg, options = state) {
    const kind = getSymbolContent(options);
    if (!kind) return '';
    const s = getSymbolSize(n);
    const x = ox + (n - s) / 2, y = oy + (n - s) / 2;
    const pad = s * 0.12;
    let out = `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.22}" fill="${bg}"/>`;

    if (kind === 'img' || (kind === 'brand' && options.brandImage)) {
        const href = kind === 'img' ? options.uploadedImage : options.brandImage;
        out += `<image href="${href}" x="${x + pad}" y="${y + pad}" width="${s - 2 * pad}" height="${s - 2 * pad}" preserveAspectRatio="xMidYMid meet"/>`;
    } else {
        const icon = symbolIcons[options.symbol] || symbolIcons.link; // Brand-Fallback
        const scale = (s - 2 * pad) / 24;
        const filled = icon.includes('data-fill');
        out += `<g transform="translate(${x + pad} ${y + pad}) scale(${scale})" fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${icon}</g>`;
    }
    return out;
}

// Liefert vollständiges SVG (als String) für Vorschau & Export
function buildSVG(outputPx, options = state, m = qrMatrix) {
    const n = m.n;
    const q = 4;                // Ruhezone
    const S = n + 2 * q;        // Kantenlänge des Codes inkl. Ruhezone
    const code = options.codeColor, bg = options.bgColor;
    const text = esc(options.frameText.trim());
    const font = `font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800"`;

    let W = S, H = S, codeX = 0, codeY = 0, frame = '', textEl = '';
    const textSize = Math.max(2.4, S * 0.075);

    switch (options.frame) {
        case 'bars': {
            const bar = textSize * 2.2;
            H = S + bar;
            frame = `<rect x="0" y="0" width="${W}" height="${H}" rx="${S * 0.04}" fill="${code}"/>` +
                    `<rect x="${q * 0.4}" y="${q * 0.4}" width="${S - q * 0.8}" height="${S - q * 0.8}" rx="${S * 0.025}" fill="${bg}"/>`;
            if (text) textEl = `<text x="${W / 2}" y="${S + bar / 2 - q * 0.2}" dominant-baseline="central" text-anchor="middle" font-size="${textSize}" ${font} fill="${bg}">${text}</text>`;
            break;
        }
        case 'bubble': {
            const pad = 1, label = textSize * 2.6;
            W = S + 2 * pad;
            H = S + 2 * pad + label;
            codeX = pad; codeY = pad;
            const labelWidth = W * .62, labelHeight = textSize * 1.9;
            const labelX = (W - labelWidth) / 2;
            const labelY = S + pad;
            frame = `<rect width="${W}" height="${H}" rx="${S * .06}" fill="${code}"/>` +
                    `<rect x="${pad}" y="${pad}" width="${W - 2 * pad}" height="${H - 2 * pad}" rx="${S * .045}" fill="${bg}"/>`;
            if (text) {
                frame += `<rect x="${labelX}" y="${labelY}" width="${labelWidth}" height="${labelHeight}" rx="${labelHeight / 2}" fill="${code}"/>` +
                         `<path d="M${W / 2 - 1.2} ${labelY + .1}L${W / 2} ${labelY - 1.3}L${W / 2 + 1.2} ${labelY + .1}Z" fill="${code}"/>`;
                const fittedSize = Math.min(textSize, labelWidth / Math.max(1, Array.from(options.frameText.trim()).length) / .65);
                textEl = `<text x="${W / 2}" y="${labelY + labelHeight / 2}" dominant-baseline="central" text-anchor="middle" font-size="${fittedSize}" ${font} fill="${bg}">${text}</text>`;
            }
            break;
        }
        case 'corners': {
            const label = text ? textSize * 2 : 0;
            H = S + label;
            const L = S * 0.18, w = 0.9, o = w / 2 + 0.4, e = S - o;
            frame = `<path d="M${o} ${o + L}V${o}H${o + L} M${e - L} ${o}H${e}V${o + L} M${e} ${e - L}V${e}H${e - L} M${o + L} ${e}H${o}V${e - L}" fill="none" stroke="${code}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
            if (text) textEl = `<text x="${W / 2}" y="${S + label / 2 - q * 0.4}" dominant-baseline="central" text-anchor="middle" font-size="${textSize}" ${font} fill="${code}">${text}</text>`;
            break;
        }
    }

    const ox = codeX + q, oy = codeY + q;
    const background = ['bars', 'bubble'].includes(options.frame) ? '' : `<rect width="${W}" height="${H}" fill="${bg}"/>`;

    const body =
        background + frame +
        modulesSVG(m, ox, oy, code, options) +
        finderSVG(ox, oy, code, bg, options) +
        finderSVG(ox + n - 7, oy, code, bg, options) +
        finderSVG(ox, oy + n - 7, code, bg, options) +
        symbolSVG(n, ox, oy, code, bg, options) +
        textEl;

    const pxW = outputPx ? Math.round(outputPx) : null;
    const pxH = outputPx ? Math.round(outputPx * H / W) : null;
    const dims = pxW ? `width="${pxW}" height="${pxH}"` : 'width="100%" height="100%"';

    return {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${dims} shape-rendering="${options.pattern === 'squares' && options.corners === 'sharp' ? 'crispEdges' : 'geometricPrecision'}">${body}</svg>`,
        ratio: H / W
    };
}

// =====================================================
// Rendern & Hinweise
// =====================================================
function render() {
    if (!window.qrcode) return;
    const preview = document.getElementById('livePreviewContainerDiv');
    try {
        qrMatrix = buildMatrix();
    } catch {
        setPreviewMessage('This link is too long to fit into a QR code.');
        return;
    }
    if (preview) {
        const { svg } = buildSVG();
        preview.innerHTML = svg;
        const el = preview.querySelector('svg');
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', 'QR code preview for ' + state.link);
        el.style.maxWidth = '100%';
        el.style.maxHeight = '100%';
        el.style.display = 'block';
    }
    updateInfoMessages();
}

function setPreviewMessage(msg) {
    const preview = document.getElementById('livePreviewContainerDiv');
    if (preview) preview.textContent = msg;
}

// Relative Luminanz für Kontrastprüfung (WCAG)
function luminance(hex) {
    const v = hex.replace('#', '');
    const rgb = [0, 2, 4].map(i => parseInt(v.substr(i, 2), 16) / 255)
        .map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a, b) {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
}

let infoTimeout = null;
function showInfo(msg, type = 'info') {
    const box = document.getElementById('infoMessagesDiv');
    if (!box) return;
    box.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = msg;
    p.style.color = type === 'error' ? 'var(--errorColor)' : '';
    box.appendChild(p);
    clearTimeout(infoTimeout);
    infoTimeout = setTimeout(updateInfoMessages, 4000);
}

function updateInfoMessages() {
    const box = document.getElementById('infoMessagesDiv');
    if (!box) return;
    const msgs = [];
    const ratio = contrast(state.codeColor, state.bgColor);
    if (ratio < 3) {
        msgs.push({ text: 'Low contrast between code and background – your code may not be scannable.', error: true });
    } else if (luminance(state.codeColor) > luminance(state.bgColor)) {
        msgs.push({ text: 'Light code on a dark background – some scanners can\'t read inverted codes.' });
    }
    box.innerHTML = '';
    msgs.forEach(m => {
        const p = document.createElement('p');
        p.textContent = m.text;
        if (m.error) p.style.color = 'var(--errorColor)';
        box.appendChild(p);
    });
    box.style.display = msgs.length ? '' : 'none';
}

// =====================================================
// Export: PNG, SVG, Drucken
// =====================================================
function bindExport() {
    document.getElementById('downloadPNGBtn')?.addEventListener('click', downloadPNG);
    document.getElementById('downloadAsSVGBtn')?.addEventListener('click', downloadSVG);
    document.getElementById('printButton')?.addEventListener('click', printCode);
}

function fileName(ext) {
    let host = 'qrcode';
    try { host = new URL(state.link).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, ''); } catch {}
    return `linqr-${host}.${ext}`;
}

function triggerDownload(url, name) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function downloadSVG() {
    if (!qrMatrix) return;
    const { svg } = buildSVG(getPixelSize());
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    triggerDownload(url, fileName('svg'));
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function svgToCanvas(px) {
    return new Promise((resolve, reject) => {
        const { svg, ratio } = buildSVG(px);
        const img = new Image();
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = px;
            canvas.height = Math.round(px * ratio);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(); };
        img.src = url;
    });
}

async function downloadPNG() {
    if (!qrMatrix) return;
    try {
        await document.fonts?.ready;
        const canvas = await svgToCanvas(getPixelSize());
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            triggerDownload(url, fileName('png'));
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 'image/png');
    } catch {
        showInfo('The PNG could not be created. Please try SVG instead.', 'error');
    }
}

function printCode() {
    if (!qrMatrix) return;
    const px = getPixelSize();
    const cm = px / PRINT_DPI * 2.54;
    const { svg } = buildSVG();
    const win = window.open('', '_blank');
    if (!win) return showInfo('Please allow pop-ups to print your code.', 'error');
    win.document.write(`<!DOCTYPE html><html><head><title>Print QR code</title>
        <style>
            @page { margin: 1.5cm; }
            html, body { margin: 0; height: 100%; }
            body { display: flex; align-items: center; justify-content: center; }
            .qr { width: ${cm.toFixed(2)}cm; max-width: 100%; }
            .qr svg { width: 100%; height: auto; display: block; }
        </style></head>
        <body><div class="qr">${svg}</div></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
}