function KeyObserver(window) {

    this.registerEventListeners = function() {
        
    }
    
    this.unregisterEventListeners = function() {
        
    }
}

function TouchObserver(element) {
    
    var registered = false;
    
    this.registerEventListeners = function() {
        if (registered) {
            return; // Listeners are already registered
        } else {
            element.addEventListener("touchstart", onTouchStart, false);
            element.addEventListener("touchend", onTouchEnd, false);
            element.addEventListener("touchcancel", onTouchCancel, false);
            element.addEventListener("touchleave", onTouchEnd, false);
            element.addEventListener("touchmove", onTouchMove, false);
            registered = true;
        }
    }
    
    this.unregisterEventListeners = function() {
        if (!registered) {
            return; // Listeners are not registered
        } else {
            element.removeEventListener("touchstart", onTouchStart);
            element.removeEventListener("touchend", onTouchEnd);
            element.removeEventListener("touchcancel", onTouchCancel);
            element.removeEventListener("touchleave", onTouchEnd);
            element.removeEventListener("touchmove", onTouchMove);
            registered = false;
        }
    }
    
    // Register
    this.registerEventListeners();

        
    function onTouchStart(event) {
        console.log("onTouchStart", event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
    
    function onTouchMove(event) {
        console.log("onTouchMove", event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
    
    function onTouchEnd(event) {
        console.log("onTouchEnd", event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
    
    function onTouchCancel(event) {
        console.log("onTouchCancel", event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
}

function MouseObserver(element) {
    


}

var KEYS = (function() {	
	
	var activeKeys = [],
		upActions = [],
		downActions = [];
		
	// TODO: investigate whether "event || window.event" and "event.keyCode || event.which" should be used
	window.onkeydown = function(event) {
		activeKeys[event.keyCode] = true;
		var downAction = downActions[event.keyCode.toString()];
		if (downAction) downAction();
	};
	
	// TODO: investigate whether "event || window.event" and "event.keyCode || event.which" should be used
	window.onkeyup = function(event) {
		activeKeys[event.keyCode] = false;
		var upAction = upActions[event.keyCode.toString()];
		if (upAction) upAction();
	};
		
	function isDown(keyCode) {
		return activeKeys[keyCode] === true;
	};
	
	function isUp(keyCode) {
		return !isDown(keyCode);
	};
	
	function setOnDown(keyCode, action) {
		downActions[keyCode] = action;
	};
		
	function setOnUp(keyCode, action) {
		upActions[keyCode] = action;
	};
	
	// DOTO: function getActiveKeys() ... maybe some neat 3rd party implementation of Set could be used...
	return {
		isDown: isDown,
		isUp: isUp,
		setOnDown: setOnDown,
		setOnUp: setOnUp		
	};
})();

var POINTER = (function() {
    var listeners = [];
    
    
    
    return;
})();