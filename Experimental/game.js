var canvas = document.getElementById("game"),
	context = canvas.getContext("2d"),
	frameRequestId = null;

canvas.width = 500;
canvas.height = 500;

function Player() {
	this.width = 50;
	this.height = 100;
	this.color = "rgba(0, 0, 0, 1)";

	this.draw = function(context) {
		context.fillStyle = this.color;
		context.fillRect(canvas.width / 2 - this.width / 2,
						 this.height,
						 this.width,
						 this.height);
	}
}

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

var player = new Player(),
	bg = new Image();
	bg.src = "img/bg.jpg";
	bg.onload = requestFrame;

	var offset = 0;
	
function draw(timeDiff) {
	offset -= timeDiff / 10;
	offset = offset % canvas.height;
	context.drawImage(bg, 0, offset + canvas.height, canvas.width, canvas.height);
	context.drawImage(bg, 0, offset, canvas.width, canvas.height);
	player
	
	console.log(timeDiff);
}


