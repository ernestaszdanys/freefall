var Game = function(context) {
    
    // Date.now() polyfill
    var getTime = Date.now || function() {return new Date().getTime()};
    
    // Physics stuff
    var timeScale = 1,
        physicsDelta = 0.01, // seconds
        totalTime = 0, // seconds
        missedTime = 0; // seconds
        
    // Camera stuff
    var cameraRect = {x: 0, y: 0, width: context.canvas.width, height: context.canvas.height};
        
    // Level stuff
    var spatialMap = new SpatialHashMap(10),
        player = new Body(new Circle(200, 100, 10), 100, new Solid(100)); // TODO:
    
    spatialMap.addArray(levelGenerator.generateObstacles(1000, context.canvas));

    function simulatePhysics(dt) {
        dt = Math.abs(dt); // TODO: figure out how it becomes negative
        dt *= 0.001; // convert milliseconds to seconds
        if (dt > 1) dt = 0.1; // if game is running like crap (or player has resumed from different tab)

        totalTime += dt;
        
        /*
         * Simulate physics in constant time steps (physicsDelta). 
         * TODO: It would be nice to interpolate between time steps when drawing...
         */
        dt += missedTime;
        while (dt > 0) {
            //------------------------------------------------------------------
            var scaledDt = dt * timeScale;

            // Move player
            console.log(scaledDt);
            player.applyForce(new Vec2(0, 9.8 * player.type.mass), scaledDt);
            // TODO: Camera should follow player
            
            // Check for collisions and resolve them
            /*var obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height),
                data = {},
                intersects = false;
        
            for(var i = 0; i < obstacles.length; i++) {
                intersects = Intersection.circlePoly(player.shape, obstacles[i].shape, data);
                if (intersects && obstacles[i].type.deadly) {
                    // Oops, the player is dead
                    console.log("Oh noes... you died... so sad...");
                } else if (data.penetration >= 0) {
                    player.shape.x += data.penetrationX;
                    player.shape.y += data.penetrationY;
                    player.velocity.reflectAlongNormal(new Vec2(data.normalX, data.normalY), 0.3);
                }
            }*/
            //------------------------------------------------------------------
            dt -= physicsDelta;
        }
        missedTime = dt;
    };
    
    function draw() {
        context.setTransform(1, 0, 0, 1, 0, -cameraRect.y);
        
        var obstacles = spatialMap.query(cameraRect.x, cameraRect.y, cameraRect.width, cameraRect.height);
	for(var i = 0; i < obstacles.length; i++) obstacles[i].shape.draw(context);		
	
        player.draw(context);
        
        console.clear();
        console.log(player.shape.x, player.shape.y);
    };
    
    this.simulatePhysics = function(dt) {
        simulatePhysics(dt);
    };
    
    this.draw = function() {
        draw();
    };
};

/*
	var fVertical = g * player.mass;
        fHorizontal = 0,
        fHorizontalDrag = 0;

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
*/