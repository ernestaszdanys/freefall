function Vec2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vec2.prototype = {
    add: function(vec) {
        this.x += vec.x;
        this.y += vec.y;
    },
    subract: function(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
    },
    scale: function(scale) {
        this.x *= scale;
        this.y *= scale;
	},
    dot: function(a, b) {
        return a instanceof Vec2 
                ? this.x * a.x + this.y + a.y 
                : this.x * a + this.y + b;
    },
    cross: function(vec) {
        return this.x * vec.y - this.y * vec.x;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);   
    },
    normalize: function() {
        var magnitude = this.magnitude();
        this.x /= magnitude;
        this.y /= magnitude;
    },
    toUnitVector: function() {
        var magnitude = this.magnitude();
        return new Vec2(this.x / magnitude, this.y / magnitude);
    },
    toString: function() {
        return JSON.stringify(this);   
    }
}
//returns normal of vector between those points
//TODO optimize that normal would always point out from polygon if needed for physics
Vec2.createNormal = function(p1, p2){
    var normal = new Vec2(p2.x-p1.x, p2.y-p1.y);
    var tempx = normal.x;
    normal.x = -normal.y;
    normal.y = tempx;
    return normal;
}