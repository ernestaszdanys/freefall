"use strict";
    
var canvas = document.getElementById("game"),
    context = canvas.getContext("2d"),
    frameRequestId,
    frameLastTimestamp = 0;

function setCanvasSize(width, height) {
    canvas.width = width;
    canvas.height = height;
}

function requestFrame() {
    if (frameRequestId === void 0) {
        frameRequestId = window.requestAnimationFrame(onDraw, canvas);
    }
}

function cancelFrame() {
    if (frameRequestId !== void 0) {
        window.cancelAnimationFrame(frameRequestId);
        frameRequestId = void 0;
    }
}

function onDraw(frameTimestamp) {
    // TODO: detect lags and deal with iOS 6 requestAnimationFrame bugs...
    draw(frameTimestamp - frameLastTimestamp);
    frameLastTimestamp = frameTimestamp;
    // Keep requesting new frames
    if (frameRequestId !== void 0) {
        frameRequestId = window.requestAnimationFrame(onDraw, canvas);
    }
}

setCanvasSize(400, 720);

var currentLevel = 0;
var States = {MENU : 0, GAME : 1, GAME_OVER : 2};
var state = States.MENU;
var menu = new Menu(context);
var hud = new Hud(context);
var gameOver = new GameOver(context);
var game = new Game(context);
hud.setHealth(100); // TODO: temp REWRITE EVERYTHING!!!!!!!
game.getPlayer().type.addEventListener(Player.EVENT_HEALTH_CHANGED, function(newHealth) {
    hud.setHealth(newHealth);
    if (~~newHealth <= 0) state = States.GAME_OVER;
});
game.getPlayer().type.addEventListener(Player.EVENT_SCORE_CHANGED, function(newScore) {
    hud.setScore(newScore);
    gameOver.setScore(newScore);
});
game.setLevel(new Level(100, 1.8, canvas.width, 1000, 1));
game.onLevelEnd = function(){
	currentLevel++;
	game.addLevel(new Level((1/(currentLevel/2))*100, 1.8, canvas.width, 5000, currentLevel * 2, game.getLevel().height + game.getLevel().offset));
}
menu.onStartClicked = function() {
    state = States.GAME;
    menu.dissable();
};

function draw(dt) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (state === States.MENU) {
        menu.draw();
    } else if (state === States.GAME) {
        game.simulatePhysics(dt);
        game.draw();
        hud.draw();
    } else if (state === States.GAME_OVER) {
        gameOver.draw();
    }
}

requestFrame();

