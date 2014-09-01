"use strict";

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function Vec3(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

/**
 * Calculates 2d screen space coordinates of a 3d point.
 * @param {number} perspectiveOriginX
 * @param {number} perspectiveOriginY
 * @param {number} perspective
 * @param {Object} resultBucket
 */
Vec3.prototype.perspectiveProjectToBucket = function(perspectiveOriginX, perspectiveOriginY, perspective, resultBucket) {
    resultBucket.w = -perspective / (this.z - perspective),
    resultBucket.x = (this.x - perspectiveOriginX) * resultBucket.w + perspectiveOriginX,
    resultBucket.y = (this.y - perspectiveOriginY) * resultBucket.w + perspectiveOriginY;
};
