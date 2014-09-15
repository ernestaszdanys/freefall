function Body(geometry, x, y, orientation, density) {
    if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(orientation)) {
        throw new Error("Invalid transformation (x: ", x, ", y: ", y, ", orientation: ", orientation, ")");
    }
    
    // Define unique read-only id
    Object.defineProperty(this, "uid", {
        value: Body.generateUid()
    });
    
    this.geometry = geometry;
    
    if (this.geometry.solid !== void 0 && (isFiniteNumber(density) || density === Number.POSITIVE_INFINITY)) {
        this.setMass(this.geometry.solid.getArea() * density);
        this.setInertia(this.geometry.solid.getInertia() * this.mass);
    } else {
        this.setMass(Number.POSITIVE_INFINITY);
        this.setInertia(Number.POSITIVE_INFINITY);
    }

    this.linearVelocity = new Vec2(0, 0);
    this.position = new Vec2(x, y);

    this.angularVelocity = 0;
    this.orientation = orientation;
    
    this.updateGeometryTransformations();
}

// Default friction and restitution values
Body.prototype.friction = 0.5;
Body.prototype.restitution = 0.5;

/**
 * @return {number} Unique id.
 */
Body.generateUid = (function() {
    var id = 1;
    return function() {
        return id++;
    };
})();

Body.prototype.setMass = function(mass) {
    if ((typeof mass === "number" && mass > 0)|| mass === Number.POSITIVE_INFINITY) {
        this.mass = mass;
        this.inverseMass = 1 / mass;
    } else {
        throw new Error("Mass must be either positive (non-zero) number or Number.POSITIVE_INFINITY");
    }
};

Body.prototype.setInertia = function(inertia) {
    if ((typeof inertia === "number" && inertia > 0)|| inertia === Number.POSITIVE_INFINITY) {
        this.inertia = inertia;
        this.inverseInertia = 1 / inertia;
    } else {
        throw new Error("Inertia must be either positive (non-zero) number or Number.POSITIVE_INFINITY");
    }
};

Body.prototype.transform = function(dx, dy, dOrientation) {
    if (isFiniteNumber(dx) && isFiniteNumber(dy) && isFiniteNumber(dOrientation)) {
        this.position.x += dx;
        this.position.y += dy;
        this.orientation += dOrientation;
        this.updateGeometryTransformations();
    } else {
        throw new Error("Can't transform by non-finite number: ", dx, dy, dOrientation);
    }
};

Body.prototype.setTransformation = function(x, y, orientation) {
    if (isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(orientation)) {
        this.position.x = x;
        this.position.y = y;
        this.orientation = orientation;
        this.updateGeometryTransformations();
    } else {
        throw new Error("Can't transform by non-finite number: ", x, y, orientation);
    }
};

// TODO: slow!
Body.prototype.updateGeometryTransformations = function() {
    for (var geometryName in this.geometry) {
        if (this.geometry.hasOwnProperty(geometryName)) {
            this.geometry[geometryName].setTransformation(this.position.x, this.position.y, this.orientation);
        }
    }
};

Body.prototype.applyForceAndTorque = function(force, torque, dt) {
    this.linearVelocity.x += (force.x / this.mass) * dt;        
    this.position.x += this.linearVelocity.x * dt;
    this.linearVelocity.y += (force.y / this.mass) * dt;
    this.position.y += this.linearVelocity.y * dt;

    this.angularVelocity += torque * this.inverseInertia * dt;
    this.orientation += this.angularVelocity * dt;

    this.updateGeometryTransformations();
};

Body.prototype.resetVelocity = function() {
    this.linearVelocity.x = 0;
    this.linearVelocity.y = 0;
    this.angularVelocity = 0;
};

// TODO:
function BackgroundBody(image, x, y, z, width, height) {
    if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(z)) {
        throw new Error("Invalid position (x: ", x, ", y: ", y, ", z: ", z, ")");
    }
    
    if (!(image instanceof Image)) {
        throw new Error("Background objects must have an image.");
    }
    
    Vec3.call(this, x, y, z);
    
    // Define unique read-only id
    Object.defineProperty(this, "uid", {value: Body.generateUid()});
    
    this.image = image;
    this.width = width;
    this.height = height;
}

BackgroundBody.prototype = Object.create(Vec3.prototype);
BackgroundBody.prototype.constructor = BackgroundBody;

BackgroundBody.prototype._scratchpad = {};

BackgroundBody.prototype.drawProjected = function(context, projectionCenterX, projectionCenterY, perspective) {
    var projected = this._scratchpad;
    
    this.perspectiveProjectToBucket(projectionCenterX, projectionCenterY, perspective, projected);
    
    var width = this.width * projected.w,
        height = this.height * projected.w;
    context.save();
    
    context.globalAlpha = 0.3 * projected.w;
    context.drawImage(this.image, projected.x - width / 2, projected.y - height / 2, width, height);
    
    context.restore();
};


//
//Body.prototype.resetVelocity = function() {
//    this.lastPosition.x = this.position.x;
//    this.lastPosition.y = this.position.y;
//};
//
//Body.prototype.getVelocityX = function() {
//    if (this.lastDt === void 0) {
//        return 0;
//    } else {
//        return (this.position.x - this.lastPosition.x) / this.lastDt;
//    }
//};
//
//Body.prototype.getVelocityY = function() {
//    if (this.lastDt === void 0) {
//        return 0;
//    } else {
//        return (this.position.y - this.lastPosition.y) / this.lastDt;
//    }
//};
//
///**
// * @param {Vec2} force
// * @param {number} dt
// */
//Body.prototype.applyForce = function(force, dt) {
//    // Lame Euler intergration
//    //        this.velocity.x += (force.x / this.mass) * dt;
//    //        this.shape.position.x += this.velocity.x * dt * Metrics.PPM;
//    //        this.velocity.y += (force.y / this.mass) * dt;
//    //        this.shape.position.y += this.velocity.y * dt * Metrics.PPM;
//
//    // Somewhat ok Verlet (velocity) integration
//    // http://buildnewgames.com/gamephysics/
//    // http://jsfiddle.net/7hKzv/
//    //        var a;
//    //
//    //        this.shape.x += (this.velocityX * dt + (0.5 * lastAX * dt * dt)) * Metrics.PPM; // TODO: PPM conversions
//    //        a = forceX / this.mass;
//    //        this.velocityX += ((lastAX + a) / 2) * dt;
//    //        lastAX = a;
//    //
//    //        this.shape.y += (this.velocityY * dt + (0.5 * lastAY * dt * dt)) * Metrics.PPM;
//    //        a = forceY / this.mass;
//    //        this.velocityY += ((lastAY + a) / 2) * dt;
//    //        lastAY = a;
//
//    // Time-corrected Verlet (position) integration
//    // http://lonesock.net/article/verlet.html
//
//    // Simulating force for 0 time breaks integrator (because of division by 0).
//    // 
//    //                                                                                ┌──── division by 0 happens here
//    //                                                                                ▼
//    //        this.position.x += (this.position.x - this.lastPosition.x) * (dt / this.lastDt) + (force.x * Metrics.PPM / this.mass) * dt * dt;
//    //        this.position.y += (this.position.y - this.lastPosition.y) * (dt / this.lastDt) + (force.y * Metrics.PPM / this.mass) * dt * dt;
//    if (dt === 0) {
//        return;
//    }
//
//    if (this.lastDt === void 0) {
//        this.lastDt = dt;
//    }
//
//    // If the objects mass is infinite it wont move...
//    // TODO: ---> insert "yo mama is so fat" joke here <---
//    if (this.mass !== Number.POSITIVE_INFINITY) {
//        var lastX = this.position.x,
//            lastY = this.position.y;
//
//        force.scale(Metrics.PPM);
//
//        this.position.x += (this.position.x - this.lastPosition.x) * (dt / this.lastDt) + (force.x / this.mass) * dt * dt;
//        this.position.y += (this.position.y - this.lastPosition.y) * (dt / this.lastDt) + (force.y / this.mass) * dt * dt;        
//
//        this.lastPosition.x = lastX;
//        this.lastPosition.y = lastY;
//        
//        this.lastDt = dt;
//    }
//
//    // Update geometries
//    this.updateGeometryTransformations();
//};
//
//Body.prototype.reflectVelocityAlongUnitVectorXY = function(normalX, normalY) {
//    // Verlet position integrator doesn't store velocity, instead it calculates it using objects current and last positions, so we need to modify last position...
//    this.lastPosition.x = this.position.x - this.lastPosition.x;
//    this.lastPosition.y = this.position.y - this.lastPosition.y;
//    this.lastPosition.reflectAlongNormalXY(normalX, normalY, this.restitution);
//    this.lastPosition.x = this.position.x - this.lastPosition.x;
//    this.lastPosition.y = this.position.y - this.lastPosition.y;
//};


/*var Body = (function() {
    
    var createUid = (function() {
        var id = 1; // Consider 0 to be invalid UID
        return function() {
            return id++;
        };
    })();
    
    function Body(solid, effect) {
        
        // Define unique read-only id
        Object.defineProperty(this, "uid", {
            value: createUid()
        });
        
        this.solid = solid;
        this.effect = effect;
    }

    Body.prototype = {
        draw: function(context) {
            if (this.effect !== void 0) {
                this.effect.draw(context);
            }
            
            if (this.shape !== void 0) {
                this.shape.draw(context);
            }
        }
    };

    return Body;
})();

function DynamicBody(solid, mass) {
    // Extend Body "class"
    Body.call(this, solid, void 0);
    
    this.mass = (mass !== void 0) ? mass : Number.POSITIVE_INFINITY; // kg
    this.position = new Vec2(); // meters
    this.lastPosition = new Vec2(); // meters
    this.restitution = 0.5;
};

// Inherit "superclass" prototype
DynamicBody.prototype = Object.create(Body.prototype);
DynamicBody.prototype.constructor = DynamicBody;

// TODO: meters
DynamicBody.prototype.translate = function(x, y) {
    this.position.x += x;
    this.position.y += y;
    this.lastPosition.x += x;
    this.lastPosition.y += y;
    this.shape.x = this.position.x;
    this.shape.y = this.position.y;
};

DynamicBody.prototype.applyForce = function(force, dt) {
    // Lame Euler intergration
    //        this.velocity.x += (force.x / this.mass) * dt;
    //        this.shape.position.x += this.velocity.x * dt * Metrics.PPM;
    //        this.velocity.y += (force.y / this.mass) * dt;
    //        this.shape.position.y += this.velocity.y * dt * Metrics.PPM;

    // Somewhat ok Verlet (velocity) integration
    // http://buildnewgames.com/gamephysics/
    // http://jsfiddle.net/7hKzv/
    //        var a;
    //
    //        this.shape.x += (this.velocityX * dt + (0.5 * lastAX * dt * dt)) * Metrics.PPM; // TODO: PPM conversions
    //        a = forceX / this.mass;
    //        this.velocityX += ((lastAX + a) / 2) * dt;
    //        lastAX = a;
    //
    //        this.shape.y += (this.velocityY * dt + (0.5 * lastAY * dt * dt)) * Metrics.PPM;
    //        a = forceY / this.mass;
    //        this.velocityY += ((lastAY + a) / 2) * dt;
    //        lastAY = a;


    // Time-corrected Verlet (position) integration
    // http://lonesock.net/article/verlet.html

    // Simulating force for 0 time breaks integrator (because of division by 0)... don't do that... it's stupid anyway...
    // 
    //                                                                                ┌──── division by 0 happens here
    //                                                                                ▼
    //        this.position.x += (this.position.x - this.lastPosition.x) * (dt / this.lastDt) + (force.x * Metrics.PPM / this.mass) * dt * dt;
    //        this.position.y += (this.position.y - this.lastPosition.y) * (dt / this.lastDt) + (force.y * Metrics.PPM / this.mass) * dt * dt;
    if (dt === 0) {
        return;
    }

    if (this.lastDt === void 0) {
        this.lastDt = dt;
    }

    // If the objects mass is infinite it wont move...
    // TODO: ---> insert "yo mama is so fat" joke here <---
    if (this.mass !== Number.POSITIVE_INFINITY) {
        var lastX = this.position.x,
            lastY = this.position.y;

        this.position.x += (this.position.x - this.lastPosition.x) * (dt / this.lastDt) + (force.x * Metrics.PPM / this.mass) * dt * dt;
        this.position.y += (this.position.y - this.lastPosition.y) * (dt / this.lastDt) + (force.y * Metrics.PPM / this.mass) * dt * dt;        

        this.lastPosition.x = lastX;
        this.lastPosition.y = lastY;
    }

    this.lastDt = dt;

    // TODO:
    this.shape.x = this.position.x;
    this.shape.y = this.position.y;
};

DynamicBody.prototype.reflectVelocityAlongUnitVectorXY = function(normalX, normalY) {
    // Verlet position integrator doesn't store velocity, instead it calculates it using objects current and last positions, so we need to modify last position...
    this.lastPosition.x = this.position.x - this.lastPosition.x;
    this.lastPosition.y = this.position.y - this.lastPosition.y;
    this.lastPosition.reflectAlongNormalXY(normalX, normalY, this.restitution);
    this.lastPosition.x = this.position.x - this.lastPosition.x;
    this.lastPosition.y = this.position.y - this.lastPosition.y;
};

function Player(shape, mass) {
    // Extend DynamicBody "class"
    DynamicBody.call(this, shape, mass);
    
    // Extend Observable "class"
    Observable.apply(this);
    
    var maxHealth = 100,
        health = 100,
        score = 0;
    
    this.getHealth = function() {
        return health;
    };
    
    this.setHealth = function(newHealth) {
        // Make sure health is within bounds (0 <= health <= maxHealth)
        if (newHealth > maxHealth) {
            newHealth = maxHealth;
        } else if (newHealth < 0) {
            newHealth = 0;
        } 
        if (newHealth !== health) {
            health = newHealth;
            this.dispatchEvent(Player.EVENT_HEALTH_CHANGED, health);
        }
    };
    
    this.getScore = function() {
        return score;
    };
    
    this.setScore = function(newScore) {
        if (newScore !== score) {
            score = newScore;
            this.dispatchEvent(Player.EVENT_SCORE_CHANGED, score);
        }
    };
}

// Inherit DynamicBody prototype
Player.prototype = Object.create(DynamicBody.prototype);
Player.prototype.constructor = Player;

Player.EVENT_HEALTH_CHANGED = "PLAYER_HEALTH_CHANGED";
Player.EVENT_SCORE_CHANGED = "PLAYER_SCORE_CHANGED";

// TODO: behaviours
function Liquid(density) {
    this.density = density;
    this.multiplier = Math.random() > 0.5 ? 1 : -0.1;
}

function Gravity(radius, mass) {
    this.shape = new Circle(0, 0, radius);
    this.maxRadius = maxRadius;
    this.pointMass = pointMass;
}*/