

// --- The Master List of All Widgets ---
const WIDGET_REGISTRY = {
    'greeting': { name: 'Greeting', class: GreetingWidget, preview: '/images/greeting-preview.png' },
    'clock': { name: 'Clock', class: ClockWidget,  preview: '/images/clock-preview.png' },
    'weather': { name: 'Weather', class: WeatherWidget, preview: '/images/weather-preview.png' },
    'todo': { name: 'To-Do List', class: TodoWidget, preview: '/images/todo-preview.png' },
    'ai-chat': { name: 'AI Chat', class: AIWidget, preview: '/images/ai-chat-preview.png' },
};


// --- The Brain that Manages Widgets ---
class WidgetManager {
    constructor() { this.activeWidgets = new Map(); }
    addWidget(id) {
        if (this.activeWidgets.has(id) || !WIDGET_REGISTRY[id]) return;
        const WidgetClass = WIDGET_REGISTRY[id].class;
        const newWidgetInstance = new WidgetClass();
        this.activeWidgets.set(id, newWidgetInstance);
    }
    removeWidget(id) {
        if (!this.activeWidgets.has(id)) return;
        const widgetInstance = this.activeWidgets.get(id);
        grid.removeWidget(widgetInstance.element); 
        this.activeWidgets.delete(id);
    }
}
const widgetManager = new WidgetManager();
// In public/js/app.js - The new, unified logic block

// --- UI Panel Management ---

// Settings Panel Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsCloseBtn = document.getElementById('settings-close-btn');

// Reorganize Modal Elements
const reorganizeBtn = document.getElementById('reorganize-btn');
const reorganizeModalOverlay = document.getElementById('reorganize-modal-overlay');
const reorganizeCancelBtn = document.getElementById('reorganize-cancel-btn');
const reorganizeForm = document.getElementById('reorganize-form');


// --- Logic for Settings Panel ---
if (settingsBtn && settingsPanel && settingsCloseBtn) {
    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('is-open');
        renderWidgetLibrary(); // Draw the library when the panel opens
    });

    settingsCloseBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('is-open');
    });
}

// Function to draw the widget library (this remains unchanged)
function renderWidgetLibrary() {
    const content = settingsPanel.querySelector('.settings-content');
    if (!content) return;
    const libraryGrid = document.createElement('div');
    libraryGrid.className = 'widget-library-grid';
    for (const id in WIDGET_REGISTRY) {
        const widget = WIDGET_REGISTRY[id];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'widget-library-item';
        const isActive = widgetManager.activeWidgets.has(id);
        itemDiv.innerHTML = `
            <div class="widget-preview"><img src="${widget.preview}" alt="${widget.name} preview"></div>
            <span>${widget.name}</span>
            <button class="widget-toggle-btn ${isActive ? 'is-active' : ''}" data-widget-id="${id}">
                ${isActive ? 'Remove' : 'Add'}
            </button>
        `;
        libraryGrid.appendChild(itemDiv);
    }
    content.innerHTML = '';
    content.appendChild(libraryGrid);
    libraryGrid.addEventListener('click', handleWidgetToggle);
}

// Function to handle add/remove clicks (this remains unchanged)
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


// --- Logic for Reorganize Modal ---
if (reorganizeBtn && reorganizeModalOverlay && reorganizeCancelBtn && reorganizeForm) {
    const showReorganizeModal = () => reorganizeModalOverlay.classList.remove('hidden');
    const hideReorganizeModal = () => reorganizeModalOverlay.classList.add('hidden');

    reorganizeBtn.addEventListener('click', showReorganizeModal);
    reorganizeCancelBtn.addEventListener('click', hideReorganizeModal);
    reorganizeModalOverlay.addEventListener('click', (e) => {
        if (e.target === reorganizeModalOverlay) {
            hideReorganizeModal();
        }
    });

    reorganizeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInput = document.getElementById('reorganize-input').value;
        console.log("User wants to reorganize with this prompt:", userInput);
        // We will add the API call here later
        hideReorganizeModal();
    });
}

// Attach listener for the main reset button (this can stay here)
const resetButton = document.getElementById('reset-layout-btn');
if (resetButton) {
    resetButton.addEventListener('click', resetLayout);
}

// ... the "Initialize Default Widgets" section comes after this

// --- Initialize Default Widgets ---
widgetManager.addWidget('greeting');
widgetManager.addWidget('clock');
widgetManager.addWidget('todo');
