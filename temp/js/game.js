var canvas = document.getElementById("game"),
	context = canvas.getContext("2d"),
	frameRequestId = null;

canvas.width = 500;
canvas.height = 500;

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

Block.prototype = {
	intersects: function(other) {
		if (other instanceof Block) {
			return (Math.abs(this.x - other.x) * 2 < (this.width + other.width)) 
				&& (Math.abs(this.y - other.y) * 2 < (this.height + other.height));
		} else {
			// TODO: point
			/* return (point.x >= this.x && point.x <= this.x + this.width)
				   && (point.y >= this.y && point.y <= this.y + this.height);
			 */
			throw "TODO: point intersection";
		}
	},
	draw: function(context) {
		context.rect(this.x, this.y, this.width, this.height);
		context.stroke();
	}	
}

var PIXELS_PER_METER = 50;

var	dragCoeff = 1.2,
	airDensity = 1.2754,
	crossSectionalArea = 0.09,
	g = 9.8;
	
var player = new Body(canvas.width / 2 - 50,
					   100,
					   100,
					   100,
					   100);
					   
	player.draw = function(context) {
		context.fillStyle = "rgba(0, 0, 0, 1)"
		context.fillRect(this.x, this.y, this.width, this.height);
	}	
	
function draw(dt) {
	dt *= 0.001; // ms to s
	
	var fGravity = 0;
		fVerticalDrag = 0;
		fHorizontal = 0,
		fHorizontalDrag = 0;
	
	if (KEYS.isDown(68)) {
		fHorizontal = 10000;
		fHorizontalDrag = player.velocityX > 0 ? (player.velocityX * player.velocityX) * 10 : 0;
		if (player.velocityX < 0) player.velocityX *= 0.2; 
	} else if (KEYS.isDown(65)) {
		fHorizontal = -10000;
		fHorizontalDrag = player.velocityX < 0 ? -(player.velocityX * player.velocityX) * 10 : 0;
		if (player.velocityX > 0) player.velocityX *= 0.2; 
	} else {
		fHorizontalDrag = player.velocityX > 0 
						? (player.velocityX * player.velocityX) * 50
						: -(player.velocityX * player.velocityX) * 50;
		player.velocityX *= 0.9; 
	}
						
	player.applyForce(fHorizontal - fHorizontalDrag, fGravity - fVerticalDrag, dt);
	console.clear();
	console.log(player.velocityX + " | " + player.velocityY);

	context.fillStyle = "rgba(255, 255, 255, 1)"
	context.fillRect(0, 0, canvas.width, canvas.height);
	player.draw(context);
}
requestFrame();