

class BaseWidget {
    constructor(options) {
        this.element = document.createElement('div');
        this.element.innerHTML = `<div class="grid-stack-item-content widget ${options.className || ''}"></div>`;
        this.contentElement = this.element.querySelector('.grid-stack-item-content');
        
        grid.addWidget(this.element, {
            id: options.id,
            x: options.x, y: options.y,
            width: options.width, height: options.height
        });
    }

    
    addHandle() {
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'widget-resize-handle';
        this.contentElement.appendChild(resizeHandle);
    }
}

class ClockWidget extends BaseWidget {
    constructor() {
        super({ id: 'clock', className: 'clock', x: 4, y: 1, width: 4, height: 2 });

        this.contentElement.innerHTML = `
            <div>
                <div class="time"></div>
                <div class="date"></div>
            </div>
        `;
        this.addHandle();
        
        this.update();
        setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        this.contentElement.querySelector('.time').textContent = timeString;
        this.contentElement.querySelector('.date').textContent = dateString;
    }
}

// --- GREETING WIDGET ---
class GreetingWidget extends BaseWidget {
    constructor() {
        // In GreetingWidget
super({
    id: 'greeting',
    className: 'greeting',
    x: 0,      // Start at the far left
    y: 0,      // Move it to the very top row
    width: 12, // Make it span the entire 12-column width
    height: 1  // Keep it short, just one row high
});
        
        // 1. Create ALL elements from the start (non-destructive)
        this.contentElement.innerHTML = `
            <span class="greeting-text hidden"></span>
            <input type="text" class="greeting-input hidden" placeholder="What's your name?">
        `;
        
        // 2. Add the handle to the stable DOM
        this.addHandle(); 

        // 3. Get references to our stable elements
        this.greetingText = this.contentElement.querySelector('.greeting-text');
        this.inputField = this.contentElement.querySelector('.greeting-input');
        
        // 4. Attach event listener ONCE
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.inputField.value) {
                const name = this.inputField.value;
                localStorage.setItem('aetheris-username', name);
                this.showGreeting(name);
            }
        });

        // 5. Run initial logic
        this.run();
    }

    run() {
        const savedName = localStorage.getItem('aetheris-username');
        if (savedName) {
            this.showGreeting(savedName);
        } else {
            this.askForName();
        }
    }
    
    askForName() {
        this.greetingText.classList.add('hidden');
        this.inputField.classList.remove('hidden');
        this.inputField.focus();
    }

    showGreeting(name) {
        const hour = new Date().getHours();
        let greeting;
        if (hour < 12) { greeting = 'Good morning'; } 
        else if (hour < 18) { greeting = 'Good afternoon'; } 
        else { greeting = 'Good evening'; }
        
        this.greetingText.textContent = `${greeting}, ${name}.`;
        
        this.inputField.classList.add('hidden');
        this.greetingText.classList.remove('hidden');
    }
}
// --- TODO WIDGET ---

class TodoWidget extends BaseWidget {
    constructor() {
        
        // Define the fixed size for the widget here.
        const defaultWidth = 4;
        const defaultHeight = 3; 

        // 1. Call super() FIRST with the desired layout.
        super({
            id: 'todo',
            className: 'todo',
            x: 4,
            y: 1,
            width: defaultWidth,
            height: defaultHeight
        });

        // 2. The "Constructor Hammer"
        grid.update(this.element, { w: defaultWidth, h: defaultHeight });

        // 3. The rest of the setup logic
        this.tasks = JSON.parse(localStorage.getItem('aetheris-tasks')) || [];
        this.contentElement.innerHTML = `
            <input type="text" class="todo-input" placeholder="New Task...">
            <ul class="todo-list"></ul>
        `;
        this.inputField = this.contentElement.querySelector('.todo-input');
        this.listElement = this.contentElement.querySelector('.todo-list');
        this.attachListeners();
        this.render();
        this.addHandle(); 
    }

    render() {
       
        this.listElement.innerHTML = '';
        this.tasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.className = `todo-item ${task.completed ? 'completed' : ''}`;
            listItem.innerHTML = `
    <div class="checkbox-container">
        <input type="checkbox" data-index="${index}" id="task-${index}" ${task.completed ? 'checked' : ''}>
        <label for="task-${index}" class="custom-checkbox"></label>
    </div>
    <span>${task.text}</span>
    <button class="delete-btn" data-index="${index}">
        <i class="ph-trash"></i>
    </button>
`;
            this.listElement.appendChild(listItem);
        });
    }

    attachListeners() {
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.inputField.value) {
                this.addTask(this.inputField.value);
                this.inputField.value = '';
            }
        });
        this.listElement.addEventListener('click', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                this.toggleTask(e.target.dataset.index);
            }
            if (e.target.matches('.delete-btn')) {
                this.deleteTask(e.target.dataset.index);
            }
        });
    }

    addTask(text) {
        this.tasks.push({ text: text, completed: false });
        this.saveAndRender();
    }

    toggleTask(index) {
        this.tasks[index].completed = !this.tasks[index].completed;
        this.saveAndRender();
    }

    deleteTask(index) {
        this.tasks.splice(index, 1);
        this.saveAndRender();
    }

    saveAndRender() {
        localStorage.setItem('aetheris-tasks', JSON.stringify(this.tasks));
        this.render();
    }
}


class WeatherWidget extends BaseWidget {
   

constructor() {
    super({
        id: 'weather',
        className: 'weather',
        x: 0, y: 2, width: 5, height: 10
    });
    
    // --- THIS IS YOUR API KEY LINE ---
    this.apiKey = window.AETHERIS_API_KEY; 


    if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
        this.contentElement.innerHTML = `<p style="color: yellow; text-align: center;">Add API Key to widgets-v2.js</p>`;
        return; 
    }
    this.addHandle();

    this.run();
}

    run() {
        const savedCity = localStorage.getItem('aetheris-city');
        if (savedCity) {
            this.getWeather(savedCity);
        } else {
            this.askForLocation();
        }
    }

    askForLocation() {
        this.contentElement.innerHTML = `<input type="text" class="weather-location-input" placeholder="Your City?">`;
        const input = this.contentElement.querySelector('.weather-location-input');
        grid.update(this.element, { w: 3, h: 2 }); 
        input.focus();
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value) {
                const city = input.value;
                localStorage.setItem('aetheris-city', city);
                this.getWeather(city);
                this.addHandle();
            }
        });
    }

    async getWeather(city) {
        this.contentElement.innerHTML = `<p>Loading Weather...</p>`;
        try {
            grid.update(this.element, { w: 3, h: 2 }); 
            const weatherAPI = `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&aqi=no`;
            
            const response = await fetch(weatherAPI);
            if (!response.ok) { throw new Error('City not found or API error.'); }
            
            const data = await response.json();
            this.renderWeather(data);

        } catch (error) {
            console.error("Weather Error:", error);
            this.contentElement.innerHTML = `<p>Could not load weather.</p>`;
        }
    }

    renderWeather(data) {
        
        const temp = Math.round(data.current.temp_c);
        const cityName = data.location.name;
        const iconUrl = data.current.condition.icon;

       
        this.contentElement.innerHTML = `
            <div class="weather-icon">
                <img src="${iconUrl}" alt="Weather icon" style="width: 64px; height: 64px;">
            </div>
            <div class="weather-details">
                <span class="weather-temp">${temp}°C</span>
                <span class="weather-city">${cityName}</span>
            </div>
        `;
        this.addHandle();
    }
}
new ClockWidget();
new GreetingWidget();
new TodoWidget();
new WeatherWidget();