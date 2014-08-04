var PIXELS_PER_METER = 50;
var Game = function(width, height) {

    // Physics stuff
    var timeScale = 1,
        totalTime = 0, // Seconds
        sampleCount = 4; // Physics runs per frame 
	
    // Camera stuff
    var cameraRect = {x: 0, y: 0, width: width, height: height};

    // Level stuff
    var spatialMap = new SpatialHashMap(10),
        player = new Body(new Circle(200, 100, 10), new Dynamic(100)); // TODO:
   
    this.setTimeScale = function(newTimeScale) {
        if (typeof newTimeScale !== "number") {
            throw new Error("Time scale must be a number");
        }
        // Negative time scale is not (yet) supported.
        if (newTimeScale < 0) {
            newTimeScale = 0;
        }
        if (newTimeScale !== timeScale) {
            // TODO: dispatch event
            timeScale = newTimeScale;
        }
    };

    this.getTimeScale = function() {
        return timeScale;
    };
    
    /*
    this.addLevel = function(newLevel) {
        level = newLevel;
        spatialMap.addArray(newLevel.obstacles);
    };
	
    this.setLevel = function(newLevel) {
	level = newLevel;
        spatialMap.clear();
        spatialMap.addArray(newLevel.obstacles);
	player.shape.y = 100;
    };
    */
   
    /*
     * TODO: Simulate physics in fixed time steps.
     * It would be nice to interpolate between time steps when drawing...
     */
    this.simulatePhysics = function(dt) {
        // Don't simulate too much if game is running like crap.
        if (dt > 100) {
            dt = 100;
        } 
        
        dt *= 0.001; // Convert milliseconds to seconds
        dt *= timeScale;
        totalTime += dt;
		
        var samplesLeft = sampleCount,
            sampleDt = dt / sampleCount;
	
        var obstacles,
            data = {}, // Intersection data (normal, distance and whatnot...)
            intersects = false,
            playerTotalForce = new Vec2(),
            playerDragForce = new Vec2();
        
        while (samplesLeft--) {
            
            playerTotalForce.y = 1.8 * player.behaviour.mass;
            playerTotalForce.x = 0;
            
            // TODO: move key handling elsewhere
            if (KEYS.isDown(68)) {
                playerTotalForce.x += 3000;
            }

            if (KEYS.isDown(65)) {
                playerTotalForce.x += -3000;
            }

            if (KEYS.isDown(83)) {
                playerTotalForce.y += 1000;
            }

            if (KEYS.isDown(87)) {
                playerTotalForce.y -= 1000;
            }
                        
            // TODO: query areas of dynamic bodies visible to the camera instead of the area of the camera vieport
            // TODO: construct pairs of collided objects (better physics board phase)
            obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height);
            for(var i = 0, length = obstacles.length; i < length; i++) {
                
            }	
            
        }
        
        
        /*		
        var totalForce = new Vec2();
        var dragForce;
    
        
        while (samplesLeft--) {
            
            // Check for collisions and resolve them
            var obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height),
                data = {},
                intersects = false;
             
            for(var i = 0; i < obstacles.length; i++) {	
				totalForce.y = level.gravity * player.type.mass;
				totalForce.x = 0;
				if (KEYS.isDown(68)) {
					totalForce.x += 3000;
				} 

				if (KEYS.isDown(65)) {
					totalForce.x += -3000;
				}

				if (KEYS.isDown(83)) {
					totalForce.y += 1000;
				}

				if (KEYS.isDown(87)) {
					totalForce.y -= 1000;
				}
				//Air resistance
				dragForce = Physics.calculateDrag(player.velocity, level.airDensity, player.shape.dragCoef, player.shape.crossSectionalArea);
				
				for(var i = 0; i < obstacles.length; i++) {
                    var obstacle = obstacles[i];
                    
                    if (obstacle.type instanceof GravityField) {
                        var gravityForceOnPlayer = new Vec2(
                                (obstacle.shape.x + obstacle.shape.width / 2) - (player.shape.x + player.shape.width / 2),
                                (obstacle.shape.y + obstacle.shape.height / 2) - (player.shape.y + player.shape.height / 2)
                            );
                        
                        var distance = gravityForceOnPlayer.length();
                        
                        gravityForceOnPlayer.scale((Physics.G * player.type.mass * obstacle.type.pointMass) / (distance * distance));
                        
                        totalForce.addVector(gravityForceOnPlayer);
                    }
                    
					intersects = Intersection.circlePoly(player.shape, obstacles[i].shape, data);
					if (intersects && obstacles[i].type instanceof Liquid) {
						dragForce = Physics.calculateDrag(player.velocity, obstacles[i].type.density, player.shape.dragCoef, player.shape.crossSectionalArea);
						dragForce.scale(obstacles[i].type.multiplier);
					} else if (data.penetration >= 0) {						
						// Remember last velocity
						var lastSpeed = player.velocity.length();
						
						player.shape.x += data.penetrationX;
						player.shape.y += data.penetrationY;
						player.velocity.reflectAlongNormal(new Vec2(data.normalX, data.normalY), 0.3);

						// Calculate health loss
						var acceleration = (player.velocity.length() - lastSpeed) / 0.1;
						var force = Math.abs(player.type.mass * acceleration);
						var healthLost = force / 1000 > 1 ? force / 1000 : 0;
						
						// Change health
						player.type.health -= healthLost;
					}
				}
				// Move player
				totalForce.addVector(dragForce);
				player.applyForce(totalForce, scaledDt);
				
				// Calculate score
				player.type.score = player.shape.y / 1000;
                
                // TODO: Camera
                cameraRect.y = player.shape.y - 50;
                if(cameraRect.y + cameraRect.height > level.height + level.offset && that.onLevelEnd !== void 0) that.onLevelEnd();
            }
            
            if (totalTime - player.type.lastTimeHealed > 0.5) {
                player.type.lastTimeHealed = totalTime;
                player.type.health += 1;
            }
        }
        */
    };

    this.draw = function(context) {
        // Transform
        context.save();
        context.setTransform(1, 0, 0, 1, 0, -cameraRect.y);

        // Draw obstacles
        var obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height);
        for (var i = 0; i < obstacles.length; i++) obstacles[i].draw(context);
		
        // Draw player 
        player.draw(context);
		
        // Restore transformation
        context.restore();
    };
};
