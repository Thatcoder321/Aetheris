function collectCurrentState() {
    const savedLayout = grid.save();
    const theme = localStorage.getItem('aetheris-theme-url');

    return { layout: savedLayout, theme: theme, widgets: {} };
}
async function saveState() {
    const state=collectCurrentState();
    await fetch('/api/user/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aetheris_config: state }),
    });
}

async function loadState() {
    const response = await fetch('/api/user/load');
    if (!response.ok) return;
    const data = await response.json();
    if (state.layout) {
        grid.load(state.layout);
    }
    if(state.theme) {
        applyTheme(state.theme);
    }
}