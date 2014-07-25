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
        //Returns distance and angle in RADIANS
        var v1 = new Vec2(),
            v2 = new Vec2(),
            center = new Vec2();
        var d1, d2, d3, distance, maxd, eq;
        var angle, normal;
        center.x = circle.getCenterX();
        center.y = circle.getCenterY();

        for (var i = 0; i < poly.vertices.length; i++) {
            v1.x = poly.vertices[i].x + poly.x;
            v1.y = poly.vertices[i].y + poly.y;
            v2.x = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].x + poly.x;
            v2.y = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].y + poly.y;
            eq = Physics.equationTwoPoints(v1, v2);
            d1 = Physics.distanceTwoPoints(v1, center);
            d2 = Physics.distanceTwoPoints(v2, center);
            d3 = Physics.distanceTwoPoints(v1, v2);
            distance = Math.abs(eq[0] * center.x + eq[1] * center.y + eq[2]) / Math.sqrt(eq[0] * eq[0] + eq[1] * eq[1]);
            maxd = Math.sqrt(d3 * d3 + distance * distance);

            if ((distance < circle.width / 2 && (d1 < maxd && d2 < maxd))) {
                normal = Vec2.createNormal(poly.vertices[i], poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1], poly);
                normal.normalize();
                if (intersectionData) {
                    intersectionData.distance = distance - circle.width / 2;
                    intersectionData.normal = normal;
                }
                return true;
            }
            if (d1 >= maxd && d2 < circle.width / 2) {
                normal = new Vec2(center.x - v2.x, center.y - v2.y);
                if (intersectionData) {
                    intersectionData.distance = d2 - circle.width / 2;
                    intersectionData.normal = normal;
                }
                return true;
            }
            if (d2 >= maxd && d1 < circle.width / 2) {
                normal = new Vec2(center.x - v1.x, center.y - v1.y);
                if (intersectionData) {
                    intersectionData.distance = d1 - circle.width / 2;
                    intersectionData.normal = normal;
                }
                return true;
            }
        }

        //checks if circle center is inside the pentagon with ray casting
        var hits = 0;

        for (var i = 0; i < poly.vertices.length; i++) {
            v1.x = poly.vertices[i].x + poly.x;
            v1.y = poly.vertices[i].y + poly.y;
            v2.x = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].x + poly.x;
            v2.y = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].y + poly.y;
            center.x = circle.getCenterX();
            center.y = circle.getCenterY();
            if (Physics.rayHitsLineSegment(v1, v2, center))
                hits++;
        }
        if (hits % 2 == 1) return [0, null];

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

Physics.rayHitsLineSegment = function(v1, v2, ray) {
    var e = Math.random()/10;
    if ((ray.y > v1.y+e && ray.y < v2.y+e) || (ray.y > v2.y+e && ray.y < v1.y+e)) {
        var eq = Physics.equationTwoPoints(v1, v2);
        var x = (-eq[1] * ray.y - eq[2]) / eq[0];
        if (eq[0] == 0)
            x = v1.x;
        if (x < ray.x)
            return true;
    }
    return false;
}

