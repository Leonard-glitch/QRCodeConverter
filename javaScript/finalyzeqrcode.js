const shapeConfig = {
    // --- 2D SHAPES ---
    circle: {
        name: 'Circle',
        dimension: '2d',
        type: 1,
        inputs: [
            { id: 'r', label: 'Radius (r)' },
            { id: 'd', label: 'Diameter (d)' },
            { id: 'U', label: 'Perimeter (P)' },
            { id: 'A', label: 'Area (A)' }
        ]
    },
};

const textToInputField=document.getElementById("textToInputField");

textToInputField.value="Scan Me";


const colors={
    codeColors:{
        color1: '#0b0f17',
        color2: '#000000',
        color3: '#0e5a4d',
        color4: '#13326b',
        color5: '#7b1d3d' 
    },
    bgColors:{
        color1: '#ffffff',
        color2: '#eff2f5',
        color3: '#fff7e6',
        color4: '#e0fcf6',
    }
};

const preDesigns={
    classic:{
        name:'Classic',
        frame:'none',
        pattern:'squares',
        corners:'sharp',
        symbol:'none',
        codeColor:'color2',
        bgColor:'color1',
        size:'web'
    },
    soft:{
        name:'Soft',
        frame:'none',
        pattern:'round',
        corners:'rounded',
        symbol:'none',
        codeColor:'color1',
        bgColor:'color1',
        size:'web'
    },
    scanme:{
        name:'Scan me',
        frame:'bars',
        pattern:'round',
        corners:'rounded',
        symbol:'none',
        codeColor:'color1',
        bgColor:'color1',
        size:'web'
    },
    points:{
        name:'Points',
        frame:'bubble',
        pattern:'dots',
        corners:'circle',
        symbol:'none',
        codeColor:'color4',
        bgColor:'color3',
        size:'web'
    },
    lines:{
        name:'Lines',
        frame:'corners',
        pattern:'lines',
        corners:'rounded',
        symbol:'none',
        codeColor:'color3',
        bgColor:'color4',
        size:'web'
    },
    brand:{
        name:'Brand',
        frame:'none',
        pattern:'round',
        corners:'circle',
        symbol:'brand',
        codeColor:'color1',
        bgColor:'color1',
        size:'web'
    }
};


function loadColors(){
    document.querySelectorAll('.colorsOption-group').forEach(group => {
        // Greift direkt auf colors.codeColors oder colors.bgColors zu
        const colorObj = colors[group.dataset.category]; 
        if (!colorObj) return;

        group.querySelectorAll('.settingsColorOptionButton').forEach(button => {
            const colorKey = button.dataset.id; // z. B. "color1"
            const colorValue = colorObj[colorKey];

            if (colorValue) {
                button.style.backgroundColor = colorValue;
            }
        });
    });
}


document.querySelectorAll('.colorsOption-group').forEach(group => {
    const categoryKey = group.dataset.category; // "codeColors" oder "bgColors"
    const picker = group.querySelector('.color-picker-input');

    if (!picker) return;

    picker.addEventListener('input', (event) => {
        const selectedColor = event.target.value;


        // Aktiven Button genau in DIESER Gruppe finden
        const activeBtn = group.querySelector('.settingsColorOptionButton.active');

    });
});


const slider = document.getElementById('sizeSlider');

function updateSlider() {
    const min = slider.min || 0;
    const max = slider.max || 100;
    const val = slider.value;
    
    // Berechnet den prozentualen Wert für die Füllung
    const percentage = ((val - min) / (max - min)) * 100;

    // Setzt den Hintergrund: Links Türkis (#00ffda), rechts Dunkelblau/Schwarz (#121820)
    slider.style.background = `linear-gradient(to right, var(--cyan-highlight) ${percentage}%, var(--background-color-secondary) ${percentage}%)`;
}

// Event-Listener für Live-Aktualisierung beim Ziehen
slider.addEventListener('input', updateSlider);




updateSlider();
loadColors();
