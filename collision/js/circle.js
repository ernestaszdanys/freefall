function Circle(x, y, radius, sAngle, eAngle, mass) {
    this.x = x;
	this.y = y;
        this.radius = radius;
	this.sAngle = sAngle;
	this.eAngle = eAngle;
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
		
		this.x += (this.velocityX * dt + (0.5 * lastAX * dt * dt)) * 50; // TODO: PPM conversions
		a = forceX / this.mass;
		this.velocityX += ((lastAX + a) / 2) * dt;
		lastAX = a;

		this.y += (this.velocityY * dt + (0.5 * lastAY * dt * dt)) * 50;
		a = forceY / this.mass;
		this.velocityY += ((lastAY + a) / 2) * dt;
		lastAY = a;
	}
        
        this.circleIntersectsPolygon = function(p) {
            for (var i=0; i<p.vertices.length; i++){
                v1 = p.vertices[i];
                v2 = p.vertices[i + 1 == p.vertices.length ? 0 : i + 1];
                
                eq = Polygon.equationTwoPoints(v1, v2);
                d1 = Polygon.distanceTwoPoints(v1, new Vertice(this.x, this.y));
                d2 = Polygon.distanceTwoPoints(v2, new Vertice(this.x, this.y));
                d3 = Polygon.distanceTwoPoints(v1, v2);
                distance = Math.abs(eq.a*this.x+eq.b*this.y+eq.c)/Math.sqrt(eq.a*eq.a+eq.b*eq.b);
                maxd = Math.sqrt(d3*d3 + distance*distance);

                if((distance<this.radius && (d1 < maxd && d2 < maxd)) ||
                   d1<this.radius ||
                   d2<this.radius) return true;
            }
        }
}

