var PIXELS_PER_METER = 50;

var Game = function(context) {
    Observable.apply(this);
    
    var self = this;

    // Physics stuff
    var timeScale = 1, // 0 <= timeScale < infinity
        totalTime = 0, // seconds
	    sampleCount = 10; // Number of physics runs per frame

    // Camera stuff
    var cameraRect = {x: 0, y: 0, width: context.canvas.width, height: context.canvas.height};

    // Level stuff
    var spatialMap = new SpatialHashMap(10),
        player = new Body(new Circle(200, 100, 10), new Player(100)); // TODO:
   
	var level;

    this.setTimeScale = function(newTimeScale) {
        timeScale = newTimeScale > 0 ? newTimeScale : 0;
    };

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
	
	this.getLevel = function() {
		return level;
	};
    
	this.getPlayer = function() {
        return player;
    };
    
    var playerLastPosition = new Vec2();
    
    // TODO: Simulate physics in fixed time steps.
    function simulatePhysics(dt) {
		if(level === void 0) {
            throw new Error("level is not set");
        }
        
        // Don't simulate too much if game is running like crap
        // TODO: there should be stall and tab switch detection somewhewre (preferably not in this file)
        if (dt > 100) dt = 100; 

        dt *= 0.001; // Convert milliseconds to seconds
        dt *= timeScale; // Apply time scale to allow slow-mo effects
        totalTime += dt; // Keep track of total simulation time
		
        var samplesLeft = sampleCount, // Number of physics runs per frame
            sampleDt = dt / sampleCount; // Sample physics delta time
			
		var totalForce = new Vec2(),
            dragForce = new Vec2(),
            playerLastPosition = new Vec2(player.shape.x, player.shape.y); // Save initial player velocity
            
        while (samplesLeft--) {
            
            totalForce.y = level.gravity * player.type.mass;
            totalForce.x = 0;
            
            // Air resistance
			dragForce = Physics.calculateDrag(player.velocity, level.airDensity, player.shape.dragCoef, player.shape.crossSectionalArea);
            
            if (KEYS.isDown(68)) { // D
                totalForce.x += 3000;
            } 

            if (KEYS.isDown(65)) { // A
                totalForce.x += -3000;
            }

            if (KEYS.isDown(83)) { // S
                totalForce.y += 1000;
            }

            if (KEYS.isDown(87)) { // W
                totalForce.y -= 1000;
            }
                
            // Check for collisions and resolve them
            var obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height),
                data = {},
                intersects = false,
                obstacle;
            
            
            for(var i = 0, length = obstacles.length; i < length; i++) {
                obstacle = obstacles[i];

                /*if (obstacle.type instanceof GravityField) {
                    var gravityForceOnPlayer = new Vec2(
                            (obstacle.shape.x + obstacle.shape.width / 2) - (player.shape.x + player.shape.width / 2),
                            (obstacle.shape.y + obstacle.shape.height / 2) - (player.shape.y + player.shape.height / 2)
                        );
                    var distance = gravityForceOnPlayer.length();
                    gravityForceOnPlayer.scale((Physics.G * player.type.mass * obstacle.type.pointMass) / (distance * distance));
                    totalForce.addVector(gravityForceOnPlayer);
                }*/

                intersects = Intersection.circlePoly(player.shape, obstacles[i].shape, data);
                if (intersects && obstacles[i].type instanceof Liquid) {
                    dragForce = Physics.calculateDrag(player.velocity, obstacles[i].type.density, player.shape.dragCoef, player.shape.crossSectionalArea);
                    dragForce.scale(obstacles[i].type.multiplier);
                } else if (data.penetration >= 0) {			
                    player.position.x += data.penetrationX;
                    player.position.y += data.penetrationY;
                    player.velocity.reflectAlongNormal(new Vec2(data.normalX, data.normalY), 0.2);
                }
            }
            
            // Move player
            totalForce.addVector(dragForce);
            player.applyForce(totalForce, sampleDt);

            // Calculate score
//            player.type.score = player.shape.y / 1000;

            // TODO: Camera
            cameraRect.y = player.shape.y - 50;
            if(cameraRect.y + cameraRect.height > level.height + level.offset && self.onLevelEnd !== void 0) self.onLevelEnd();
        }
        
        // Calculate the force that player felt during the simulation
        var playerPositionDeltaX = player.shape.x - playerLastPosition.x,
            playerPositionDeltaY = player.shape.y - playerLastPosition.y;
            
//            console.clear();
//            console.log((playerPositionDeltaX / dt) * player.type.mass);
//            console.log((playerPositionDeltaX / dt) * player.type.mass);
    };

    function draw() {
		if(level === void 0) {
            throw new Error("Level is not set.");
        }
        
        // Transform
        context.save();
        context.setTransform(1, 0, 0, 1, 0, -cameraRect.y);

        // Draw obstacles
        var obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height);
        for (var i = 0, length = obstacles.length; i < length; i++) {
            obstacles[i].draw(context);
        }
		
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
Game.EVENT_LEVEL_END_VISIBLE = "GAME_LEVEL_END_VISIBLE";
