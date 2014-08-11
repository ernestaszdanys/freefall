function Vec2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vec2.prototype = {
    addVector: function(vec) {
        this.x += vec.x;
        this.y += vec.y;
    },
    addScalar: function(scalar) {
        this.x += scalar;
        this.y += scalar;
    },
    subtractVector: function(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
    },
    subtractScalar: function(scalar) {
        this.x -= scalar;
        this.y -= scalar;
    },
    scale: function(scale) {
        this.x *= scale;
        this.y *= scale;
    },
    dot: function(a, b) {
        return a instanceof Vec2
                ? this.x * a.x + this.y * a.y
                : this.x * a + this.y * b;
    },
    cross: function(vec) {
        return this.x * vec.y - this.y * vec.x;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function() {
        var length = this.length();
        this.x /= length;
        this.y /= length;
    },
    reflectAlongNormal: function(normal, restitution) {
        if (restitution === void 0 || restitution > 1)
            restitution = 1;
        else if (restitution < 0)
            resitution = 0;

        // vectorReflection = vector - 2(vector dot normal) * normal
        var dotTimesTwo = this.dot(normal) * (1 + restitution);
        this.x -= dotTimesTwo * normal.x;
        this.y -= dotTimesTwo * normal.y;
    },
    toUnitVector: function() {
        var length = this.length();
        return new Vec2(this.x / length, this.y / length);
    },
    toString: function() {
        return JSON.stringify(this);
    }
};

// Returns normal of vector between 2 points
Vec2.createNormal = function(p1, p2) {
	var normal = new Vec2(p2.y-p1.y, -p2.x+p1.x);
    return normal.toUnitVector();
};