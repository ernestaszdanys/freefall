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
    this.setTimeScale = function(newTimeScale) {
        timeScale = newTimeScale > 0 ? newTimeScale : 0;
    };

    this.setLevel = function(obstacles) {
        spatialMap.clear();
        spatialMap.addArray(obstacles);
    };
    
    this.onPlayerHealthChanged;
    this.onPlayerScoreChanged;

    /*
     * TODO: Simulate physics in fixed time steps (constant dt).
     * It would be nice to interpolate between time steps when drawing...
     */
    function simulatePhysics(dt) {
        dt = Math.abs(dt); // TODO: wth is happening?
        dt *= 0.001; // Convert milliseconds to seconds
        
        // Don't simulate too much if game is running like crap (or if user switcher tabs)
        if (dt > 0.1) dt = 0.1; 

        totalTime += dt;

        var samples = 4,
            scaledDt = (dt * timeScale) / samples;
    
        while (samples--) {
             var fHorizontal = 0,
                 fVertical = 9.8 * player.type.mass,
                 fHorizontalDrag = 0,
                 fVerticalDrag = 0;

            if (KEYS.isDown(68)) {
                fHorizontal += 3000;
            } 

            if (KEYS.isDown(65)) {
                fHorizontal += -3000;
            }

            if (KEYS.isDown(83)) {
                fVertical += 1000;
            }

            if (KEYS.isDown(87)) {
                fVertical -= 1000;
            }
            
            // Move player
            player.applyForce(new Vec2(fHorizontal, fVertical), scaledDt);
            player.type.score = player.shape.y / 1000;
            
            // TODO: Camera
            cameraRect.y = player.shape.y - 50;
            
            // Check for collisions and resolve them
            var obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height),
                data = {},
                intersects = false;
             
            for(var i = 0; i < obstacles.length; i++) {
                intersects = Intersection.circlePoly(player.shape, obstacles[i].shape, data);
                if (data.penetration >= 0) {
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
        }
    };

    function draw() {
        // Transform
        context.save();
        context.setTransform(1, 0, 0, 1, 0, -cameraRect.y);

        // Draw obstacles
        var obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height);
        for (var i = 0; i < obstacles.length; i++) obstacles[i].shape.draw(context);
		
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
