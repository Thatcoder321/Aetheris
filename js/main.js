// --- Parallax Effect ---
const stage = document.getElementById('stage');
const maxRotate = 4;

window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    const rotateX = -y * maxRotate;
    const rotateY = x * maxRotate;
    
    stage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});


// In js/main.js - THE FINAL, CORRECTED VERSION

// --- WIDGET GRID SYSTEM ---
// In js/main.js
// In js/main.js - THE CORRECTED VERSION

// --- WIDGET GRID SYSTEM ---
// In js/main.js

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

// The new, more powerful reset function
function resetLayout() {
    console.log("Resetting layout...");

    // 1. Tell the Gridstack instance to shut down and release control.
    // The 'false' parameter means "don't delete the child elements".
    if (grid) {
        grid.destroy(false);
    }

    // 2. Remove the saved layout from localStorage.
    // Replace 'gridstack' with the key you found in Step 1 if it's different.
    localStorage.removeItem('gridstack');

    // 3. Force a reload of the page.
    console.log("Reloading page now.");
    location.reload();
}

function createGridDebugger() {
    const overlay = document.createElement('div');
    overlay.className = 'grid-overlay';
    for (let i = 0; i < 12; i++) {
        const column = document.createElement('div');
        column.className = 'grid-column';
        column.textContent = i; // Show the column number
        overlay.appendChild(column);
    }
    document.body.appendChild(overlay);
}
const resetButton = document.getElementById('reset-layout-btn');

// 2. If the button exists, attach a 'click' listener to it.
// When clicked, it will run our existing resetLayout function.
if (resetButton) {
    resetButton.addEventListener('click', resetLayout);
}
createGridDebugger(); // Run the function

