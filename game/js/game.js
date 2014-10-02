"use strict";

function Player() {
    Body.apply(this, arguments);
    Observable.apply(this);
    
    var maxHealth = 100,
        health = 100,
        score = 0;
    
    this.restitution = 0.3;
    this.friction = 0.5;
    
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
            this.geometry.solid.textureDescription.imageIndex = ~~Math.min((health / (maxHealth / this.geometry.solid.textureDescription.image.length)), this.geometry.solid.textureDescription.image.length - 1); // TODO
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
        
    var leftButton = new Button(context, {width: context.canvas.width / 2, height: context.canvas.height - 60}),
        rightButton = new Button(context, {width: context.canvas.width / 2, height: context.canvas.height - 60});

    leftButton.layout(context.canvas.width / 4, context.canvas.height / 2 - 60, 0, 0);
    rightButton.layout(context.canvas.width / 4 * 3, context.canvas.height / 2 - 60, 0, 0);

    // Physics stuff
    var timeScale = 1,      // 0 <= timeScale < infinity
        sampleCount = 1;    // Number of physics runs per frame
    
    // Level related stuff
    var levelGravity = 7.8,
        levelEnvironmentDensity = Physics.densityAir * 6,
        levelMinY = 0,
        levelMaxY = 0;
        
    // Animators
    var drawRealTimeAnimator = new Animator();
    
    // Camera (all parameters are defined in world space (meters))
    var cameraWidth = context.canvas.width / PPM,       // meters
        cameraHeight = context.canvas.height / PPM,     // meters
        cameraDefaultOffsetY = cameraHeight / 2 - 2,    // meters
        camera = new Camera(cameraWidth / 2, 0, cameraWidth, cameraHeight);
    camera.setOffsetY(cameraDefaultOffsetY);
    
    // Create spatial maps
    var solidBodies = new SpatialMap("geometry.solid.aabb", 2),     // Solid shapes
        effectBodies = new SpatialMap("geometry.effect.aabb", 2),   // Effect areas
        backgroundBodies = new SpatialMap(null, 3);                 // Background objects 
          
    // Prepare polygons
    // Egg polygon
    var eggPoly = new Poly(resources.eggDescription.vertices, {
        image: resources.eggImages,
        imageIndex: resources.eggImages.length - 1,
        width: resources.eggDescription.imageWidth,
        height: resources.eggDescription.imageHeight,
        offsetX: resources.eggDescription.imageOffsetX,
        offsetY: resources.eggDescription.imageOffsetY
    });
    // Meteor polygons
    var meteorPolygons = [];
    for (var i = 0; i < resources.meteorDescriptions.length; i++) {
        meteorPolygons[i] = new Poly(resources.meteorDescriptions[i].vertices, {
            image: resources.meteorImages[i],
            width: resources.meteorDescriptions[i].imageWidth,
            height: resources.meteorDescriptions[i].imageHeight,
            offsetX: resources.meteorDescriptions[i].imageOffsetX,
            offsetY: resources.meteorDescriptions[i].imageOffsetY
        });
    }
    // Metal thingy polygon
    var metalBallPoly = new Poly(resources.metalBallDescription.vertices, {
        image: resources.metalBallImage,
        width: resources.metalBallDescription.imageWidth,
        height: resources.metalBallDescription.imageHeight,
        offsetX: resources.metalBallDescription.imageOffsetX,
        offsetY: resources.metalBallDescription.imageOffsetY
    });
    
    // Create player
    var player = new Player({solid: eggPoly}, cameraWidth / 2, 1, 0, Physics.densityEgg);
    player.addEventListener(Player.EVENT_HEALTH_CHANGED, function(eventName, health) {
        self.dispatchEvent(Game.EVENT_PLAYER_HEALTH_CHANGED, health);
        if (health === 0) {
            drawRealTimeAnimator.animate(cameraDefaultOffsetY, 0, 1000, easeOutPower3, camera.setOffsetY);
        } else {
            camera.setOffsetY(cameraDefaultOffsetY);
        }
    });
    player.addEventListener(Player.EVENT_SCORE_CHANGED, function(eventName, score) {
        self.dispatchEvent(Game.EVENT_PLAYER_SCORE_CHANGED, score);
    });    
    
    /**
     * @param {number} dt Simulation length (delta time) in milliseconds.
     */
    this.simulatePhysics = function(dt) {
        
        if (dt > 50) dt = 50;   // Don't simulate too much if game is running like crap
        dt *= 0.001;            // Convert milliseconds to seconds
        dt *= timeScale;        // Apply time scale to allow slow-mo effects
		        
        var samplesLeft = sampleCount,
            sampleDt = dt / sampleCount,
            intersectionData = {},
            i,
            bodies,
            body,
            forceOnPlayer = new Vec2(0, 0);
        
        var playerHealthLossX = player.linearVelocity.x,
            playerHealthLossY = player.linearVelocity.y;
        
        while (samplesLeft--) {
            var currentEnvironmentDensity = levelEnvironmentDensity;
            
            forceOnPlayer.y = (levelGravity + (player.position.y / 200)) * player.mass;
            forceOnPlayer.x = 0;
                        
            if (KEYS.isDown(68) || KEYS.isDown(39) || rightButton.isPressed()) { // Right
                forceOnPlayer.x += 28000;
            } 

            if (KEYS.isDown(65) || KEYS.isDown(37) || leftButton.isPressed()) { // Left
                forceOnPlayer.x += -28000;
            }

            /*if (KEYS.isDown(83) || KEYS.isDown(40)) { // Down
                forceOnPlayer.y += 10000;
            }

            if (KEYS.isDown(87) || KEYS.isDown(38)) { // Up
                forceOnPlayer.y -= 2000;
            }
            
            // TODO:
            if (KEYS.isDown(13)) {
                player.setHealth(0);
            }*/
            
            // Apply air drag
            // TODO: cross section area
            forceOnPlayer.x += Physics.calculateDragForce1d(player.linearVelocity.x, currentEnvironmentDensity, Physics.dragCoeffCube, 10);
            forceOnPlayer.y += Physics.calculateDragForce1d(player.linearVelocity.y, currentEnvironmentDensity, Physics.dragCoeffCube, 10);

            // Check and apply force-based obstacle effects on player
            bodies = effectBodies.queryRect(player.geometry.solid.aabb);
            for (i = 0; i < bodies.length; i++) {
                body = bodies[i];
                if (Physics.intersectPolyPoly(player.geometry.solid, body.geometry.effect, intersectionData, false)) {
                    var distanceSqr = (player.position.x - body.position.x) * (player.position.x - body.position.x) + (player.position.y - body.position.y) * (player.position.y - body.position.y); // TODO: perf
                    forceOnPlayer.x -= 40000 * intersectionData.normal.x / Math.sqrt(distanceSqr);
                    forceOnPlayer.y -= 40000 * intersectionData.normal.y / Math.sqrt(distanceSqr);
                }
            }
            
            // Move and rotate player
            player.applyForceAndTorque(
                forceOnPlayer,
                Physics.calculateDragForce1d(player.angularVelocity, currentEnvironmentDensity, Physics.dragCoeffCube, 5), // TODO:
                sampleDt);

            // Check and resolve collisions between player and obstacles
            bodies = solidBodies.queryRect(player.geometry.solid.aabb);
            for (i = 0; i < bodies.length; i++) {
                body = bodies[i];
                if (Physics.intersectPolyPoly(player.geometry.solid, body.geometry.solid, intersectionData, true)) {
                    Physics.resolveCollision(player, body, intersectionData);
                }
            }
            
        }

        playerHealthLossX = player.linearVelocity.x - playerHealthLossX;
        playerHealthLossY = player.linearVelocity.y - playerHealthLossY;
        
        var playerDtVelocitySignX = playerHealthLossX >= 0 ? 1 : -1,
            playerDtVelocitySignY = playerHealthLossY >= 0 ? 1 : -1;

        if (playerHealthLossX || playerHealthLossY) {
            playerHealthLossX /= dt * 200000;
            playerHealthLossY /= dt * 200000;

            playerHealthLossX *= player.mass;
            playerHealthLossY *= player.mass;

            playerHealthLossX = Math.abs(playerHealthLossX);
            playerHealthLossY = Math.abs(playerHealthLossY);

            playerHealthLossX = playerHealthLossX >= 1 ? playerHealthLossX : 0;
            playerHealthLossY = playerHealthLossY >= 1 ? playerHealthLossY : 0;

            var healthLoss = playerHealthLossX + playerHealthLossY;
            if (healthLoss > 0) {
                player.setHealth(player.getHealth() - healthLoss - 6);
                if (player.getHealth() > 0) {
                    camera.spring(playerHealthLossX * playerDtVelocitySignX, playerHealthLossY * -playerDtVelocitySignY);
                }
            } 
        }
            
        // TODO: Camera
        camera.setCenterY(player.position.y);
        
        // Check if level end is visible
        if(camera.getBottom() > levelMaxY - 10) {
            // generateMoreObstacles();
            //this.dispatchEvent(Game.EVENT_LEVEL_END_VISIBLE, levelMaxY);
            var max = levelMaxY;
            this.addObstacles(this.generateObstacles(player.position.y / 50 + 30, max));
            backgroundBodies.addArray(this.generateBackgroundObjects(200, max));
        }

        // Set player score
        player.setScore(player.position.y / 15);
    };
    
    // Background gradient
    var backgroundFill = context.createLinearGradient(0, 0, 0, cameraHeight);
    backgroundFill.addColorStop(0, "rgb(32, 46, 59)");
    backgroundFill.addColorStop(0.5, "rgb(65, 77, 89)");
    backgroundFill.addColorStop(1, "rgb(90, 101, 111)");
    
    this.draw = function() {
        drawRealTimeAnimator.tick(Date.now()); // milliseconds

        context.save();
        
        // Scale canvas
        context.scale(PPM, PPM);
        context.lineWidth /= PPM;
        
        // Draw background
        context.fillStyle = backgroundFill;
        context.fillRect(0, 0, camera.getWidth(), camera.getHeight());
        
            context.save();
            context.translate(-camera.getLeft(), -camera.getTop());
            var objects;
            
            // Draw background stuff
            objects = backgroundBodies.query(camera.getLeft() - 10, camera.getTop() - 10, camera.getWidth() + 20, camera.getHeight() + 20);
            objects.forEach(function(object) {
                object.drawProjected(context, camera.getLeft() + camera.getWidth() / 2, camera.getTop() + camera.getHeight() / 2, 1000 / 50);
                //obstacle.geometry.effect.debugDraw(context);
            });
            
            // Draw effect obstacles
            objects = effectBodies.query(camera.getLeft(), camera.getTop(), camera.getWidth(), camera.getHeight());
            objects.forEach(function(obstacle) {
                obstacle.geometry.effect.draw(context);
                //obstacle.geometry.effect.debugDraw(context);
            });
            
            // Draw solid obstacles
            objects = solidBodies.query(camera.getLeft(), camera.getTop(), camera.getWidth(), camera.getHeight());
            objects.forEach(function(obstacle) {
                obstacle.geometry.solid.draw(context);
                //obstacle.geometry.solid.debugDraw(context);
            });
            
            // Draw player
            player.geometry.solid.draw(context);
            //player.geometry.solid.debugDraw(context);

            context.restore();
        
        // Draw death rectangles
        if (player.getHealth() === 0) {
            context.fillStyle = "rgb(32, 46, 59)";
            context.globalAlpha = 0.9;
            var boxHeight = (cameraDefaultOffsetY - camera.getOffsetY()) * 0.8;
            context.fillRect(0, 0, camera.getWidth(), boxHeight);
            context.fillRect(0, camera.getHeight() - boxHeight, camera.getWidth(), boxHeight);
            context.globalAlpha = 1;
        }

        context.restore();
    };
    
    /**
     * @param {Body[]} obstacles
     */
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
        player.resetVelocity();
        player.setTransformation(camera.getWidth() / 2, 0, 0);
        camera.resetSpring();
    };
    
    this.getPlayerHealth = function() {
        return player.getHealth();
    };
    
    this.getPlayerScore = function() {
        return player.getScore();
    };
    
    this.setTimeScale = function(newTimeScale) {
        timeScale = (newTimeScale > 0) ? newTimeScale : 0;
    };
    
    this.dissableControls = function() {
        leftButton.setClickable(false);
        rightButton.setClickable(false);
    };
    
    this.enableControls = function() {
        leftButton.setClickable(true);
        rightButton.setClickable(true);
    };
    
    this.generateObstacles = function(numberOfObstacles, offsetY) {
        //solidBodies.add(new Body({solid: new Poly(obstacleVertices[0], obstacleTextureDescriptions[0])}, cameraWidth / 2, 8, 0, Number.POSITIVE_INFINITY));

        var height = cameraHeight * 20,
            width = cameraWidth,
            obstacleArray = [],
            obstacleVerticleSpacing = height / numberOfObstacles,
            random,
            body;

        var leftWall = new Body({solid: new Poly([0, 0, 1, 0, 1, height + 20, 0, height + 20], {image: null})}, -0.5, offsetY + height / 2, 0, Number.POSITIVE_INFINITY),
            rightWall = new Body({solid: new Poly([0, 0, 1, 0, 1, height + 20, 0, height + 20], {image: null})}, cameraWidth + 0.5, offsetY + height / 2, 0, Number.POSITIVE_INFINITY);

        leftWall.restitution = 0;
        leftWall.friction = 0.1;
        rightWall.restitution = 0;
        rightWall.friction = 0.1;
        obstacleArray.push(leftWall);
        obstacleArray.push(rightWall);

        for (var i = 0; i < numberOfObstacles; i++){
            offsetY += obstacleVerticleSpacing;

            if (Math.random() > 0.075) {
                random = Math.floor(Math.random() * meteorPolygons.length);
                body = new Body({solid: meteorPolygons[random].shallowClone()}, Math.random() * width, offsetY, 0, Number.POSITIVE_INFINITY);
                obstacleArray.push(body);
            } else {
                body = new Body({solid: metalBallPoly.shallowClone(), effect: Poly.createCircle(16, 10, {image: resources.gravityGradientImage, width: 20, height: 20})}, Math.random() * width, offsetY, 0, Number.POSITIVE_INFINITY);
                obstacleArray.push(body);
            }
        }

        return obstacleArray;
    };
    
    this.generateBackgroundObjects = function(numberOfObstacles, offsetY) {
        var height = cameraHeight * 20,
            width = cameraWidth,
            backgroundBodies = [],
            obstacleVerticleSpacing = height / numberOfObstacles,
            random,
            body;
        
        for (var i = 0; i < numberOfObstacles; i++){
            offsetY += obstacleVerticleSpacing;
            
            random = Math.floor(Math.random() * meteorPolygons.length);
            body = new BackgroundBody(
                resources.backgroundObstaclesBlur2[random],
                Math.random() * width,
                offsetY,
                Math.random() * -10 - 2,
                resources.meteorDescriptions[random].imageWidth,
                resources.meteorDescriptions[random].imageHeight
            );
        
            backgroundBodies.push(body);
        }

        return backgroundBodies;
    };
}

Game.EVENT_LEVEL_END_VISIBLE = "GAME_LEVEL_END_VISIBLE";
Game.EVENT_PLAYER_HEALTH_CHANGED = "GAME_PLAYER_HEALTH_CHANGED";
Game.EVENT_PLAYER_SCORE_CHANGED = "GAME_PLAYER_SCORE_CHANGED";
