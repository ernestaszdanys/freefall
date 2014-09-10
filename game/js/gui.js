"use strict";

// TODO: multiple images, hover state, remove global PXR
function Button(context, image) {
    Observable.call(this);

    var self = this;
    this.context = context;
    
    this.state = Button.State.NORMAL; // NORMAL|HOVERED|PRESSED
    
    this.x = 0;
    this.y = 0;
    this.width = image.naturalWidth;
    this.height = image.naturalHeight;
    this.image = image;
    
    this.handlePointerEvent = function(event) {
        switch (event.type) {
            // Touch event
            case "touchstart":  
                if (self.isHitByEvent(event.changedTouches[0])) {
                    self.state = Button.State.PRESSED;
                }
                break;

            case "touchend": 
                if (self.isHitByEvent(event.changedTouches[0]) && self.state === Button.State.PRESSED) {
                    self.dispatchEvent(Button.EVENT_CLICK);
                } // NOTE: no break.
            case "touchleave":
            case "touchcancel":
                self.state = Button.State.NORMAL;
                break;
                
            // Mouse event
            case "mousedown":
                if (self.isHitByEvent(event)) {
                    self.state = Button.State.PRESSED;
                }
                break;
                
            case "mouseup":
                if (self.isHitByEvent(event) && self.state === Button.State.PRESSED) {
                    self.dispatchEvent(Button.EVENT_CLICK);
                }
                self.state = Button.State.NORMAL;
                break;

        }
    };
}

Button.prototype.layout = function(parentX, parentY, parentWidth, parentHeight) {
    this.x = parentX + (parentWidth - this.width) * 0.5;
    this.y = parentY + (parentHeight - this.height) * 0.5;
};

Button.prototype.draw = function() {
    if (this.state === Button.State.NORMAL) {
        this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
        this.context.drawImage(this.image, this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    }
};

Button.prototype.isHitByEvent = function(event) {
    var canvasRect = this.context.canvas.getBoundingClientRect();
    return this.isHit((event.clientX - canvasRect.left) / PXR, (event.clientY - canvasRect.top) / PXR); // TODO: evil global
};

Button.prototype.isHit = function(x, y) {
    return (x >= this.x && x <= this.x + this.width) && (y >= this.y && y <= this.y + this.height);
};

Button.EVENT_CLICK = "BUTTON_ON_CLICK";
Button.State = {
    NORMAL: 0,
    HOVERED: 1,
    PRESSED: 2
};


function Menu(context, resources) {
    Observable.call(this);
    
    var self = this;
    
    var button = new Button(context, resources.imageButtonRedRound);
    button.layout(context.canvas.width / 2, 559, 0, 0);
    
    var gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
    gradient.addColorStop(0, 'rgba(32, 46, 59, 1.000)');
    gradient.addColorStop(0.5, 'rgba(65, 77, 89, 1.000)');
    gradient.addColorStop(1, 'rgba(90, 101, 111, 1.000)');
    
    button.addEventListener(Button.EVENT_CLICK, function() {
        self.dispatchEvent(Menu.EVENT_START_CLICKED);
    });
    
    this.enable = function() {
        context.canvas.addEventListener("touchstart", button.handlePointerEvent, false);
        context.canvas.addEventListener("touchend", button.handlePointerEvent, false);
        context.canvas.addEventListener("touchmove", button.handlePointerEvent, false);
        context.canvas.addEventListener("touchcancel", button.handlePointerEvent, false);
        context.canvas.addEventListener("touchleave", button.handlePointerEvent, false);
        context.canvas.addEventListener("mousedown", button.handlePointerEvent, false);
        context.canvas.addEventListener("mousemove", button.handlePointerEvent, false);
        // TODO: fix this monstrosity
        (context.canvas.ownerDocument.defaultView || context.canvas.ownerDocument.parentWindow)
            .addEventListener("mouseup", button.handlePointerEvent, false);
    };
    
    this.dissable = function() {
        context.canvas.removeEventListener("touchstart", button.handlePointerEvent);
        context.canvas.removeEventListener("touchend", button.handlePointerEvent);
        context.canvas.removeEventListener("touchmove", button.handlePointerEvent);
        context.canvas.removeEventListener("touchcancel", button.handlePointerEvent);
        context.canvas.removeEventListener("touchleave", button.handlePointerEvent);
        context.canvas.removeEventListener("mousedown", button.handlePointerEvent);
        context.canvas.removeEventListener("mousemove", button.handlePointerEvent);
        // TODO: fix this monstrosity
        (context.canvas.ownerDocument.defaultView || context.canvas.ownerDocument.parentWindow)
            .removeEventListener("mouseup", button.handlePointerEvent, false);    
    };
    
    this.draw = function() {
        context.fillStyle = gradient;
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        context.fillStyle = "rgb(32, 46, 59)";
        context.fillRect(0, 245, context.canvas.width, 185);
        context.drawImage(resources.imageLogo, (context.canvas.width - resources.imageLogo.width)/2+9, 183);

        button.draw(context);
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
        highScore = localStorage.getItem("highscore");
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
        highScoreValueText.setText(this.getHighScore() === null ? 0 : this.getHighScore());
        highScoreText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 - 4, context.canvas.height-15);
        highScoreValueText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 + highScoreText.getWidth() + 8, context.canvas.height-15);
    };
};

function GameOver(context, resources) {
    Observable.call(this);

    var self = this;

    var score = 0,
        highScore,
        scoreText = new Text(context),
        ptsText = new Text(context),
        highScoreText = new Text(context),
        highScoreValueText = new Text(context);

    var button = new Button(context, resources.imageButtonRedRound);
    button.layout(context.canvas.width/2, 500, 0, 0);
    button.addEventListener(Button.EVENT_CLICK, function() {
        self.dispatchEvent(GameOver.EVENT_RESTART_CLICKED);
    });
    
    var buttonFb = new Button(context, resources.facebookShare);
    buttonFb.layout(context.canvas.width/2, 600, 0, 0);
    buttonFb.addEventListener(Button.EVENT_CLICK, function() {
        console.log("whattt");
    });
    
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
        highScore = localStorage.getItem("highscore");
    };

    this.getHighScore = function() {
        return highScore;
    };

    this.enable = function() {
        context.canvas.addEventListener("touchstart", button.handlePointerEvent, false);
        context.canvas.addEventListener("touchend", button.handlePointerEvent, false);
        context.canvas.addEventListener("touchmove", button.handlePointerEvent, false);
        context.canvas.addEventListener("touchcancel", button.handlePointerEvent, false);
        context.canvas.addEventListener("touchleave", button.handlePointerEvent, false);
        context.canvas.addEventListener("mousedown", button.handlePointerEvent, false);
        context.canvas.addEventListener("mousemove", button.handlePointerEvent, false);
        // TODO: fix this monstrosity
        (context.canvas.ownerDocument.defaultView || context.canvas.ownerDocument.parentWindow)
            .addEventListener("mouseup", button.handlePointerEvent, false);
        
        context.canvas.addEventListener("touchstart", buttonFb.handlePointerEvent, false);
        context.canvas.addEventListener("touchend", buttonFb.handlePointerEvent, false);
        context.canvas.addEventListener("touchmove", buttonFb.handlePointerEvent, false);
        context.canvas.addEventListener("touchcancel", buttonFb.handlePointerEvent, false);
        context.canvas.addEventListener("touchleave", buttonFb.handlePointerEvent, false);
        context.canvas.addEventListener("mousedown", buttonFb.handlePointerEvent, false);
        context.canvas.addEventListener("mousemove", buttonFb.handlePointerEvent, false);
        // TODO: fix this monstrosity
        (context.canvas.ownerDocument.defaultView || context.canvas.ownerDocument.parentWindow)
            .addEventListener("mouseup", buttonFb.handlePointerEvent, false);
    };
    
    this.dissable = function() {
        context.canvas.removeEventListener("touchstart", button.handlePointerEvent);
        context.canvas.removeEventListener("touchend", button.handlePointerEvent);
        context.canvas.removeEventListener("touchmove", button.handlePointerEvent);
        context.canvas.removeEventListener("touchcancel", button.handlePointerEvent);
        context.canvas.removeEventListener("touchleave", button.handlePointerEvent);
        context.canvas.removeEventListener("mousedown", button.handlePointerEvent);
        context.canvas.removeEventListener("mousemove", button.handlePointerEvent);
        // TODO: fix this monstrosity
        (context.canvas.ownerDocument.defaultView || context.canvas.ownerDocument.parentWindow)
            .removeEventListener("mouseup", button.handlePointerEvent, false);    

        context.canvas.removeEventListener("touchstart", buttonFb.handlePointerEvent);
        context.canvas.removeEventListener("touchend", buttonFb.handlePointerEvent);
        context.canvas.removeEventListener("touchmove", buttonFb.handlePointerEvent);
        context.canvas.removeEventListener("touchcancel", buttonFb.handlePointerEvent);
        context.canvas.removeEventListener("touchleave", buttonFb.handlePointerEvent);
        context.canvas.removeEventListener("mousedown", buttonFb.handlePointerEvent);
        context.canvas.removeEventListener("mousemove", buttonFb.handlePointerEvent);
        // TODO: fix this monstrosity
        (context.canvas.ownerDocument.defaultView || context.canvas.ownerDocument.parentWindow)
            .removeEventListener("mouseup", buttonFb.handlePointerEvent, false);    
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
        highScoreText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 - 4, context.canvas.height-15);
        highScoreValueText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 + highScoreText.getWidth() + 8, context.canvas.height-15);

        button.draw();
        buttonFb.draw();
    };
};
GameOver.EVENT_RESTART_CLICKED = "GAME_OVER_RESTART_CLICKED";