function Body(shape, mass) {
    this.shape = shape;
    this.velocity = new Vec2();
    this.mass = mass;
    
    this.isStatic = function() {
        return this.velocity.x === 0 && this.velocity.y === 0 && this.mass === Infinity;
    };
    
    this.makeStatic = function() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.mass = Infinity;
    };
    
    this.applyForce = function(force, dt) {
        /*
         * Based on obscure code for Verlet numerical integration for velocity from article 
         * on http://buildnewgames.com/gamephysics/ (note that "acceleration" is not defined)
         * 		last_acceleration = acceleration
         * 		position += velocity * time_step + ( 0.5 * last_acceleration * time_step^2 )
         * 		new_acceleration = force / mass 
         * 		avg_acceleration = ( last_acceleration + new_acceleration ) / 2
         * 		velocity += avg_acceleration * time_step
         *
         * THE CORRECT CODE (hopefully :D... see the comparison on http://jsfiddle.net/7hKzv/
         * 		position += velocity * dt + (0.5 * lastA * dt * dt)
         *		var a = force / mass 
         *		velocity += ((lastA + a) / 2) * dt
         * 		lastA = a
         */

        /*
        var a;

        this.shape.x += (this.velocityX * dt + (0.5 * lastAX * dt * dt)) * 50; // TODO: PPM conversions
        a = forceX / this.mass;
        this.velocityX += ((lastAX + a) / 2) * dt;
        lastAX = a;

        this.shape.y += (this.velocityY * dt + (0.5 * lastAY * dt * dt)) * 50;
        a = forceY / this.mass;
        this.velocityY += ((lastAY + a) / 2) * dt;
        lastAY = a;
        */
        // TODO: replace this lame euler-based implementation with something better
        this.velocity.x += (force.x / this.mass) * dt;
        this.shape.position.x += this.velocity.x * dt * Metrics.PPM;
        this.velocity.y += (force.y / this.mass) * dt;
        this.shape.position.y += this.velocity.y * dt * Metrics.PPM;
    };
}
Body.prototype = {
    draw: function(context) {
        this.shape.draw(context);
    }
};

function Player(shape, mass) {
    Body.call(this, shape, mass);
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
Player.prototype = Object.create(Body.prototype);
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
