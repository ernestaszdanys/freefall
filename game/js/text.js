var fontStrokeRatio = 1/40;

WebFontConfig = {
	google: { families: [ 'Bitter:400,700:latin,latin-ext' ] }
};
(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
		'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

function Text(message, x, y) {
	this.message = message;
	this.x = x;
	this.y = y;
	this.height;
	this.width;
	this.size;
}

Text.prototype = {
	draw: function(context) {
		context.font = "bold " + (this.size + fontStrokeRatio*this.size) + 'px ' + 'Bitter';
		context.lineWidth = 6;
		context.strokeStyle = "rgba(0, 0, 0, 0.2)";
		context.strokeText(this.message, this.x - fontStrokeRatio*this.size, this.y + fontStrokeRatio*this.size);
		
		context.font = "bold " + this.size + 'px ' + 'Bitter';
		context.fillStyle = "rgba(255, 255, 255, 1)";
		context.fillText(this.message, this.x, this.y);
		
		context.fillStyle = "rgba(198, 212, 222, 1)";
		context.fillText(this.message, this.x, this.y + 2);
	},
	setText: function(message) {
		this.message = message;
	},
	getText: function() {
		return this.message;
	},
	setSize: function(size) {
		this.size = size
	},
	setWidth: function(width) {
		this.width = width;
	},
	setHeight: function(height) {
		this.height = height;
	},
	getWidth: function() {
		return this.width;
	},
	getHeight: function() {
		return this.height;
	}
}