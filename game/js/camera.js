var cameraDefaultOffset = 285;

function Camera(centerX, centerY, width, height, perspective) {
    "use strict";
    
    var offsetX = 0,
        offsetY = cameraDefaultOffset;
        
    // Spring related
    this.spring = false;
    this.stepTrigger = false;
    this.init();
    
    this.setCenterX = function(newCenterX) {
        centerX = newCenterX;
    }
    
    this.setCenterY = function(newCenterY) {
        centerY = newCenterY;
        if (this.spring) {
            this.setStepTrigger();
            offsetY = cameraDefaultOffset - this.massPos;
        }
    }
    
    this.setCenter = function(newCenterX, newCenterY) {
        centerX = newCenterX;
        centerY = newCenterY;
    }
    
    this.animateOffsetX = function(newOffsetX, time) {
        offsetX = newOffsetX;
        // TODO:
    }
    
    this.animateOffsetY = function(newOffsetY, time) {
        offsetY = newOffsetY;
        // TODO:  
    }
    
    this.setOffsetX = function(newOffsetX) {
        offsetX = newOffsetX;
    }
    
    this.setOffsetY = function(newOffsetY) {
        offsetY = newOffsetY;
    }
    
    this.getTop = function() {
        return centerY - height / 2 + offsetY;
    }
    
    this.getLeft = function() {
        return centerX - width / 2 + offsetX;
    }
    
    this.getBottom = function() {
        return centerY + height / 2 + offsetY;
    }
    
    this.getRight = function() {
        return centerX + width / 2 + offsetX;
    }
    
    this.getWidth = function() {
        return width;   
    }
    
    this.getHeight = function() {
        return height;   
    }
    
    this.getOffsetX = function() {
        return offsetX;
    }
    
    this.getOffsetY = function() {
        return offsetY;
    }
    
    this.getX = function() {
        return centerX;   
    }
    
    this.getY = function() {
        return centerY;
    }
    
    this.worldSpaceToScreenSpace = function(x, y, z) {
        var results = {};
        this.worldSpaceToScreenSpaceToBucket(x, y, z, results);
        return results;
    }
    
    this.worldSpaceToScreenSpaceToBucket = function(x, y, z, resultBucket) {
        resultBucket.w = -perspective / (z - perspective),
        resultBucket.x = (x - centerX) * resultBucket.w + centerX,
        resultBucket.y = (y - centerY) * resultBucket.w + centerY;
    }
    
    this.applyTransformation = function(context) {
        /*scaleX: Increases or decreases the size of the pixels in the X direction
        skewX: This effectively angles the X axis up or down
        skewY: This effectively angles the Y axis left or right
        scaleY: Increases or decreases the size of the pixels in the Y direction
        translateX: Moves the whole coordinate system in the X direction (so [0,0] is moved left or right)
        translateY: Moves the whole coordinate system in the Y direction (so [0,0] is moved up or down)*/
        context.setTransform(1, 0, 0, 1, -this.getLeft(), -this.getTop());
    }
    
    this.enableSpring = function(x, y) {
        if (!this.spring){
            this.spring = true;
            // Remove if you want bouncy restart effect!
            this.init();
            console.log(y*y);
            this.start(y*y, 0, 500, 0);
        }
    }
    
    this.disableSpring = function() {
        this.spring = false;
    }
}

Camera.prototype.init = function() {
    this.interval = 0;
    this.acceleration = 0;
    this.distance = 0;
    this.speed = 0;
    this.springForce = 0;
    this.dampingForce = 0;
    this.totalForce = 0;
    this.anchorPos = 0;
    this.massPos = 0;
    this.stiffness = 120;
    this.mass = 45;
    this.friction = 4;
}

//this gives the spring an impulse
//impulses can also be given while spring is in motion in order to alter its state
Camera.prototype.start = function(acceleration, massPos, speed, anchorPos) {
    this.massPos = (typeof massPos != 'undefined') ? massPos : spring.massPos;
    this.speed = (typeof speed != 'undefined') ? speed : spring.speed;
    this.speed += acceleration*10 || 0;
    this.anchorPos = (typeof anchorPos != 'undefined') ? anchorPos : spring.anchorPos;
    this.step();
}

//one step is one recalculation of all spring variables when in motion
Camera.prototype.step = function() {
    this.distance = this.massPos - this.anchorPos;
    this.dampingForce = -this.friction * this.speed;
    this.springForce = -this.stiffness * this.distance;
    this.totalForce = this.springForce + this.dampingForce;
    this.acceleration = this.totalForce / this.mass;
    this.speed += this.acceleration;
    this.massPos += this.speed/100;
    if (Math.round(this.massPos) == this.anchorPos && Math.abs(this.speed) < 0.2) {
        this.removeStepTrigger();
    }
}

//this sets the timer for the next step
Camera.prototype.setStepTrigger = function() {
    var spring = this;
    clearTimeout(this.stepTrigger);
    this.stepTrigger = setTimeout(function() {spring.step()}, this.interval);
}

//this stops the spring from performing the next step
Camera.prototype.removeStepTrigger = function() {
    this.init();
    this.spring = false;
    this.stepTrigger = false; //removeTimeout(spring.step(), 10);
}