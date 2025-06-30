// main.js: Sets up the core environment and global objects.

// --- GLOBAL OBJECTS ---
// These are created here so all other scripts can access them.
const stage = document.getElementById('stage');
const grid = GridStack.init({
    column: 12,
    minRow: 1,
    cellHeight: '10vh',
    margin: 10,
    placeholderClass: 'widget-ghost',
    float: true,
    resizable: { handles: '.widget-resize-handle' },
    draggable: { cancel: '.widget-resize-handle' }
});

// --- PARALLAX EFFECT ---
window.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return; // Disable on mobile
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    const rotateX = -y * 3; // Using maxRotate of 3
    const rotateY = x * 3;
    // stage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

// --- LAYOUT FUNCTIONS ---
function applyPreset(presetName) {
    const presets = {
        "default": [ /* Define presets later */ ]
    };
    if (presets[presetName]) {
        grid.load(presets[presetName]);
    }
}

function resetLayout() {
    localStorage.removeItem('gridstack');
    location.reload();
}