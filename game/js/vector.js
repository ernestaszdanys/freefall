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

// Returns normal of vector between 2 points
Vec2.createNormal = function(p1, p2) {
    var normal = new Vec2(p2.y-p1.y, -p2.x+p1.x);
    normal.normalize();
    return normal;
};

Vec2.parseVectorPrimitiveArray = function(primitives) {
    if (!(primitives instanceof Array)) {
        throw new Error("Parameter 1 (primitives) must be an array of vector primitives: [x0, y0, x1, y1, ... , xn, yn]");
    }
    
    if (primitives.length % 2 !== 0) {
        throw new Error("Primitive array must have even number of entries.");
    }
    
    var vectorArray = [];
    for (var i = 0; i < primitives.length; i += 2) {
        vectorArray.push(new Vec2(primitives[i], primitives[i + 1]));
    }
    
    return vectorArray;
};

function Vec3(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

Vec3.prototype.perspectiveProjectToBucket = function(perspectiveOriginX, perspectiveOriginY, perspective, resultBucket) {
    resultBucket.w = -perspective / (this.z - perspective),
    resultBucket.x = (this.x - perspectiveOriginX) * resultBucket.w + perspectiveOriginX,
    resultBucket.y = (this.y - perspectiveOriginY) * resultBucket.w + perspectiveOriginY;
};
