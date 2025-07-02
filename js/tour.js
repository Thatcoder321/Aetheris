
class Tour {
    constructor() {
        this.tooltip = document.getElementById('tour-tooltip');
        this.tooltipContent = document.getElementById('tour-tooltip-content');
        this.nextBtn = document.getElementById('tour-next-btn');
        this.arrow = document.getElementById('tour-arrow');

        this.currentStep = -1;
        this.steps = [
            { title: "Welcome to Aetheris!", content: "This is your new dashboard, a space you can customize completely. Let's take a quick tour.", target: null, action: 'button', showArrow: false },
            { title: "Command Center", content: "This is the **Settings** button. **Click the gear icon to continue.**", target: '#settings-btn', action: 'click', showArrow: true },
            { title: "The Widget Library", content: "This panel contains the widget library. **Find the 'Quote of the Day' and click its 'Add' button.**", target: '#settings-panel', action: 'custom_waitForQuoteAdd', showArrow: false, position: 'top-center' },

{
    title: "Your First Widget!",
    content: "Perfect! You can drag widgets to move them and use the handle in the corner to resize(one with the 3 dots) them. This makes your dashboard truly your own.",
    target: '.grid-stack-item[gs-id="quote-of-day"]',
    action: 'button', 
    showArrow: true
},
            { title: "The AI Architect", content: "This is the **AI Layout Architect** (the magic wand icon). Use it to reorganize your dashboard with a simple command.", target: '#reorganize-btn', action: 'button', showArrow: true },
            { title: "You're All Set!", content: "You've mastered the basics. The rest is up to you. Build your perfect space.", target: null, action: 'finish', showArrow: false }
        ];

        this.nextBtn.addEventListener('click', () => this.next());
    }

    start() {
        if (localStorage.getItem('aetheris-onboarding-complete') === 'true') return;
        this.next();
    }

    next() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.finish();
            return;
        }
        this.tooltip.classList.add('hidden');
        this.arrow.classList.add('hidden');

        const step = this.steps[this.currentStep];
        this.tooltipContent.innerHTML = `<h4>${step.title}</h4><p>${step.content}</p>`;

        if (step.action === 'button' || step.action === 'finish') {
            this.nextBtn.style.display = 'block';
            this.nextBtn.textContent = (step.action === 'finish') ? 'Get Started' : 'Next';
        } else {
            this.nextBtn.style.display = 'none';
        }

        this.tooltip.classList.remove('hidden');
        this.executeStepAction(step);
    }

    executeStepAction(step) {
        this.patientlyFindAndHandle(step, (element) => {
            if (step.action === 'click') element.addEventListener('click', () => this.next(), { once: true });
            else if (step.action === 'interact') this.waitForInteraction();
            else if (step.action === 'custom_waitForQuoteAdd') {
                const button = document.querySelector('.widget-toggle-btn[data-widget-id="quote-of-day"]');
                if (button) button.addEventListener('click', () => this.next(), { once: true });
            }
        });
    }

    patientlyFindAndHandle(step, callback) {
        if (!step.target) {
            this.positionElements(null, step);
            if (callback) callback(null);
            return;
        }
        const interval = setInterval(() => {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
                clearInterval(interval);
                this.positionElements(targetElement, step);
                if (callback) callback(targetElement);
            }
        }, 100);
    }

    positionElements(targetElement, step) {
        this.arrow.classList[step.showArrow ? 'remove' : 'add']('hidden');
        const PADDING = 20;
        if (step.position === 'top-center') {
            this.tooltip.style.top = `${PADDING}px`; this.tooltip.style.left = '50%'; this.tooltip.style.transform = 'translateX(-50%)';
            return;
        }
        if (!targetElement) {
            this.tooltip.style.left = `50%`; this.tooltip.style.top = `50%`; this.tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        let tooltipTop = targetRect.bottom + PADDING;
        let tooltipLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        if (tooltipTop + tooltipRect.height > window.innerHeight) tooltipTop = targetRect.top - tooltipRect.height - PADDING;
        tooltipLeft = Math.max(PADDING, Math.min(tooltipLeft, window.innerWidth - tooltipRect.width - PADDING));
        this.tooltip.style.top = `${tooltipTop}px`; this.tooltip.style.left = `${tooltipLeft}px`; this.tooltip.style.transform = 'none';
        if (!step.showArrow) return;
        const arrowSize = 50;
        const arrowTop = tooltipTop - (arrowSize / 2);
        const arrowLeft = tooltipLeft + (tooltipRect.width / 2) - (arrowSize / 2);
        this.arrow.style.top = `${arrowTop}px`; this.arrow.style.left = `${arrowLeft}px`;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        const angle = Math.atan2(targetCenterY - (arrowTop + arrowSize/2), targetCenterX - (arrowLeft + arrowSize/2)) * (180 / Math.PI);
        this.arrow.style.transform = `rotate(${angle + 45}deg)`;
    }


    waitForInteraction() {
        console.log("Tour Step: Now waiting for interaction...");

        const checkInterval = setInterval(() => {
            const widgetElement = document.querySelector('.grid-stack-item[gs-id="quote-of-day"]');
            if (widgetElement) {
                clearInterval(checkInterval);
                console.log("Tour Step: Found the Quote widget. Attaching listeners now.");

                const interactionHandler = (event) => {
   
                    console.log(`GRID INTERACTION FIRED! Event type: ${event.type}`); 
                    
                    grid.off('dragstop', interactionHandler);
                    grid.off('resizestop', interactionHandler);
                    this.next();
                };

                grid.on('dragstop', interactionHandler);
                grid.on('resizestop', interactionHandler);
            }
        }, 100);
    }

    finish() {
        this.tooltip.classList.add('hidden');
        this.arrow.classList.add('hidden');
        localStorage.setItem('aetheris-onboarding-complete', 'true');
    }
}