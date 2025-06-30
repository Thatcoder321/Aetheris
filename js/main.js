const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('github_auth')) {

    window.history.replaceState({}, document.title, "/");
    
    location.reload();
}
const stage = document.getElementById('stage');



const grid = GridStack.init({
    column: 12,
    minRow: 1,
    cellHeight: '10vh',
    margin: 10,
    float: true,

    placeholderClass: 'widget-ghost',
    

    resizable: {
        handles: 'se'
    },
    draggable: {
        handle: '.widget-drag-handle'
    }
});
// --- PARALLAX EFFECT ---
window.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return; // Disable on mobile
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    const rotateX = -y * 3; // Using maxRotate of 3
    const rotateY = x * 3;
    stage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
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