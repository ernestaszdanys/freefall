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
    dot: function(vec) {
        return this.x * vec.x + this.y + vec.y;
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