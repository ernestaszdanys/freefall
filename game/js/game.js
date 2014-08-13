"use strict";
var Game = function(context) {
    // Extend Observable "class"
    Observable.apply(this);
    
    var self = this;

    // Physics stuff
    var timeScale = 1, // 0 <= timeScale < infinity
        totalTime = 0, // seconds
	sampleCount = 1; // Number of physics runs per frame

    // Camera stuff
    var cameraRect = {x: 0, y: 0, width: context.canvas.width, height: context.canvas.height};

    // World (map) related stuff
    var levelAreas = new SpatialMap(null, 8), // TODO:
        staticBodies = new SpatialMap("shape", 8), // Spatial map containing all the shapes of the bodies
        staticEffectAreas = new SpatialMap("effect.shape", 8), // Spatial map containing all the effect areas of the bodies
        // TODO: dynamicBodies = new SpatialMap("shape", 8), // Spatial map containing all dynamic bodies
        player = new DynamicBody(new Circle(200, 100, 10), 100); // TODO: dynamicBodies
    
    
    var level = new Level(100, 0, 1000, 1000, 50, 0);
    
    staticBodies.addArray(level.obstacles);
    staticEffectAreas.addArray(level.obstacles);

    this.setTimeScale = function(newTimeScale) {
        timeScale = (newTimeScale > 0) ? newTimeScale : 0;
    };
    
    // TODO: Simulate physics in fixed time steps.
    this.simulatePhysics = function(dt) {
        
        // Don't simulate too much if game is running like crap
        // TODO: there should be stall and tab switch detection somewhewre (preferably not in this file)
        if (dt > 100) dt = 100; 

        dt *= 0.001; // Convert milliseconds to seconds
        dt *= timeScale; // Apply time scale to allow slow-mo effects
        totalTime += dt; // Keep track of total simulation time
		
        var samplesLeft = sampleCount, // Number of physics runs per frame
            sampleDt = dt / sampleCount; // Sample physics delta time
			
	var totalForce = new Vec2(),
            dragForce = new Vec2();            
            
        while (samplesLeft--) {

            totalForce.y = 500; // level.gravity * player.mass;
            totalForce.x = 0;
            
            // Air resistance
            // dragForce = Physics.calculateDrag(player.velocity, level.airDensity, player.shape.dragCoef, player.shape.crossSectionalArea);
            
            if (KEYS.isDown(68)) { // D
                totalForce.x += 1000;
            } 

            if (KEYS.isDown(65)) { // A
                totalForce.x += -1000;
            }

            if (KEYS.isDown(83)) { // S
                totalForce.y += 1000;
            }

            if (KEYS.isDown(87)) { // W
                totalForce.y -= 1000;
            }
                        
            // Move player
            totalForce.addVector(dragForce);
            player.applyForce(totalForce, sampleDt);
                    
            // Check for collisions and resolve them
            var obstacles = staticBodies.query(player.shape.x, player.shape.y, player.shape.width, player.shape.height),
                intersectionData = {},
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

                intersects = Intersection.circlePoly(player.shape, obstacles[i].shape, intersectionData);
                if (intersects && intersectionData.penetration >= 0) {
                    // Move the player out of the obstacle
                    player.translate(intersectionData.penetrationX, intersectionData.penetrationY);
                    // Bounce the player back
                    player.reflectVelocityAlongUnitVectorXY(intersectionData.normalX, intersectionData.normalY);
                }
            }

            // TODO: Camera
            cameraRect.y = player.shape.y - 50;
            if(cameraRect.y + cameraRect.height > level.height + level.offset && self.onLevelEnd !== void 0) self.onLevelEnd();
        }
    };

    this.draw = function() {
        
        // Transform
        context.save();
        context.setTransform(1, 0, 0, 1, 0, -cameraRect.y);

        // Draw obstacles
        var obstacles = staticBodies.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height);
        for(var i = 0, length = obstacles.length; i < length; i++) {
            obstacles[i].draw(context);
        }
		
        // Draw player 
        player.draw(context);
		
        // Restore transformation
        context.restore();
    };
};
Game.EVENT_LEVEL_END_VISIBLE = "GAME_LEVEL_END_VISIBLE";
