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

AABB.prototype.clone = function() {
    return new AABB(this.x, this.y, this.width, this.height);
};

/**
 * Abstract geometry "class".
 * @constructor
 * @param {number} x            Center x.
 * @param {number} y            Center y.
 * @param {number} orientation  Orientation in radians.
 */
function Geometry(x, y, orientation) {
    if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(orientation)) {
        throw new Error("Invalid transformation (x: ", x, ", y: ", y, ", orientation: ", orientation, ")");
    }
    
    this._x = x;
    this._y = y;
    this._orientation = orientation;
    this.aabb = new AABB(x, y, 0, 0);
}

Geometry.prototype.getCenterX = function() {
    return this._x;
};

Geometry.prototype.getCenterY = function() {
    return this._y;
};

Geometry.prototype.getOrientation = function() {
    return this._orientation;
};

Geometry.prototype.setTransformation = function(x, y, orientation) {
    if (this._x === x && this._y === y && this._orientation === orientation) {
        return; // There's no point to calculate anything...
    } else if (isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(orientation)) {
        this._applyTransformation(x, y, orientation);
        this._x = x;
        this._y = y;
        this._orientation = orientation;
    } else {
        throw new Error("Invalid transformation (x: ", x, ", y: ", y, ", orientation: ", orientation, ")");
    }
};

/**
 * "Abstract" "protected" method. Called by Geometry.prototype.setTransformation.<br>
 * Geometry implementation should move geometry to the specified point, set its orientation, recalculate axis-aligned 
 * bounding box and texture anchor point.
 * @param {number} x            New center x.
 * @param {number} y            New center y.
 * @param {number} orientation  New orientation in radians.
 */
Geometry.prototype._applyTransformation = function(x, y, orientation) {
    throw new Error("Unsupported operation. Subclass didn't override Geometry._applyTransformation()");
};

/**
 * @returns {number}
 */
Geometry.prototype.getArea = function() {
    throw new Error("Unsupported operation. Subclass didn't override Geometry.getArea()");
};

/**
 * Geometry implementation should return moment of inertia along z axis passing through the center of mass. Assume that
 * mass is qual to 1.
 * @returns {number}
 */
Geometry.prototype.getInertia = function() {
    throw new Error("Unsupported operation. Subclass didn't override Geometry.getInertia()");
};

Geometry.prototype.draw = function(context) {
    throw new Error("Unsupported operation. Subclass didn't override Geometry.draw()");
};

Geometry.prototype.debugDraw = function(context) {
    throw new Error("Unsupported operation. Subclass didn't override Geometry.debugDraw()");
};

/**
 * @constructor
 * @param {number[] | Vec2[] | Poly.Template} vertexData    Polygon vertex data.
 * @param {type} textureDescription                         Object containing image and its width, height, offsetX and offsetY in model space.
 */
function Poly(vertexData, textureDescription) {
    Geometry.call(this, 0, 0, 0);
    
    // Protected polygon data (vertices, normals, area, inertia and initial origin point).
    // NOTE: READ-ONLY, this._template can be shared by multiple Poly instances (see Poly.prototype.shallowClone).
    // NOTE: center of this._template.vertices (the (0, 0) point) is also the center of mass
    this._template = (vertexData instanceof Poly.Template) ? vertexData : new Poly.Template(vertexData);
    
    // Transformed vertices. Recalculated every time setTransformation is called.
    this.vertices = Poly.cloneVertexArray(this._template.vertices);
    this.normals = Poly.cloneVertexArray(this._template.normals);
    
    // Texture related stuff
    this.textureAnchorPoint = new Vec2(this._template.origin.x, this._template.origin.y);
    this.textureDescription = textureDescription; // TODO: validate texture descritption
    
    // Find initial axis-aligned bounding box
    var aabb = this.aabb,
        vertex = this._template.vertices[0];
    aabb.x = vertex.x;
    aabb.y = vertex.y;
    aabb.width = vertex.x;
    aabb.height = vertex.y;
    for (var i = 1; i < this._template.vertices.length; i++) {
        vertex = this.vertices[i];
        if (vertex.x > aabb.width) {
            aabb.width = vertex.x;
        }
        if (vertex.y > aabb.height) {
            aabb.height = vertex.y;
        }
        if (vertex.x < aabb.x) {
            aabb.x = vertex.x;
        }
        if (vertex.y < aabb.y) {
            aabb.y = vertex.y;
        }
    }
    aabb.width -= aabb.x;
    aabb.height -= aabb.y;
    
    // Apply transformation
    //this.setTransformation(x, y, orientation);
}

Poly.prototype = Object.create(Geometry.prototype);
Poly.prototype.constructor = Poly;

Poly.createCircle = function(vertexCount, radius, textureDescription) {
    if (!isFiniteNumber(vertexCount) || vertexCount < 3) {
        throw new Error("Polygon circle must containt at least 3 vertices.");
    }
    
    if (!isFiniteNumber(radius)) {
        throw new Error("Radius must be a finite number.");
    }
    
    var dAngle = (Math.PI * 2) / vertexCount,
        vertices = [];
    
    for (var i = 0, angle = 0; i < vertexCount; i++, angle += dAngle) {
        vertices.push(new Vec2(radius + Math.cos(angle) * radius, radius + Math.sin(angle) * radius));
    }
    
    return new Poly(vertices, textureDescription);
};

/**
 * Creates a shallow clone of this polygon with the specified transformation.
 * @returns {Poly}
 */
Poly.prototype.shallowClone = function() {
    return new Poly(this._template, this.textureDescription);
};

Poly.prototype.getArea = function() {
    return this._template.area;
};

Poly.prototype.getInertia = function() {
    return this._template.inertia;
};

Poly.prototype._applyTransformation = function(x, y, orientation) {
    var templateVertices = this._template.vertices,
        templateNormals = this._template.normals,
        templateVertex,
        vertex,
        sin = Math.sin(orientation),
        cos = Math.cos(orientation),
        xMin = Number.MAX_VALUE,
        yMin = Number.MAX_VALUE,
        xMax = -Number.MAX_VALUE,
        yMax = -Number.MAX_VALUE;

    // Rotate and translate vertices, find axis-aligned bounding box (aabb) and rotate normals
    for (var i = 0; i < templateVertices.length; i++) {
        // Rotate and translate vertices
        templateVertex = templateVertices[i];
        vertex = this.vertices[i];
        vertex.x = templateVertex.x * cos - templateVertex.y * sin + x;
        vertex.y = templateVertex.x * sin + templateVertex.y * cos + y;

        // Find axis-aligned bounding box corners
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
        templateVertex = templateNormals[i];
        vertex = this.normals[i];
        vertex.x = templateVertex.x * cos - templateVertex.y * sin;
        vertex.y = templateVertex.x * sin + templateVertex.y * cos;
    }
    
    // Calculate texture anchor point
    this.textureAnchorPoint.x = this._template.origin.x * cos - this._template.origin.y * sin + x;
    this.textureAnchorPoint.y = this._template.origin.x * sin + this._template.origin.y * cos + y;
    
    // Set axis-aligned bounding box position, width and height
    this.aabb.x = xMin;
    this.aabb.y = yMin;
    this.aabb.width = xMax - xMin;
    this.aabb.height = yMax - yMin;
};

Poly.prototype.debugDraw = function(context) {
    // Save state
    context.save();
    
        // Draw polygon
        context.beginPath();
        context.moveTo(this.vertices[this.vertices.length - 1].x, this.vertices[this.vertices.length - 1].y);
        for (var i = 0; i < this.vertices.length; i++) {
            context.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        context.closePath();
        context.fillStyle = "rgba(0, 255, 0, 0.2)";
        context.fill();
        context.strokeStyle = "rgba(0, 255, 0, 1)";
        context.stroke();

        // Draw axis-aligned bounding box
        context.beginPath();
        context.strokeStyle = "rgba(255, 0, 0, 1)";
        context.strokeRect(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
        
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
        
    // Restore state
    context.restore();
    
// TODO: draw mass center, normals, texture anchor point, texture rectangle
//    Draw normals
//    var vertex,
//        nextVertex,
//        normal,
//        middleX,
//        middleY;
//
//    for (var i = 0, length = this.vertices.length; i < length; i++) {
//        vertex = this.vertices[i];
//        nextVertex = this.vertices[(i + 1) === length ? 0 : (i + 1)];
//        normal = this.normals[i];
//
//        middleX = (vertex.x + nextVertex.x) / 2;
//        middleY = (vertex.y + nextVertex.y) / 2;
//
//        context.beginPath();
//        context.moveTo(middleX, middleY);
//        context.lineTo(middleX + normal.x / 10, middleY + normal.y / 10);
//        context.closePath();
//
//        context.stroke();
//    }
//
//    // Draw aabb
//    context.beginPath();
//    context.strokeRect(this.aabb.x, this.aabb.y, this.aabb.width, this.aabb.height);
//
//
//    // Draw texture point anchor
//    context.fillStyle = "rgba(0, 0, 255, 1)";
//    context.fillRect(
//        this.textureAnchorPoint.x - 2 / 100,
//        this.textureAnchorPoint.y - 2 / 100,
//        4 / 100,
//        4 / 100
//    );
};

Poly.prototype.draw = function(context) {
    if (this.textureDescription !== void 0) {
        // Check if image is defined
        if (this.textureDescription.image) {
            // Save state
            context.save();

                // Apply transformation
                context.translate(this.textureAnchorPoint.x, this.textureAnchorPoint.y);
                context.rotate(this._orientation);

                // Draw image
                context.drawImage(
                    (this.textureDescription.image instanceof Array) ? this.textureDescription.image[this.textureDescription.imageIndex] : this.textureDescription.image,
                    this.textureDescription.offsetX || 0,
                    this.textureDescription.offsetY || 0,
                    this.textureDescription.width,
                    this.textureDescription.height
                );

            // Restore state
            context.restore(); 
        }
    } else {
        this.debugDraw(context);
    }
};

/**
 * Clones vertex array. Converts primitive numbers to Vec2 objects if needed.<br>
 * <pre>[0, 0, 1, 0, 1, 1] -> [{0, 0}, {1, 0}, {1, 1}]</pre>
 * @param {number[] | Vec2[]} vertices
 * @returns {Vec2[]}
 * @throws {Error} Throws an error if vertex count less than 3.
 */
Poly.cloneVertexArray = function(vertices) {    
    var i,
        cloned = [];
    
    if (!(vertices instanceof Array) || vertices.length < 3) {
        throw new Error("Illegal argument. Vertices must be an array containing at least 3 vertices.");
    }
    
    if (typeof vertices[0] === "number") {
        // Convert primitives [x0, y0, x1, y1, ... xn, yn] to Vec2 objects [vertex0, vertex1, ... vertexn]
        if (vertices.length < 6 || vertices.length % 2 !== 0) {
            throw new Error("Array must contain even number of vertex primitives, minimum 6.");
        } else {
            for (i = 0; i < vertices.length; i += 2) {
                // TODO: validate numbers?
                cloned.push(new Vec2(vertices[i], vertices[i + 1]));
            }
            return cloned;
        }
    } else {
        // Just clone
        for (i = 0; i < vertices.length; i++) {
            // TODO: validate numbers?
            cloned.push(vertices[i].clone());
        }
        return cloned;
    }
};

Poly.createEdgeNormalArray = function(vertices) {
    var normals = [],
        v,
        v1;
    for (var i = 0, lastIndex = vertices.length - 1; i < lastIndex; i++) {
        v = vertices[i];
        v1 = vertices[i + 1];
        normals.push(Vec2.createNormal(v, v1));
    }
    v = vertices[lastIndex];
    v1 = vertices[0];
    normals.push(Vec2.createNormal(v, v1));
    return normals;
};

/**
 * @constructor
 * @param {number[] | Vec2[]} vertices
 */
Poly.Template = function(vertices) {
    // TODO: split into multiple functions?
    
    // Clones vertices (also converts primitives to Vec2 objects if needed)
    vertices = Poly.cloneVertexArray(vertices);
    
    var v,  // vertex[i]
        v1, // vertex[i + 1]
        i, 
        length = vertices.length,
        lastIndex = length - 1;

    // Calculate centroid and signed area
    // http://stackoverflow.com/questions/5271583/center-of-gravity-of-a-polygon
    var centroidX = 0,  // Centroid x
        centroidY = 0,  // Centroid y
        area = 0,       // Signed polygon area (use absolute value for the actual area)
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

    // Translate vertices so that polygon center of mass becomes (0, 0) in model space
    for (i = 0; i < length; i++) {
        v = vertices[i];
        v.x -= centroidX;
        v.y -= centroidY;
    }

    // Calculate moment of inertia about an axis passing through (0, 0) (assume that mass is equal to 1)
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

    this.vertices = vertices;
    this.normals = Poly.createEdgeNormalArray(vertices);
    this.area = area;
    this.inertia = inertia;
    this.origin = new Vec2(-centroidX, -centroidY);
};
