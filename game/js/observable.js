
/**
 * @requires Requires Array.indexOf or pollyfill.
 * @constructor
 */
function Observable() {
    var eventNameToListeners = {};

    /**
     * Attaches listener to the specified event.
     * @param {String} eventName
     * @param {function} listener
     */
    this.addEventListener = function(eventName, listener) {
        if (!isString(eventName)) {
            throw new Error("Event name must be a string.");
        }
        
        if (isFunction(listener)) {
            throw new Error("Listener must be a function."); 
        }
        
        var eventListeners = eventNameToListeners[eventName];
        
        if (!eventListeners) {
            eventListeners = eventNameToListeners[eventName] = [];
        }
        
        if (eventListeners.indexOf(listener) === -1) {
            eventListeners.push(listener);
        } else {
            throw new Error("Listener is already added.");
        }
    };

    /**
     * Detaches listener from the specified event.
     * @param {String} eventName
     * @param {function} listener
     */
    this.removeEventListener = function(eventName, listener) {
        if (!isString(eventName)) {
            throw new Error("Event name must be a string.");
        }
        
        if (isFunction(listener)) {
            throw new Error("Listener must be a function."); 
        }
        
        var eventListeners = eventNameToListeners[eventName],
            listenerIndex;
        
        if (eventListeners) {
            listenerIndex = eventListeners.indexOf(listener);
            if (listenerIndex !== -1) {
                eventListeners.splice(listenerIndex, 1);    
            }
        }
    };

    /**
     * Detaches listener from all associated events.
     * @param {function} listener
     */
    this.removeListener = function(listener) {
        for(var eventName in eventNameToListeners) {
            this.removeEventListener(eventName, listener)
        }
    };

    /**
     * Triggers all listeners associated with the event name. All arguments passed to this function will be forwarded to
     * listeners as well (including the event name).
     * @param {String} eventName
     */
    this.dispatchEvent = function(eventName) {
        if (!isString(eventName)) {
            throw new Error("Event name must be a string.");
        }
        
        var eventListeners = eventNameToListeners[eventName];
        if (eventListeners !== void 0) {
            for(var i = 0, length = eventListeners.length; i < length; i++) {
                eventListeners[i].apply(void 0, arguments);
            }
        }
    };
};


