function Circle(centerX, centerY, radius) {
    this.radius = radius;
    this.position = new Vec2(centerX - this.radius, centerY - this.radius);
    this.width = this.height = 2 * this.radius;
}
Circle.TAU = Math.PI * 2;
Circle.prototype = {
    getCenterX: function() {
        return this.position.x + this.radius;
    },
    getCenterY: function() {
        return this.position.y + this.radius;
    },
    draw: function(context) {
        this.drawBoundingBox(context);

        context.beginPath();
        context.arc(this.getCenterX(), this.getCenterY(), this.radius, 0, Circle.TAU);
        context.closePath();
        context.fillStyle = "rgba(255, 0, 0, 0.2)";
        context.fill();
        context.strokeStyle = "rgba(255, 0, 0, 1)";
        context.stroke();
    },
    drawBoundingBox: function(context) {
        context.strokeStyle = "rgba(0, 0, 0, 0.1)";
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
};

function Rect(x, y, width, height) {
    this.position = new Vec2(x, y);
    this.width = width;
    this.height = height;
}
Rect.prototype = {
    draw: function(context) {
        this.drawBoundingBox(context);

        context.fillStyle = "rgba(0, 0, 255, 0.2)";
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.strokeStyle = "rgba(0, 0, 255, 1)";
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    },
    drawBoundingBox: function(context) {
        context.strokeStyle = "rgba(0, 0, 0, 0.1)";
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
};

function Poly(x, y, vertices) {
    this.vertices = vertices;
	
    // Calculates bounding box of the given polygon
    this.position = new Vec2(vertices[0].x, vertices[0].y);
    this.width = vertices[0].x;
    this.height = vertices[0].y;	
    for (var i = 1; i < this.vertices.length; i++) {
        if (this.vertices[i].x < this.position.x) this.position.x = this.vertices[i].x;
        if (this.vertices[i].y < this.position.y) this.position.y = this.vertices[i].y;
        if (this.vertices[i].x > this.width) this.width = this.vertices[i].x;
        if (this.vertices[i].y > this.height) this.height = this.vertices[i].y;
    }
    this.width -= this.position.x;
    this.height -= this.position.y;

    // Align everything to x and y axes
    for (var i = 0; i < this.vertices.length; i++) {
        this.vertices[i].x -= this.position.x;
        this.vertices[i].y -= this.position.y;
    }
    
    this.position.x = x;
    this.position.y = y;
}
Poly.prototype = {
    draw: function(context) {
        this.drawBoundingBox(context);

        context.beginPath();
        context.moveTo(this.vertices[this.vertices.length - 1].x + this.position.x, this.vertices[this.vertices.length - 1].y + this.position.y);
        for (var i = 0; i < this.vertices.length; i++) {
            context.lineTo(this.vertices[i].x + this.position.x, this.vertices[i].y + this.position.y);
        }
        context.closePath();
        context.fillStyle = "rgba(0, 255, 0, 0.2)";
        context.fill();
        context.strokeStyle = "rgba(0, 255, 0, 1)";
        context.stroke();
    },
    drawBoundingBox: function(context) {
        context.strokeStyle = "rgba(0, 0, 0, 0.1)";
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
};
/*
function Poly2(x, y, vertices) {
    this.vertices = vertices;
	
    // Calculates bounding box of the given polygon
    this.x = vertices[0];
    this.y = vertices[1];
    this.width = vertices[0];
    this.height = vertices[1];	
    for (var i = 2; i < this.vertices.length; i += 2) {
        if (this.vertices[i] < this.x) this.x = this.vertices[i];
        if (this.vertices[i+1] < this.y) this.y = this.vertices[i+1];
        if (this.vertices[i] > this.width) this.width = this.vertices[i];
        if (this.vertices[i+1] > this.height) this.height = this.vertices[i+1];
    }
    this.width -= this.x;
    this.height -= this.y;

    // Align everything to x and y axes
    for (var i = 0; i < this.vertices.length; i += 2) {
        this.vertices[i] -= this.x;
        this.vertices[i+1] -= this.y;
    }

    this.x = x;
    this.y = y;
}
Poly2.prototype = {
    draw: function(context) {   // TODO: temp
        this.drawBoundingBox(context);

        context.beginPath();
        context.moveTo(this.vertices[this.vertices.length - 2] + this.x, this.vertices[this.vertices.length - 1] + this.y);
        for (var i = 0; i < this.vertices.length; i += 2) {
            context.lineTo(this.vertices[i] + this.x, this.vertices[i+1] + this.y);
        }
        context.closePath();
        context.fillStyle = "rgba(0, 0, 0, 0.2)";
        context.fill();
        context.strokeStyle = "rgba(0, 0, 0, 1)";
        context.stroke();
    },
    drawBoundingBox: function(context) {
        context.strokeStyle = "rgba(0, 0, 0, 0.1)";
        context.strokeRect(this.x, this.y, this.width, this.height);
    }
};
*/