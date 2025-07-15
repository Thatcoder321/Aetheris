function collectCurrentState() {
    const layout = grid.save(false);
    const theme = localStorage.getItem('aetheris-theme-url') || '/images/abstract-gradient-image.jpg';
    const activeWidgets = Array.from(widgetManager.activeWidgets.keys()); // ✅ Track active widgets
    
    const widgetData = {
        todo: { tasks: JSON.parse(localStorage.getItem('aetheris-tasks')) || [] },
        weather: { city: localStorage.getItem('aetheris-city') },
        greeting: { name: localStorage.getItem('aetheris-username') },
        stocks: { symbols: localStorage.getItem('aetheris-stock-symbols') },
        countdown: { 
            target: localStorage.getItem('aetheris-countdown-target'),
            title: localStorage.getItem('aetheris-countdown-title')
        },
        quickLinks: { links: JSON.parse(localStorage.getItem('aetheris-quick-links')) || [] },
        notepad: { text: localStorage.getItem('aetheris-notepad-text') }
    };
    
    return { layout, theme, widgets: widgetData, activeWidgets }; // ✅ Include activeWidgets
}

async function saveStateToCloud() {
    if (typeof supabase_client === 'undefined') {
        console.log("supabase_client not available, skipping cloud save");
        return;
    }
    const { data: { session } } = await supabase_client.auth.getSession();
    if (!session) {
        console.log("No session, skipping cloud save");
        return;
    }
    
    console.log("%cSaving state to cloud...", "color: blue");
    const state = collectCurrentState();
    
    try {
        await fetch('/api/state', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ aetheris_config: state })
        });
        console.log("✅ State saved successfully");
    } catch (error) {
        console.error("Failed to save state:", error);
    }
}

async function loadStateFromCloud() {
    console.log("%cLoading state from cloud...", "color: green");
    if (typeof supabase_client === 'undefined') {
        console.log("supabase_client not available, using local defaults");
        return false;
    }
    const { data: { session } } = await supabase_client.auth.getSession();
    if (!session) {
        console.log("No active session, using local defaults");
        return false;
    }
    
    try {
        const response = await fetch('/api/state', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        
        if (!response.ok) {
            console.log("No cloud state found for user. Using local defaults.");
            return false;
        }

        const state = await response.json();
        if (!state || Object.keys(state).length === 0) {
            console.log("Cloud state is empty. Using local defaults.");
            return false;
        }

        console.log("Cloud state loaded successfully. Applying now...", state);


        if (state.theme) {
            applyTheme(state.theme);
        }
        

        if (state.widgets) {
            const widgets = state.widgets;
            if (widgets.todo?.tasks) localStorage.setItem('aetheris-tasks', JSON.stringify(widgets.todo.tasks));
            if (widgets.weather?.city) localStorage.setItem('aetheris-city', widgets.weather.city);
            if (widgets.greeting?.name) localStorage.setItem('aetheris-username', widgets.greeting.name);
            if (widgets.stocks?.symbols) localStorage.setItem('aetheris-stock-symbols', widgets.stocks.symbols);
            if (widgets.countdown?.target) localStorage.setItem('aetheris-countdown-target', widgets.countdown.target);
            if (widgets.countdown?.title) localStorage.setItem('aetheris-countdown-title', widgets.countdown.title);
            if (widgets.quickLinks?.links) localStorage.setItem('aetheris-quick-links', JSON.stringify(widgets.quickLinks.links));
            if (widgets.notepad?.text) localStorage.setItem('aetheris-notepad-text', widgets.notepad.text);
        }

        if (state.activeWidgets && Array.isArray(state.activeWidgets)) {
            console.log("Restoring active widgets:", state.activeWidgets);
            state.activeWidgets.forEach(widgetId => {
                if (WIDGET_REGISTRY[widgetId]) {
                    widgetManager.addWidget(widgetId);
                } else {
                    console.warn(`Widget ID "${widgetId}" not found in registry`);
                }
            });
        }

        if (state.layout) {
            console.log("Applying layout positions...");
            grid.load(state.layout);
        }
        
        return true;

    } catch (error) {
        console.error("Failed to load and apply state:", error);
        return false;
    }
}