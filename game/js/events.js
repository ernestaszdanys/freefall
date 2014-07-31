var Observable = (function() {
    
    function isFunction(object) {
        return !!(object && object.constructor && object.call && object.apply);
    }

    return function() {
        var callbacks = {};
        
        this.addCallback = function(eventName, callback) {
            if (isFunction(callback)) {
                var eventCallbacks = callbacks[eventName];
                if (eventCallbacks === void 0) eventCallbacks = callbacks[eventName] = [];
                eventCallbacks.push(callback);
            } else {
                throw new Error("Parameter callback must be a function."); 
            }
        };
        
        this.removeCallback = function(callback) {
            if (isFunction(callback)) {
                for(var eventName in callbacks) {
                    if(callbacks.hasOwnProperty(eventName)) {
                        var eventCallbacks = callbacks[eventName];
                        for(var i = 0; i < eventCallbacks.length; i++) {
                            if (eventCallbacks[i] === callback) eventCallbacks.splice(i, 1);    
                        }
                    }
                }
            } else {
                throw new Error("Parameter callback must be a function."); 
            }
        };
        
        this.dispatchEvent = function(eventName, args) {
            var eventCallbacks = callbacks[eventName];
            if (eventCallbacks !== void 0) {
                for(var i = 0, length = eventCallbacks.length; i < length; i++) {
                    eventCallbacks[i](args);
                }
            }
        };
    };
})();
