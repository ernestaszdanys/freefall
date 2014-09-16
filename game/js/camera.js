function Camera(centerX, centerY, width, height, perspective) {
    "use strict";
    
    var offsetX = 0,
        offsetY = 0;
        
    // Spring related
    this.springX = new Spring(100, 40, 7);
    this.springY = new Spring(30, 20, 3);
    
    this.setCenterX = function(newCenterX) {
        centerX = newCenterX;
        this.animateSpring();
    };
    
    this.setCenterY = function(newCenterY) {
        centerY = newCenterY;
        this.animateSpring();
    };
    
    this.setCenter = function(newCenterX, newCenterY) {
        centerX = newCenterX;
        centerY = newCenterY;
        this.animateSpring();
    };

    this.setOffsetX = function(newOffsetX) {
        offsetX = newOffsetX;
    };
    
    this.setOffsetY = function(newOffsetY) {
        offsetY = newOffsetY;
    };
    
    this.getTop = function() {
        return centerY - height / 2 + offsetY + (this.springY.getPos() || 0);
    };
    
    this.getLeft = function() {
        return centerX - width / 2 + offsetX + (this.springX.getPos() || 0);
    };
    
    this.getBottom = function() {
        return centerY + height / 2 + offsetY + (this.springY.getPos() || 0);
    };
    
    this.getRight = function() {
        return centerX + width / 2 + offsetX + (this.springX.getPos() || 0);
    };
    
    this.getWidth = function() {
        return width;   
    };
    
    this.getHeight = function() {
        return height;   
    };
    
    this.getOffsetX = function() {
        return offsetX;
    };
    
    this.getOffsetY = function() {
        return offsetY;
    };
    
    this.getX = function() {
        return centerX;   
    };
    
    this.getY = function() {
        return centerY;
    };
    
    this.worldSpaceToScreenSpace = function(x, y, z) {
        var results = {};
        this.worldSpaceToScreenSpaceToBucket(x, y, z, results);
        return results;
    };
    
    this.worldSpaceToScreenSpaceToBucket = function(x, y, z, resultBucket) {
        resultBucket.w = -perspective / (z - perspective),
        resultBucket.x = (x - centerX) * resultBucket.w + centerX,
        resultBucket.y = (y - centerY) * resultBucket.w + centerY;
    };
    
    this.isSpringActive = function() {
        return this.springX.isActive();
    };
    
    this.animateSpring = function() {
        if (this.springX.isActive()) {
            this.springX.setStepTrigger();
        }
        if (this.springY.isActive()) {
            this.springY.setStepTrigger();
        }
    };
    
    this.spring = function(x, y) {
        this.springX.enableSpring();
        this.springX.start(x, this.springX.getPos(), 0, 0);
        this.springY.enableSpring();
        this.springY.start(y, this.springY.getPos(), 0, 0);
    };
    
    this.resetSpring = function() {
        this.springX.disableSpring();
        this.springY.disableSpring();
        this.springX.reset();
        this.springY.reset();
    };
}

function Spring(stiffness, mass, friction) {
    this.spring = false;
    this.stepTrigger = false;
    this.getTime = Date.now || function() {return new Date().getTime();},
    this.lastTime = 0;
    
    this.isActive = function() {
        return this.spring;
    };
    
    this.enableSpring = function() {
        this.spring = true;
    };
    
    this.disableSpring = function() {
        this.spring = false;
    };
    
    this.getPos = function() {
        return this.massPos;
    };
    
    this.reset = function() {
        this.interval = 0;
        this.acceleration = 0;
        this.distance = 0;
        this.speed = 0;
        this.springForce = 0;
        this.dampingForce = 0;
        this.totalForce = 0;
        this.anchorPos = 0;
        this.massPos = 0;
        this.stiffness = stiffness;
        this.mass = mass;
        this.friction = friction;
    };
    
    this.reset();
}

// This gives the spring an impulse
Spring.prototype.start = function(acceleration, massPos, speed, anchorPos) {
    this.massPos = (typeof massPos !== 'undefined') ? massPos : this.massPos;
    this.speed = (typeof speed !== 'undefined') ? speed : this.speed;
    this.speed += acceleration * 10 || 0;
    this.anchorPos = (typeof anchorPos !== 'undefined') ? anchorPos : this.anchorPos;
    this.step();
};

// One step is one recalculation of all spring variables when in motion
Spring.prototype.step = function() {
    var currentTime = this.getTime();
    var dt = currentTime - this.lastTime;
    if (dt > 50) dt = 50;
    this.distance = this.massPos - this.anchorPos;
    this.dampingForce = -this.friction * this.speed;
    this.springForce = -this.stiffness * this.distance;
    this.totalForce = this.springForce + this.dampingForce;
    this.acceleration = this.totalForce / this.mass;
    this.speed += this.acceleration * dt / 15;
    this.massPos += this.speed / 100;
    if (Math.round(this.massPos) === this.anchorPos && Math.abs(this.speed) < 0.001) {
        this.removeStepTrigger();
    }
    this.lastTime = currentTime;
};

// This sets the timer for the next step
Spring.prototype.setStepTrigger = function() {
    var spring = this;
    this.stepTrigger = setTimeout(function() {spring.step();}, this.interval);
};

// This stops the spring from performing the next step
Spring.prototype.removeStepTrigger = function() {
    this.reset();
    this.spring = false;
    this.stepTrigger = false;
};