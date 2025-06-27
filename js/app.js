// app.js: The main application entry point. Runs last.

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

// --- Settings Panel Logic ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsCloseBtn = document.getElementById('settings-close-btn');

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
        renderWidgetLibrary();
    });
    settingsCloseBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('is-open');
    });
}

// Attach listener for the main reset button
const resetButton = document.getElementById('reset-layout-btn');
if (resetButton) {
    resetButton.addEventListener('click', resetLayout);
}

// --- Initialize Default Widgets ---
widgetManager.addWidget('greeting');
widgetManager.addWidget('clock');
widgetManager.addWidget('todo');