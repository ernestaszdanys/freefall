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

var	velocity = 0,
	position = 0,
	mass = 80,
	dragCoeff = 1.2,
	airDensity = 1.2754,
	crossSectionalArea = 0.09,
	fGravity = 9.8 * mass;
	
var player = new Block(canvas.width / 2 - 50,
					   100,
					   100,
					   100);
function draw(dt) {
	dt *= 0.001; // ms to s
    position = position + velocity * dt;
	fDrag = 0.5 * airDensity * velocity * velocity * dragCoeff * crossSectionalArea;
    velocity = velocity + ((fGravity - fDrag) / mass ) * dt;
	
	player.draw(context);
}


	

requestFrame();