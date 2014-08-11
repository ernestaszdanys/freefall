var Level = (function() {
	var coordinates = [
		[new Vec2(13, 0), new Vec2(26, 0), new Vec2(38, 5), new Vec2(50, 17), new Vec2(58, 32), new Vec2(61, 46), new Vec2(61, 52), new Vec2(58, 58), 
		 new Vec2(47, 61), new Vec2(34, 61), new Vec2(24, 60), new Vec2(10, 52), new Vec2(2, 39), new Vec2(0, 22), new Vec2(3, 10)],
		[new Vec2(17, 0), new Vec2(29, 0), new Vec2(56, 8), new Vec2(71, 17), new Vec2(81, 31), new Vec2(87, 46), new Vec2(85, 60), new Vec2(71, 69),
		 new Vec2(53, 72), new Vec2(36, 72), new Vec2(20, 68), new Vec2(9, 61), new Vec2(0, 42), new Vec2(0, 25), new Vec2(3, 11), new Vec2(9, 3)],
		[new Vec2(28, 0), new Vec2(43, 0), new Vec2(55, 10), new Vec2(59, 21), new Vec2(57, 34), new Vec2(45, 47), new Vec2(31, 54),
		 new Vec2(19, 54), new Vec2(4, 47), new Vec2(0, 39), new Vec2(0, 28), new Vec2(6, 12), new Vec2(20, 2)],
		[new Vec2(33, 0), new Vec2(46, 7), new Vec2(58, 19), new Vec2(70, 34), new Vec2(77, 49), new Vec2(77, 57), new Vec2(71, 65), new Vec2(54, 70), 
		 new Vec2(31, 70), new Vec2(16, 67), new Vec2(6, 61), new Vec2(1, 50), new Vec2(1, 38), new Vec2(10, 14), new Vec2(21, 1)]
	];
	
	var textures = [new Image(), new Image(), new Image(), new Image()];
	textures[0].src = 'assets/images/obstacle_1.png';
	textures[1].src = 'assets/images/obstacle_2.png';
	textures[2].src = 'assets/images/obstacle_3.png';
	textures[3].src = 'assets/images/obstacle_4.png';

	function generateObstacles(numberOfObstacles, width, height, offset) {
		var offsetY = offset || 0;
		var obstacleArray = [];
		var obstacleVerticleSpacing = height / numberOfObstacles;
		var random;

		for (var i = 0; i < numberOfObstacles; i++){
			offsetY += obstacleVerticleSpacing;
			random = Math.floor(Math.random() * 4);
			obstacleArray.push(new Body(new Poly(coordinates[random], textures[random]), new Solid(100)));
			obstacleArray[i].shape.x = (Math.floor(Math.random() * 10000)) % (width - obstacleArray[i].shape.width);
			obstacleArray[i].shape.y = offsetY;
		}
		return obstacleArray;
	}
	
	return function(airDensity, gravity, width, height, numberOfObstacles, offset) {
		this.airDensity = airDensity;
		this.gravity = gravity;
		this.width = width;
		this.height = height;
		this.numberOfObstacles = numberOfObstacles;
		this.offset = offset || 0;
		this.obstacles = generateObstacles(numberOfObstacles, width, height, offset);
	}
})();

