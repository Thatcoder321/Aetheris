
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


// In js/widgets-v2.js - The FINAL WeatherWidget with the CORRECT variable name

class WeatherWidget extends BaseWidget {
    constructor() {
        // --- This is our Control Panel for the widget's size ---
        const defaultWidth = 3;
        const defaultHeight = 2;

        // 1. Call super() FIRST with the desired layout.
        super({
            id: 'weather',
            className: 'weather',
            x: 0,
            y: 3,
            width: defaultWidth,
            height: defaultHeight
        });
        grid.update(this.element, { w: defaultWidth, h: defaultHeight });
        // --- THIS IS THE CORRECTED LINE ---
        // It now correctly looks for the _WEATHER_ variable.
        this.apiKey = window.AETHERIS_WEATHER_API_KEY; 

        // This check will now pass on the live Vercel deployment.
        if (!this.apiKey) {
            this.contentElement.innerHTML = `<p style="color: yellow; text-align: center;">API Key not found.</p>`;
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
        // We wrap the input in a div to allow for easy centering
        this.contentElement.innerHTML = `
            <div class="weather-input-container">
                <input type="text" class="weather-location-input" placeholder="Your City?">
            </div>
        `;
        
        // Re-assert the size after changing innerHTML
        
        this.addHandle();
    
        const input = this.contentElement.querySelector('.weather-location-input');
        input.focus();
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value) {
                const city = input.value;
                localStorage.setItem('aetheris-city', city);
                this.getWeather(city);
            }
        });
    }

    async getWeather(city) {
        this.contentElement.innerHTML = `<p>Loading Weather...</p>`;
        try {
            const weatherAPI = `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(city)}&aqi=no`;
            const response = await fetch(weatherAPI);
            if (!response.ok) { throw new Error('API error.'); }
            const data = await response.json();
            this.renderWeather(data);
        } catch (error) {
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
        this.addHandle(); // Re-add handle after final render
    }
}

class AIWidget extends BaseWidget {
    constructor() {

        const defaultWidth = 3;
        const defaultHeight = 4;

        super({
            id: 'ai-chat',
            className: 'ai-chat',
            x: 5, y: 1, // Place it on the right side
            width: defaultWidth,
            height: defaultHeight,
        });

        // The "Constructor Hammer" to enforce our size.
        grid.update(this.element, { w: defaultWidth, h: defaultHeight });
        

        this.history = [
            { role: 'system', content: 'You are a helpful and concise assistant built into a dashboard called Aetheris.' }
        ];

        this.isAwaitingReply = false; // Prevents sending multiple messages at once

       
        this.contentElement.innerHTML = `
            <div class="ai-chat-history"></div>
            <form class="ai-chat-input-form">
                <input type="text" placeholder="Ask anything..." required>
                <button type="submit">
                    <i class="ph-paper-plane-tilt-fill"></i>
                </button>
            </form>
        `;

  
        this.historyElement = this.contentElement.querySelector('.ai-chat-history');
        this.formElement = this.contentElement.querySelector('.ai-chat-input-form');
        this.inputElement = this.formElement.querySelector('input');
        this.submitButton = this.formElement.querySelector('button');

   
        this.attachListener();

        this.addHandle();
    }

    attachListener() {
        this.formElement.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevents the page from reloading on form submit
            const userInput = this.inputElement.value.trim();
            if (userInput && !this.isAwaitingReply) {
                this.sendMessage(userInput);
            }
        });
    }

    addMessageToHistory(role, content) {
        // Add the new message to our internal history array
        this.history.push({ role, content });

        // Create and display the new message bubble
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        messageDiv.textContent = content;
        this.historyElement.appendChild(messageDiv);

        // Automatically scroll to the bottom to see the new message
        this.historyElement.scrollTop = this.historyElement.scrollHeight;
    }



async sendMessage(userInput) {
    this.isAwaitingReply = true;
    this.inputElement.value = '';
    this.submitButton.disabled = true;

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user';
    userMessageDiv.textContent = userInput;
    this.historyElement.appendChild(userMessageDiv);

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message ai typing';
    typingIndicator.textContent = '...';
    this.historyElement.appendChild(typingIndicator);
    this.historyElement.scrollTop = this.historyElement.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userInput })
        });

        if (!response.ok) {
            throw new Error('API request failed.');
        }

        const data = await response.json();

      
        const aiReplyText = data.reply;

       


   
        typingIndicator.remove();
        
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'chat-message ai';
        aiMessageDiv.textContent = aiReplyText;
        this.historyElement.appendChild(aiMessageDiv);
        this.historyElement.scrollTop = this.historyElement.scrollHeight;

    } catch (error) {
        console.error('Chat Error:', error);
        typingIndicator.textContent = 'Sorry, something went wrong.';
    } finally {
        this.isAwaitingReply = false;
        this.submitButton.disabled = false;
    }
}
}


class PomodoroWidget extends BaseWidget {
    constructor() {
        const defaultWidth = 4;
        const defaultHeight = 3;

        super({
            id: 'pomodoro',
            className: 'pomodoro',
            x: 0,
            y: 5, 
            width: defaultWidth,
            height: defaultHeight
        });

      
        grid.update(this.element, { w: defaultWidth, h: defaultHeight });

        this.timerId = null; 
        this.totalSeconds = 25 * 60; // Default to 25 minutes
        this.secondsRemaining = this.totalSeconds;
        this.isWorkSession = true;
        this.isRunning = false;

        // --- Build the HTML Shell ---
        this.contentElement.innerHTML = `
            <div class="pomodoro-timer-container">
                <svg class="pomodoro-progress-ring">
                    <circle class="progress-ring-background" stroke="rgba(255,255,255,0.1)" stroke-width="4" fill="transparent" r="90" cx="90" cy="90"/>
                    <circle class="progress-ring-circle" stroke="#5a78ff" stroke-width="4" fill="transparent" r="80" cx="90" cy="90"/>
                </svg>
                <div class="pomodoro-time-display">25:00</div>
            </div>
            <div class="pomodoro-mode-display">WORK</div>
            <div class="pomodoro-controls">
                <button data-action="start">Start</button>
        <button data-action="reset">Reset</button>
            </div>
        `;
        if (window.phosphor) {
            phosphor.embed();
        }

        // --- Element References ---
        this.timeDisplay = this.contentElement.querySelector('.pomodoro-time-display');
        this.modeDisplay = this.contentElement.querySelector('.pomodoro-mode-display');
        this.progressCircle = this.contentElement.querySelector('.progress-ring-circle');
        this.controlsContainer = this.contentElement.querySelector('.pomodoro-controls');
        this.mainActionButton = this.controlsContainer.querySelector('button[data-action="start"]');

        // --- Initial Setup ---
        const radius = this.progressCircle.r.baseVal.value;
        this.circumference = 2 * Math.PI * radius;
        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.updateProgress();

        // --- Attach Event Listener ---
        this.controlsContainer.addEventListener('click', (e) => this.handleControlClick(e));

        this.addHandle();
    }

    handleControlClick(e) {
        const action = e.target.closest('button')?.dataset.action;
        if (!action) return;

        switch (action) {
            case 'start':
                this.startTimer();
                break;
            case 'pause':
                this.pauseTimer();
                break;
            case 'reset':
                this.resetTimer();
                break;
        }
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        // Change the button to a "pause" button
        this.mainActionButton.dataset.action = 'pause';
        this.mainActionButton.textContent = 'Pause';
        this.mainActionButton.innerHTML = `<i class="ph-pause-fill"></i>`;
        if (window.phosphor) { phosphor.embed(); }
        this.mainActionButton.classList.add('main-action'); 

        this.timerId = setInterval(() => {
            this.secondsRemaining--;
            this.updateDisplay();
            
            if (this.secondsRemaining <= 0) {
                this.sessionEnd();
            }
        }, 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.timerId);
        
        // Change the button back to a "start" button
        this.mainActionButton.dataset.action = 'start';
        this.mainActionButton.textContent = 'Start'
        this.mainActionButton.innerHTML = `<i class="ph-play-fill"></i>`;
        if (window.phosphor) { phosphor.embed(); }
        this.mainActionButton.classList.remove('main-action'); 
    }

    resetTimer() {
        this.pauseTimer();
        this.secondsRemaining = this.totalSeconds;
        this.updateDisplay();
    }
    
    sessionEnd() {
        this.pauseTimer();
        // Switch session type
        this.isWorkSession = !this.isWorkSession;
        if (this.isWorkSession) {
            this.totalSeconds = 25 * 60; // 25 min work
            this.modeDisplay.textContent = 'WORK';
        } else {
            this.totalSeconds = 5 * 60; // 5 min break
            this.modeDisplay.textContent = 'BREAK';
        }
        this.resetTimer();
        
    }

    updateDisplay() {
        const minutes = Math.floor(this.secondsRemaining / 60);
        const seconds = this.secondsRemaining % 60;
        this.timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        this.updateProgress();
    }

    updateProgress() {
        const progress = (this.totalSeconds - this.secondsRemaining) / this.totalSeconds;
        const offset = this.circumference * (1 - progress);
        this.progressCircle.style.strokeDashoffset = offset;
    }
}

class NotepadWidget extends BaseWidget {
    constructor() {
        const defaultWidth = 3;
        const defaultHeight = 3;

        // 1. Standard widget initialization
        super({
            id: 'notepad',
            className: 'notepad',
            x: 8, // A sensible default position
            y: 5,
            width: defaultWidth,
            height: defaultHeight
        });

        // 2. The Aetheris Law: Enforce size immediately.
        grid.update(this.element, { w: defaultWidth, h: defaultHeight });

        // 3. Define the widget's internal structure. A textarea is perfect.
        this.contentElement.innerHTML = `
            <textarea class="notepad-area" placeholder="Scratchpad..."></textarea>
        `;

        // 4. Get a reference to the interactive element
        this.textarea = this.contentElement.querySelector('.notepad-area');

        // 5. Add the universal resize handle
        this.addHandle();

        // 6. Load saved content and attach the auto-save listener
        this.loadContent();
        this.attachListener();
    }

    loadContent() {
        const savedText = localStorage.getItem('aetheris-notepad-text');
        if (savedText) {
            this.textarea.value = savedText;
        }
    }

    saveContent() {
        localStorage.setItem('aetheris-notepad-text', this.textarea.value);
    }

    attachListener() {
        // The 'input' event is best for auto-saving as it fires on any change
        this.textarea.addEventListener('input', () => {
            this.saveContent();
        });
    }
}