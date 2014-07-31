var PIXELS_PER_METER = 50;
var Game = function(context) {

    var that = this;

    // Physics stuff
    var timeScale = 1,
        totalTime = 0; // seconds
	
    // Camera stuff
    var cameraRect = {x: 0, y: 0, width: context.canvas.width, height: context.canvas.height};

    // Level stuff
    var spatialMap = new SpatialHashMap(10),		
        player = new Body(new Circle(200, 100, 10), new Player(100)); // TODO:
        player.type.onHealthChanged = function(oldHealth, newHealth) {
            if (that.onPlayerHealthChanged !== void 0) that.onPlayerHealthChanged(oldHealth, newHealth);
        }
        player.type.onScoreChanged = function(oldScore, newScore) {
            if (that.onPlayerScoreChanged !== void 0) that.onPlayerScoreChanged(oldScore, newScore);
        }
	
	var level;

    this.setTimeScale = function(newTimeScale) {
        timeScale = newTimeScale > 0 ? newTimeScale : 0;
    };

    this.addLevel = function(newLevel) {
		level = newLevel;
        //spatialMap.clear();
        spatialMap.addArray(newLevel.obstacles);
		//player.shape.y = 100;
    };
	
	this.setLevel = function(newLevel) {
		level = newLevel;
        spatialMap.clear();
        spatialMap.addArray(newLevel.obstacles);
		player.shape.y = 100;
    };
	
	this.getLevel = function() {
		return level;
	}
	
	this.onLevelEnd;
    
    this.onPlayerHealthChanged;
    this.onPlayerScoreChanged;

    /*
     * TODO: Simulate physics in fixed time steps (constant dt).
     * It would be nice to interpolate between time steps when drawing...
     */
    function simulatePhysics(dt) {
		if(level === void 0) throw new Error("level is not set");
        dt = Math.abs(dt); // TODO: wth is happening?
        dt *= 0.001; // Convert milliseconds to seconds
        
        // Don't simulate too much if game is running like crap (or if user switcher tabs)
        if (dt > 0.1) dt = 0.1; 

        totalTime += dt;
		
        var samples = 4,
            scaledDt = (dt * timeScale) / samples;
			
		var totalForce = new Vec2();
		var dragForce;
    
        while (samples--) {
            
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
    };

    function draw() {
		if(level === void 0) throw new Error("level is not set");
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

    this.simulatePhysics = function(dt) {
        simulatePhysics(dt);
    };

    this.draw = function() {
        draw();
    };
};
