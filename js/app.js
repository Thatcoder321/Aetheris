
// --- List of All Widgets ---
const WIDGET_REGISTRY = {
    'greeting': { name: 'Greeting', class: GreetingWidget, preview: '/images/greeting-preview.png' },
    'clock': { name: 'Clock', class: ClockWidget,  preview: '/images/clock-preview.png' },
    'weather': { name: 'Weather', class: WeatherWidget, preview: '/images/weather-preview.png' },
    'todo': { name: 'To-Do List', class: TodoWidget, preview: '/images/todo-preview.png' },
    'ai-chat': { name: 'AI Chat', class: AIWidget, preview: '/images/ai-chat-preview.png' },
    'pomodoro': { name: 'Pomodoro Timer', class: PomodoroWidget, preview: '/images/pomodoro-preview.png' }, // Using a placeholder preview for now
    'notepad': { name: 'Notepad', class: NotepadWidget, preview: '/images/notepad-preview.png' }, 
    'news-ticker': { name: 'News Ticker', class: NewsTickerWidget, preview: '/images/news-preview.png' },
    'countdown': { name: 'Countdown', class: CountdownWidget, preview: '/images/countdown-preview.png' },
    'stock-ticker': { name: 'Stock Ticker', class: StockTickerWidget, preview: '/images/stock-ticker-preview.png' },
    'github-stats': { name: 'GitHub Stats', class: GitHubStatsWidget, preview: '/images/github-preview.png' },
    'quote-of-day': { name: 'Quote of the Day', class: QuoteWidget, preview: '/images/quote-preview.png' },
    'quick-links': { name: 'Quick Links', class: QuickLinksWidget, preview: '/images/quick-links-preview.png' },
    'system-stats': { name: 'System Stats', class: SystemStatsWidget, preview: '/images/system-stats-preview.png' },
    'unit-converter': { name: 'Unit Converter', class: UnitConverterWidget, preview: '/images/unit-converter-preview.png' },
    'calculator': { name: 'Calculator', class: CalculatorWidget, preview: '/images/calculator-preview.png' },
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
        if (typeof widgetInstance.cleanup === 'function') {
            widgetInstance.cleanup();
        }

        grid.removeWidget(widgetInstance.element);
        this.activeWidgets.delete(id);
    }
}
const widgetManager = new WidgetManager();

const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsCloseBtn = document.getElementById('settings-close-btn');

const reorganizeBtn = document.getElementById('reorganize-btn');
const reorganizeModalOverlay = document.getElementById('reorganize-modal-overlay');
const reorganizeCancelBtn = document.getElementById('reorganize-cancel-btn');
const reorganizeForm = document.getElementById('reorganize-form');

const resetButton = document.getElementById('reset-layout-btn');



// 3. Logic for the Reorganize Modal (The Magic Wand Icon)
if (reorganizeBtn && reorganizeModalOverlay && reorganizeCancelBtn && reorganizeForm) {
    const showReorganizeModal = () => reorganizeModalOverlay.classList.remove('hidden');
    const hideReorganizeModal = () => reorganizeModalOverlay.classList.add('hidden');

    reorganizeBtn.addEventListener('click', showReorganizeModal);
    reorganizeCancelBtn.addEventListener('click', hideReorganizeModal);
    
    reorganizeModalOverlay.addEventListener('click', (e) => {
        if (e.target === reorganizeModalOverlay) hideReorganizeModal();
    });



reorganizeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = document.getElementById('reorganize-input').value;
    if (!userInput) return;

    const submitButton = reorganizeForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Thinking...';
    submitButton.disabled = true;

    try {
        
        const currentLayout = grid.save();
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        
      
        const response = await fetch('/api/reorganize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentLayout: currentLayout,
                viewport: viewport,
                userPrompt: userInput
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get new layout from server.');
        }

        const data = await response.json();
        
   

if (data.layout && Array.isArray(data.layout)) {
    data.layout.forEach(({ id, x, y, w, h }) => {
        const el = document.getElementById(id);
        if (el) {
            grid.update(el, { x, y, w, h });
        }
    });
    grid.compact();
} else {
    throw new Error("Received invalid layout data from server.");
}

    } catch (error) {
        console.error("Reorganization failed:", error);
        alert("Sorry, the AI architect failed to create a new layout.");
    } finally {
        // 4. Clean up
        submitButton.textContent = 'Reorganize';
        submitButton.disabled = false;
        hideReorganizeModal();
    }
});
}

// 4. Logic for the Reset Button
if (resetButton) {
    resetButton.addEventListener('click', resetLayout);
}


// --- Supporting Functions for the Settings Panel ---

function renderWidgetLibrary() {
    const libraryGrid = document.createElement('div');
    libraryGrid.className = 'widget-library-grid';

    for(const id in WIDGET_REGISTRY) {
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
    const libraryTab = document.getElementById('library-tab');
    libraryTab.innerHTML = '';
    libraryTab.appendChild(libraryGrid);
    libraryTab.removeEventListener('click', handleWidgetToggle);
    libraryTab.addEventListener('click', handleWidgetToggle);
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






widgetManager.addWidget('greeting');
widgetManager.addWidget('clock');
widgetManager.addWidget('todo');


loadInitialTheme();


const tour = new Tour();


window.addEventListener('load', () => {

    renderWidgetLibrary();
    renderThemes();


    setTimeout(() => tour.start(), 500);
});


const THEMES = [
    { name: 'Default', url: '/images/abstract-gradient-image.jpg' },
    { name: 'Cosmic', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop' },
    { name: 'Mountain', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2070&auto=format&fit=crop' }
];

function applyTheme(themeUrl) {
    document.body.style.backgroundImage = `url(${themeUrl})`;
    localStorage.setItem('aetheris-theme-url', themeUrl);
}

function renderThemes() {
    const themesTab = document.getElementById('themes-tab');
    themesTab.innerHTML = ''; 
    const themeGrid = document.createElement('div');
    themeGrid.className = 'theme-grid';

    THEMES.forEach(theme => {
        const themeItem = document.createElement('div');
        themeItem.className = 'theme-item';
        themeItem.innerHTML = `
            <img src="${theme.url}" alt="${theme.name}" class="theme-thumbnail">
            <span>${theme.name}</span>
        `;
        themeItem.addEventListener('click', () => applyTheme(theme.url));
        themeGrid.appendChild(themeItem);
    });
    themesTab.appendChild(themeGrid);
}


function loadInitialTheme() {
    const savedThemeUrl = localStorage.getItem('aetheris-theme-url');
    if (savedThemeUrl) {
        applyTheme(savedThemeUrl);
    }
}



const tabContainer = document.querySelector('.settings-tabs');
const contentPanes = document.querySelectorAll('.tab-content');

function showActiveTabContent() {
    const activeTabButton = tabContainer.querySelector('.tab-link.is-active');
    if (!activeTabButton) {

        tabContainer.querySelector('.tab-link').classList.add('is-active');
    }
    
    const activeTabId = tabContainer.querySelector('.tab-link.is-active').dataset.tab;


    contentPanes.forEach(pane => pane.classList.remove('is-active'));
    

    const activeContentPane = document.getElementById(`${activeTabId}-tab`);
    if (activeContentPane) {
        activeContentPane.classList.add('is-active');
    }
}


if (settingsBtn && settingsPanel && settingsCloseBtn && tabContainer) {

    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('is-open');

        showActiveTabContent();
    });


    settingsCloseBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('is-open');
    });

    tabContainer.addEventListener('click', (e) => {
        if (e.target.matches('.tab-link')) {

            tabContainer.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('is-active'));
            e.target.classList.add('is-active');

            showActiveTabContent();
            

            if (e.target.dataset.tab === 'themes' && !document.getElementById('themes-tab').hasChildNodes()) {
                renderThemes();
            }
        }
    });
}



loadInitialTheme();

const authManager = new AuthManager();