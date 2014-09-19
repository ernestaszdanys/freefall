"use strict";

// TODO: multiple images, hover state, remove global PXR
function Button(context, image) {
    Observable.call(this);

    var self = this;
        
    // Internal state
    this._context = context;
    this._state = Button.State.NORMAL; // NORMAL|HOVERED|PRESSED
    this._clickable = false;
    
    this.x = 0;
    this.y = 0;
    
    if (image instanceof Image) {
        this.width = image.naturalWidth;
        this.height = image.naturalHeight;
        this.image = image;
    } else {
        this.width = image.width;
        this.height = image.height;
        this.image = void 0;
    }
    
    this.handlePointerEvent = function(event) {
        switch (event.type) {
            // Touch event
            case "touchstart":  
                if (self.isHitByEvent(event.changedTouches[0])) {
                    self._state = Button.State.PRESSED;
                }
                event.preventDefault();
                break;

            case "touchend": 
                if (self.isHitByEvent(event.changedTouches[0]) && self._state === Button.State.PRESSED) {
                    self.dispatchEvent(Button.EVENT_CLICK);
                } // NOTE: no break.
            case "touchleave":
            case "touchcancel":
                self._state = Button.State.NORMAL;
                event.preventDefault();
                break;
            
            case "touchmove":
            case "mousemove":
                event.preventDefault();
                break;
                
            // Mouse event
            case "mousedown":
                if (self.isHitByEvent(event)) {
                    self._state = Button.State.PRESSED;
                }
                event.preventDefault();
                break;
                
            case "mouseup":
                if (self.isHitByEvent(event) && self._state === Button.State.PRESSED) {
                    self.dispatchEvent(Button.EVENT_CLICK);
                }
                self._state = Button.State.NORMAL;
                event.preventDefault();
                break;
        }
    };
    
    this.setClickable(true);
}

Button.prototype.layout = function(parentX, parentY, parentWidth, parentHeight) {
    this.x = parentX + (parentWidth - this.width) * 0.5;
    this.y = parentY + (parentHeight - this.height) * 0.5;
};

Button.prototype.draw = function() {
    if (this._state === Button.State.NORMAL) {
        this._context.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
        this._context.drawImage(this.image, this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    }
};

Button.prototype.isHitByEvent = function(event) {
    var canvasRect = this._context.canvas.getBoundingClientRect();
    return this.isHit((event.clientX - canvasRect.left) / PXR, (event.clientY - canvasRect.top) / PXR); // TODO: evil global
};

Button.prototype.isHit = function(x, y) {
    return (x >= this.x && x <= this.x + this.width) && (y >= this.y && y <= this.y + this.height);
};

Button.prototype.isClickable = function() {
    return this._clickable;
};

/**
 * @param {boolean} clickable
 */
Button.prototype.setClickable = function(clickable) {
    if (clickable && !this._clickable) {
        this._context.canvas.addEventListener("touchstart", this.handlePointerEvent, false);
        this._context.canvas.addEventListener("touchend", this.handlePointerEvent, false);
        this._context.canvas.addEventListener("touchmove", this.handlePointerEvent, false);
        this._context.canvas.addEventListener("touchcancel", this.handlePointerEvent, false);
        this._context.canvas.addEventListener("touchleave", this.handlePointerEvent, false);
        this._context.canvas.addEventListener("mousedown", this.handlePointerEvent, false);
        this._context.canvas.addEventListener("mousemove", this.handlePointerEvent, false);
        // TODO: fix this monstrosity
        (this._context.canvas.ownerDocument.defaultView || this._context.canvas.ownerDocument.parentWindow)
            .addEventListener("mouseup", this.handlePointerEvent, false);
        this._clickable = true;
    } else if (!clickable && this._clickable) {
        this._context.canvas.removeEventListener("touchstart", this.handlePointerEvent);
        this._context.canvas.removeEventListener("touchend", this.handlePointerEvent);
        this._context.canvas.removeEventListener("touchmove", this.handlePointerEvent);
        this._context.canvas.removeEventListener("touchcancel", this.handlePointerEvent);
        this._context.canvas.removeEventListener("touchleave", this.handlePointerEvent);
        this._context.canvas.removeEventListener("mousedown", this.handlePointerEvent);
        this._context.canvas.removeEventListener("mousemove", this.handlePointerEvent);
        // TODO: fix this monstrosity
        (this._context.canvas.ownerDocument.defaultView || this._context.canvas.ownerDocument.parentWindow)
            .removeEventListener("mouseup", this.handlePointerEvent, false);    
        this._clickable = false;
    }
};

Button.prototype.isPressed = function() {
    return this._state === Button.State.PRESSED;
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
    
    var button = new Button(context, resources.imageButtonPlay);
    button.layout(context.canvas.width / 2, 559, 0, 0);
    
    var gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
    gradient.addColorStop(0, 'rgba(32, 46, 59, 1.000)');
    gradient.addColorStop(0.5, 'rgba(65, 77, 89, 1.000)');
    gradient.addColorStop(1, 'rgba(90, 101, 111, 1.000)');
    
    button.addEventListener(Button.EVENT_CLICK, function() {
        self.dispatchEvent(Menu.EVENT_START_CLICKED);
    });
    
    this.enable = function() {
        button.setClickable(true);
    };
    
    this.dissable = function() {
        button.setClickable(false);
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

    ptsText.setText("WTF");
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
        newHighScore = false,
        scoreText = new Text(context),
        ptsText = new Text(context),
        highScoreText = new Text(context),
        highScoreValueText = new Text(context),
        newHighScoreText = new Text(context);

    var buttonRetry = new Button(context, resources.imageButtonRetry);
    buttonRetry.layout(context.canvas.width / 2 - 65, 500, 0, 0);
    buttonRetry.addEventListener(Button.EVENT_CLICK, function() {
        self.dispatchEvent(GameOver.EVENT_RESTART_CLICKED);
    });
    
    var buttonShare = new Button(context, resources.imageButtonFacebookShare);
    buttonShare.layout(context.canvas.width / 2 + 65, 500, 0, 0);
    buttonShare.addEventListener(Button.EVENT_CLICK, function() {
        self.dispatchEvent(GameOver.EVENT_FACEBOOK_SCORE_SHARE_CLICKED);
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
    
    newHighScoreText.setText("NEW HIGH SCORE!");
    newHighScoreText.setSize(30);
    newHighScoreText.setBold(false);
    
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
    
    this.setNewHighScore = function(value) {
        newHighScore = value;
    };

    this.getHighScore = function() {
        return highScore;
    };

    this.enable = function() {
        buttonRetry.setClickable(true);
        buttonShare.setClickable(true);
    };
    
    this.dissable = function() {
        buttonRetry.setClickable(false);
        buttonShare.setClickable(false);
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
        highScoreValueText.setText(this.getHighScore() === null ? 0 : this.getHighScore());
        highScoreText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 - 4, context.canvas.height-15);
        highScoreValueText.draw((context.canvas.width-highScoreText.getWidth()-highScoreValueText.getWidth())/2 + highScoreText.getWidth() + 8, context.canvas.height-15);
        
        if (newHighScore) {
            newHighScoreText.draw((context.canvas.width - newHighScoreText.getWidth()) / 2, context.canvas.height - 90);
        }
        
        buttonRetry.draw();
        buttonShare.draw();
    };
};
GameOver.EVENT_RESTART_CLICKED = "GAME_OVER_RESTART_CLICKED";
GameOver.EVENT_FACEBOOK_SCORE_SHARE_CLICKED = "GAME_OVER_FACEBOOK_SCORE_SHARE_CLICKED";
