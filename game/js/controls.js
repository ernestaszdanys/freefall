var KEYS = (function() {	
	
	var activeKeys = [],
		upActions = [],
		downActions = [];
		
	window.onkeydown = function(event) {
		activeKeys[event.keyCode] = true;
		var downAction = downActions[event.keyCode.toString()];
		if (downAction) downAction();
	};
	
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
