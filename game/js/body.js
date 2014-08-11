function Body(shape, type){

    this.shape = shape;
    this.type = type;
    this.velocity = new Vec2(0, 0);
	this.lastVelocity = new Vec2(0, 0);
    
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
        this.lastVelocity.x = this.velocity.x;
        this.lastVelocity.y = this.velocity.y;
        this.velocity.x += (force.x / this.type.mass) * dt;
        this.shape.x += this.velocity.x * dt * 50;
        this.velocity.y += (force.y / this.type.mass) * dt;
        this.shape.y += this.velocity.y * dt * 50;

    };
	
    this.draw = function(context) {
        this.shape.draw(context, this.type);
    };
}

// Body types
function Solid(mass) {
    this.mass = mass;
}

function Liquid(density) {
    this.density = density;
	this.multiplier = Math.random() > 0.5 ? 1 : -0.1;
}

function Player(mass) {
    
    var maxHealth = 100,
        health = 100,
        score = 0;
    
    this.mass = mass;
    this.lastTimeHealed = 0;
    
    Object.defineProperty(this, "health", {
        get: function() {
            return health;
        },
        set: function(newHealth) {
            var oldHealth = health;
            
            if (newHealth < 0) {
                health = 0;
            } else if (newHealth > maxHealth) {
                health = maxHealth;
            } else {
                health = newHealth;
            }
            
            if (oldHealth !== health && this.onHealthChanged !== void 0) this.onHealthChanged(oldHealth, health);
        }
    });
    
    Object.defineProperty(this, "score", {
        get: function() {
            return score;
        },
        set: function(newScore) {
            var oldScore = score;
            if (newScore !== oldScore) {
                score = newScore;
                if (this.onScoreChanged !== void 0) this.onScoreChanged(oldScore, score);
            }
        }
    });
    
    this.onHealthChanged;
    this.onScoreChanged;
}
