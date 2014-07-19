/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function Polygon(vertices, mass) {

    this.vertices = vertices;
    
    this.xMin = this.xMax = this.vertices[0].x;
    this.yMin = this.yMax = this.vertices[0].y;

    //TODO is this most effective?
    for(var i=0; i<this.vertices.length; i++){
        if(this.vertices[i].x < this.xMin) this.xMin = this.vertices[i].x;
        if(this.vertices[i].x > this.xMax) this.xMax = this.vertices[i].x;
        if(this.vertices[i].y < this.yMin) this.yMin = this.vertices[i].y;
        if(this.vertices[i].y < this.yMax) this.yMax = this.vertices[i].y;
    }
    
    //Array of normals of edges
    this.normals = [];
    for (var i=0; i<this.vertices.length; i++){
        this.normals[i] = Vec2.createNormal(this.vertices[i], this.vertices[i + 1 == this.vertices.length ? 0 : i + 1]);
    }
    
    this.mass = mass;
    this.velocityX = 0;
    this.velocityY = 0;

    var lastAX = 0,
        lastAY = 0;

    this.resetVelocityX = function() {
        lastAX = 0;
        this.velocityX = 0;
    }

    this.resetVelocityY = function() {
        lastAY = 0;
        this.velocityY = 0;
    }
    //color is just for testing
    this.draw = function(context, color){
        context.beginPath();
        context.moveTo(this.vertices[this.vertices.length-1].x, vertices[this.vertices.length-1].y);
        for (var i = 0; i<this.vertices.length; i++){
            context.lineTo(this.vertices[i].x, this.vertices[i].y);
            context.stroke();
        }
        context.closePath();
        context.fillStyle=color;
        context.fill();
    }
}

function Vertice(x, y){
    this.x = x;
    this.y = y;
}

function Projection(vertices, axis){
    this.min = MAX_VALUE;
    this.max = 0;        
    for (var i=0; i<axis.length; i++)
        for (var j=0; j<vertices.length; j++){
            if (axis[i].dot(vertices[j].x, vertices[j].y) > max)
                max = axis[i].dot(vertices[j].x, vertices[j].y);
            if (axis[i].dot(vertices[j].x, vertices[j].y) < min)
                min = axis[i].dot(vertices[j].x, vertices[j].y);
        }
}


//Returns coefficients A, B, C of line equation between 2 points Ax+Bx+C=0
Polygon.equationTwoPoints = function(x1, x2){
    var eq = new Equation(0, 0, 0);
    
    if (x1.x == x2.x){
        eq.a=0;
        eq.b=1;
        eq.c=-x1.x;
    } else
    {
        eq.a = (x2.y -x1.y)/(x2.x -x1.x);
        eq.b = -1;
        eq.c = eq.a*(-x1.x)+x1.y;
    }

    return eq;
}

Polygon.distanceTwoPoints = function(x1, x2){
    return Math.sqrt( (x2.x-x1.x)*(x2.x-x1.x)+(x2.y-x1.y)*(x2.y-x1.y) );
}

function Equation(a, b, c){
    this.a = a;
    this.b = b;
    this.c = c;
}