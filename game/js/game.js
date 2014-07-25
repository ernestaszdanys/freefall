var canvas = document.getElementById("game"),
context = canvas.getContext("2d"),
frameRequestId = null;

canvas.width = 400;
canvas.height = 720;

var lastTime = 0;

function requestFrame() {
    frameRequestId = window.requestAnimationFrame(onDraw);
}

function cancelFrame() {
    window.cancelAnimationFrame(frameRequestId);
}

function onDraw(time) {
    draw(time - lastTime);
    lastTime = time;
    requestFrame();
}

var PIXELS_PER_METER = 50;

var airDensity = 50.2754,
    g = 2.8;
	
var spatialMap = new SpatialHashMap(10);
var obstacles = levelGenerator.generateObstacles(1000, canvas);
spatialMap.addArray(obstacles);

var player = new Body(new Circle(canvas.width / 2, 100, 10), 100);
			
function draw(dt) {
	if (dt > 30) dt = 30;
	dt *= 0.001; // ms to s
	
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);

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
	dt = dt/4;
	for (var j = 0; j<4; j++){
		// Move player
		player.applyForce(new Vec2(fHorizontal, fVertical), dt);
		var cameraY = player.shape.y - player.shape.height * 2;
		
		// Find obstacle
		var obstacles = spatialMap.query(0, cameraY, canvas.width, canvas.height + cameraY);

		// Check collision between player and obstacles
		var data = {}, intersects = false;
		for(var i = 0; i < obstacles.length; i++) {
			intersects = Intersection.circlePoly(player.shape, obstacles[i].shape, data);
			
			// Resolve collision (if any)
			if (intersects && data.penetration >= 0) {
				player.shape.x += data.penetrationX;
				player.shape.y += data.penetrationY;
				player.velocity.reflectAlongNormal(new Vec2(data.normalX, data.normalY), 0.3);
			}
		}
	}
	context.setTransform(1, 0, 0, 1, 0, -cameraY);
	
	// Draw stuff
	for(var i = 0; i < obstacles.length; i++) obstacles[i].shape.draw(context);		
	player.draw(context);
}

requestFrame();
