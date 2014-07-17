var canvas = document.getElementById("game"),
	context = canvas.getContext("2d"),
	frameRequestId = null;

canvas.width = 500;
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
var cameraY = 0;

var	dragCoeff = 1.2,
	airDensity = 50.2754,
	crossSectionalArea = 0.09,
	g = 1.8;
	
var player = new Body(canvas.width / 2 - 25, 100, 50, 100, 100);
player.draw = function(context) {
	context.fillStyle = "rgba(0, 0, 0, 1)"
	context.fillRect(this.x, this.y - cameraY, this.width, this.height);
}

var obstacle = new Body(canvas.width / 2 - 100, 100, 200, 100, 100);
obstacle.draw = function(context, colided) {
	context.fillStyle = colided ? "rgba(255, 0, 0, 1)" : "rgba(0, 0, 0, 1)"
	context.fillRect(this.x, this.y - cameraY, this.width, this.height);
}

bg = new Image();
bg.src = "img/bg.jpg";
bg.onload = requestFrame;
	
function draw(dt) {
	dt *= 0.001; // ms to s
	
	// TODO: fix this mess...
	var fVertical = 0;
		fVerticalDrag = 0;
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
						? (player.velocityX * player.velocityX) * 50
						: -(player.velocityX * player.velocityX) * 50;
		player.velocityX *= 0.9; 
	}
	
	if (KEYS.isDown(83)) {
		fVertical += 1000;
	}
	
	if (KEYS.isDown(87)) {
		fVertical -= 1000;
	}

	fVertical += g * player.mass;
	fVerticalDrag += player.velocityY > 0 
						? 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY
						: -0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
	
	player.applyForce(fHorizontal - fHorizontalDrag, fVertical - fVerticalDrag, dt);
	if (player.x < 0) {
		player.x = 0;
		player.velocityX = 0;
	} else if (player.x + player.width > canvas.width) {
		player.x = canvas.width - player.width;
		player.velocityX = 0;
	}
	cameraY = player.y - 100;

	//context.fillStyle = "rgba(255, 255, 255, 1)"
	//context.fillRect(0, 0, canvas.width, canvas.height);
	var offset = -cameraY % canvas.height;
	context.drawImage(bg, 0, offset + canvas.height, canvas.width, canvas.height);
	context.drawImage(bg, 0, offset, canvas.width, canvas.height);
		
	if (obstacle.y + obstacle.height < cameraY) obstacle.y += canvas.height + obstacle.height;

	obstacle.draw(context, boxIntersectsBox(obstacle, player));
	player.draw(context);

	
	console.clear();
	console.log("fVertical:       " + fVertical.toFixed(2) + " (N)");
	console.log("fVerticalDrag:   " + fVerticalDrag.toFixed(2) + " (N)");
	console.log("fHorizontal:     " + (fHorizontal - fHorizontalDrag).toFixed(2)+ " (N)");
	console.log("player velocity: " + player.velocityX.toFixed(2) + " | " + player.velocityY.toFixed(2) + " (m/s)");
	console.log("player position: " + (player.x / PIXELS_PER_METER).toFixed(2) + " | " + (player.y / PIXELS_PER_METER).toFixed(2) + " (m)");
}