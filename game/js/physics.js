var Intersection = {
    pointRect: function(x, y, rect) {
        return (x >= rect.x && x <= rect.x + rect.width)
                && (y >= rect.y && y <= rect.y + rect.height);
    },
    circlePoly: function(circle, poly, intersectionData) {
		if (!intersectionData) intersectionData = {};
		
		// Checks if circle is outside the bounding box
		if (!Intersection.rectRect(circle, poly)) return false;
		
        // Checks if circle touches or crosses any edge of polygon
        var v1 = new Vec2(), v2 = new Vec2(), center = new Vec2(circle.getCenterX(), circle.getCenterY()),
			a, b, c, d, param, closestX, closestY;
		
		// Clear intersectionData.distance
		intersectionData.distance = Number.MAX_VALUE;
		
		for (var i = 0; i < poly.vertices.length; i++) {
            v1.x = poly.vertices[i].x + poly.x;
            v1.y = poly.vertices[i].y + poly.y;
            v2.x = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].x + poly.x;
            v2.y = poly.vertices[i + 1 == poly.vertices.length ? 0 : i + 1].y + poly.y;

			a = center.x - v1.x,
			b = center.y - v1.y,
			c = v2.x - v1.x,
			d = v2.y - v1.y,
			param = (a * c + b * d) / (c * c + d * d);
		
			if (param < 0 || (v1.x == v2.x && v1.y == v2.y)) {
				closestX = v1.x;
				closestY = v1.y;
			} else if (param > 1) {
				closestX = v2.x;
				closestY = v2.y;
			} else {
				closestX = v1.x + param * c;
				closestY = v1.y + param * d;
			}

			var dx = center.x - closestX,
				dy = center.y - closestY,
				distance = Math.sqrt(dx * dx + dy * dy);

			if (intersectionData.distance > distance) {
				intersectionData.distance = distance;
				intersectionData.dx = dx;
				intersectionData.dy = dy;
			}
		}
		
		intersectionData.penetration = circle.width * 0.5 - intersectionData.distance;
		intersectionData.normalX = intersectionData.distance === 0 ? 0 : intersectionData.dx / intersectionData.distance;
		intersectionData.normalY = intersectionData.distance === 0 ? 0 : intersectionData.dy / intersectionData.distance;
		intersectionData.penetrationX = intersectionData.normalX * intersectionData.penetration;
		intersectionData.penetrationY = intersectionData.normalY * intersectionData.penetration;
		
		if (intersectionData.distance <= circle.width * 0.5) return true;

        // Checks if circle center is inside the pentagon with ray casting
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
		
        return hits % 2 == 1;
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

