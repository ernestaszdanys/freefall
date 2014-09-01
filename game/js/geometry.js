/**
 * Axis-aligned bounding box.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
function AABB(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
}

/**
 * Abstract geometry class.
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} orientation  Orientation in radians.
 */
function Geometry(x, y, orientation) {
    this.x = x || 0;
    this.y = y || 0;
    this.orientation = orientation || 0;
    this.aabb = new AABB(x, y, 0, 0);
}

/**
 * Geometry implementation should move geometry to the specified point, set its orientation, recalculate
 * axis-aligned bounding box and texture anchor point.<br>
 * <b>If one of the arguments passed to this function is non-finite number (0 is ok) or not a number at all, an
 * error must be thrown.</b><br>
 * @param {number} x            Center x.
 * @param {number} y            Center y.
 * @param {number} orientation  Orientation in radians.
 */
Geometry.prototype.setTransformation = function(x, y, orientation) {
    throw new Error("Unsupported operation. Subclass didn't override Geometry.setTransformation()");
};

/**
 * Geometry implementation should move geometry by the specified distance, increase rotation by the specified angle,
 * recalculate axis-aligned bounding box and texture anchor point.<br>
 * <b>If one of the arguments passed to this function is non-finite number (0 is ok) or not a number at all, an
 * error must be thrown.</b><br>
 * @param {number} dx           Distance along x axis.
 * @param {number} dy           Distance along y axis.
 * @param {number} dRotation    Rotation in radians.
 */
Geometry.prototype.transform = function(dx, dy, dRotation) {
    throw new Error("Unsupported operation. Subclass didn't override Geometry.transform()");
};

/**
 * @returns {number}
 */
Geometry.prototype.getArea = function() {
    throw new Error("Unsupported operation. Subclass didn't override Geometry.getArea()");
};

/**
 * Geometry implementation should return moment of inertia along z axis passing through the center of mass (0, 0).
 * Assume that mass is qual to 1.
 * @returns {number}
 */
Geometry.prototype.getInertia = function() {
    throw new Error("Unsupported operation. Subclass didn't override Geometry.getInertia()");
};

/**
 * Creates polygon object. <br>
 * Poly._templateVertices, Poly._templateNormals and Poly._offset are defined in model space and should be treated
 * as read-only, while Poly.vertices, Poly.normals and Poly.textureAnchorPoint are defined in world space and will
 * be recalculated every time Poly.setTransformation(x, y, orientation) is called.
 * <br>
 * Poly.setTransformation(x, y, orientation) is lengthy operation and should be called sparingly.
 * @param {number[] | Vec2[] | Poly} vertices
 * @param {Image} texture
 */
function Poly(vertices, texture) {
    Geometry.call(this, 0, 0, 0);

    // Shape related stuff
    if (vertices instanceof Poly) {
        // Shallow clone
        this._templateVertices = vertices._templateVertices;
        this._templateNormals = vertices._templateNormals;
        this._templateArea = vertices._templateArea;
        this._templateInertia = vertices._templateInertia;
        this._offset = vertices._offset;
    } else if (vertices instanceof Array) {
        // Create polygon from scratch
        var data = Poly.generateConvexPolyData(vertices);
        this._templateVertices = data.vertices;
        this._templateNormals = Poly.createEdgeNormalArray(data.vertices);
        this._templateArea = data.area;
        this._templateInertia = data.inertia;
        this._offset = data.offset;
    } else {
        throw new Error("Invalid polygon data. Polygon data must be either an array of vertices or an instance of Poly.");
    }
    this.vertices = Poly.cloneVertexArray(this._templateVertices);
    this.normals = Poly.cloneVertexArray(this._templateNormals);

    this.textureAnchorPoint = new Vec2(-this.offsetX, -this.offsetY);
    // TODO: Texture offset
    this.texture = texture;
};

Poly.prototype = Object.create(Geometry.prototype);
Poly.prototype.constructor = Poly;

Poly.prototype.getArea = function() {
    return this._templateArea;
};

Poly.prototype.getInertia = function() {
    return this._templateInertia;
};

Poly.prototype.getInitialOffsetX = function() {
    return this._offset.x;
};

Poly.prototype.getInitialOffsetY = function() {
    return this._offset.y;
};

/**
 * Creates a shallow clone of this polygon with the specified transformation.
 * @param {number} x
 * @param {number} y
 * @param {number} orientation
 * @returns {Poly}
 */
Poly.prototype.clone = function(x, y, orientation) {
    if (isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(orientation)) {
        return new Poly(this, x, y, orientation || this.orientation);
    } else {
        throw new Error();
    }
};

Poly.prototype.setTransformation = function(x, y, orientation) {
    if (isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(orientation)) {
        var templateVertex,
            vertex,
            sin = Math.sin(orientation),
            cos = Math.cos(orientation),
            xMin = Number.MAX_VALUE,
            yMin = Number.MAX_VALUE,
            xMax = -Number.MAX_VALUE,
            yMax = -Number.MAX_VALUE;

        // Rotate and translate vertices, find axis-aligned bounding box (aabb) and rotate normals
        for (var i = 0; i < this._templateVertices.length; i++) {
            // Rotate and translate vertices
            templateVertex = this._templateVertices[i];
            vertex = this.vertices[i];
            vertex.x = templateVertex.x * cos - templateVertex.y * sin + x;
            vertex.y = templateVertex.x * sin + templateVertex.y * cos + y;

            // Find bounding box corners
            if (vertex.x > xMax) {
                xMax = vertex.x;
            }
            if (vertex.y > yMax) {
                yMax = vertex.y;
            }
            if (vertex.x < xMin) {
                xMin = vertex.x;
            }
            if (vertex.y < yMin) {
                yMin = vertex.y;
            }

            // Rotate normals
            templateVertex = this._templateNormals[i];
            vertex = this.normals[i];
            vertex.x = templateVertex.x * cos - templateVertex.y * sin;
            vertex.y = templateVertex.x * sin + templateVertex.y * cos;
        }

        // Calculate texture anchor point
        this.textureAnchorPoint.x = -this._offset.x * cos + this._offset.y * sin + x;
        this.textureAnchorPoint.y = -this._offset.x * sin - this._offset.y * cos + y;

        this.aabb.x = xMin;
        this.aabb.y = yMin;
        this.aabb.width = xMax - xMin;
        this.aabb.height = yMax - yMin;

        this.x = x;
        this.y = y;
        this.orientation = orientation;
    } else {
        throw new Error("Can't transform by non-finite number: ", x, y, orientation);
    }
};

Poly.prototype.transform = function(x, y, orientation) {
    this.setTransformation(this.position.x + x, this.position.y + y, this.orientation + orientation);
};

Poly.prototype.drawShape = function(context) {
    // Draw imaginary texture
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.orientation);
        context.beginPath();
        context.moveTo(
            this._templateVertices[this._templateVertices.length - 1].x,
            this._templateVertices[this._templateVertices.length - 1].y
        );
        for (var i = 0; i < this._templateVertices.length; i++) {
            context.lineTo(
                this._templateVertices[i].x,
                this._templateVertices[i].y
            );
        }
        context.closePath();
        context.fillStyle = "rgba(0, 255, 0, 0.2)";
        context.fill();
        context.strokeStyle = "rgba(0, 255, 0, 1)";
        context.stroke();
    context.restore();


    /*
    context.beginPath();
    context.moveTo(
        this.vertices[this.vertices.length - 1].x,
        this.vertices[this.vertices.length - 1].y
    );
    for (var i = 0; i < this.vertices.length; i++) {
        context.lineTo(
            this.vertices[i].x,
            this.vertices[i].y
        );
    }
    context.closePath();
    context.fillStyle = "rgba(0, 255, 0, 0.2)";
    context.fill();
    context.strokeStyle = "rgba(0, 255, 0, 1)";
    context.stroke();

    context.strokeStyle = "rgba(0, 0, 0, 0.1)";

    // Draw normals
    var vertex,
        nextVertex,
        normal,
        middleX,
        middleY;

    for (var i = 0, length = this.vertices.length; i < length; i++) {
        vertex = this.vertices[i];
        nextVertex = this.vertices[(i + 1) === length ? 0 : (i + 1)];
        normal = this.normals[i];

        middleX = (vertex.x + nextVertex.x) / 2;
        middleY = (vertex.y + nextVertex.y) / 2;

        context.beginPath();
        context.moveTo(middleX, middleY);
        context.lineTo(middleX + normal.x / 10, middleY + normal.y / 10);
        context.closePath();

        context.stroke();
    }

    // Draw aabb
    context.beginPath();
    context.strokeRect(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);


    // Draw texture point anchor
    context.fillStyle = "rgba(0, 0, 255, 1)";
    context.fillRect(
        this.textureAnchorPoint.x - 2 / 100,
        this.textureAnchorPoint.y - 2 / 100,
        4 / 100,
        4 / 100
    );
*/
    context.save();
    context.translate(this.textureAnchorPoint.x, this.textureAnchorPoint.y);
    context.rotate(this.orientation);

    // Draw image
    if (this.texture) {
        context.drawImage(this.texture, 0, 0, this.texture.naturalWidth / 50, this.texture.naturalHeight / 50);
    } else {
        context.fillRect(0, 0, 1, 1);
    }

    // Restore transformation
    context.restore();
};

Poly.cloneVertexArray = function(vertices) {
    var cloned = [],
        vertex;
    for (var i = 0, length = vertices.length; i < length; i++) {
        vertex = vertices[i];
        cloned[i] = new Vec2(vertex.x, vertex.y);
    }
    return cloned;
};

Poly.createEdgeNormalArray = function(vertices) {
    var normals = [],
        v,
        v1;
    for (var i = 0, lastIndex = vertices.length - 1; i < lastIndex; i++) {
        v = vertices[i];
        v1 = vertices[i + 1];
        normals[i] = Vec2.createNormal(v, v1);
    }
    v = vertices[lastIndex];
    v1 = vertices[0];
    normals[lastIndex] = Vec2.createNormal(v, v1);
    return normals;
};

/**
 * <ul>
 *     <li><b> TODO: validate polygon winding (should be clock-wise). </b></li>
 *     <li> TODO: make sure that polygon is convex. </li>
 * </ul>
 * <ol>
 *     <li> Converts primitive numbers to vector objects (instances of Vec2) if needed. <pre>[0, 0, 1, 0, 1, 1] -> [{0, 0}, {1, 0}, {1, 1}]</pre></li>
 *     <li> Finds center of mass. </li>
 *     <li> Calculates polygon area. </li>
 *     <li> Translates vertices so that their origin (center of mass) becomes (0, 0). </li>
 *     <li> Calculates moment of inertia about an axis passing through the center of mass (assumes that mass is equal to 1). </li>
 * </ol>
 * @param {number[] | Vec2[]} vertices
 * @returns {Object} <code>{<br>vertices: Vec2[],<br> area: number,<br> inertia: number,<br> offset: Vec2<br>}</code>
 */
Poly.generateConvexPolyData = function(vertices) {
    // TODO: either write this more efficiently, or separate code into multiple functions...
    if (!(vertices instanceof Array) || vertices.length < 3) {
        throw new Error("Argument 1 (vertices) must be an array containing at least 3 vertices.");
    }

    // Parse or clone vertices
    if (typeof vertices[0] === "number") {
        // Convert primitives [x0, y0, x1, y1, ... xn, yn] to Vec2 objects [vertex0, vertex1, ... vertexn]
        if (vertices.length < 6 || vertices.length % 2 !== 0) {
            throw new Error("Array must contain even amount of vertex primitives, minimum 6.");
        } else {
            vertices = Vec2.parseVectorPrimitiveArray(vertices);
        }
    } else {
        // Just clone
        vertices = Poly.cloneVertexArray(vertices);
    }

    var v,                  // vertex[i]
        v1,                 // vertex[i + 1]
        i, 
        length = vertices.length,
        lastIndex = length - 1;

    // Calculate centroid and signed area
    // http://stackoverflow.com/questions/5271583/center-of-gravity-of-a-polygon
    var centroidX = 0,      // Centroid x
        centroidY = 0,      // Centroid y
        area = 0,           // Signed polygon area (use absolute value for the actual area)
        crossProduct;

    for (i = 0; i < lastIndex; i++) {
        v = vertices[i];
        v1 = vertices[i + 1];
        crossProduct = Vec2.vec2CrossVec2(v, v1);
        centroidX += (v.x + v1.x) * crossProduct;
        centroidY += (v.y + v1.y) * crossProduct;
        area += crossProduct;
    }
    v = vertices[lastIndex];
    v1 = vertices[0];
    crossProduct = (v.x * v1.y) - (v1.x * v.y);
    centroidX += (v.x + v1.x) * crossProduct;
    centroidY += (v.y + v1.y) * crossProduct;
    area += crossProduct;
    area /= 2;
    centroidX /= area * 6;
    centroidY /= area * 6;
    if (centroidX < 0) {
        centroidX = -centroidX;
        centroidY = -centroidY;
    } 
    area = Math.abs(area);

    // Translate vertices so that their origin (center of mass) becomes (0, 0)
    for (i = 0; i < length; i++) {
        v = vertices[i];
        v.x -= centroidX;
        v.y -= centroidY;
    }
    var offsetX = centroidX,
        offsetY = centroidY;
    centroidX = centroidY = 0;

    // Calculate moment of inertia about an axis passing through centroid (assume that mass is equal to 1)
    // http://mathoverflow.net/questions/73556/calculating-moment-of-inertia-in-2d-planar-polygon
    var inertia = 0;

    for (i = 0; i < lastIndex; i++) {
        v = vertices[i];
        v1 = vertices[i+1];
        inertia += (v.x * v.x + v.y * v.y + v.x * v1.x + v.y * v1.y + v1.x * v1.x + v1.y * v1.y) * Vec2.vec2CrossVec2(v, v1);
    }
    v = vertices[lastIndex];
    v1 = vertices[0];
    inertia += (v.x * v.x + v.y * v.y + v.x * v1.x + v.y * v1.y + v1.x * v1.x + v1.y * v1.y) * Vec2.vec2CrossVec2(v, v1);
    inertia = Math.abs(inertia);
    inertia /= area * 12;

    return {
        vertices: vertices,
        area: area,
        inertia: inertia,
        offset: new Vec2(offsetX, offsetY)
    };
};

/////**
// * Abstract geometry class.
// * 
// * @param {type} x      Bounding box left coordinate.
// * @param {type} y      Bounding box top coordinate.
// * @param {type} width  Bounding box width.
// * @param {type} height Bounding box height.
// */
//function Geometry(x, y, width, height, texture) {
//    this.x = x;
//    this.y = y;
//    this.width = width;
//    this.height = height;
//    this.texture = texture;
//}
//
///**
// * Should be called by the parent when its position or size changes. <br>
// * Geometry implementation should layout itself and its children accordingly. <br>
// * <br>
// * Default implementation centers geometry in its parent. <br>
// * <br>
// * @param {number} parentX
// * @param {number} parentY
// * @param {number} parentWidth
// * @param {number} parentHeight
// */
//Geometry.prototype.layout = function(parentX, parentY, parentWidth, parentHeight) {
//    this.x = parentX + (parentWidth - this.width) * 0.5;
//    this.y = parentY + (parentHeight - this.height) * 0.5;
//};
//
///**
// * Draws bounding box...
// * 
// * @param {CanvasRenderingContext2D} context
// */
//Geometry.prototype.drawBoundingBox = function(context) {
//    context.strokeStyle = "rgba(0, 0, 0, 0.2)";
//    context.strokeRect(this.x, this.y, this.width, this.height);
//};
//
//Geometry.prototype.drawShape = function(context) {
//    this.drawBoundingBox(context);
//};
//
//Geometry.prototype.drawTextured = function(context) {
//    if (this.texture !== void 0) {
//        context.drawImage(this.texture, this.x, this.y, this.width, this.height);
//    } else {
//        // TODO: throw new Error("Geometry.texture is not defined.");
//    }
//};
//
///*--------------------------------------------------------------------------------------------------------------------*/
//
//// TODO: documentation
//function Circle(radius, texture) {
//    Geometry.call(this, 
//        0,           // Bounding box left coordinate.
//        0,           // Bounding box top coordinate.
//        2 * radius,  // Bounding box top width.
//        2 * radius,   // Bounding box top height.
//        texture
//    );
//    // TODO: what if we change the radius? A function to calculate bounding box would be neat.
//    this.radius = radius;
//}
//
//Circle.prototype = Object.create(Geometry.prototype);
//Circle.prototype.constructor = Circle;
//
//Circle.TAU = Math.PI * 2;
//
//Circle.prototype.getCenterX = function() {
//    return this.x + this.radius;
//};
//
//Circle.prototype.getCenterY = function() {
//    return this.y + this.radius;
//};
//
//Circle.prototype.drawShape = function(context) {
//    context.beginPath();
//    context.arc(this.getCenterX(), this.getCenterY(), this.radius, 0, Circle.TAU);
//    context.closePath();
//    context.fillStyle = "rgba(255, 0, 0, 0.2)";
//    context.fill();
//    context.strokeStyle = "rgba(255, 0, 0, 1)";
//    context.stroke();
//};
//
///*--------------------------------------------------------------------------------------------------------------------*/
//
//function Poly(vertices, texture) {
//    Geometry.call(this, 0, 0, 0, 0, texture);
//    this.vertices = vertices;
//    this.calculateBoundingBox(); // TODO: this also aligns polygon to x and y axes and resets position, it's not good if we ever want to rotate poly
//}
//
//Poly.prototype = Object.create(Geometry.prototype);
//Poly.prototype.constructor = Poly;
//
//Poly.prototype.calculateBoundingBox = function() {
//    this.x = this.vertices[0].x;
//    this.y = this.vertices[0].y;
//    this.width = this.vertices[0].x;
//    this.height = this.vertices[0].y;	
//    for (var i = 1; i < this.vertices.length; i++) {
//        if (this.vertices[i].x < this.x) this.x = this.vertices[i].x;
//        if (this.vertices[i].y < this.y) this.y = this.vertices[i].y;
//        if (this.vertices[i].x > this.width) this.width = this.vertices[i].x;
//        if (this.vertices[i].y > this.height) this.height = this.vertices[i].y;
//    }
//    this.width -= this.x;
//    this.height -= this.y;
//
//    // Align vertices to x and y axes
//    for (var i = 0; i < this.vertices.length; i++) {
//        this.vertices[i].x -= this.x;
//        this.vertices[i].y -= this.y;
//    }
//    
//    this.x = 0;
//    this.y = 0;
//};
//
//Poly.prototype.drawShape = function(context) {
//    context.beginPath();
//    context.moveTo(this.vertices[this.vertices.length - 1].x + this.x, this.vertices[this.vertices.length - 1].y + this.y);
//    for (var i = 0; i < this.vertices.length; i++) {
//        context.lineTo(this.vertices[i].x + this.x, this.vertices[i].y + this.y);
//    }
//    context.closePath();
//    context.fillStyle = "rgba(0, 255, 0, 0.2)";
//    context.fill();
//    context.strokeStyle = "rgba(0, 255, 0, 1)";
//    context.stroke();
//};

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
