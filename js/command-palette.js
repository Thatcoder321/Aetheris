class CommandPalette {
    constructor() {
        this.commands = [];
        this.isOpen = false;
        this.selectedIndex = 0;
        this.init();
    }
    
    init() {
        this.createUI();
        this.registerCommands();
        this.attachListeners();
    }
    
    createUI() {
        const html = `
            <div id="command-palette" class="command-palette hidden">
                <input type="text" id="command-input" placeholder="Type a command or search...">
                <div id="command-results"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        
        this.palette = document.getElementById('command-palette');
        this.input = document.getElementById('command-input');
        this.results = document.getElementById('command-results');
    }
    
    registerCommands() {
        this.commands = [
            // Widget Management
            { name: 'Add Widget', icon: '➕', action: () => this.showWidgetLibrary() },
            { name: 'Remove All Widgets', icon: '🗑️', action: () => this.removeAllWidgets() },
            
            // Layout
            { name: 'Switch to Bento Grid', icon: '🎨', action: () => this.switchLayout('bento') },
            { name: 'Switch to Original Grid', icon: '📊', action: () => this.switchLayout('original') },
            { name: 'Reorganize with AI', icon: '✨', action: () => this.openAIReorganize() },
            { name: 'Reset Layout', icon: '🔄', action: () => this.resetLayout() },
            
            // Themes
            { name: 'Change Theme', icon: '🎨', action: () => this.openThemes() },
            { name: 'Dark Mode', icon: '🌙', action: () => this.toggleDarkMode() },
            
            // Quick Actions
            { name: 'Start Pomodoro', icon: '⏱️', action: () => this.startPomodoro() },
            { name: 'Add Quick Note', icon: '📝', action: () => this.quickNote() },
            { name: 'Check Weather', icon: '⛅', action: () => this.focusWidget('weather') },
            
            // Export/Import
            { name: 'Export Dashboard', icon: '💾', action: () => this.exportDashboard() },
            { name: 'Import Dashboard', icon: '📥', action: () => this.importDashboard() },
        ];
        
        // Dynamically add "Open X Widget" for each widget
        Object.keys(WIDGET_REGISTRY).forEach(id => {
            this.commands.push({
                name: `Add ${WIDGET_REGISTRY[id].name}`,
                icon: '📦',
                action: () => widgetManager.addWidget(id)
            });
        });
    }
    
    attachListeners() {
        // Cmd+K / Ctrl+K to open
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Search as you type
        this.input.addEventListener('input', (e) => {
            this.search(e.target.value);
        });
        
        // Keyboard navigation
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectNext();
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectPrevious();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSelected();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.palette.classList.remove('hidden');
        this.input.focus();
        this.search('');
        this.isOpen = true;
    }
    
    close() {
        this.palette.classList.add('hidden');
        this.input.value = '';
        this.isOpen = false;
    }
    
    search(query) {
        const filtered = this.commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase())
        );
        
        this.results.innerHTML = filtered.map((cmd, i) => `
            <div class="command-item ${i === 0 ? 'selected' : ''}" data-index="${i}">
                <span class="command-icon">${cmd.icon}</span>
                <span class="command-name">${cmd.name}</span>
            </div>
        `).join('');
        
        this.selectedIndex = 0;
        this.attachResultListeners(filtered);
    }
    
    attachResultListeners(filteredCommands) {
        this.results.querySelectorAll('.command-item').forEach((item, i) => {
            item.addEventListener('click', () => {
                filteredCommands[i].action();
                this.close();
            });
        });
    }
    
    executeSelected() {
        const selected = this.results.querySelector('.command-item.selected');
        if (selected) {
            selected.click();
        }
    }
    
    selectNext() {
        const items = this.results.querySelectorAll('.command-item');
        if (items.length === 0) return;
        
        items[this.selectedIndex].classList.remove('selected');
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        items[this.selectedIndex].classList.add('selected');
        items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
    }
    
    selectPrevious() {
        const items = this.results.querySelectorAll('.command-item');
        if (items.length === 0) return;
        
        items[this.selectedIndex].classList.remove('selected');
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
        items[this.selectedIndex].classList.add('selected');
        items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Initialize after DOM loads
window.addEventListener('DOMContentLoaded', () => {
    window.commandPalette = new CommandPalette();
});