

class Tour {
    constructor() {
        this.overlay = document.getElementById('tour-overlay');
        this.spotlight = document.getElementById('tour-spotlight');
        this.tooltip = document.getElementById('tour-tooltip');
        this.tooltipContent = document.getElementById('tour-tooltip-content');
        this.nextBtn = document.getElementById('tour-next-btn');

        this.currentStep = 0;
        this.steps = [
            {
                title: "Welcome to Aetheris!",
                content: "This is your new dashboard, a space you can customize completely. Let's take a quick tour to learn the basics.",
                target: null,
                action: 'button_begin'
            },
            {
                title: "Command Center",
                content: "This is the **Settings** button. It's your command center for managing everything in Aetheris. **Click the gear icon to continue.**",
                target: '#settings-btn',
                action: 'click'
            },
            {
                title: "The Widget Library",
                content: "From here, you can add and remove widgets. Let's add the **Clock** widget. **Click its 'Add' button.**",
                target: '.widget-toggle-btn[data-widget-id="clock"]',
                action: 'click'
            },
            {
                title: "Your First Widget!",
                content: "Perfect! You can drag widgets to move them, and use the handle in the corner to resize them. **Try moving or resizing the clock to continue.**",
                target: '.grid-stack-item[gs-id="clock"]',
                action: 'interact'
            },
            {
                title: "The AI Architect",
                content: "This is the **AI Layout Architect**. Use it to reorganize your entire dashboard with a simple text command. We won't try it now, but remember it's here!",
                target: '#reorganize-btn',
                action: 'button_next'
            },
            {
                title: "You're All Set!",
                content: "That's it! You've mastered the basics. The rest is up to you. Build your perfect space.",
                target: null,
                action: 'finish'
            } 
        ];

        this.nextBtn.addEventListener('click', () => {
            const currentAction = this.steps[this.currentStep].action;
       
            if (currentAction === 'button_begin' || currentAction === 'button_next' || currentAction === 'finish') {
                this.next();
            }
        });
    }

    start() {
        if (localStorage.getItem('aetheris-onboarding-complete') === 'true') {
            return;
        }
        this.currentStep = 0;
        this.showStep();
    }

    showStep() {
        this.overlay.classList.remove('hidden');
        this.tooltip.classList.remove('hidden');

        const step = this.steps[this.currentStep];
        this.tooltipContent.innerHTML = `<h4>${step.title}</h4><p>${step.content}</p>`;

        switch(step.action) {
            case 'button_begin':
                this.nextBtn.textContent = 'Begin Tour';
                this.nextBtn.style.display = 'block'; 
                break;
            case 'button_next':
                this.nextBtn.textContent = 'Next';
                this.nextBtn.style.display = 'block';
                break;
            case 'finish':
                this.nextBtn.textContent = 'Get Started';
                this.nextBtn.style.display = 'block';
                break;
            default:
                this.nextBtn.style.display = 'none'; 
        }

        if (step.target) {
            setTimeout(() => {
                const targetElement = document.querySelector(step.target);
                if(targetElement) {
                    this.highlight(targetElement);
                    if (step.action === 'click') {
                        this.waitForClick(targetElement);
                    } else if (step.action === 'interact') {
                        this.waitForInteraction();
                    }
                }
            }, 100);
        } else {
            this.spotlight.classList.add('hidden');
            this.positionTooltip();
        }
    }
    
    highlight(element) {
        this.spotlight.classList.remove('hidden');
        const rect = element.getBoundingClientRect();
        this.spotlight.style.width = `${rect.width + 10}px`;
        this.spotlight.style.height = `${rect.height + 10}px`;
        this.spotlight.style.top = `${rect.top - 5}px`;
        this.spotlight.style.left = `${rect.left - 5}px`;
        this.positionTooltip(rect);
    }

    

positionTooltip(rect) {
    if (!rect) {

        this.tooltip.style.top = '50%';
        this.tooltip.style.left = '50%';
        this.tooltip.style.transform = 'translate(-50%, -50%)';
    } else {

        const tooltipRect = this.tooltip.getBoundingClientRect();
        const top = rect.bottom + 15; 


        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

 
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.transform = 'none'; 
    }
}

    waitForClick(element){
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.next();
        };
        element.addEventListener('click', clickHandler, { once: true });
    }

    waitForInteraction() {
        const interactionHandler = () => {
            grid.off('dragstop', interactionHandler);
            grid.off('resizestop', interactionHandler);
            this.next();
        };
        grid.on('dragstop', interactionHandler);
        grid.on('resizestop', interactionHandler);
    }

    next() {
        this.currentStep++;
        if (this.currentStep < this.steps.length) {
            this.showStep();
        } else {
            this.finish();
        }
    }

    finish() {

        this.overlay.classList.add('hidden');
        this.spotlight.classList.add('hidden');
        this.tooltip.classList.add('hidden');
        localStorage.setItem('aetheris-onboarding-complete', 'true');
    }
}