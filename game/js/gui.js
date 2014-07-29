function loadImages(sources, callback) {
    var sourceCount = 0,
        loadedCount = 0,
        images = {};
    
    for (var imageName in sources) {
        if (sources.hasOwnProperty(imageName)) sourceCount++;
    }

    for (var imageName in sources) {
        if (sources.hasOwnProperty(imageName)) {
            images[imageName] = new Image();
            images[imageName].onload = function() {
                if (++loadedCount >= sourceCount) callback(images);
            };
            images[imageName].onerror = function() {
                throw new Error("Couldn't load " + imageName);
            };
            images[imageName].src = sources[imageName];
        }
    }
}

function Menu(context) {
    "use strict";
    
    var that = this;
    
    var buttonRect = {x: 50, y: 500, width: 300, height: 60},
        buttonClick = false,
        buttonHover = false,
        images;

    loadImages({
        background : "assets/images/gui/main.png",
        logo: "assets/images/gui/logoSmall.png",
        buttonIdle: "assets/images/gui/button.png",
        buttonHover: "assets/images/gui/button1.png",
        buttonClick: "assets/images/gui/button2.png"
    }, function(loadedImages) {
        images = loadedImages;
        console.log("Menu images loaded.");
    });

    function onMouseMove(event) {
        var canvasRect = context.canvas.getBoundingClientRect();
        buttonHover = Intersection.pointRect(event.clientX - canvasRect.left, event.clientY - canvasRect.top, buttonRect);
    }

    function onMouseUp() {
        buttonClick = false;
    }

    function onMouseDown(event) {
        var canvasRect = context.canvas.getBoundingClientRect();
        buttonClick = Intersection.pointRect(event.clientX - canvasRect.left, event.clientY - canvasRect.top, buttonRect);
        if (buttonClick && that.onStartClicked !== void 0) that.onStartClicked();
    } 
    
    context.canvas.addEventListener("mousemove", onMouseMove, false);
    context.canvas.addEventListener("mouseup", onMouseUp, false);
    context.canvas.addEventListener("mousedown", onMouseDown, false);
  
    this.dissable = function() {
        context.canvas.removeEventListener("mousemove", onMouseMove, false);
        context.canvas.removeEventListener("mouseup", onMouseUp, false);
        context.canvas.removeEventListener("mousedown", onMouseDown, false);
    };
    
    this.draw = function() {
        if (images) {
            context.drawImage(images.background, 0, 0);
            context.drawImage(images.logo, 0, 50);

            if (buttonHover && buttonClick) { // Hover
                context.drawImage(images.buttonClick, buttonRect.x, buttonRect.y);

            } else if (buttonHover) { // Click
		context.drawImage(images.buttonHover, buttonRect.x, buttonRect.y);
                
            } else { // Idle
                context.drawImage(images.buttonIdle, buttonRect.x, buttonRect.y);
            }
        }
    };
};

function Hud(context) {
    
    var score = 0,
        health = 0;
    
    this.setScore = function(newScore) {
        score = newScore;
    };
    
    this.setHealth = function(newHealth) {
        health = newHealth;
    };
    
    this.draw = function() {
        context.font = "20px Georgia";
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillText("Score: " + ~~score, 10, 30);
        context.fillText("Health: " + ~~health, 10, 60);
    };
};

function GameOver(context) {
    
    var score = 0,
        textGameOver = "Game Over";
    
    this.setScore = function(newScore) {
        score = ~~newScore;
    };
    
    this.draw = function() {
        // Draw background
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        // Draw "Game Over"
        context.font = "70px Georgia";
        context.fillStyle = "rgb(255, 255, 255)";
        context.fillText(textGameOver,
                (context.canvas.width - context.measureText(textGameOver).width) / 2,
                300);
        // Draw score
        var scoreText = "Score: " + score;
        context.font = "30px Georgia";
        context.fillStyle = "rgb(255, 255, 255)";
        context.fillText(
                scoreText,
                (context.canvas.width - context.measureText(scoreText).width) / 2,
                350);
    };
};