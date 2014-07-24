var canvas = document.getElementById("game"),
context = canvas.getContext("2d"),
frameRequestId = null;

canvas.width = 400;
canvas.height = 720;

var lastTime = 0;
var game = { state : "stop" };
var score = 0;

function requestFrame() {
    frameRequestId = window.requestAnimationFrame(onDraw);
}

function cancelFrame() {
    window.cancelAnimationFrame(frameRequestId);
}

function onDraw(time) {
    draw(time - lastTime);
    lastTime = time;
    requestFrame();
}

var PIXELS_PER_METER = 50;

var //dragCoeff = 1.2,
    airDensity = 50.2754,
    //crossSectionalArea = 0.09,
    g = 1.8;
	
var player = new Circle(canvas.width / 2, 100, 50, 0, 2 * Math.PI, 100);

var triangle = new Polygon([new Vec2(canvas.width / 2, 300), 
                            new Vec2(canvas.width / 2 + 100, 300),
                            new Vec2(canvas.width / 2 + 150, 350),
                            new Vec2(canvas.width / 2 + 100, 250)], 50);

	
/*function draw(dt) {
    dt *= 0.001; // ms to s

    //fix the mess
    var fVertical = g * player.mass;
        fVerticalDrag = 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
        fHorizontal = 0,
        fHorizontalDrag = 0;

    if (KEYS.isDown(68)) {
        fHorizontal += 10000;
        fHorizontalDrag += player.velocityX > 0 ? (player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX < 0) player.velocityX *= 0.2; 
    } 

    if (KEYS.isDown(65)) {
        fHorizontal += -10000;
        fHorizontalDrag += player.velocityX < 0 ? -(player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX > 0) player.velocityX *= 0.2; 
    } 	

    if (!KEYS.isDown(68) && !KEYS.isDown(65)) {
        fHorizontalDrag = player.velocityX > 0 
            ? 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY
            : -0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
        player.velocityX *= 0.9;
    }

    if (KEYS.isDown(83)) {
        fVertical += 1000;
    }

    if (KEYS.isDown(87)) {
        fVertical -= 1000;
    }

    player.applyForce(fHorizontal - fHorizontalDrag, fVertical - fVerticalDrag, dt);
    if (player.x < 0) {
        player.x = 0;
        player.resetVelocityX();
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.resetVelocityX();
    }

    context.clearRect(0, 0 ,canvas.width, canvas.height);
    player.draw(context);
    if (player.circleIntersectsPolygon(triangle, context)) triangle.draw(context, "red")
        else triangle.draw(context, "black");

    console.clear();
    console.log("fVertical:       " + fVertical.toFixed(2) + " (N)");
    console.log("fVerticalDrag:   " + fVerticalDrag.toFixed(2) + " (N)");
    console.log("fHorizontal:     " + (fHorizontal - fHorizontalDrag).toFixed(2)+ " (N)");
    console.log("player velocity: " + player.velocityX.toFixed(2) + " | " + player.velocityY.toFixed(2) + " (m/s)");
    console.log("player position: " + (player.x / PIXELS_PER_METER).toFixed(2) + " | " + (player.y / PIXELS_PER_METER).toFixed(2) + " (m)");
}
*/

var spatialMap = new SpatialHashMap(6);
var obstacles = levelGenerator.generateObstacles();
spatialMap.addArray(obstacles);
							
var offsetY = 0;							
							
/*function draw(dt) {
    dt *= 0.001; // ms to s

	var fVertical = g * player.mass;
        fVerticalDrag = 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
        fHorizontal = 0,
        fHorizontalDrag = 0;

    if (KEYS.isDown(68)) {
        fHorizontal += 10000;
        fHorizontalDrag += player.velocityX > 0 ? (player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX < 0) player.velocityX *= 0.2; 
    } 

    if (KEYS.isDown(65)) {
        fHorizontal += -10000;
        fHorizontalDrag += player.velocityX < 0 ? -(player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX > 0) player.velocityX *= 0.2; 
    } 	

    if (!KEYS.isDown(68) && !KEYS.isDown(65)) {
        fHorizontalDrag = player.velocityX > 0 
            ? 0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY
            : -0.5 * crossSectionalArea * airDensity * dragCoeff * player.velocityY * player.velocityY;
        player.velocityX *= 0.9;
    }

    if (KEYS.isDown(83)) {
        fVertical += 1000;
    }

    if (KEYS.isDown(87)) {
        fVertical -= 1000;
    }

    player.applyForce(fHorizontal - fHorizontalDrag, fVertical - fVerticalDrag, dt);
    if (player.x < 0) {
        player.x = 0;
        player.resetVelocityX();
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.resetVelocityX();
    }
	
	offsetY = player.y - 100;
	
	context.clearRect(0, 0, canvas.width, canvas.height);
		
	var obstacles = spatialMap.query(0, 0 + offsetY, canvas.width, canvas.height + offsetY);
	for(var i = 0; i < obstacles.length; i++) {
		obstacles[i].draw(context, offsetY, player.circleIntersectsPolygon(obstacles[i]));
	}
	
	player.draw(context, offsetY);
	
	//console.log(obstacles);
	
	
 //   player.draw(context);
 //   triangle.draw(context);  
}

requestFrame();

*/
	var floor = new Poly([new Vec2(0, 0), new Vec2(canvas.width, 0), new Vec2(canvas.width / 2, 50)]),
		player = new Body(new Circle(canvas.width / 2, 100, 40), 100);
		
	floor.y = canvas.height - floor.height;
	
function draw(dt) {
    
	dt *= 0.001; // ms to s
	context.clearRect(0, 0, canvas.width, canvas.height);

	var fVertical = g * player.mass;
        fHorizontal = 0,
        fHorizontalDrag = 0;

    if (KEYS.isDown(68)) {
        fHorizontal += 10000;
        fHorizontalDrag += player.velocityX > 0 ? (player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX < 0) player.velocityX *= 0.2; 
    } 

    if (KEYS.isDown(65)) {
        fHorizontal += -10000;
        fHorizontalDrag += player.velocityX < 0 ? -(player.velocityX * player.velocityX) * 10 : 0;
        if (player.velocityX > 0) player.velocityX *= 0.2; 
    } 	

    if (!KEYS.isDown(68) && !KEYS.isDown(65)) {
        player.velocityX *= 0.9;
    }

    if (KEYS.isDown(83)) {
        fVertical += 1000;
    }

    if (KEYS.isDown(87)) {
        fVertical -= 1000;
    }

    player.applyForce(fHorizontal - fHorizontalDrag, fVertical, dt);
    if (player.x < 0) {
        player.x = 0;
        player.resetVelocityX();
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.resetVelocityX();
    }
	
//	player.draw(context);
//	floor.draw(context, Intersection.circlePoly(player.shape, floor));
	/*
	var obs = spatialMap.query(0, 0, canvas.width, canvas.height);
	//console.log(obs);
	for (var i = 0; i < obs.length; i++) {
		obs[i].draw(context);
	}
	*/

    gui.draw(context);
    
    if (game.state == "play") {
        
        context.clearRect(0, 0, canvas.width, canvas.height);
//        context.fillStyle = "#ffffff";
//        context.fillRect(0,0,canvas.width, canvas.height);
        
        player.draw(context);
        floor.draw(context, Intersection.circlePoly(player.shape, floor));
        
        //score +=1;
        
        context.font="20px Georgia";
        context.fillText("Score: ",10,30);
        context.fillText(score,80,30);
        
        context.font="20px Georgia";
        context.fillText("P.Velocity: ",10,60);
        context.fillText(player.velocityY.toFixed(2),120,60);
        

        
        if (player.velocityY.toFixed(2) > 10 && player.velocityY.toFixed(2) < 20) {
            score +=10;
            context.font="20px Georgia";
            context.fillText("+ 10 Points: ",10,90);
            //console.log("Plus 10 points", + score);
        } else if (player.velocityY.toFixed(2) > 20) {
            score +=20;
            context.font="20px Georgia";
            context.fillText("+ 20 Points: ",10,90);
            //console.log("Plus 20 points", + score);
        } else {
            score +=5;
            //console.log("Plus 5 points", + score);
        }
        
//        //if (player.velocityY.toFixed(2) >=  100) {
        if (score >= 5000) {
            score = 5000;
            context.rect(0,0,canvas.width, canvas.height);
            context.fillStyle="rgb(0, 0, 0)";
            context.fill();
            
            context.font="70px Georgia";
            context.fillStyle = 'rgb(255, 255, 255)';
            context.fillText("Score: ",10,300);
            context.fillStyle = 'rgb(255, 255, 255)';
            context.fillText(score,200,300);
        }
        
//        if (player.velocityY.toFixed(2) <= 10) {
//                score += 10;
            
                //score += player.velocityY.toFixed(0);
//            if (score >= 500) {
//        
//        
//        context.rect(0,0,canvas.width, canvas.height);
//        context.fillStyle="rgb(0, 0, 0)";
//        context.fill();
//            
//        context.font="70px Georgia";
//        context.fillStyle = 'rgb(255, 255, 255)';
//        context.fillText("Score: ",10,300);
//        context.fillStyle = 'rgb(255, 255, 255)';
//        context.fillText(score,200,300);
//                }

//        var score = 50;
//        if (player.velocityY.toFixed(2) > score) {
//        console.log("velocity: " + score + " ok");
//        }
        
       // console.log(Math.max(50, player.velocityY.toFixed(2) ));
        
//        console.log("velocity: " + player.velocityY.toFixed(2) + " | " + (player.y) + " (m)");
    }    
}

requestFrame();
