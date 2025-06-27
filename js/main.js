// --- Parallax Effect ---
const stage = document.getElementById('stage');
const maxRotate = 3;

window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    const rotateX = -y * maxRotate;
    const rotateY = x * maxRotate;
    
    stage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});




const grid = GridStack.init({
    // --- General Options ---
    column: 12,
    minRow: 1,
    cellHeight: '10vh',
    margin: 10,
    placeholderClass: 'widget-ghost',
    float: true,

    // --- Resizing and Dragging Rules ---
    // Rule 1: Tell Gridstack HOW to resize.
    resizable: {
        handles: '.widget-resize-handle'
    },
    // Rule 2: Tell Gridstack WHEN NOT to drag.
    draggable: {
        cancel: '.widget-resize-handle'
    }
});

// --- LAYOUT PRESETS ---
const presets = {
    "default": [
        { id: 'clock', x: 4, y: 1, width: 4, height: 2 },
        { id: 'greeting', x: 0, y: 3, width: 12, height: 1 }
    ],
    "sidebar-left": [
        { id: 'clock', x: 0, y: 0, width: 3, height: 2 },
        { id: 'greeting', x: 0, y: 2, width: 3, height: 1 }
    ],
    "focused-center": [
        { id: 'clock', x: 3, y: 3, width: 6, height: 2 },
        { id: 'greeting', x: 0, y: 5, width: 12, height: 1 }
    ]
};

// Function to apply a preset to the grid
function applyPreset(presetName) {
    if (presets[presetName]) {
        grid.load(presets[presetName]);
    }
}

function resetLayout() {
    console.log("Resetting layout...");

   
    if (grid) {
        grid.destroy(false);
    }

    localStorage.removeItem('gridstack');

    // 3. Force a reload of the page.
    console.log("Reloading page now.");
    location.reload();
}


const resetButton = document.getElementById('reset-layout-btn');


if (resetButton) {
    resetButton.addEventListener('click', resetLayout);
}




// --- SETTINGS PANEL LOGIC ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsCloseBtn = document.getElementById('settings-close-btn');

if (settingsBtn && settingsPanel && settingsCloseBtn) {
    // Function to open the panel
    const openPanel = () => {
        settingsPanel.classList.add('is-open');
    };

    // Function to close the panel
    const closePanel = () => {
        settingsPanel.classList.remove('is-open');
    };

    // Attach event listeners
    settingsBtn.addEventListener('click', openPanel);
    settingsCloseBtn.addEventListener('click', closePanel);
}