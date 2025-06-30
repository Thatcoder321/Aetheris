
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

        
    

        const dragHandle = document.createElement('div');
        dragHandle.className = 'widget-drag-handle';
        this.contentElement.prepend(dragHandle);
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

//  Adaptive WeatherWidget
class WeatherWidget extends BaseWidget {
    constructor() {
        super({
            id: 'weather',
            className: 'weather',
            x: 0,
            y: 3,
            width: 3,
            height: 2
        });
    
        this.fullForecastData = null;
        this.addHandle();
        this.run();
    

        grid.on('resizestop', (event, element) => {

            if (element === this.element) {
                

                const width = parseInt(element.getAttribute('gs-w'));
                const height = parseInt(element.getAttribute('gs-h'));
    

                this.updateLayout(width, height);
            }
        });
    }
    run() {
        const savedCity = localStorage.getItem('aetheris-city');
        if (savedCity) {
            this.fetchFullForecast(savedCity);
        } else {
            this.askForLocation();
        }
    }

    askForLocation() {
        this.contentElement.innerHTML = `
            <div class="weather-input-container">
                <input type="text" class="weather-location-input" placeholder="Enter Your City">
            </div>
        `;
        this.addHandle();
    
        const input = this.contentElement.querySelector('.weather-location-input');
        input.focus();
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value) {
                const city = input.value;
                localStorage.setItem('aetheris-city', city);
                this.fetchFullForecast(city);
            }
        });
    }



async fetchFullForecast(city) {
    this.contentElement.innerHTML = `<p>Loading Weather...</p>`;
    try {

        const response = await fetch(`/api/weather`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ city: city }),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'API request failed');
        }
        this.fullForecastData = await response.json();

        const width = parseInt(this.element.getAttribute('gs-w'));
        const height = parseInt(this.element.getAttribute('gs-h'));
        this.updateLayout(width, height);

    } catch (error) {
        console.error('Weather Fetch Error:', error);
        this.contentElement.innerHTML = `<p style="color: #ffcccc;">Error: ${error.message}</p>`;

        this.addHandle(); 
    }
}

    updateLayout(width, height) {
        if (!this.fullForecastData) return; 

        const area = width * height;

        // The Breakpoint System
        if (area > 18) {
            this.renderForecast(width); 
        } else if (area > 8) {
            this.renderDetailed();
        } else {
            this.renderCompact();
        }
        

        this.addHandle();
    }

    // Tier 1 Renderer
    renderCompact() {
        const { current, location } = this.fullForecastData;
        this.contentElement.innerHTML = `
            <div class="weather-compact">
                <img src="https:${current.condition.icon}" alt="${current.condition.text}">
                <div class="weather-details">
                    <span class="weather-temp">${Math.round(current.temp_c)}°C</span>
                    <span class="weather-city">${location.name}</span>
                </div>
            </div>
        `;
    }

    // Tier 2 Renderer
    renderDetailed() {
        const { current, location, forecast } = this.fullForecastData;
        const hourlyForecast = forecast.forecastday[0].hour; // Today's hourly data

        // Get the next 4 hours from now
        const now = new Date().getHours();
        const nextHours = hourlyForecast.filter(h => new Date(h.time).getHours() > now).slice(0, 4);

        this.contentElement.innerHTML = `
            <div class="weather-detailed">
                <div class="weather-detailed-top">
                    <img src="https:${current.condition.icon}" alt="${current.condition.text}">
                    <div>
                        <span class="weather-temp">${Math.round(current.temp_c)}°C</span>
                        <span class="weather-city">${location.name}</span>
                    </div>
                </div>
                <div class="weather-hourly-forecast">
                    ${nextHours.map(hour => `
                        <div class="hourly-item">
                            <span>${new Date(hour.time).getHours()}:00</span>
                            <img src="https:${hour.condition.icon}" alt="${hour.condition.text}">
                            <span>${Math.round(hour.temp_c)}°</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Tier 3 Renderer
    renderForecast() {
        const { location, forecast } = this.fullForecastData;
        const dailyForecast = forecast.forecastday;

        this.contentElement.innerHTML = `
            <div class="weather-full-forecast">
                <div class="forecast-header">${location.name} - 3 Day Forecast</div>
                <div class="daily-forecast-list">
                    ${dailyForecast.map(day => `
                        <div class="daily-item">
                            <span class="daily-day">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                            <div class="daily-temps">
                                <span class="temp-high">${Math.round(day.day.maxtemp_c)}°</span>
                                <span class="temp-low">${Math.round(day.day.mintemp_c)}°</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
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

        this.textarea.addEventListener('input', () => {
            this.saveContent();
        });
    }
}

class NewsTickerWidget extends BaseWidget {
    constructor() {

        const defaultWidth = 12;
        const defaultHeight = 1;

        super({
            id: 'news-ticker',
            className: 'news-ticker',
            x: 0,
            y: 1,
            width: defaultWidth,
            height: defaultHeight
        });

        grid.update(this.element, { w: defaultWidth, h: defaultHeight });
        this.contentElement.innerHTML = `<div class="ticker-wrap"><div class="ticker-content"><span>Loading news...</span></div></div>`;
        this.addHandle();
        this.fetchNews();
    }

    async fetchNews() {
        try {
            const response = await fetch('/api/news');
            if (!response.ok) throw new Error('Failed to fetch news feed.');
            
            const data = await response.json();
            if (data.articles && data.articles.length > 0) {
                this.renderNews(data.articles);
            } else {
                this.renderError('No articles found.');
            }
        } catch (error) {
            console.error('News Widget Error:', error);
            this.renderError(error.message);
        }
    }

    renderNews(articles) {
        const tickerContent = articles.map(article => 
            `<a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a>`
        ).join('<span class="ticker-separator">◆</span>');

        this.contentElement.innerHTML = `
            <div class="ticker-wrap">
                <div class="ticker-content">${tickerContent}</div>
            </div>
        `;

        this.addHandle();
    }

    renderError(message) {
        this.contentElement.innerHTML = `<div class="ticker-wrap"><div class="ticker-content"><span>Error: ${message}</span></div></div>`;
        this.addHandle();
    }
}

class CountdownWidget extends BaseWidget {
    constructor() {
        // I'm using your default size variables. This is good practice.
        const defaultWidth = 5;
        const defaultHeight = 2;

        super({
            id: 'countdown',
            className: 'countdown',
            x: 8,
            y: 0,
            width: defaultWidth,
            height: defaultHeight
        });

        // The "Aetheris Law"
        grid.update(this.element, { w: defaultWidth, h: defaultHeight });

        this.timerId = null;
        this.addHandle();
        this.run();
    }

    run() {
        // --- FIX #1: Store the date on "this" so the widget remembers it. ---
        this.targetDate = localStorage.getItem('aetheris-countdown-target');
        this.targetTitle = localStorage.getItem('aetheris-countdown-title') || "Countdown";

        if (this.targetDate) {
            this.startCountdown();
        } else {
            this.showSetupForm();
        }
    }

    showSetupForm() {
        this.cleanup();
        this.contentElement.innerHTML = `
            <form class="countdown-setup-form">
                <input type="text" id="countdown-title-input" placeholder="Event Name" required>
                <input type="datetime-local" id="countdown-date-input" required>
                <button type="submit">Start Countdown</button>
            </form>
        `;
        grid.update(this.element, { w: 5, h: 2 });
        this.addHandle();
        
        // No change here, this logic is good.
        this.contentElement.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('countdown-title-input').value;
            const date = document.getElementById('countdown-date-input').value;
            localStorage.setItem('aetheris-countdown-title', title);
            localStorage.setItem('aetheris-countdown-target', date);
            this.run();
        });
    }
    
    startCountdown() {
        // --- FIX #2: Use classes instead of IDs for the time spans. ---
        this.contentElement.innerHTML = `
            <div class="countdown-display">
                <div class="countdown-title">${this.targetTitle}</div>
                <div class="countdown-timer">
                    <div class="time-segment">
                        <span class="countdown-days">0</span>
                        <label>Days</label>
                    </div>
                    <div class="time-segment">
                        <span class="countdown-hours">0</span>
                        <label>Hours</label>
                    </div>
                    <div class="time-segment">
                        <span class="countdown-minutes">0</span>
                        <label>Mins</label>
                    </div>
                    <div class="time-segment">
                        <span class="countdown-seconds">0</span>
                        <label>Secs</label>
                    </div>
                </div>
                <button class="countdown-edit-btn">Edit</button>
            </div>
        `;
        grid.update(this.element, { w: 5, h: 2 });
        this.addHandle();

        this.contentElement.querySelector('.countdown-edit-btn').addEventListener('click', () => {
            this.showSetupForm();
        });

        // Store references to the display elements for efficiency
        this.daysSpan = this.contentElement.querySelector('.countdown-days');
        this.hoursSpan = this.contentElement.querySelector('.countdown-hours');
        this.minutesSpan = this.contentElement.querySelector('.countdown-minutes');
        this.secondsSpan = this.contentElement.querySelector('.countdown-seconds');
        
        this.updateDisplay();
        this.timerId = setInterval(() => this.updateDisplay(), 1000);
    }

    updateDisplay() {
        const now = new Date();
        // This will now work correctly because this.targetDate is properly set.
        const target = new Date(this.targetDate);
        const diff = target - now;

        if (diff <= 0) {
            this.contentElement.querySelector('.countdown-timer').innerHTML = "<div class='countdown-finished'>Countdown Finished!</div>";
            this.cleanup();
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        // --- FIX #3: Update the elements safely and efficiently. ---
        if (this.daysSpan) {
            this.daysSpan.textContent = days;
            this.hoursSpan.textContent = hours;
            this.minutesSpan.textContent = minutes;
            this.secondsSpan.textContent = seconds;
        }
    }

    cleanup() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
}

class StockTickerWidget extends BaseWidget {
    constructor() {
        super({
            id: 'stock-ticker',
            className: 'stock-ticker',
            x: 0, y: 5,
            width: 4, height: 3 
        });

        this.stocks = [];
        this.scrollIndex = 0;
        this.timerId = null;
        this.addHandle();
        this.run();
    }

    run() {
        const savedSymbols = localStorage.getItem('aetheris-stock-symbols');
        if (savedSymbols) {
            this.fetchStockData(savedSymbols);
        } else {
            this.showSetupForm();
        }
    }

    showSetupForm() {
        this.cleanup();
        this.contentElement.innerHTML = `
            <form class="stock-setup-form">
                <label>Enter Stock Symbols</label>
                <input type="text" placeholder="AAPL,TSLA,MSFT..." required>
                <p>Enter up to 4, separated by commas.</p>
                <button type="submit">Track Stocks</button>
            </form>
        `;
        this.addHandle();
        
        this.contentElement.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = e.target.querySelector('input').value;
            localStorage.setItem('aetheris-stock-symbols', input);
            this.run();
        });
    }

    async fetchStockData(symbolsString) {
        this.contentElement.innerHTML = `<div class="loading-stocks">Fetching market data...</div>`;
        const symbols = symbolsString.split(',').map(s => s.trim()).filter(Boolean);

        try {
            const response = await fetch('/api/stocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbols })
            });

            if (!response.ok) throw new Error('Failed to get data from server.');
            const data = await response.json();
            this.stocks = data.stocks || [];
            this.renderStocks();

        } catch (error) {
            this.contentElement.innerHTML = `<div class="loading-stocks">Error: ${error.message}</div>`;
        }
    }

    renderStocks() {
        if (this.stocks.length === 0) {
            this.contentElement.innerHTML = `<div class="loading-stocks">No valid stock data found.</div>`;
            return;
        }

        this.contentElement.innerHTML = `<ul class="stock-list"></ul>`;
        const list = this.contentElement.querySelector('.stock-list');
        
        this.stocks.forEach(stock => {
            const changeClass = stock.change >= 0 ? 'is-up' : 'is-down';
            const sign = stock.change >= 0 ? '+' : '';
            const item = document.createElement('li');
            item.className = `stock-item ${changeClass}`;
            item.innerHTML = `
                <span class="stock-symbol">${stock.symbol}</span>
                <span class="stock-price">$${stock.price}</span>
                <span class="stock-change">${sign}${stock.change} (${sign}${stock.changePercent}%)</span>
            `;
            list.appendChild(item);
        });

        list.innerHTML += list.innerHTML;
        this.startScrolling();
        this.addHandle();
    }

startScrolling() {
    this.cleanup();
    
    const list = this.contentElement.querySelector('.stock-list');
    if (!list || list.children.length === 0) return;


    const numStocks = list.children.length / 2;
    if (numStocks <= 0) return;

    const itemHeight = list.children[0].offsetHeight;
    let currentIndex = 0;

    this.timerId = setInterval(() => {
        currentIndex++;
        
        // This moves the list up by one item's height
        list.style.transform = `translateY(-${currentIndex * itemHeight}px)`;
        // Apply a smooth transition for the scroll
        list.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1.0)';


        if (currentIndex >= numStocks) {

            setTimeout(() => {

                list.style.transition = 'none';
                currentIndex = 0;
                list.style.transform = 'translateY(0)';
            }, 800); 
        }
    }, 3000); 
}

    cleanup() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
}




class GitHubStatsWidget extends BaseWidget {
    constructor() {

        const defaultWidth = 4;
        const defaultHeight = 3;


        super({
            id: 'github-stats',
            className: 'github-stats',
            x: 4, 
            y: 5,
            width: defaultWidth,
            height: defaultHeight
        });

        grid.update(this.element, { w: defaultWidth, h: defaultHeight });


        this.addHandle();
        this.checkAuthStatus();
    }

    async checkAuthStatus() {
        try {

            this.contentElement.innerHTML = `<p>Checking GitHub Status...</p>`;
            grid.update(this.element, { w: 4, h: 3 }); 

            const response = await fetch('/api/github/stats');
            if (response.status === 401) {
                this.renderLogin();
            } else if (response.ok) {
                const data = await response.json();
                this.renderStats(data);
            } else {
                throw new Error('Failed to check auth status.');
            }
        } catch (error) {
            this.renderError(error.message);
        }
    }

    renderLogin() {

        this.contentElement.innerHTML = `
            <div class="github-login-view">
                <h4>GitHub Stats</h4>
                <p>Connect your GitHub account to see your stats.</p>
                <a href="/api/auth/github/redirect" class="github-connect-btn">Connect with GitHub</a>
            </div>
        `;

        grid.update(this.element, { w: 4, h: 3 });
        this.addHandle(); 
    }

    renderStats(data) {

        this.contentElement.innerHTML = `
            <div class="github-stats-view">
                <div class="github-header">
                    <img src="${data.avatar_url}" alt="GitHub Avatar">
                    <div>
                        <span class="github-name">${data.name}</span>
                        <span class="github-login">@${data.login}</span>
                    </div>
                    <button class="github-logout-btn">X</button>
                </div>
                <div class="github-body">
                    <div class="stat-item">
                        <span class="stat-value">${data.public_repos}</span>
                        <span class="stat-label">Repositories</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${data.followers}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                </div>
            </div>
        `;

        grid.update(this.element, { w: 4, h: 3 });
        this.addHandle(); 
        
        this.contentElement.querySelector('.github-logout-btn').addEventListener('click', async () => {
            await fetch('/api/auth/github/logout');
            this.renderLogin();
        });
    }

    renderError(message) {

        this.contentElement.innerHTML = `<p>Error: ${message}</p>`;

        grid.update(this.element, { w: 4, h: 3 });
    }

    cleanup() {

    } 
}

class QuoteWidget extends BaseWidget {
    constructor() {
        const defaultWidth = 4;
        const defaultHeight = 2;

        super({
            id: 'quote-of-the-day',
            className: 'quote-widget',
            x: 0,
            y: 0,
            width: defaultWidth,
            height: defaultHeight
        });
        grid.update(this.element, { w: defaultWidth, h: defaultHeight });
        this.addHandle();
        this.fetchQuote();
    }

    async fetchQuote() {
        this.contentElement.innerHTML = `<p> class="quote-loading">Finding some wisdom...</p>`;
        try {
            const response = await fetch('/api/quote');
            if (!response.ok) throw new Error('API was not avaliable,');
            const data = await response.json();
            this.renderQuote(data);
        } catch (error) {
            this.contentElement.innerHTML = `<p class="quote-loading">Could not fetch a quote.</p>`;
            console.error('Quote Widget Error:', error);
        }
    }

renderQuote(data) {

    const quote = data[0]; 
    this.contentElement.innerHTML = `
        <blockquote class="quote-text">“${quote.q}”</blockquote>
        <cite class="quote-author">— ${quote.a}</cite>
    `;

    this.addHandle();
}
    cleanup() {}
}