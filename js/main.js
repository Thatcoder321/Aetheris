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

const WIDGET_REGISTRY = {
    'greeting': {name: 'Greeting', class: 'GreetingWidget'},
    'clock': {name: 'Clock', class: 'ClockWidget'},
    'weather': {name: 'Weather', class: 'WeatherWidget'},
    'todo': {name: 'To-Do List', class: 'TodoWidget'},
    'ai-chat': {name: 'AI Chat', class: 'AIWidget'}
};
// In js/widgets-v2.js

class WidgetManager {
    constructor() {
        this.activeWidgets = new Map();
    }

    addWidget(id) {
        if (this.activeWidgets.has(id) || !WIDGET_REGISTRY[id]) {
            console.warn(`Widget ${id} is already active or does not exist.`);
            return;
        }
        
        console.log(`Adding widget: ${id}`);
        // This is the corrected way to create a new class instance
        const WidgetClass = WIDGET_REGISTRY[id].class;
        const newWidgetInstance = new WidgetClass(); 
        
        this.activeWidgets.set(id, newWidgetInstance);
    }

    removeWidget(id) {
        if (!this.activeWidgets.has(id)) return;

        console.log(`Removing widget: ${id}`);
        const widgetInstance = this.activeWidgets.get(id);
        
        // This is the corrected spelling of 'grid'
        grid.removeWidget(widgetInstance.element, false); // Vercel recommends just two args
        
        this.activeWidgets.delete(id);
    }
}



const widgetManager = new WidgetManager();


// --- SETTINGS PANEL LOGIC ---
// In js/main.js - The CORRECTED Settings Panel Logic

// We wait for the entire document, including all scripts, to be ready
document.addEventListener('DOMContentLoaded', () => {

    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsCloseBtn = document.getElementById('settings-close-btn');

    // This function now lives inside the listener, so it has access
    // to variables from other files, like widgetManager.
    function renderWidgetLibrary() {
        const content = settingsPanel.querySelector('.settings-content');
        if (!content) return;

        const libraryGrid = document.createElement('div');
        libraryGrid.className = 'widget-library-grid';
        
        // Loop through every widget in our master list from widgets-v2.js
        for (const id in WIDGET_REGISTRY) {
            const widget = WIDGET_REGISTRY[id];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'widget-library-item';
            
            const isActive = widgetManager.activeWidgets.has(id);
            
            itemDiv.innerHTML = `
                <span>${widget.name}</span>
                <button class="widget-toggle-btn" data-widget-id="${id}">
                    ${isActive ? 'Remove' : 'Add'}
                </button>
            `;
            libraryGrid.appendChild(itemDiv);
        }
        
        content.innerHTML = '';
        content.appendChild(libraryGrid);

        // Remove old listener before adding new one to prevent duplicates
        libraryGrid.removeEventListener('click', handleWidgetToggle);
        libraryGrid.addEventListener('click', handleWidgetToggle);
    }
    
    // Moved the event handler logic into its own function for clarity
    function handleWidgetToggle(e) {
        if (e.target.matches('.widget-toggle-btn')) {
            const widgetId = e.target.dataset.widgetId;
            if (widgetManager.activeWidgets.has(widgetId)) {
                widgetManager.removeWidget(widgetId);
            } else {
                widgetManager.addWidget(widgetId);
            }
            renderWidgetLibrary(); 
        }
    }

    if (settingsBtn && settingsPanel && settingsCloseBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsPanel.classList.add('is-open');
            renderWidgetLibrary(); // Draw the library when the panel opens
        });
        settingsCloseBtn.addEventListener('click', () => {
            settingsPanel.classList.remove('is-open');
        });
    }

}); 
widgetManager.addWidget('greeting');
widgetManager.addWidget('clock');
widgetManager.addWidget('todo');