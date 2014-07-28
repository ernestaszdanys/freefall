var levelGenerator = {
	 coordinates : [
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
	],

	generateObstacles : function(numberOfObstacles, canvas) {
		var offsetY = 0;
		var obstacleArray = [];
		var obstacleVerticleSpacing = 500;
		for (var i = 0; i < numberOfObstacles; i++){
			offsetY += obstacleVerticleSpacing;
			obstacleArray.push(new Body(new Poly(this.coordinates[Math.floor(Math.random() * 10) % this.coordinates.length]), new Solid(1)));
			obstacleArray[i].shape.x = (Math.floor(Math.random() * 10000)) % (canvas.width - obstacleArray[i].shape.width);
			obstacleArray[i].shape.y = offsetY;
		}
		var wallHeight = numberOfObstacles * obstacleVerticleSpacing;
		obstacleArray.push(new Body(new Poly([new Vec2(0, 0), new Vec2(20, 0), new Vec2(20, wallHeight), new Vec2(0, wallHeight)])));
		obstacleArray.push(new Body(new Poly([new Vec2(0, 0), new Vec2(20, 0), new Vec2(20, wallHeight), new Vec2(0, wallHeight)])));
		obstacleArray[obstacleArray.length-1].shape.x = canvas.width-20;
		//adding water
		/*obstacleArray.push(new Body(new Poly([new Vec2(0, 0), new Vec2(0, canvas.width), new Vec2(200, canvas.width), new Vec2(200, 0)]), new Liquid(1000)));
		obstacleArray[obstacleArray.length-1].shape.x = 0;
		obstacleArray[obstacleArray.length-1].shape.y = 1000;*/

		return obstacleArray;
	}
	
}