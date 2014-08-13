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
        player = new Body(new Poly([new Vec2(0, 26), new Vec2(3, 18), new Vec2(7, 11), new Vec2(12, 5), new Vec2(19, 0),
            new Vec2(28, 0), new Vec2(34, 5), new Vec2(39, 11), new Vec2(43, 18), new Vec2(45, 26), new Vec2(45, 38),
            new Vec2(41, 48), new Vec2(35, 55), new Vec2(28, 59), new Vec2(18, 59), new Vec2(10, 59), new Vec2(3, 48),
            new Vec2(0, 38)], playerImage), new Player(100)); // TODO:
		
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
		player.shape.x = canvas.width/2;
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
             
				totalForce.y = level.gravity * player.type.mass;
				totalForce.x = 0;
				if (KEYS.isDown(68)) {
					totalForce.x += 3000;
				} 

				if (KEYS.isDown(65)) {
					totalForce.x += -3000;
				}

				if (KEYS.isDown(83)) {
					totalForce.y += 3000;
				}

				if (KEYS.isDown(87)) {
					totalForce.y -= 1000;
				}
                if (KEYS.isDown(13)) {
                    player.type.health = 5;
                }
				//Air resistance
				dragForce = Physics.calculateDrag(player.velocity, level.airDensity, player.shape.dragCoef, player.shape.crossSectionalArea);
				
				for(var i = 0; i < obstacles.length; i++) {
					intersects = Intersection.polyPoly(player.shape, obstacles[i].shape, data);
					if (intersects && data.penetration >= 0) {						
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
