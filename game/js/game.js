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
    var staticBodies = new SpatialMap("shape", 8), // Spatial map containing all the solid shapes of the bodies
        staticEffectAreas = new SpatialMap("effect.shape", 8), // Spatial map containing all the effect areas of the bodies
        // TODO: dynamicBodies = new SpatialMap("shape", 8), // Spatial map containing all dynamic bodies
        player = new DynamicBody(new Circle(200, 100, 10), 100); // TODO: dynamicBodies
    
    
    var level = new Level(100, 0, 1000, 1000, 50, 0);
    level.obstacles = [];
    level.obstacles.push(new Body(new Poly(200, 200, [new Vec2(0, 50), new Vec2(70, 0), new Vec2(100, 100)]), void 0));
    level.obstacles.push(new Body(new Poly(200, 400, [new Vec2(0, 0), new Vec2(100, 0), new Vec2(100, 100), new Vec2(0, 100)]), new Gravity(9999999999999)));
    
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
        totalTime += dt; // Keep track of the total simulation time
		
        var samplesLeft = sampleCount,
            sampleDt = dt / sampleCount; // Sample physics delta time
			
	var forceOnPlayer = new Vec2();
            
        while (samplesLeft--) {

            forceOnPlayer.y = 0 * player.mass;
            forceOnPlayer.x = 0;
            
            // Air resistance
            // dragForce = Physics.calculateDrag(player.velocity, level.airDensity, player.shape.dragCoef, player.shape.crossSectionalArea);
            
            if (KEYS.isDown(68)) { // D
                forceOnPlayer.x += 1000;
            } 

            if (KEYS.isDown(65)) { // A
                forceOnPlayer.x += -1000;
            }

            if (KEYS.isDown(83)) { // S
                forceOnPlayer.y += 1000;
            }

            if (KEYS.isDown(87)) { // W
                forceOnPlayer.y -= 1000;
            }
            
            
            // Apply effects on player
            var effectObstacles = staticEffectAreas.query(player.shape.x, player.shape.y, player.shape.width, player.shape.height),
                intersectionData = {},
                intersects = false,
                effectObstacle;
            
            for (var i = 0, length = effectObstacles.length; i < length; i++) {
                effectObstacle = effectObstacles[i];
                intersects = intersect.apply(player.shape, effectObstacle.effect.shape, intersectionData);
                if (intersects) console.log("Effect obstacle...");
            }
            
            // Move player
            player.applyForce(forceOnPlayer, sampleDt);
                    
            // Check for collisions and resolve them
            var obstacles = staticBodies.query(player.shape.x, player.shape.y, player.shape.width, player.shape.height),
                obstacle;
            
            for(var i = 0, length = obstacles.length; i < length; i++) {
                obstacle = obstacles[i];
                intersects = intersect.apply(player.shape, obstacle.shape, intersectionData);
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
