function Camera(centerX, centerY, width, height, perspective) {
    "use strict";
    
    var offsetX = 0,
        offsetY = 0;

    //triggers one calculation cycle to change the spring.
    this.stepTrigger = false;
    //initiates the spring Class
    this.init();
    
    this.setCenterX = function(newCenterX) {
        centerX = newCenterX;
    }
    
    this.setCenterY = function(newCenterY) {
        centerY = newCenterY;
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
    
}

Camera.prototype.init = function () {
    var spring = this;
    spring.interval = 0;
    spring.acceleration = 0;
    spring.distance = 0;
    spring.speed = 0;
    spring.springForce = 0;
    spring.dampingForce = 0;
    spring.totalForce = 0;
    spring.anchorPos = 0;
    spring.massPos = 0;
    spring.stiffness = 120;
    spring.mass = 10;
    spring.friction = 3;
}

//this gives the spring an impulse
//impulses can also be given while spring is in motion in order to alter its state
Camera.prototype.start = function (acceleration, massPos, speed, anchorPos) {
    var spring = this;
    spring.massPos = (typeof massPos != 'undefined') ? massPos : spring.massPos;
    spring.speed = (typeof speed != 'undefined') ? speed : spring.speed;
    spring.speed += acceleration*10 || 0;
    spring.anchorPos = (typeof anchorPos != 'undefined') ? anchorPos : spring.anchorPos;
    spring.step();
}

//one step is one recalculation of all spring variables when in motion
Camera.prototype.step = function () {
    var spring = this;
    spring.distance = spring.massPos - spring.anchorPos;
    spring.dampingForce = -spring.friction * spring.speed;
    spring.springForce = -spring.stiffness * spring.distance;
    spring.totalForce = spring.springForce + spring.dampingForce;
    spring.acceleration = spring.totalForce / spring.mass;
    spring.speed += spring.acceleration;
    spring.massPos += spring.speed/100;

    if (Math.round(spring.massPos) == spring.anchorPos && Math.abs(spring.speed) < 0.2) {
        spring.removeStepTrigger();
    } else {		
        /*spring.onSpringChange(Math.round(spring.massPos), {distance: spring.distance,
                                                           acceleration: spring.acceleration,
                                                           speed: spring.speed });*/
        this.setStepTrigger();
    }
}

//this sets the timer for the next step
Camera.prototype.setStepTrigger = function () {
    var spring = this;
    clearTimeout(spring.stepTrigger);
    spring.stepTrigger = setTimeout(function () {spring.step()}, spring.interval);
}

//this stops the spring from performing the next step
Camera.prototype.removeStepTrigger = function () {
    var spring = this;
    spring.stepTrigger = false; //removeTimeout(spring.step(), 10);
}