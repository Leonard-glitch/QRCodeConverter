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

    // 4. Gespeicherte Einstellungen beim Laden anwenden
    const savedTheme = localStorage.getItem('linqr_theme') || 'dark';
    const savedHistory = localStorage.getItem('linqr_history') !== 'false';
    const savedLang = localStorage.getItem('linqr_lang') || 'en';

    // Theme sofort setzen
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateActiveThemeButton(savedTheme);

    if (historyToggle) {
        historyToggle.checked = savedHistory;
        historyToggle.addEventListener('change', (e) => {
            localStorage.setItem('linqr_history', e.target.checked);
        });
    }

    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            localStorage.setItem('linqr_lang', e.target.value);
        });
    }

    // 5. Theme wechseln & speichern (mit e.currentTarget statt e.target)
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedTheme = e.currentTarget.getAttribute('data-theme');
            
            // Auf html-Tag setzen
            document.documentElement.setAttribute('data-theme', selectedTheme);
            
            // In localStorage sichern
            localStorage.setItem('linqr_theme', selectedTheme);
            
            // UI aktualisieren
            updateActiveThemeButton(selectedTheme);
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