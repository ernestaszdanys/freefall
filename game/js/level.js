var Level = (function() {
	var coordinates = [
		[new Vec2(0, 70), new Vec2(70, 0), new Vec2(70, 70)], 
		[new Vec2(0, 50), new Vec2(70, 0), new Vec2(100, 100)],
		[new Vec2(0, 80), new Vec2(50, 0), new Vec2(150, 50)],
		[new Vec2(0, 50), new Vec2(50, 0), new Vec2(100, 50), new Vec2(50, 100)],
		[new Vec2(0, 80), new Vec2(50, 30), new Vec2(80, 0), new Vec2(100, 100)],
		[new Vec2(0, 120), new Vec2(80, 0), new Vec2(90, 40), new Vec2(70, 130)],
		[new Vec2(0, 45), new Vec2(90, 0), new Vec2(130, 50), new Vec2(60, 100)],
		[new Vec2(0, 100), new Vec2(40, 50), new Vec2(80, 0), new Vec2(125, 100), new Vec2(80, 150)],
		[new Vec2(0, 35), new Vec2(70, 0), new Vec2(90, 30), new Vec2(60, 60), new Vec2(30, 50)],
		[new Vec2(0, 130), new Vec2(50, 50), new Vec2(100, 50), new Vec2(80, 80), new Vec2(30, 130)]
	];

	function generateObstacles(numberOfObstacles, width, height, offset) {
		var offsetY = offset || 0;
		var obstacleArray = [];
		var obstacleVerticleSpacing = height / numberOfObstacles;
		
		
		for (var i = 0; i < numberOfObstacles; i++){
			offsetY += obstacleVerticleSpacing;			
			obstacleArray.push(new Body(new Poly(coordinates[Math.floor(Math.random() * 10) % coordinates.length]), Math.random() > 0.5 ? new Solid(1) : new Liquid(10000)));
			obstacleArray[i].shape.x = (Math.floor(Math.random() * 10000)) % (width - obstacleArray[i].shape.width);
			obstacleArray[i].shape.y = offsetY;
		}
		
		offsetY = offset || 0;
		var wallHeight = numberOfObstacles * obstacleVerticleSpacing;
		obstacleArray.push(new Body(new Poly([new Vec2(0, 0), new Vec2(20, 0), new Vec2(20, wallHeight), new Vec2(0, wallHeight)])));
		obstacleArray[obstacleArray.length-1].shape.y = offsetY;
		obstacleArray.push(new Body(new Poly([new Vec2(0, 0), new Vec2(20, 0), new Vec2(20, wallHeight), new Vec2(0, wallHeight)])));
		obstacleArray[obstacleArray.length-1].shape.x = canvas.width-20;
		obstacleArray[obstacleArray.length-1].shape.y = offsetY;

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

