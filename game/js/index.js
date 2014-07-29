var canvas = document.getElementById("game"),
    context = canvas.getContext("2d"),
    frameRequestId = null;

canvas.width = 400;
canvas.height = 720;

var lastTime = 0;

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

var States = {MENU : 0, GAME : 1, GAME_OVER : 2};
var state = States.MENU;
var menu = new Menu(context);
var hud = new Hud(context);
var gameOver = new GameOver(context);
var game = new Game(context);
game.setLevel(levelGenerator.generateObstacles(1000, canvas));
menu.onStartClicked = function() {
    state = States.GAME;
};

function draw(dt) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (state === States.MENU) {
        menu.draw();
    } else if (state === States.GAME) {
        game.simulatePhysics(dt);
        game.draw();
        hud.draw();
        if (KEYS.isDown(87)) state = States.GAME_OVER;
    } else if (state === States.GAME_OVER) {
        gameOver.draw();
    }
}

requestFrame();