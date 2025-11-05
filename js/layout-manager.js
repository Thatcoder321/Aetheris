class LayoutManager {
    constructor() {
        this.currentLayout = localStorage.getItem('aetheris-layout-style') || 'original';
        this.init();
    }
    
    init() {
        this.applyLayout(this.currentLayout);
    }
    
    switchLayout(layoutType) {
        this.currentLayout = layoutType;
        localStorage.setItem('aetheris-layout-style', layoutType);
        this.applyLayout(layoutType);
    }
    
    applyLayout(layoutType) {
        const stage = document.getElementById('stage');
        
        // Remove all layout classes
        stage.classList.remove('layout-original', 'layout-bento');
        
        if (layoutType === 'bento') {
            stage.classList.add('layout-bento');
            this.applyBentoGrid();
        } else {
            stage.classList.add('layout-original');
            this.applyOriginalGrid();
        }
    }
    
    applyBentoGrid() {
        // Bento grid uses larger rounded corners, more spacing
        const widgets = document.querySelectorAll('.grid-stack-item');
        widgets.forEach(widget => {
            widget.style.borderRadius = '24px';
            widget.style.padding = '20px';
        });
    }
    
    applyOriginalGrid() {
        const widgets = document.querySelectorAll('.grid-stack-item');
        widgets.forEach(widget => {
            widget.style.borderRadius = '12px';
            widget.style.padding = '16px';
        });
    }
}

window.layoutManager = new LayoutManager();