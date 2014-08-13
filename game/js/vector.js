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
    addXY: function(x, y) {
        this.x += x;
        this.y += y;
    },
    subtractVector: function(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
    },
    subtractScalar: function(scalar) {
        this.x -= scalar;
        this.y -= scalar;
    },
    subtractXY: function(x, y) {
        this.x -= x;
        this.y -= y;
    },
    scale: function(scale) {
        this.x *= scale;
        this.y *= scale;
    },
    scaleXY: function(x, y) {
        this.x *= x;
        this.y *= y;
    },
    dotVector: function(vector) {
        return this.x * vector.x + this.y * vector.y;
    },
    dotXY: function(x, y) {
        return this.x * x + this.y * y;
    },
    cross: function(vector) {
        return this.x * vector.y - this.y * vector.x;
    },
    crossXY: function(x, y) {
        return this.x * y - this.y * x;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function() {
        var length = this.length();
        this.x /= length;
        this.y /= length;
    },
    reflectAlongNormalVector: function(normal, restitution) {
        if (restitution === void 0 || restitution > 1) {
            restitution = 1;
        } if (restitution < 0) {
            resitution = 0;
        }
        // vectorReflection = vector - 2(vector dot normal) * normal
        var dotTimesTwo = this.dotVector(normal) * (1 + restitution);
        this.x -= dotTimesTwo * normal.x;
        this.y -= dotTimesTwo * normal.y;
    },
    reflectAlongNormalXY: function(x, y, restitution) {
        if (restitution === void 0 || restitution > 1) {
            restitution = 1;
        } if (restitution < 0) {
            resitution = 0;
        }
        // vectorReflection = vector - 2(vector dot normal) * normal
        var dotTimesTwo = this.dotXY(x, y) * (1 + restitution);
        this.x -= dotTimesTwo * x;
        this.y -= dotTimesTwo * y;
    },
    toUnitVector: function() {
        var length = this.length();
        return new Vec2(this.x / length, this.y / length);
    },
    toString: function() {
        return JSON.stringify(this);
    }
};

//returns normal of vector between 2 points
//TODO: optimize (clock_wise_normal = new Vec2(-end.y + start.y, end.x - start.x).toUnitVector();)
Vec2.createNormal = function(p1, p2, shape) {
    var e = 0.1;
    var normal = new Vec2(p2.y - p1.y, p2.x - p1.x);
    var middle;

    if ((normal.x >= 0 && normal.y >= 0) || (normal.x < 0 && normal.y <= 0)) {
        middle = new Circle((p1.x + p2.x) / 2 + shape.x - e, (p1.y + p2.y) / 2 + shape.y + e, e / 2);
        if (Intersection.circlePoly(middle, shape)) {
            normal.x = Math.abs(normal.x);
            normal.y = -Math.abs(normal.y);
        } else {
            normal.x = -Math.abs(normal.x);
            normal.y = Math.abs(normal.y);
        }
    } else
    if ((normal.x <= 0 && normal.y >= 0) || (normal.x >= 0 && normal.y <= 0)) {
        middle = new Circle((p1.x + p2.x) / 2 + shape.x + e, (p1.y + p2.y) / 2 + shape.y + e, e / 2);
        if (Intersection.circlePoly(middle, shape)) {
            normal.x = -Math.abs(normal.x);
            normal.y = -Math.abs(normal.y);
        } else {
            normal.x = Math.abs(normal.x);
            normal.y = Math.abs(normal.y);
        }
    }

    return normal;
};