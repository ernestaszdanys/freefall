function Body(shape, mass){

    this.shape = shape;
    this.mass = mass;
    
    this.velocity = new Vec2(0, 0);
    this.position = new Vec2(0, 0);
    this.lastPosition = new Vec2(0, 0);
    this.lastDt;
    
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
       
//        this.velocity.x += (force.x / this.type.mass) * dt;
//        this.shape.x += this.velocity.x * dt * 50;
//        this.velocity.y += (force.y / this.type.mass) * dt;
//        this.shape.y += this.velocity.y * dt * 50;

        // Time corrected Verlet numerical intergration
        console.log("applying force over", dt, "s");

        if (this.lastDt === void 0) {
            this.lastDt = dt;
        }

        console.log((force.x / this.mass) * dt * dt * Metrics.PPM);
        console.log((dt / this.lastDt));


        
        var lastX = this.position.x,
            lastY = this.position.y;
        console.log(lastX);
        this.position.x += (this.position.x - this.lastPosition.x) * (dt / this.lastDt) + (force.x / this.mass) * dt * dt * Metrics.PPM;
        this.position.y += (this.position.y - this.lastPosition.y) * (dt / this.lastDt) + (force.y / this.mass) * dt * dt * Metrics.PPM;

        this.lastDt = dt;
        this.lastPosition.x = lastX;
        this.lastPosition.y = lastY;
        
        // TODO
        this.shape.x = this.position.x;
        this.shape.y = this.position.y;
    };
	
    this.draw = function(context) {
        console.log("drawing");
        this.shape.draw(context, this.type);
    };
}

function Player(shape, mass) {
    Observable.apply(this);
    Body.call(this, shape, mass);
    
    var maxHealth = 100,
        health = 100,
        score = 0;
    
    this.mass = mass;
    this.lastTimeHealed = 0;
        
    this.getHealth = function() {
        return health;
    };
    
    this.setHealth = function(newHealth) {
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

// TODO: body types
function Solid(mass) {
    this.mass = mass;
}

function Liquid(density) {
    this.density = density;
	this.multiplier = Math.random() > 0.5 ? 1 : -0.1;
}

function GravityField(maxRadius, pointMass) {
    this.maxRadius = maxRadius;
    this.pointMass = pointMass;
}