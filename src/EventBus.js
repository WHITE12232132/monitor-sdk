class EventBus {
    constructor() {
        this.events = {}
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = []
        }
        this.events[eventName].push(callback)
    }
    emit(eventName, ...args) {
        if (!this.events[eventName]) {
            return
        }
        for (let cb of this.events[eventName]) {
            cb(...args)
        }
    }

    off(eventName, callback) {
        if (!this.events[eventName]) {
            return
        }
        if (callback === undefined) {
            delete this.events[eventName];
            return;
        }
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback)
    }
}

export default EventBus