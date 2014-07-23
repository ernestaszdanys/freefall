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

var //dragCoeff = 1.2,
    airDensity = 50.2754,
    //crossSectionalArea = 0.09,
    g = 1.8;
	
var player = new Circle(canvas.width / 2, 100, 50, 0, 2 * Math.PI, 100);

var triangle = new Polygon([new Vec2(canvas.width / 2, 300), 
                            new Vec2(canvas.width / 2 + 100, 300),
                            new Vec2(canvas.width / 2 + 150, 350),
                            new Vec2(canvas.width / 2 + 100, 250)], 50);

	
/*function draw(dt) {
    dt *= 0.001; // ms to s

    //fix the mess
    var fVertical = g * player.mass;
        fVerticalDrag = 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
        fHorizontal = 0,
        fHorizontalDrag = 0;

    if (KEYS.isDown(68)) {
        fHorizontal += 10000;
        fHorizontalDrag += player.velocityX > 0 ? (player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX < 0) player.velocityX *= 0.2; 
    } 

    if (KEYS.isDown(65)) {
        fHorizontal += -10000;
        fHorizontalDrag += player.velocityX < 0 ? -(player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX > 0) player.velocityX *= 0.2; 
    } 	

    if (!KEYS.isDown(68) && !KEYS.isDown(65)) {
        fHorizontalDrag = player.velocityX > 0 
            ? 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY
            : -0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
        player.velocityX *= 0.9;
    }

    if (KEYS.isDown(83)) {
        fVertical += 1000;
    }

    if (KEYS.isDown(87)) {
        fVertical -= 1000;
    }

    player.applyForce(fHorizontal - fHorizontalDrag, fVertical - fVerticalDrag, dt);
    if (player.x < 0) {
        player.x = 0;
        player.resetVelocityX();
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.resetVelocityX();
    }

    context.clearRect(0, 0 ,canvas.width, canvas.height);
    player.draw(context);
    if (player.circleIntersectsPolygon(triangle, context)) triangle.draw(context, "red")
        else triangle.draw(context, "black");

    console.clear();
    console.log("fVertical:       " + fVertical.toFixed(2) + " (N)");
    console.log("fVerticalDrag:   " + fVerticalDrag.toFixed(2) + " (N)");
    console.log("fHorizontal:     " + (fHorizontal - fHorizontalDrag).toFixed(2)+ " (N)");
    console.log("player velocity: " + player.velocityX.toFixed(2) + " | " + player.velocityY.toFixed(2) + " (m/s)");
    console.log("player position: " + (player.x / PIXELS_PER_METER).toFixed(2) + " | " + (player.y / PIXELS_PER_METER).toFixed(2) + " (m)");
}
*/

var spatialMap = new SpatialHashMap(6);
spatialMap.add(new Polygon([new Vec2(canvas.width / 2 + 0, 300 ), 
                            new Vec2(canvas.width / 2 + 100, 300),
                            new Vec2(canvas.width / 2 + 150, 350),
                            new Vec2(canvas.width / 2 + 100, 250)], 50));
spatialMap.add(new Polygon([new Vec2(canvas.width / 2 + 0, 300 + 800), 
                            new Vec2(canvas.width / 2 + 100, 300 + 800),
                            new Vec2(canvas.width / 2 + 150, 350 + 800),
                            new Vec2(canvas.width / 2 + 100, 250 + 800)], 50));
							
var offsetY = 0;							
							
/*function draw(dt) {
    dt *= 0.001; // ms to s

	var fVertical = g * player.mass;
        fVerticalDrag = 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
        fHorizontal = 0,
        fHorizontalDrag = 0;

    if (KEYS.isDown(68)) {
        fHorizontal += 10000;
        fHorizontalDrag += player.velocityX > 0 ? (player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX < 0) player.velocityX *= 0.2; 
    } 

    if (KEYS.isDown(65)) {
        fHorizontal += -10000;
        fHorizontalDrag += player.velocityX < 0 ? -(player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX > 0) player.velocityX *= 0.2; 
    } 	

    if (!KEYS.isDown(68) && !KEYS.isDown(65)) {
        fHorizontalDrag = player.velocityX > 0 
            ? 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY
            : -0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
        player.velocityX *= 0.9;
    }

    if (KEYS.isDown(83)) {
        fVertical += 1000;
    }

    if (KEYS.isDown(87)) {
        fVertical -= 1000;
    }

    player.applyForce(fHorizontal - fHorizontalDrag, fVertical - fVerticalDrag, dt);
    if (player.x < 0) {
        player.x = 0;
        player.resetVelocityX();
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.resetVelocityX();
    }
	
	offsetY = player.y - 100;
	
	context.clearRect(0, 0, canvas.width, canvas.height);
		
	var obstacles = spatialMap.query(0, 0 + offsetY, canvas.width, canvas.height + offsetY);
	for(var i = 0; i < obstacles.length; i++) {
		obstacles[i].draw(context, offsetY, player.circleIntersectsPolygon(obstacles[i]));
	}
	
	player.draw(context, offsetY);
	
	//console.log(obstacles);
	
	
 //   player.draw(context);
 //   triangle.draw(context);  
}

requestFrame();

*/
	var floor = new Poly([new Vec2(0, 0), new Vec2(canvas.width, 0), new Vec2(canvas.width / 2, 50)]),
		player = new Body(new Circle(canvas.width / 2, 100, 40), 100);
		
	floor.y = canvas.height - floor.height;
	
function draw(dt) {
	dt *= 0.001; // ms to s
	context.clearRect(0, 0, canvas.width, canvas.height);

	var fVertical = g * player.mass;
        fHorizontal = 0,
        fHorizontalDrag = 0;

    if (KEYS.isDown(68)) {
        fHorizontal += 10000;
        fHorizontalDrag += player.velocityX > 0 ? (player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX < 0) player.velocityX *= 0.2; 
    } 

    if (KEYS.isDown(65)) {
        fHorizontal += -10000;
        fHorizontalDrag += player.velocityX < 0 ? -(player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX > 0) player.velocityX *= 0.2; 
    } 	

    if (!KEYS.isDown(68) && !KEYS.isDown(65)) {
        player.velocityX *= 0.9;
    }

    if (KEYS.isDown(83)) {
        fVertical += 1000;
    }

    if (KEYS.isDown(87)) {
        fVertical -= 1000;
    }

    player.applyForce(fHorizontal - fHorizontalDrag, fVertical, dt);
    if (player.x < 0) {
        player.x = 0;
        player.resetVelocityX();
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.resetVelocityX();
    }
	
	player.draw(context);
	floor.draw(context);
	
}

requestFrame();
