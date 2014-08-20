/*function loadImages(sources, callback) {
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
*/
"use strict";

function Menu(context, resources) {
    Observable.call(this);
    
    var self = this;
    
    var buttonCircle = new Circle(45),
        buttonClick = false,
        buttonHover = false;
    
    var gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
    gradient.addColorStop(0, 'rgba(32, 46, 59, 1.000)');
    gradient.addColorStop(0.5, 'rgba(65, 77, 89, 1.000)');
    gradient.addColorStop(1, 'rgba(90, 101, 111, 1.000)');
    
    buttonCircle.layout(context.canvas.width / 2, 559, 0, 0);
    
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
        if (buttonClick) {
            self.dispatchEvent(Menu.EVENT_START_CLICKED);
        }
    } 
    
    this.enable = function() {
        context.canvas.addEventListener("mousemove", onMouseMove, false);
        context.canvas.addEventListener("mouseup", onMouseUp, false);
        context.canvas.addEventListener("mousedown", onMouseDown, false);
    };

    this.dissable = function() {
        context.canvas.removeEventListener("mousemove", onMouseMove, false);
        context.canvas.removeEventListener("mouseup", onMouseUp, false);
        context.canvas.removeEventListener("mousedown", onMouseDown, false);
    };
    
    this.draw = function() {
        context.fillStyle = gradient;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        context.fillStyle = "rgb(32, 46, 59)";
        context.fillRect(0, 245, context.canvas.width, 185);
        context.drawImage(resources.imageLogo, (context.canvas.width - resources.imageLogo.width)/2+9, 183);
        //context.drawImage(images.button, 153, 514);

        if (buttonHover && buttonClick) { // Click
            //context.drawImage(images.button, buttonRect.x, buttonRect.y);

        } else if (buttonHover) { // Hover
            context.drawImage(resources.imageButtonRedRound, buttonCircle.x+3, buttonCircle.y+3);
            context.drawImage(resources.iconPlay, buttonCircle.x+35, buttonCircle.y+21);

        } else { // Idle
            context.drawImage(resources.imageButtonRedRound, buttonCircle.x, buttonCircle.y);
            context.drawImage(resources.iconPlay, buttonCircle.x+32, buttonCircle.y+18);
        }
    };
};
Menu.EVENT_START_CLICKED = "MENU_START_CLICKED";

function Hud(context, resources) {
    
    var score = 0,
        highScore,
        health = 0,
        count = 0,
        scoreText = new Text(context),
        ptsText = new Text(context),
        healthText = new Text(context),
        hpText = new Text(context),
        highScoreText = new Text(context),
        highScoreValueText = new Text(context);

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

    highScoreText.setText("HIGH SCORE");
    highScoreText.setSize(20);
    highScoreText.setBold(false);

    highScoreValueText.setSize(20);
    highScoreValueText.setBold(true);

    this.setHighScore = function() {
        highScore = getCookie("highscore");
    };

    this.getHighScore = function() {
        return highScore;
    };

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
        context.fillRect(0, context.canvas.height - 60, context.canvas.width, 60);
        context.globalAlpha = 1;

        // printing pts
        scoreText.setText(~~score);
        scoreText.draw(15, context.canvas.height-15);

        count = Math.floor(Math.log(score === 0 ? 1 : score) / Math.LN10) + 1;
        ptsText.draw(20 + 25 * (count === 0 ? 1 : count), context.canvas.height-15);

        // printing hp
        healthText.setText(~~health);
        count = Math.floor(Math.log(health === 0 ? 1 : health) / Math.LN10) + 1;
        healthText.draw(context.canvas.width-60 - 25 * (count === 0 ? 1 : count), context.canvas.height-15);

        hpText.draw(context.canvas.width - 55, context.canvas.height - 15);

        // printing high score
        highScoreValueText.setText(this.getHighScore());
        console.log(highScoreText.getWidth(), highScoreValueText.getWidth(), (context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2, (context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 + highScoreText.getWidth());
        highScoreText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 - 4, context.canvas.height-15);
        highScoreValueText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 + highScoreText.getWidth() + 8, context.canvas.height-15);
    };
};

function GameOver(context, resources) {
    Observable.call(this);

    var self = this;

    var score = 0,
        highScore,
        buttonCircle = new Circle(45),
        buttonClick = false,
        buttonHover = false,
        scoreText = new Text(context),
        ptsText = new Text(context),
        highScoreText = new Text(context),
        highScoreValueText = new Text(context);

    buttonCircle.layout(context.canvas.width/2, 500, 0, 0);
        
    scoreText.setSize(40);
    scoreText.setBold(true);

    ptsText.setText("PTS");
    ptsText.setSize(30);
    ptsText.setBold(false);

    highScoreText.setText("HIGH SCORE");
    highScoreText.setSize(22);
    highScoreText.setBold(false);

    highScoreValueText.setSize(22);
    highScoreValueText.setBold(true);
    
    var gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
    gradient.addColorStop(0, 'rgba(32, 46, 59, 1.000)');
    gradient.addColorStop(0.5, 'rgba(65, 77, 89, 1.000)');
    gradient.addColorStop(1, 'rgba(90, 101, 111, 1.000)');
    
    this.setScore = function(newScore) {
        score = ~~newScore;
    };
    this.getScore = function() {
        return score;
    };

    this.setHighScore = function() {
        highScore = getCookie("highscore");
    };

    this.getHighScore = function() {
        return highScore;
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
        if (buttonClick) {
            self.dispatchEvent(GameOver.EVENT_RESTART_CLICKED);
        }
    }

    this.enable = function() {
        context.canvas.addEventListener("mousemove", onMouseMove, false);
        context.canvas.addEventListener("mouseup", onMouseUp, false);
        context.canvas.addEventListener("mousedown", onMouseDown, false);
    };

    this.dissable = function() {
        context.canvas.removeEventListener("mousemove", onMouseMove, false);
        context.canvas.removeEventListener("mouseup", onMouseUp, false);
        context.canvas.removeEventListener("mousedown", onMouseDown, false);
    };

    this.draw = function() {
        context.fillStyle = gradient;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        context.fillStyle = "rgb(32, 46, 59)";
        context.fillRect(0, 245, context.canvas.width, 148);
        context.drawImage(resources.imageEggBroken, (context.canvas.width - resources.imageEggBroken.width)/2, 200);
        context.drawImage(resources.imageRibbon, (context.canvas.width - resources.imageRibbon.width)/2, 295);

        // printing pts
        scoreText.setText(score);
        scoreText.draw((context.canvas.width-scoreText.getWidth()-ptsText.getWidth())/2 - 2, 390);
        ptsText.draw((context.canvas.width-scoreText.getWidth()-ptsText.getWidth())/2 + scoreText.getWidth() + 4, 390);

        // printing high score
        highScoreValueText.setText(this.getHighScore());
        console.log(highScoreText.getWidth(), highScoreValueText.getWidth(), (context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2, (context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 + highScoreText.getWidth());
        highScoreText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 - 4, context.canvas.height-15);
        highScoreValueText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 + highScoreText.getWidth() + 8, context.canvas.height-15);

        if (buttonHover && buttonClick) { // Click
            context.drawImage(resources.imageButtonRedRound, buttonCircle.x, buttonCircle.y);
            context.drawImage(resources.iconRefresh, buttonCircle.x+19, buttonCircle.y+17);

        } else if (buttonHover) { // Hover
            context.drawImage(resources.imageButtonRedRound, buttonCircle.x+3, buttonCircle.y+3);
            context.drawImage(resources.iconRefresh, buttonCircle.x+22, buttonCircle.y+20);

        } else { // Idle
            context.drawImage(resources.imageButtonRedRound, buttonCircle.x, buttonCircle.y);
            context.drawImage(resources.iconRefresh, buttonCircle.x+19, buttonCircle.y+17);
        }
    };
};
GameOver.EVENT_RESTART_CLICKED = "GAME_OVER_RESTART_CLICKED";