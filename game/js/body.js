function Body(shape, mass){
	this.shape = shape;
	this.mass = mass;
    this.velocityX = 0;
    this.velocityY = 0;

	var lastAX = 0,
        lastAY = 0;

    this.resetVelocityX = function() {
        lastAX = 0;
        this.velocityX = 0;
    }

    this.resetVelocityY = function() {
        lastAY = 0;
        this.velocityY = 0;
    }

    this.applyForce = function(forceX, forceY, dt) {
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


        /* 
         * this.velocityX += forceX / this.mass * dt;
         * this.x += this.velocityX * dt;
         * 		
         * this.velocityY += forceY / this.mass * dt;
         * this.y += this.velocityY * dt;
         */

        var a;

        this.shape.x += (this.velocityX * dt + (0.5 * lastAX * dt * dt)) * 50; // TODO: PPM conversions
        a = forceX / this.mass;
        this.velocityX += ((lastAX + a) / 2) * dt;
        lastAX = a;

        this.shape.y += (this.velocityY * dt + (0.5 * lastAY * dt * dt)) * 50;
        a = forceY / this.mass;
        this.velocityY += ((lastAY + a) / 2) * dt;
        lastAY = a;
    }
}