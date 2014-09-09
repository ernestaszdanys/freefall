var Physics = {
    
    // Drag coefficients
    dragCoeffSphere: 0.47,
    dragCoeffHalfSphere: 0.42,
    dragCoeffCone: 0.5,
    dragCoeffCube: 1.05,
    dragCoeffAngledCube: 0.8,
    
    // Densities
    densityAir: 1.2922,
    densityWater: 1000,
    densityEgg: 1038,
    
    // Gravitational constant
    G: 6.67384E-11, 

    /**
     * Finds farthest point opposite to the given direction.
     * @param {Vec2[]} vertices
     * @param {Vec2} direction
     * @returns {Vec2}
     */
    getOppositeSupportPoint: function(vertices, direction) {
        // http://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032

        var vertex,
            bestVertex,
            projection,
            bestProjection = -Number.MAX_VALUE;

        for (var i = 0; i < vertices.length; i++) {
            vertex = vertices[i];
            projection = vertex.dotXy(-direction.x, -direction.y);
            if (projection > bestProjection) {
                bestVertex = vertex;
                bestProjection = projection;
            }
        }

        return bestVertex;
    },

    simpleIntersectPointPoly: function(point, poly) {
        // http://stackoverflow.com/questions/217578/point-in-polygon-aka-hit-test
        var i = 0,
            j = poly.vertices.length - 1,
            isInside = false;
        for (i, j; i < poly.vertices.length; j = i++) {
            if ((poly.vertices[i].y > point.y) !== (poly.vertices[j].y > point.y) && point.x < (poly.vertices[j].x - poly.vertices[i].x) * (point.y - poly.vertices[i].y) / (poly.vertices[j].y - poly.vertices[i].y) + poly.vertices[i].x ) {
                isInside = !isInside;
            }
        }
        return isInside;
    },

    intersectPolyCircle: function(circle, poly, bucket) {
        // http://stackoverflow.com/questions/217578/point-in-polygon-aka-hit-test
        // TODO:
    },

    /**
     * Checks collision between 2 polygons.
     * @param {Vec2[]} a
     * @param {Vec2[]} b
     * @param {Object} bucket       Object in which results (distance, x, y, dx, dy) will be stored. <b>The results are only valid if this function returns <code>true</code> or failFast is set to <code>false</code></b>
     * @param {boolean} failFast
     * @returns {boolean} <code>true</code> if polygons are intersecting.
     */
    intersectPolyPoly: function(a, b, bucket, failFast) {
        // http://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032

        var normal,
            vertex,
            supportPoint,
            distance,
            bestDistance = -Number.MAX_VALUE,
            bestNormal,
            bestPoint,
            supportPointOnA = false;

        // Support point belongs to b
        for (var i = 0; i < a.vertices.length; i++) {
            normal = a.normals[i];
            vertex = a.vertices[i];
            supportPoint = this.getOppositeSupportPoint(b.vertices, normal);
            distance = normal.dotXy(supportPoint.x - vertex.x, supportPoint.y - vertex.y);
            if (distance > bestDistance) {
                bestDistance = distance;
                bestNormal = normal;
                bestPoint = supportPoint;
            }
        }

        if (failFast && bestDistance > 0) {
            return false;
        }

        // Support point belongs to a
        for (var i = 0; i < b.vertices.length; i++) {
            normal = b.normals[i];
            vertex = b.vertices[i];
            supportPoint = this.getOppositeSupportPoint(a.vertices, normal);
            distance = normal.dotXy(supportPoint.x - vertex.x, supportPoint.y - vertex.y);
            if (distance > bestDistance) {
                bestDistance = distance;
                bestNormal = normal;
                bestPoint = supportPoint;
                supportPointOnA = true;
            }
        }

        if (failFast && bestDistance > 0) {
            return false;
        }

        bucket.distance = bestDistance;
        bucket.pointReference = bestPoint;
        if (supportPointOnA) {
            bucket.normal = new Vec2(bestNormal.x, bestNormal.y);
            bucket.dx = -bestNormal.x * bestDistance;
            bucket.dy = -bestNormal.y * bestDistance;
            // TODO: pointA and pointB are wrong. Don't use them...
            bucket.pointA = bestPoint.clone();
            bucket.pointB = new Vec2(bucket.pointA.x + bucket.dx, bucket.pointA.y + bucket.dy);
        } else {
            bucket.normal = new Vec2(-bestNormal.x, -bestNormal.y);
            bucket.dx = bestNormal.x * bestDistance;
            bucket.dy = bestNormal.y * bestDistance;
            // TODO: pointA and pointB are wrong. Don't use them...
            bucket.pointB = bestPoint.clone();
            bucket.pointA = new Vec2(bucket.pointB.x - bucket.dx, bucket.pointB.y - bucket.dy);
        }

        return bestDistance <= 0;
    },
    
    /**
     * @param {number} x
     * @param {number} y
     * @param {object} rect
     * @returns {boolean}
     */
    simpleIntersectPointRect: function(x, y, rect) {
        return (x >= rect.x && x <= rect.x + rect.width) && (y >= rect.y && y <= rect.y + rect.height);
    },
    
    /**
     * @param {object} rect1
     * @param {object} rect2
     * @returns {boolean}
     */
    simpleIntersectRectRect: function(rect1, rect2) {
        return (rect1.x + rect1.width > rect2.x || rect1.x - rect1.width < rect2.x + rect2.width 
            || rect1.y + rect1.height > rect2.y || rect1.y - rect1.height < rect2.y + rect2.height);
    },
    
    /**
     * Resolves collision between 2 bodies.
     * @param {Body} a
     * @param {Body} b
     * @param {Object} intersectionData
     */
    resolveCollision: function(a, b, intersectionData) {
        // Mostly based on http://www.randygaul.net/2013/03/27/game-physics-engine-part-1-impulse-resolution/

        // Separate bodies
        if (a.mass === Infinity && b.mass === Infinity) {
            // Two bodies with infinite mass collide... the universe explodes... good job...
            throw new Error("Can't resolve collision between 2 bodies with infinite mass.");
        } else if (a.mass === Infinity) {
            // A is static. Move B.
            b.transform(-intersectionData.dx, -intersectionData.dy, 0);
        } else if (b.mass === Infinity) {
            // B is static. Move A.
            a.transform(intersectionData.dx, intersectionData.dy, 0);
        } else {
            // Both can move. Move both.
            var massRatio = b.mass / (a.mass + b.mass);
            a.transform(intersectionData.dx * massRatio, intersectionData.dy * massRatio, 0);
            massRatio = a.mass / (a.mass + b.mass);
            b.transform(-intersectionData.dx * massRatio, -intersectionData.dy * massRatio, 0);
        }

        var contactPoint = intersectionData.pointReference, // READ-ONLY!!!
            contactNormal = intersectionData.normal,
            restitutionCoeff = Math.min(a.restitution, b.restitution),
            frictionCoeff = Math.min(a.friction, b.friction),
            aContactRadius = new Vec2(contactPoint.x - a.position.x, contactPoint.y - a.position.y),
            bContactRadius = new Vec2(contactPoint.x - b.position.x, contactPoint.y - b.position.y),
            impulseX,
            impulseY;

        // Collision
        // Velocities of contact points
        var aVelocity = Vec2.scalarCrossVec2(a.angularVelocity, aContactRadius);
            aVelocity.x += a.linearVelocity.x;
            aVelocity.y += a.linearVelocity.y;
        var bVelocity = Vec2.scalarCrossVec2(b.angularVelocity, bContactRadius);
            bVelocity.x += b.linearVelocity.x;
            bVelocity.y += b.linearVelocity.y;

        var relativeVelocity = new Vec2(bVelocity.x - aVelocity.x, bVelocity.y - aVelocity.y),
            normalVelocity = relativeVelocity.dotVec2(contactNormal);

        // Bodies are separating if normalVelocity < 0
        if (normalVelocity < 0) {
            return;
        }
        
        // normalImpulseMagnitude = (1 + restitution) * (relativeVelocity dot contactNormal)
        //                          --------------------------------------------------------
        //                                 1       1     (aR cross n)^2   (bR cross n)^2
        //                               ----- + ----- + -------------- + --------------
        //                               aMass   bMass      aInertia         bInertia
        //
        // normalImpulse = normalImpulseMagnitude * contactNormal;

        var aRCrossN = aContactRadius.crossVec2(contactNormal),
            bRCrossN = bContactRadius.crossVec2(contactNormal);

        var normalImpulseMagnitude = (1 + restitutionCoeff) * normalVelocity;
        normalImpulseMagnitude /= a.inverseMass + b.inverseMass + aRCrossN * aRCrossN * a.inverseInertia + bRCrossN * bRCrossN * b.inverseInertia;

        // Apply contact impulse on bodies
        // ---------------------------------------------------------------------------------------------------------
        impulseX = normalImpulseMagnitude * contactNormal.x;
        impulseY = normalImpulseMagnitude * contactNormal.y;
        if (a.mass !== Number.POSITIVE_INFINITY) {
            a.linearVelocity.x += a.inverseMass * impulseX;
            a.linearVelocity.y += a.inverseMass * impulseY;
            a.angularVelocity += a.inverseInertia * aContactRadius.crossXy(impulseX, impulseY);
        }
        if (b.mass !== Number.POSITIVE_INFINITY) {
            b.linearVelocity.x -= b.inverseMass * impulseX;
            b.linearVelocity.y -= b.inverseMass * impulseY;
            b.angularVelocity -= b.inverseInertia * bContactRadius.crossXy(impulseX, impulseY);
        }
        // ---------------------------------------------------------------------------------------------------------

        // Friction
        // TODO: friction destroyes too much energy (sometimes it completely destroyes velocity along normal, even
        // with restitution set to 1). There's probably something wrong with contactTanget.

        // Recalculate velocities of contact points
        aVelocity = Vec2.scalarCrossVec2(a.angularVelocity, aContactRadius);
        aVelocity.x += a.linearVelocity.x;
        aVelocity.y += a.linearVelocity.y;
        bVelocity = Vec2.scalarCrossVec2(b.angularVelocity, bContactRadius);
        bVelocity.x += b.linearVelocity.x;
        bVelocity.y += b.linearVelocity.y;
        relativeVelocity = new Vec2(bVelocity.x - aVelocity.x, bVelocity.y - aVelocity.y);

        // Find friction direction
        var contactTangent = new Vec2(
            relativeVelocity.x - relativeVelocity.dotXy(contactNormal.x, contactNormal.y) * contactNormal.x,
            relativeVelocity.y - relativeVelocity.dotXy(contactNormal.x, contactNormal.y) * contactNormal.y
        );
        //contactTangent = new Vec2(relativeVelocity.x, relativeVelocity.y);
        contactTangent.normalize();

        var aRCrossT = aContactRadius.crossVec2(contactTangent),
            bRCrossT = bContactRadius.crossVec2(contactTangent);

        // Friction impulse magnitude
        var frictionImpulseMagnitude = relativeVelocity.dotVec2(contactTangent);
        frictionImpulseMagnitude /= a.inverseMass + b.inverseMass + aRCrossT * aRCrossT * a.inverseInertia + bRCrossT * bRCrossT * b.inverseInertia;//poly1.inverseMass + poly2.inverseMass;

        // Coulomb friction (fFriction <= frictionCoeff * fNormal)
        if (Math.abs(frictionImpulseMagnitude) > normalImpulseMagnitude * frictionCoeff) {
            frictionImpulseMagnitude = (frictionImpulseMagnitude >= 0) ? (normalImpulseMagnitude * frictionCoeff) : (-normalImpulseMagnitude * frictionCoeff);
        }

        // Apply friction impulse on bodies
        // ---------------------------------------------------------------------------------------------------------
        impulseX = frictionImpulseMagnitude * contactTangent.x;
        impulseY = frictionImpulseMagnitude * contactTangent.y;
        if (a.mass !== Number.POSITIVE_INFINITY) {
            a.linearVelocity.x += a.inverseMass * impulseX;
            a.linearVelocity.y += a.inverseMass * impulseY;
            a.angularVelocity += a.inverseInertia * aContactRadius.crossXy(impulseX, impulseY);
        }
        if (b.mass !== Number.POSITIVE_INFINITY) {
            b.linearVelocity.x -= b.inverseMass * impulseX;
            b.linearVelocity.y -= b.inverseMass * impulseY;
            b.angularVelocity -= b.inverseInertia * bContactRadius.crossXy(impulseX, impulseY);
        }
        // ---------------------------------------------------------------------------------------------------------
    },

    calculateDragForce1d: function(velocity, density, dragCoef, crossSectionalArea) {
        return (velocity > 0 ? -0.5 : 0.5) * velocity * velocity * density * dragCoef * crossSectionalArea;
    }
};