function Vec2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vec2.prototype = {
    dot: function(vec) {
        return this.x * vec.x + this.y + vec.y;
    },
    magnitude: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);   
    },
    toUnitVector: function() {
        var magnitude = this.magnitude();
        return new Vec2(this.x / magnitude, this.y / magnitude);
    },
    toString: function() {
        return JSON.stringify(this);   
    }
}