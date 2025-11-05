
class WidgetEventBus {
    constructor() {
        this.subscribers = new Map();
        this.widgetRegistry = new Map();
    }
    

    register(widgetId, widgetInstance) {
        this.widgetRegistry.set(widgetId, widgetInstance);
    }
    
    subscribe(widgetId, eventType, callback) {
        const key = `${widgetId}:${eventType}`;
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
    }
    

    publish(eventType, data, sourceWidgetId) {
        console.log(`[EventBus] ${sourceWidgetId} published ${eventType}:`, data);
        

        this.subscribers.forEach((callbacks, key) => {
            if (key.endsWith(`:${eventType}`)) {
                callbacks.forEach(cb => cb(data, sourceWidgetId));
            }
        });
    }
    
    async request(targetWidgetId, requestType, payload) {
        const widget = this.widgetRegistry.get(targetWidgetId);
        if (!widget || !widget.handleRequest) {
            throw new Error(`Widget ${targetWidgetId} cannot handle requests`);
        }
        return await widget.handleRequest(requestType, payload);
    }
}

window.widgetBus = new WidgetEventBus();