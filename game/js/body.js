function Body(shape, type){

	this.shape = shape;
	this.type = type;

	this.velocity = new Vec2(0, 0);
	
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
         * THE CORRECT CODE (hopefully :D... see the comparison on http://jsfiddle.net/7hKzv/)
         * 		position += velocity * dt + (0.5 * lastA * dt * dt)
         *		var a = force / mass 
         *		velocity += ((lastA + a) / 2) * dt
         * 		lastA = a
         */


        this.velocity.x += (force.x / this.type.mass) * dt;
        this.shape.x += this.velocity.x * dt * 50;
        this.velocity.y += (force.y / this.type.mass) * dt;
        this.shape.y += this.velocity.y * dt * 50;
        
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
    }
	
	this.draw = function(context) {
		this.shape.draw(context);
	}
}

function Solid(mass) {
	this.mass = mass;
}

function Liquid(density) {
	this.density = density;
}

