function Circle(centerX, centerY, radius) {
    this.radius = radius;
    this.x = centerX - this.radius;
    this.y = centerY - this.radius;
    this.width = this.height = 2 * this.radius;
	this.dragCoef = 0.47;
	this.crossSectionalArea = Math.PI*radius*radius/PIXELS_PER_METER/PIXELS_PER_METER;
}
Circle.TAU = Math.PI * 2;
Circle.prototype = {
    getCenterX: function() {
        return this.x + this.radius;
    },
    getCenterY: function() {
        return this.y + this.radius;
    },
    draw: function(context) {
        context.beginPath();
        context.arc(this.getCenterX(), this.getCenterY(), this.radius, 0, Circle.TAU);
        context.stroke();
    },
    calculateVerticalCrossSectionalArea: function() {
        return Math.PI * this.radius * this.radius;
    },
    calculateHorizontalCrossSectionalArea: function() {
        return Math.PI * this.radius * this.radius;
    }
}

function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Rect.prototype = {
    draw: function(context) {
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    },
    calculateVerticalCrossSectionalArea: function() {
        return this.height * this.height;
    },
    calculateHorizontalCrossSectionalArea: function() {
        return this.width * this.height;
    }
}

function Poly(vertices, image) {
    this.vertices = vertices;
	this.dragCoef = 1.05;     // TODO: find the way to calculate it. god damn...
	this.image = image;
	
    // Calculates bounding box of the given polygon
    this.x = vertices[0].x;
    this.y = vertices[0].y;
    this.width = vertices[0].x;
    this.height = vertices[0].y;	
    for (var i = 1; i < this.vertices.length; i++) {
        if (this.vertices[i].x < this.x)
            this.x = this.vertices[i].x;
        if (this.vertices[i].y < this.y)
            this.y = this.vertices[i].y;
        if (this.vertices[i].x > this.width)
            this.width = this.vertices[i].x;
        if (this.vertices[i].y > this.height)
            this.height = this.vertices[i].y;
    }
    this.width -= this.x;
    this.height -= this.y;
	
	this.crossSectionalArea = this.width * this.width/(100*50);

    // Align everything to x and y axes
    for (var i = 0; i < this.vertices.length; i++) {
        this.vertices[i].x -= this.x;
        this.vertices[i].y -= this.y;
    }
    this.x = this.y = 0;
}

Poly.prototype = {
    draw: function(context) {// TODO: temp
        // TODO: loader
		if (this.image) context.drawImage(this.image, this.x, this.y);
    },
    calculateVerticalCrossSectionalArea: function() {
        return this.height * this.height;
    },
    calculateHorizontalCrossSectionalArea: function() {
        return this.width * this.height;
    }
}