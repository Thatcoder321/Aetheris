

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
}// In js/widgets-v2.js - The NEW AI Chat Widget Class

class AIWidget extends BaseWidget {
    constructor() {
        // This widget needs a lot of space, so we'll give it a generous default size.
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
        
        // This will hold our conversation history, including the system prompt.
        this.history = [
            { role: 'system', content: 'You are a helpful and concise assistant built into a dashboard called Aetheris.' }
        ];

        this.isAwaitingReply = false; // Prevents sending multiple messages at once

        // Build the initial HTML structure
        this.contentElement.innerHTML = `
            <div class="ai-chat-history"></div>
            <form class="ai-chat-input-form">
                <input type="text" placeholder="Ask anything..." required>
                <button type="submit">
                    <i class="ph-paper-plane-tilt-fill"></i>
                </button>
            </form>
        `;

        // Get references to our key elements
        this.historyElement = this.contentElement.querySelector('.ai-chat-history');
        this.formElement = this.contentElement.querySelector('.ai-chat-input-form');
        this.inputElement = this.formElement.querySelector('input');
        this.submitButton = this.formElement.querySelector('button');

        // Attach the event listener for the form
        this.attachListener();

        this.addHandle(); // Let's make it resizable!
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
        this.inputElement.value = ''; // Clear the input field
        this.submitButton.disabled = true; // Disable the send button

        // Display the user's message immediately
        this.addMessageToHistory('user', userInput);

        // Show a "typing..." indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message ai typing';
        typingIndicator.textContent = '...';
        this.historyElement.appendChild(typingIndicator);
        this.historyElement.scrollTop = this.historyElement.scrollHeight;

        try {
            // --- This is the key part: Calling our OWN back-end ---
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput }) // Send the whole conversation
            });

            if (!response.ok) {
                throw new Error('API request failed.');
            }

            const data = await response.json();
            const aiReply = data.reply;

            // Remove the "typing..." indicator
            typingIndicator.remove();

            // Add the AI's real message to the history
            this.addMessageToHistory(aiReply.role, aiReply.content);

        } catch (error) {
            console.error('Chat Error:', error);
            typingIndicator.textContent = 'Sorry, something went wrong.';
        } finally {
            // Re-enable the form whether the request succeeded or failed
            this.isAwaitingReply = false;
            this.submitButton.disabled = false;
        }
    }
}
new ClockWidget();
new GreetingWidget();
new TodoWidget();
new WeatherWidget();
new AIWidget();