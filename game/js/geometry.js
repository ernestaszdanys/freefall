/**
 * Abstract geometry class.
 * 
 * @param {type} x      Bounding box left coordinate.
 * @param {type} y      Bounding box top coordinate.
 * @param {type} width  Bounding box width.
 * @param {type} height Bounding box height.
 */
function Geometry(x, y, width, height, texture) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.texture = texture;
}

/**
 * Should be called by the parent when its position or size changes. <br>
 * Geometry implementation should layout itself and its children accordingly. <br>
 * <br>
 * Default implementation centers geometry in its parent. <br>
 * <br>
 * @param {number} parentX
 * @param {number} parentY
 * @param {number} parentWidth
 * @param {number} parentHeight
 */
Geometry.prototype.layout = function(parentX, parentY, parentWidth, parentHeight) {
    this.x = parentX + (parentWidth - this.width) * 0.5;
    this.y = parentY + (parentHeight - this.height) * 0.5;
};

/**
 * Draws bounding box...
 * 
 * @param {CanvasRenderingContext2D} context
 */
Geometry.prototype.drawBoundingBox = function(context) {
    context.strokeStyle = "rgba(0, 0, 0, 0.2)";
    context.strokeRect(this.x, this.y, this.width, this.height);
};

Geometry.prototype.drawShape = function(context) {
    this.drawBoundingBox(context);
};

Geometry.prototype.drawTextured = function(context) {
    if (this.texture !== void 0) {
        context.drawImage(this.texture, this.x, this.y, this.width, this.height);
    } else {
        // TODO: throw new Error("Geometry.texture is not defined.");
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

// TODO: documentation
function Circle(radius, texture) {
    Geometry.call(this, 
        0,           // Bounding box left coordinate.
        0,           // Bounding box top coordinate.
        2 * radius,  // Bounding box top width.
        2 * radius,   // Bounding box top height.
        texture
    );
    // TODO: what if we change the radius? A function to calculate bounding box would be neat.
    this.radius = radius;
}

Circle.prototype = Object.create(Geometry.prototype);
Circle.prototype.constructor = Circle;

Circle.TAU = Math.PI * 2;

Circle.prototype.getCenterX = function() {
    return this.x + this.radius;
};

Circle.prototype.getCenterY = function() {
    return this.y + this.radius;
};

Circle.prototype.drawShape = function(context) {
    context.beginPath();
    context.arc(this.getCenterX(), this.getCenterY(), this.radius, 0, Circle.TAU);
    context.closePath();
    context.fillStyle = "rgba(255, 0, 0, 0.2)";
    context.fill();
    context.strokeStyle = "rgba(255, 0, 0, 1)";
    context.stroke();
};

/*--------------------------------------------------------------------------------------------------------------------*/

function Poly(vertices, texture) {
    Geometry.call(this, 0, 0, 0, 0, texture);
    this.vertices = vertices;
    this.calculateBoundingBox(); // TODO: this also aligns polygon to x and y axes and resets position, it's not good if we ever want to rotate poly
}

Poly.prototype = Object.create(Geometry.prototype);
Poly.prototype.constructor = Poly;

Poly.prototype.calculateBoundingBox = function() {
    this.x = this.vertices[0].x;
    this.y = this.vertices[0].y;
    this.width = this.vertices[0].x;
    this.height = this.vertices[0].y;	
    for (var i = 1; i < this.vertices.length; i++) {
        if (this.vertices[i].x < this.x) this.x = this.vertices[i].x;
        if (this.vertices[i].y < this.y) this.y = this.vertices[i].y;
        if (this.vertices[i].x > this.width) this.width = this.vertices[i].x;
        if (this.vertices[i].y > this.height) this.height = this.vertices[i].y;
    }
    this.width -= this.x;
    this.height -= this.y;

    // Align vertices to x and y axes
    for (var i = 0; i < this.vertices.length; i++) {
        this.vertices[i].x -= this.x;
        this.vertices[i].y -= this.y;
    }
    
    this.x = 0;
    this.y = 0;
};

Poly.prototype.drawShape = function(context) {
    context.beginPath();
    context.moveTo(this.vertices[this.vertices.length - 1].x + this.x, this.vertices[this.vertices.length - 1].y + this.y);
    for (var i = 0; i < this.vertices.length; i++) {
        context.lineTo(this.vertices[i].x + this.x, this.vertices[i].y + this.y);
    }
    context.closePath();
    context.fillStyle = "rgba(0, 255, 0, 0.2)";
    context.fill();
    context.strokeStyle = "rgba(0, 255, 0, 1)";
    context.stroke();
};

/*--------------------------------------------------------------------------------------------------------------------*/

// Some old code

//function Poly2(x, y, vertices) {
//    if (!(vertices instanceof Array)) {
//        throw new Error("Parameter 3 (vertices) must be an array containing x and y coordinates of the shape. Example: [0, 0, 0, 100, 100, 100, 100, 0]");
//    }
//
//    if ((vertices.length % 2) === 1) {
//        throw new Error("Odd number of vertex components");
//    }
//    this.vertices = vertices;
//	
//    // Calculates bounding box of the given polygon
//    this.x = vertices[0];
//    this.y = vertices[1];
//    this.width = vertices[0];
//    this.height = vertices[1];	
//    for (var i = 2; i < this.vertices.length; i += 2) {
//        if (this.vertices[i] < this.x) this.x = this.vertices[i];
//        if (this.vertices[i + 1] < this.y) this.y = this.vertices[i + 1];
//        if (this.vertices[i] > this.width) this.width = this.vertices[i];
//        if (this.vertices[i + 1] > this.height) this.height = this.vertices[i + 1];
//    }
//    this.width -= this.x;
//    this.height -= this.y;
//
//    // Align everything to x and y axes
//    for (var i = 0; i < this.vertices.length; i += 2) {
//        this.vertices[i] -= this.x;
//        this.vertices[i + 1] -= this.y;
//    }
//
//    this.x = x;
//    this.y = y;
//}
//Poly2.prototype = {
//    draw: function(context) {   // TODO: temp
//        this.drawBoundingBox(context);
//
//        context.beginPath();
//        context.moveTo(this.vertices[this.vertices.length - 2] + this.x, this.vertices[this.vertices.length - 1] + this.y);
//        for (var i = 0; i < this.vertices.length; i += 2) {
//            context.lineTo(this.vertices[i] + this.x, this.vertices[i + 1] + this.y);
//        }
//        context.closePath();
//        context.fillStyle = "rgba(0, 0, 0, 0.2)";
//        context.fill();
//        context.strokeStyle = "rgba(0, 0, 0, 1)";
//        context.stroke();
//    },
//    drawBoundingBox: function(context) {
//        context.strokeStyle = "rgba(0, 0, 0, 0.1)";
//        context.strokeRect(this.x, this.y, this.width, this.height);
//    }
//};
