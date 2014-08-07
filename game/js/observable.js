var Observable = (function() {
    
    
//    function isFunction(object) {
//        //return !!(object && object.constructor && object.call && object.apply);
//        return typeof(object) === "function";
//    }

    return function() {
        var listeners = {};
        
        /**
         * Attaches listener to the specified event.
         * @param {String} eventName
         * @param {function} listener
         * @throws Error if the listener is not a function.
         */
        this.addEventListener = function(eventName, listener) {
            if (typeof(listener) === "function") {
                var eventListeners = listeners[eventName];
                if (eventListeners === void 0) eventListeners = listeners[eventName] = [];
                eventListeners.push(listener);
            } else {
                throw new Error("Listener must be a function."); 
            }
        };
        
        /**
         * Detaches listener from the specified event.
         * @param {String} eventName
         * @param {function} listener
         */
        this.removeEventListener = function(eventName, listener) {
            var eventListeners = listeners[eventName];
            for(var i = 0; i < eventListeners.length; i++) {
                if (eventListeners[i] === listener) eventListeners.splice(i, 1);    
            }
        };
        
        /**
         * Detaches listener from all associated events.
         * @param {function} listener
         */
        this.removeListener = function(listener) {
            for(var eventName in listeners) {
                if(listeners.hasOwnProperty(eventName)) {
                    var eventListeners = listeners[eventName];
                    for(var i = 0; i < eventListeners.length; i++) {
                        if (eventListeners[i] === listener) eventListeners.splice(i, 1);    
                    }
                }
            }
        };
        
        /**
         * Triggers all listeners associated with the event name. All arguments
         * passed to this function will be forwarded to listeners as well
         * (including the event name).
         * @param {String} eventName
         */
        this.dispatchEvent = function(eventName) {
            var eventListeners = listeners[eventName];
            if (eventListeners !== void 0) {
                for(var i = 0, length = eventListeners.length; i < length; i++) {
                    eventListeners[i].apply(void 0, arguments);
                }
            }
        };
    };
})();

