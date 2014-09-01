"use strict";

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 */
function Vec2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vec2.prototype = {
    scale: function(scale) {
        this.x *= scale;
        this.y *= scale;
    },
    scaleXy: function(x, y) {
        this.x *= x;
        this.y *= y;
    },
    dotVec2: function(vector) {
        return this.x * vector.x + this.y * vector.y;
    },
    dotXy: function(x, y) {
        return this.x * x + this.y * y;
    },
    crossVec2: function(vector) {
        return this.x * vector.y - this.y * vector.x;
    },
    crossXy: function(x, y) {
        return this.x * y - this.y * x;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    lengthSquared: function() {
        return this.x * this.x + this.y * this.y;
    },
    normalize: function() {
        var length = this.length();
        this.x /= length;
        this.y /= length;
    },
    reflectAlongNormalVec2: function(normal) {
        // vectorReflection = vector - 2(vector dot normal) * normal
        var dotTimesTwo = this.dotVec2(normal) * 2;
        this.x -= dotTimesTwo * normal.x;
        this.y -= dotTimesTwo * normal.y;
    },
    reflectAlongNormalXy: function(x, y) {
        // vectorReflection = vector - 2(vector dot normal) * normal
        var dotTimesTwo = this.dotXY(x, y) * 2;
        this.x -= dotTimesTwo * x;
        this.y -= dotTimesTwo * y;
    },
    toUnitVec2: function() {
        var length = this.length();
        return new Vec2(this.x / length, this.y / length);
    },
    toString: function() {
        return JSON.stringify(this);
    },
    clone: function() {
        return new Vec2(this.x, this.y);
    }
};

// "Static" functions

/**
 * @param {Vec2} vector
 * @param {number} scalar
 * @returns {Vec2}
 */
Vec2.vec2CrossScalar = function(vector, scalar) {
    return new Vec2(scalar * vector.y, -scalar * vector.x);
};

/**
 * @param {number} scalar
 * @param {Vec2} vector
 * @returns {Vec2}
 */
Vec2.scalarCrossVec2 = function(scalar, vector) {
    return new Vec2(-scalar * vector.y, scalar * vector.x);
};

/**
 * @param {Vec2} vector1
 * @param {Vec2} vector2
 * @returns {number}
 */
Vec2.vec2CrossVec2 = function(vector1, vector2) {
    return vector1.x * vector2.y - vector1.y * vector2.x;
};

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
Vec2.xyCrossXy = function(x1, y1, x2, y2) {
    return x1 * y2 - y1 * x2;
};

/**
 * Creates unit long normal vector of a line.
 * @param {Vec2} point1
 * @param {Vec2} point2
 * @returns {Vec2}
 */
Vec2.createNormal = function(point1, point2) {
    var normal = new Vec2(point2.y - point1.y, -point2.x + point1.x);
    normal.normalize();
    return normal;
};

/**
 * @param {number[]} primitives [x0, y0, x1, y1, ... , xn, yn]
 * @returns {Vec2[]}
 */
Vec2.parseVectorPrimitiveArray = function(primitives) {
    if (!(primitives instanceof Array)) {
        throw new Error("Argument 1 (primitives) must be an array of vector primitives: [x0, y0, x1, y1, ... , xn, yn]");
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
