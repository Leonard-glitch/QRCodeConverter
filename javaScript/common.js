document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('headerSettingsBTN');
    const settingsDialog = document.getElementById('settingsDialog');
    const closeBtn = document.getElementById('closeSettingsBTN');
    const historyToggle = document.getElementById('historyToggle');
    const themeButtons = document.querySelectorAll('.theme-option');
    const langSelect = document.getElementById('languageSelect');

    if (!settingsBtn || !settingsDialog) return;

    // 1. Modal öffnen
    settingsBtn.addEventListener('click', () => {
        settingsDialog.showModal();
    });

    // 2. Modal schließen (Button)
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            settingsDialog.close();
        });
    }

    // 3. Modal schließen bei Klick außerhalb
    settingsDialog.addEventListener('click', (e) => {
        const rect = settingsDialog.getBoundingClientRect();
        if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
        ) {
            settingsDialog.close();
        }
    });

    function safeGetLocal(key, fallback) {
        try {
            return localStorage.getItem(key) ?? fallback;
        } catch {
            return fallback;
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

    const savedTheme = safeGetLocal('linqr_theme', 'dark');
    const savedHistory = safeGetLocal('linqr_history', 'true') !== 'false';
    const savedLang = safeGetLocal('linqr_lang', 'en');

    // Theme sofort setzen
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateActiveThemeButton(savedTheme);

        if (historyToggle) {
            historyToggle.checked = savedHistory;
            historyToggle.addEventListener('change', (e) => {
                safeSetLocal('linqr_history', e.target.checked);
            });
        }

        if (langSelect) {
            langSelect.value = savedLang;
            langSelect.addEventListener('change', (e) => {
                safeSetLocal('linqr_lang', e.target.value);
            });
        }

    // 5. Theme wechseln & speichern (mit e.currentTarget statt e.target)
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedTheme = e.currentTarget.getAttribute('data-theme');

            document.documentElement.setAttribute('data-theme', selectedTheme);

            updateActiveThemeButton(selectedTheme);

            safeSetLocal('linqr_theme', selectedTheme);
        });
    });

    function updateActiveThemeButton(theme) {
        themeButtons.forEach(b => {
            if (b.getAttribute('data-theme') === theme) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }
});




document.addEventListener('DOMContentLoaded',()=>{
    const howItWorksBtn=document.getElementById('headerHowItWorksBTN');
    const howItWorksDialog=document.getElementById('howItWorksDialog');
    const closeHowItWorksBtn=document.getElementById('closeHowItWorksBTN');
    if(howItWorksBtn&&howItWorksDialog){
        howItWorksBtn.addEventListener('click',()=>howItWorksDialog.showModal());
    }
    if(closeHowItWorksBtn&&howItWorksDialog){
        closeHowItWorksBtn.addEventListener('click',()=>howItWorksDialog.close());
    }
    if(howItWorksDialog){
        howItWorksDialog.addEventListener('click',(e)=>{
            const rect=howItWorksDialog.getBoundingClientRect();
            if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom){
            howItWorksDialog.close();
            }
        });
    }
});



const burgerDiv=document.getElementById("headerBurgerDeluxe");


    function initNavBurger() {
        burgerDiv
    }

    function setupNavBurgerFor(navRow) {
        const burger = document.createElement('button');
        burger.className = 'navBurger';
        burger.setAttribute('aria-label', 'Open menu');
        burger.setAttribute('aria-expanded', 'false');
        burger.innerHTML = `<span class="burgerLine"></span><span class="burgerLine"></span><span class="burgerLine"></span>`;
        navRow.appendChild(burger);

        function openMenu() {
            navRow.classList.add('nav-open');
            burger.classList.add('is-open');
            burger.setAttribute('aria-expanded', 'true');
            burger.setAttribute('aria-label', 'Close menu');
        }
        function closeMenu() {
            navRow.classList.remove('nav-open');
            burger.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Open menu');
        }

        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            navRow.classList.contains('nav-open') ? closeMenu() : openMenu();
        });
        document.addEventListener('click', (e) => { if (!navRow.contains(e.target)) closeMenu(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
        navRow.querySelector('[id^="navUserArea"]')?.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
        navRow.querySelector('[id^="searchResults"]')?.addEventListener('click', closeMenu);
    }

    initNavBurger();



const burgerToggle = document.getElementById('open-close-BurgerBtn');
const navLinks = document.getElementById('headerBurgerDeluxe');

burgerToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});