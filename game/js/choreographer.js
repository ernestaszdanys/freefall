/**
 * requestAnimationFrame polyfill. Based on Gist by Paul Irish.
 * https://gist.github.com/paulirish/1579671
 */
(function() {
    var vendors = ["ms", "moz", "webkit", "o"],
        getTime = Date.now || function() {return new Date().getTime();},
        lastTime = 0;

    // TODO: test
    for (var x = 0; x < vendors.length && (!window.requestAnimationFrame || !window.cancelAnimationFrame); x++) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    }

    // TODO: test
    if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = getTime();
            var timeToCall = Math.max(0, 16.33333333333 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
})();

function Choreographer(window) {
    Observable.apply(this);
    
    var self = this,
        frameId,
        lastFrameTimestamp;
        
    function onFrame(frameTimestamp) {
        if (lastFrameTimestamp === void 0) {
            lastFrameTimestamp = frameTimestamp;
        }
        self.dispatchEvent(Choreographer.EVENT_ON_FRAME, frameTimestamp - lastFrameTimestamp);
        lastFrameTimestamp = frameTimestamp;
        if (frameId !== void 0) {
            frameId = window.requestAnimationFrame(onFrame);
        }
    }
    
    this.startFrameLoop = function() {
        if (frameId === void 0) {
            frameId = window.requestAnimationFrame(onFrame);
        }
    };

    this.stopFrameLoop = function() {
        if (frameId !== void 0) {
            window.cancelAnimationFrame(frameId);
            frameId = void 0;
        }
    };
    
    // TODO: documentation
    // TODO: implement stall detection (if possible)
    // TODO: implement frame skippping 
    // TODO: investigate iOS 6 safari requestAnimationFrame problems
}
Choreographer.EVENT_ON_FRAME = "CHOREOGRAPHER_ON_FRAME";