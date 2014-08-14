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

var images = void 0;
loadImages({
    //background : "assets/images/gui/main.png",
    logo: "assets/images/logo.png",
    button: "assets/images/button_red_round.png",
    playIcon: "assets/images/icon_play.png",
    refreshIcon: "assets/images/icon_refresh.png",
    brokenEgg: "assets/images/egg_broken.png",
    ribbon: "assets/images/ribbon.png"

}, function(loadedImages) {
    images = loadedImages;
    console.log("Menu images loaded.");
});

function Menu(context) {
    "use strict";
    
    var that = this;
    
    var buttonCircle = new Circle(canvas.width/2, 559, 45),
        buttonClick = false,
        buttonHover = false;



    function onMouseMove(event) {
        var canvasRect = context.canvas.getBoundingClientRect();
        buttonHover = Intersection.pointCircle(event.clientX - canvasRect.left, event.clientY - canvasRect.top, buttonCircle);
    }

    function onMouseUp() {
        buttonClick = false;
    }

    function onMouseDown(event) {
        var canvasRect = context.canvas.getBoundingClientRect();
        buttonClick = Intersection.pointCircle(event.clientX - canvasRect.left, event.clientY - canvasRect.top, buttonCircle);
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
            context.fillStyle = "rgb(32, 46, 59)";
            context.fillRect(0, 245, canvas.width, 185);
            context.drawImage(images.logo, (canvas.width - images.logo.width)/2+9, 183);
            //context.drawImage(images.button, 153, 514);

            if (buttonHover && buttonClick) { // Click
                //context.drawImage(images.button, buttonRect.x, buttonRect.y);

            } else if (buttonHover) { // Hover
		        context.drawImage(images.button, buttonCircle.x+3, buttonCircle.y+3);
                context.drawImage(images.playIcon, buttonCircle.x+35, buttonCircle.y+21);
                
            } else { // Idle
                context.drawImage(images.button, buttonCircle.x, buttonCircle.y);
                context.drawImage(images.playIcon, buttonCircle.x+32, buttonCircle.y+18);
            }
        }
    };
};

function Hud(context) {
    
    var score = 0,
        health = 0,
        count = 0;
        scoreText = new Text(context);
        ptsText = new Text(context);
        healthText = new Text(context);
        hpText = new Text(context);

    scoreText.setSize(40);
    scoreText.setBold(true);

    ptsText.setText("PTS");
    ptsText.setSize(30);
    ptsText.setBold(false);

    healthText.setSize(40);
    healthText.setBold(true);

    hpText.setText("HP");
    hpText.setSize(30);
    hpText.setBold(false);

    this.setScore = function(newScore) {
        score = newScore;
    };
    
    this.setHealth = function(newHealth) {
        health = newHealth;
    };
    
    this.draw = function() {
        // transparent rect in the bottom of the screen
        context.fillStyle = "rgb(32, 46, 59)";
        context.globalAlpha = 0.8;
        context.fillRect(0, canvas.height - 60, canvas.width, 60);
        context.globalAlpha = 1;

        // printing pts
        scoreText.setText(~~score);
        scoreText.draw(15, canvas.height-15);

        count = Math.floor(Math.log(score)/Math.LN10) + 1;
        ptsText.draw(20 + 25 * (count == 0 ? 1 : count), canvas.height-15);

        // printing hp
        healthText.setText(~~health);
        count = Math.floor(Math.log(health)/Math.LN10) + 1;
        healthText.draw(canvas.width-60 - 25 * (count == 0 ? 1 : count), canvas.height-15);

        hpText.draw(canvas.width - 55, canvas.height - 15);
    };
};

function GameOver(context) {
    "use strict";

    var that = this;

    var score = 0,
        buttonCircle = new Circle(canvas.width/2, 500, 45),
        buttonClick = false,
        buttonHover = false,
        scoreText = new Text(context),
        ptsText = new Text(context);

    scoreText.setSize(40);
    scoreText.setBold(true);

    ptsText.setText("PTS");
    ptsText.setSize(30);
    ptsText.setBold(false);

    this.setScore = function(newScore) {
        score = ~~newScore;
    };

    function onMouseMove(event) {
        var canvasRect = context.canvas.getBoundingClientRect();
        buttonHover = Intersection.pointCircle(event.clientX - canvasRect.left, event.clientY - canvasRect.top, buttonCircle);
    }

    function onMouseUp() {
        buttonClick = false;
    }

    function onMouseDown(event) {
        var canvasRect = context.canvas.getBoundingClientRect();
        buttonClick = Intersection.pointCircle(event.clientX - canvasRect.left, event.clientY - canvasRect.top, buttonCircle);
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
        context.fillStyle = "rgb(32, 46, 59)";
        context.fillRect(0, 245, canvas.width, 148);
        context.drawImage(images.brokenEgg, (canvas.width - images.brokenEgg.width)/2, 200);
        context.drawImage(images.ribbon, (canvas.width - images.ribbon.width)/2, 295);

        // printing pts
        scoreText.setText(score);
        scoreText.draw((canvas.width-scoreText.getWidth()-ptsText.getWidth())/2 - 2, 390);
        ptsText.draw((canvas.width-scoreText.getWidth()-ptsText.getWidth())/2 + scoreText.getWidth() + 4, 390);

        if (buttonHover && buttonClick) { // Click
            context.drawImage(images.button, buttonCircle.x, buttonCircle.y);

        } else if (buttonHover) { // Hover
            context.drawImage(images.button, buttonCircle.x+3, buttonCircle.y+3);
            context.drawImage(images.refreshIcon, buttonCircle.x+22, buttonCircle.y+20);

        } else { // Idle
            context.drawImage(images.button, buttonCircle.x, buttonCircle.y);
            context.drawImage(images.refreshIcon, buttonCircle.x+19, buttonCircle.y+17);
        }
    };
};