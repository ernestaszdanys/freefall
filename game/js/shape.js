function Circle(centerX, centerY, radius) {
	this.radius = radius;	
	this.x = centerX - this.radius;
	this.y = centerY - this.radius;
	this.width = this.height = 2 * this.radius;
}
Circle.DRAG_COEF = 0.47;
Circle.TAU = Math.PI * 2;
Circle.prototype = {
	getCenterX : function() {
		return this.x + this.radius;
	},
	getCenterY : function() {
		return this.y + this.radius;
	},
	draw : function(context) {
        context.beginPath();
        context.arc(this.getCenterX(), this.getCenterY(), this.radius, 0, Circle.TAU);
        context.stroke();
    },
	calculateVerticalCrossSectionalArea : function() {
		return Math.PI * this.radius * this.radius;
	},
	calculateHorizontalCrossSectionalArea : function() {
		return Math.PI * this.radius * this.radius;
	}
}


function Rect(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}
Rect.DRAG_COEF = 1.05;     // TODO: find the way to calculate it. god damn...
Rect.prototype = {
	draw : function(context){
        context.rect(this.x, this.y, this.width, this.height);
		context.stroke();
    },
	calculateVerticalCrossSectionalArea : function() {
		return this.height * this.height;
	},
	calculateHorizontalCrossSectionalArea : function() {
		return this.width * this.height;
	}
}


function Poly(vertices) {
	this.vertices = vertices;
    
	// Calculate bounding box of the given polygon
    this.x = vertices[0].x;
    this.y = vertices[0].y;
    this.width = vertices[0].x;
    this.height = vertices[0].y;
    for (var i = 1; i < this.vertices.length; i++){
        if(this.vertices[i].x < this.x) this.x = this.vertices[i].x;
        if(this.vertices[i].y < this.y) this.y = this.vertices[i].y;
        if(this.vertices[i].x > this.width) this.width = this.vertices[i].x;
        if(this.vertices[i].y > this.height) this.height = this.vertices[i].y;
    }
    this.width -= this.x;
    this.height -= this.y;
	
	// Align everything to x and y axes
	for (var i = 0; i < this.vertices.length; i++){
        this.vertices[i].x -= this.x;
		this.vertices[i].y -= this.y;
    }
	this.x = this.y = 0;
}
Poly.DRAG_COEF = 1.05;     // TODO: find the way to calculate it. god damn...
Poly.prototype = {
	draw : function(context, red){   // TODO: temp
        context.beginPath();
        context.moveTo(this.vertices[this.vertices.length-1].x + this.x, this.vertices[this.vertices.length-1].y + this.y);
        for (var i = 0; i<this.vertices.length; i++){
            context.lineTo(this.vertices[i].x + this.x, this.vertices[i].y + this.y);
            context.stroke();
        }
        context.closePath();
        context.fillStyle = red ? "red" : "black";
        context.fill();
    },
	calculateVerticalCrossSectionalArea : function() {
		return this.height * this.height;
	},
	calculateHorizontalCrossSectionalArea : function() {
		return this.width * this.height;
	}
}