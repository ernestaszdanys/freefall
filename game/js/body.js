var Body = (function() {
    
    var createUid = (function() {
        var id = 1; // Consider 0 to be invalid UID
        return function() {
            return id++;
        };
    })();
    
    function Body(shape, effect) {
        
        // Define unique read-only id
        Object.defineProperty(this, "uid", {
            value: createUid(),
            enumerable: false,
            configurable: false,
            writable: false
        });
        
        this.shape = shape;
        this.effect = effect;
    }

    Body.prototype = {
        draw: function(context) {
            this.shape.draw(context);
        }
    };

    return Body;
})();

function DynamicBody(shape, mass) {
    // Extend Body "class"
    Body.call(this, shape, void 0);
    
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

function GravityField(maxRadius, pointMass) {
    this.maxRadius = maxRadius;
    this.pointMass = pointMass;
}