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


const colors={
    codeColors:{
        color1:'black',
        color2:'',
        color3:'',
        color4:'',
        color5:''
    },
    bgColors:{
        color1:'black',
        color2:'',
        color3:'',
        color4:'',
        color5:''
    }
}

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



const textToInputField=document.getElementById("textToInputField");

textToInputField.value="Scan Me";