var Intersection = {
    pointRect: function(x, y, rect) {
        return (x >= rect.x && x <= rect.x + rect.width)
                && (y >= rect.y && y <= rect.y + rect.height);
    },
    circlePoly: function(circle, poly, intersectionData) {
        //Checks if circle is outside the bounding box
        if (!Intersection.rectRect(circle, poly)) {
            return null;
        }

        //Checks if circle touches or crosses any edge of polygon
        var v1 = new Vec2(),
                v2 = new Vec2(),
                center = new Vec2();
        var d1, d2, d3, distance, maxd, eq;

        for (var i = 0; i < poly.vertices.length; i++) {
            v1.x = poly.vertices[i].x + poly.x;
            v1.y = poly.vertices[i].y + poly.y;
            v2.x = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].x + poly.x;
            v2.y = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].y + poly.y;
            center.x = circle.getCenterX();
            center.y = circle.getCenterY();
            eq = Physics.equationTwoPoints(v1, v2);
            d1 = Physics.distanceTwoPoints(v1, center);
            d2 = Physics.distanceTwoPoints(v2, center);
            d3 = Physics.distanceTwoPoints(v1, v2);
            distance = Math.abs(eq[0] * center.x + eq[1] * center.y + eq[2]) / Math.sqrt(eq[0] * eq[0] + eq[1] * eq[1]);
            maxd = Math.sqrt(d3 * d3 + distance * distance);

            if ((distance < circle.width / 2 && (d1 < maxd && d2 < maxd)) ||
                    d1 < circle.width / 2 ||
                    d2 < circle.width / 2) {
                return true;
            }
        }

        //checks if circle center is inside the pentagon with ray casting
        var hits = 0; 


        
          //e = ((poly.x+poly.width)/poly.x)/100;
        for (var i = 0; i < poly.vertices.length; i++) {
            v1.x = poly.vertices[i].x + poly.x;
            v1.y = poly.vertices[i].y + poly.y;
            v2.x = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].x + poly.x;
            v2.y = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].y + poly.y;
            center.x = circle.getCenterX();
            center.y = circle.getCenterY();
            intersectionData = Physics.rayHitsLineSegment(v1, v2, center);
            if (Physics.rayHitsLineSegment(v1, v2, circle)) hits++;
        }
        
        console.clear();
        console.log(hits);

        if (hits % 2 == 1) return true;
        
        
    },
    rectRect: function(rect1, rect2) {
        if (rect1.x + rect1.width > rect2.x || rect1.x - rect1.width < rect2.x + rect2.width
                || rect1.y + rect1.height > rect2.y || rect1.y - rect1.height < rect2.y + rect2.height) {
            return true;
        }
        return false;
    }
}

var Physics = {};

//Returns coefficients A, B, C of line equation between 2 points Ax+Bx+C=0
Physics.equationTwoPoints = function(x1, x2) {
    var a, b, c;

    if (x1.x == x2.x) {
        a = 0;
        b = 1;
        c = -x1.x;
    } else
    {
        a = (x2.y - x1.y) / (x2.x - x1.x);
        b = -1;
        c = a * (-x1.x) + x1.y;
    }
    return [a, b, c];
}

Physics.distanceTwoPoints = function(x1, x2) {
    return Math.sqrt((x2.x - x1.x) * (x2.x - x1.x) + (x2.y - x1.y) * (x2.y - x1.y));
}

Physics.rayHitsLineSegment = function(v1, v2, ray){
    pointhit = false;
    var e = Math.abs(v1.y-v2.y)/100;
    if ((ray.y >= v1.y && ray.y <= v2.y) || (ray.y >= v2.y && ray.y <= v1.y)){
        if (ray.y == v1.y || ray.y == v2.y){
            ray.x += e;
        }
        var eq = Physics.equationTwoPoints(v1, v2);
        var x = (-eq[1]*ray.y-eq[2])/eq[0];
        
        if(x < ray.x) return true;
    }
    return false;
}