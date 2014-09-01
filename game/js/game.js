"use strict";

/**
 * @constructor
 * @param {type} context
 * @param {type} resources
 * @param {type} PPM        Pixels per meter.
 */
function Game(context, resources, PPM) {
    
    // Extend Observable
    Observable.apply(this);
        
    var self = this;
        
    // Physics stuff
    var timeScale = 1, // 0 <= timeScale < infinity
        sampleCount = 5; // Number of physics runs per frame
        
    // Camera stuff
    var cameraWidth = context.canvas.width / PPM,       // meters
        cameraHeight = context.canvas.height / PPM,     // meters
        cameraDefaultOffsetY = cameraHeight / 2,        // meters
        camera = new Camera(cameraWidth / 2, 0, cameraWidth, cameraHeight);
    camera.setOffsetY(cameraDefaultOffsetY);
    
    // Game (map) related stuff
    var solidBodies = new SpatialMap("geometry.solid.aabb", 2),      // Spatial map containing all the solid shapes of the bodies
        effectBodies = new SpatialMap("geometry.effect.aabb", 2);    // Spatial map containing all the effect areas of the bodies
    
    // Parse and scale egg vertices
    var eggVertices = Vec2.parseVectorPrimitiveArray(resources.eggVertices);
    eggVertices.forEach(function(vertex) {vertex.scale(1 / PPM);});
    
    var player = Body.createSolid(new Poly(eggVertices, resources.eggTexture), Physics.densityEgg, cameraWidth / 2, 1, 0);
        
    solidBodies.add(Body.createSolid(new Poly([0, 0, 1, 0, 1, 1, 0, 1]), Number.POSITIVE_INFINITY, cameraWidth / 2, 8, 2));
    
        
    /**
     * @param {number} dt Simulation length (delta time) in milliseconds.
     */
    this.simulatePhysics = function(dt) {
        // Don't simulate too much if game is running like crap
        if (dt > 50) dt = 50; 
        
        dt *= 0.001; // Converts milliseconds to seconds
        player.applyForceAndTorque(new Vec2(0, player.mass * 9.8), 20, dt);
        
        var obstacles = solidBodies.queryRect(player.geometry.solid.aabb),
            intersectionData = {};
        obstacles.forEach(function(obstacle) {
            if (Physics.intersectPolyPoly(player.geometry.solid, obstacle.geometry.solid, intersectionData)) {
                Physics.resolveCollision(player, obstacle, intersectionData);
            }
        });
    };
    
    var backgroundFill = context.createLinearGradient(0, 0, 0, cameraHeight);
    backgroundFill.addColorStop(0, "rgb(32, 46, 59)");
    backgroundFill.addColorStop(0.5, "rgb(65, 77, 89)");
    backgroundFill.addColorStop(1, "rgb(90, 101, 111)");
    
    this.draw = function() {
        context.save();
        
        // Scale canvas
        context.scale(PPM, PPM);
        context.lineWidth /= PPM;
        
        // Draw background
        context.fillStyle = backgroundFill;
        context.fillRect(0, 0, camera.getWidth(), camera.getHeight());
        
            context.save();
            
            // Draw obstacles
            var obstacles = solidBodies.query(camera.getLeft(), camera.getTop(), camera.getWidth(), camera.getHeight());
            obstacles.forEach(function(obstacle) {
                obstacle.geometry.solid.drawShape(context);
            });
            
            // Draw player
            player.geometry.solid.drawShape(context);
            
            context.restore();
        
        context.restore();
    };
}

/*
function Player() {
    Body.apply(this, arguments);
    Observable.apply(this);
    
    var maxHealth = 100,
        health = 100,
        score = 0;
    
    this.mass = 100;
    
    this.restitution = 0.3;
    
    this.getHealth = function() {
        return health;
    };
    
    this.setHealth = function(newHealth) {
        // Make sure health is within bounds (0 <= health <= maxHealth)
        if (newHealth > maxHealth) {
            newHealth = maxHealth;
        } else if (newHealth < 0) {
            newHealth = 0;
        } 
        if (newHealth !== health) {
            health = newHealth;
            this.dispatchEvent(Player.EVENT_HEALTH_CHANGED, health);
        }
    };
    
    this.getScore = function() {
        return score;
    };
    
    this.setScore = function(newScore) {
        if (newScore !== score) {
            score = newScore;
            this.dispatchEvent(Player.EVENT_SCORE_CHANGED, score);
        }
    };
}

// Inherit Body prototype
Player.prototype = Object.create(Body.prototype);
Player.prototype.constructor = Player;

Player.EVENT_HEALTH_CHANGED = "PLAYER_HEALTH_CHANGED";
Player.EVENT_SCORE_CHANGED = "PLAYER_SCORE_CHANGED";
*/
/*
var Game = function(context, resources) {
    
    // Extend Observable
    Observable.apply(this);
    
    var self = this;
    
    var scaledTimeAnimator = new Animator(),
        drawRealTimeAnimator = new Animator();
    
    var touchObserver = new TouchObserver(context.canvas),
        lastTouchX, 
        lastTouchY,
        touchDown = false;
    touchObserver.addEventListener(TouchObserver.EVENT_TOUCH, function(eventName, eventType, x, y) {
        switch (eventType) {
            case PointerEvent.DOWN:
                touchDown = true;
                break;
            case PointerEvent.UP: 
                touchDown = false;
                break;
        }
        lastTouchX = x / PXR;
        lastTouchY = y / PXR;
    });
    
    // Physics stuff
    var timeScale = 1, // 0 <= timeScale < infinity
        totalTime = 0, // seconds
        totalScaledTime = 0, // second
        sampleCount = 10; // Number of physics runs per frame

    // Camera stuff
    var camera = new Camera(context.canvas.width / 2, 0, context.canvas.width, context.canvas.height),
        cameraDefaultOffset = context.canvas.height / 2 - 75;
    
        camera.setOffsetY(cameraDefaultOffset);
    
    // Game (map) related stuff
    var solidBodies = new SpatialMap("geometry.solid", 8), // Spatial map containing all the solid shapes of the bodies
        effectBodies = new SpatialMap("geometry.effect", 8), // Spatial map containing all the effect areas of the bodies
        player = new Player(context.canvas.width / 2, 0, {
            solid: new Poly(Vec2.parseVectorPrimitiveArray(resources.eggVertices), resources.eggTexture)
        });
        
    var backgroundObjectMap = new SpatialMap(null, 10);
        
    player.addEventListener(Player.EVENT_HEALTH_CHANGED, function(eventName, health) {
        self.dispatchEvent(Game.EVENT_PLAYER_HEALTH_CHANGED, health);
        if (health === 0) {
            drawRealTimeAnimator.animate(cameraDefaultOffset, 0, 1000, easeOutPower3, camera.setOffsetY);
        } else {
            camera.setOffsetY(cameraDefaultOffset);
        }
    });

    player.addEventListener(Player.EVENT_SCORE_CHANGED, function(eventName, score) {
        self.dispatchEvent(Game.EVENT_PLAYER_SCORE_CHANGED, score);
    });

    // Level related stuff
    var levelGravity = 6.8,
        levelEnvironmentDensity = Physics.densityAir * 7,
        levelMinY = Number.MIN_VALUE,
        levelMaxY = Number.MIN_VALUE;
    
    this.addObstacles = function(obstacles) {
        if (!(obstacles instanceof Array) || obstacles.length === 0) {
            throw new Error("Parameter obtacles must be an array of bodies.");
        }
        
        // Add all obstacles to array
        solidBodies.addArray(obstacles);
        effectBodies.addArray(obstacles);
        
        // Update level max and min y...
        var obstacle;
        for (var i = 0; i < obstacles.length; i++) {
            obstacle = obstacles[i];
            if (obstacle.position.y > levelMaxY) {
                levelMaxY = obstacle.position.y;
            }
            if (obstacle.position.y < levelMinY) {
                levelMinY = obstacle.position.y;
            }
        }
    };

    this.resetPlayer = function() {
        player.setHealth(100);
        player.setScore(0);
        player.moveTo(context.canvas.width / 2, 0);
        player.resetVelocity();
    };
    
    this.addBackgroundObjects = function(backgroundObjects) {
        backgroundObjectMap.addArray(backgroundObjects);
    };
    
    this.getPlayerHealth = function() {
        return player.getHealth();
    };
    
    this.getPlayerScore = function() {
        return player.getScore();
    };
    
    this.getGravity = function() {
        return levelGravity;
    };
    
    // TODO: validate gravity
    this.setGravity = function(newGravity) {
        levelGravity = newGravity;
    };
    
    this.getEnvironmentDensity = function() {
        return levelEnvironmentDensity;
    };
    
    // TODO: validate density
    this.setEnvironmentDensity = function(newEnvironmentDensity) {
        levelEnvironmentDensity = newEnvironmentDensity;
    };
    
    // TODO: validate time scale
    this.setTimeScale = function(newTimeScale) {
        timeScale = (newTimeScale > 0) ? newTimeScale : 0;
    };
        
    // TODO: Simulate physics in fixed time steps.
    // TODO: validate dt
    this.simulatePhysics = function(dt) {
        
        // Don't simulate too much if game is running like crap
        // TODO: there should be stall and tab switch detection somewhewre (preferably not in this file)
        if (dt > 50) dt = 50; 
        
        scaledTimeAnimator.tick(scaledTimeAnimator.getCurrentTime + dt * timeScale); // milliseconds


        dt *= 0.001; // Convert milliseconds to seconds
        totalTime += dt; // Keep track of total unscaled simulation time
        dt *= timeScale; // Apply time scale to allow slow-mo effects
        totalScaledTime += dt; // Keep track of the total scaled simulation time
		        
        var samplesLeft = sampleCount,
            sampleDt = dt / sampleCount; // Sample physics delta time
			
	var forceOnPlayer = new Vec2(),
            obstacles,
            obstacle,
            intersects,
            intersectionData = {};
            
        while (samplesLeft--) {
            
            var currentEnvironmentDensity = levelEnvironmentDensity;
            
            // TODO:
            forceOnPlayer.y = (levelGravity + (player.position.y / 10000)) * player.mass;
            forceOnPlayer.x = 0;
            
            if (lastTouchX > (context.canvas.width / PXR) / 2) {
                if (touchDown) forceOnPlayer.x += 2800;
            } else {
                if (touchDown) forceOnPlayer.x -= 2800;
            }
            
            if (KEYS.isDown(68) || KEYS.isDown(39)) { // Right
                forceOnPlayer.x += 2800;
            } 

            if (KEYS.isDown(65) || KEYS.isDown(37)) { // Left
                forceOnPlayer.x += -2800;
            }

            if (KEYS.isDown(83) || KEYS.isDown(40)) { // Down
                forceOnPlayer.y += 1000;
            }

            if (KEYS.isDown(87) || KEYS.isDown(38)) { // Up
                forceOnPlayer.y -= 200;
            }
            
            // TODO:
            if (KEYS.isDown(13)) {
                player.setHealth(0);
            }
               
            // Interact with effect bodies (obstacle gravity, slowdown, speedup, etc.) // TODO
//            obstacles = effectBodies.query(player.geometry.solid.x, player.geometry.solid.y, player.geometry.solid.width, player.geometry.solid.height);
//            for (var i = 0, length = obstacles.length; i < length; i++) {
//
//            }
            
            // Apply air drag
            // TODO: cross section area
            forceOnPlayer.x += Physics.calculateDrag(player.getVelocityX() / Metrics.PPM, currentEnvironmentDensity, Physics.dragCoeffCube, 1);
            forceOnPlayer.y += Physics.calculateDrag(player.getVelocityY() / Metrics.PPM, currentEnvironmentDensity, Physics.dragCoeffCube, 1);
            
            // Move player
            player.applyForce(forceOnPlayer, sampleDt);
            
            var playerHealthLossX = player.getVelocityX(),
                playerHealthLossY = player.getVelocityY();
            
            // Interact with solid objects (hit and bounce back, lose hp)
            obstacles = solidBodies.query(player.geometry.solid.x, player.geometry.solid.y, player.geometry.solid.width, player.geometry.solid.height);
            for (var i = 0, length = obstacles.length; i < length; i++) {
                obstacle = obstacles[i];
                intersects = Physics.intersect(player.geometry.solid, obstacle.geometry.solid, intersectionData);
                if (intersects && intersectionData.penetration >= 0) {
                    // Move the player out of the obstacle
                    player.translate(intersectionData.penetrationX, intersectionData.penetrationY);
                    // Bounce the player back
                    player.reflectVelocityAlongUnitVectorXY(intersectionData.normalX, intersectionData.normalY);
                }
            }
            
            playerHealthLossX = player.getVelocityX() - playerHealthLossX;
            playerHealthLossY = player.getVelocityY() - playerHealthLossY;
            
            if (playerHealthLossX || playerHealthLossY) {
                playerHealthLossX /= sampleDt * 10000000;
                playerHealthLossY /= sampleDt * 10000000;

                playerHealthLossX *= player.mass;
                playerHealthLossY *= player.mass;

                playerHealthLossX = Math.abs(playerHealthLossX);
                playerHealthLossY = Math.abs(playerHealthLossY);

                playerHealthLossX = playerHealthLossX >= 1 ? playerHealthLossX : 0;
                playerHealthLossY = playerHealthLossY >= 1 ? playerHealthLossY : 0;
                
                player.setHealth(player.getHealth() - (playerHealthLossX + playerHealthLossY));        
            }

            // TODO: Camera
            camera.setCenterY(player.position.y);
            
            // Check if level end is visible
            if(camera.getBottom() > levelMaxY) {
                self.dispatchEvent(Game.EVENT_LEVEL_END_VISIBLE, levelMaxY);
            }
            
            // Set player score
            player.setScore(player.position.y / 1000);
        }
    };


    var gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
    gradient.addColorStop(0, 'rgba(32, 46, 59, 1.000)');
    gradient.addColorStop(0.5, 'rgba(65, 77, 89, 1.000)');
    gradient.addColorStop(1, 'rgba(90, 101, 111, 1.000)');

    this.draw = function() {
        drawRealTimeAnimator.tick(Date.now()); // milliseconds

        // Transform
        context.save();
        camera.applyTransformation(context);

        // Draw background
        context.fillStyle = gradient;
        context.fillRect(camera.getLeft(), camera.getTop(), camera.getWidth(), camera.getHeight());
            
        // Draw background objects
        context.save();
        var backgroundObjects = backgroundObjectMap.query(camera.getLeft() - 1000, camera.getTop() - 1000, camera.getWidth() + 2000, camera.getHeight() + 2000),
            dataBucket = {},
            backgroundObject;
        for(var i = 0, length = backgroundObjects.length; i < length; i++) {
            backgroundObject = backgroundObjects[i];
            backgroundObject.perspectiveProjectToBucket(camera.getX(), camera.getY(), 500, dataBucket);
            dataBucket.w *= 2;
            context.globalAlpha = 0.5 / dataBucket.w;
            context.drawImage(
                backgroundObject.texture,
                dataBucket.x - (backgroundObject.texture.naturalWidth / dataBucket.w) / 2,
                dataBucket.y - (backgroundObject.texture.naturalHeight / dataBucket.w) / 2,
                backgroundObject.texture.naturalWidth / dataBucket.w,
                backgroundObject.texture.naturalHeight / dataBucket.w);
        }
        
        context.restore();
        
        // Draw solid bodies
        var obstacles = solidBodies.query(camera.getLeft(), camera.getTop(), camera.getWidth(), camera.getHeight());
        for(var i = 0, length = obstacles.length; i < length; i++) {
            obstacles[i].geometry.solid.drawTextured(context);
        }
   
        // Draw player 
        player.geometry.solid.drawTextured(context);
		
        
        // Draw death rectangles
        if (player.getHealth() === 0) {
            context.fillStyle = "rgb(32, 46, 59)";
            context.globalAlpha = 0.9;
            var boxHeight = (cameraDefaultOffset - camera.getOffsetY()) * 0.8;
            context.fillRect(camera.getLeft(), camera.getTop(), camera.getWidth(), boxHeight);
            context.fillRect(camera.getLeft(), camera.getBottom() - boxHeight, camera.getWidth(), boxHeight);
            context.globalAlpha = 1;
        }
        
        // Restore transformation
        context.restore();
    };
};
Game.EVENT_LEVEL_END_VISIBLE = "GAME_LEVEL_END_VISIBLE";
Game.EVENT_PLAYER_HEALTH_CHANGED = "GAME_PLAYER_HEALTH_CHANGED";
Game.EVENT_PLAYER_SCORE_CHANGED = "GAME_PLAYER_SCORE_CHANGED";
*/