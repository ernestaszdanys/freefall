function getElementTop ( elem ) 
{		

    var yPos = elem.offsetTop;
    var tempEl = elem.offsetParent;

    while ( tempEl != null ) 
    {
        yPos += tempEl.offsetTop;
        tempEl = tempEl.offsetParent;
    }  

    return yPos;
}   


function getElementLeft ( elem ) 
{

    var xPos = elem.offsetLeft;
    var tempEl = elem.offsetParent; 		

    while ( tempEl != null ) 
    {
        xPos += tempEl.offsetLeft;
        tempEl = tempEl.offsetParent;
    }   		
    return xPos;
}

var PointerEvent = {
    DOWN: 0,
    MOVE: 1,
    UP: 2
};

function KeyObserver(window) {

    this.registerEventListeners = function() {
        
    }
    
    this.unregisterEventListeners = function() {
        
    }
}

function TouchObserver(element) {
    Observable.call(this);
    
    var self = this,
        registered = false;
    
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
        self.dispatchEvent(
            TouchObserver.EVENT_TOUCH,
            PointerEvent.DOWN,
            event.changedTouches[0].clientX - getElementLeft(element),
            event.changedTouches[0].clientY - getElementTop(element)
        );
    }
    
    function onTouchMove(event) {
        self.dispatchEvent(
            TouchObserver.EVENT_TOUCH,
            PointerEvent.MOVE,
            event.changedTouches[0].clientX - getElementLeft(element),
            event.changedTouches[0].clientY - getElementTop(element)
        );
    }
    
    function onTouchEnd(event) {
        self.dispatchEvent(
            TouchObserver.EVENT_TOUCH,
            PointerEvent.UP,
            event.changedTouches[0].clientX - getElementLeft(element),
            event.changedTouches[0].clientY - getElementTop(element)
        );
    }
    
    function onTouchCancel(event) {
        self.dispatchEvent(
            TouchObserver.EVENT_TOUCH,
            PointerEvent.UP,
            event.changedTouches[0].clientX - getElementLeft(element),
            event.changedTouches[0].clientY - getElementTop(element)
        );
    }
}
TouchObserver.EVENT_TOUCH = "TOUCH_OBSERVER_ON_TOUCH";


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