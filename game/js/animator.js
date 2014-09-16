// TODO: REWRITE THIS CRAP!
function Animator() {
    var ongoingAnimations = [],
        firstTime,
        currentTime = 0;
    
    function Animation(startValue, endValue, startTime, endTime, interpolator, callback) {
        this.callback = callback;
        
        /**
         * @return {boolean} Returns true if animation is complete.
         */
        this.onTick = function(time) {
            var value = interpolator(startValue, endValue, startTime, endTime, time);
            callback(value);
            return value === endValue; // TODO: tolerate small error (floating point math errors)
        };
    }
    
    this.animate = function(from, to, time, interpolator, callback) {
        ongoingAnimations.push(new Animation(from, to, currentTime, currentTime + time, interpolator, callback));
    };
    
    this.stop = function(callback) {
        for (var i = 0; i < ongoingAnimations.length; i++) {
            if (ongoingAnimations[i].callback === callback) {
                ongoingAnimations.splice(i, 1);
            }
        }
    };
    
    this.getCurrentTime = function() {
        return currentTime;   
    };
    
    this.tick = function(time) {
        if (firstTime === void 0) {
            firstTime = time;   
        }
        
        if (time - firstTime < currentTime) {
            throw new Error("You can't reverse time... NO SERIOUSELY.. YOU CAN'T...");   
        }
        currentTime = time - firstTime;
        
        for (var i = 0, animation; i < ongoingAnimations.length; i++) {
            animation = ongoingAnimations[i];
            if (animation.onTick(currentTime)) {
                ongoingAnimations.splice(i, 1);
            }
        }        
    };
}