var canvas = document.getElementById("game"),
context = canvas.getContext("2d"),
frameRequestId = null;

canvas.width = 1280;
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

function Block(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

var PIXELS_PER_METER = 50;

var dragCoeff = 1.2,
    airDensity = 50.2754,
    crossSectionalArea = 0.09,
    g = 1.8;
	
var player = new Circle(canvas.width / 2, 100, 50, 0, 2*Math.PI, 100);



var triangle = new Polygon([new Vec2(canvas.width / 2, 300), 
                            new Vec2(canvas.width / 2+100, 300),
                            new Vec2(canvas.width / 2+150, 350),
                            new Vec2(canvas.width / 2+100, 250)], 50);

	
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

function draw(dt) {
    player.draw(context);
    triangle.draw(context);  
}

requestFrame();