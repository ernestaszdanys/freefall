function Camera(centerX, centerY, width, height, perspective) {
    "use strict";
    
    var offsetX = 0,
        offsetY = 0;
    
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