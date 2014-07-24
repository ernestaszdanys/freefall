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

	generateObstacles : function() {
		var offsetY = 0;
		var obstacleArray = [];
		for (var i = 0; i < 15; i++){
			offsetY += 500;
			obstacleArray.push(new Body(new Poly(this.coordinates[Math.floor(Math.random() * 10) % this.coordinates.length]), 1));
			obstacleArray[i].shape.x = (Math.floor(Math.random() * 10000)) % (canvas.width - obstacleArray[i].shape.width);
			obstacleArray[i].shape.y = offsetY;
			obstacleArray[i].shape.deadly = (Math.floor(Math.random() * 10) % 2) === 1 ? true : false;
		}
		return obstacleArray;
	}
	
}