/**
 * requestAnimationFrame polyfill. Based on Gist by Paul Irish.
 * https://gist.github.com/paulirish/1579671
 */
(function(){
	var vendors = ["ms", "moz", "webkit", "o"],
		getTime = Date.now || function() {return new Date().getTime()},
		lastTime = 0;
		
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    }

	if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
})();