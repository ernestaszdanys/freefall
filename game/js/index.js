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

var currentLevel = 0;
var States = {MENU : 0, GAME : 1, GAME_OVER : 2};
var state = States.MENU;
var menu = new Menu(context);
var hud = new Hud(context);
var gameOver = new GameOver(context);
var game = new Game(context);
hud.setHealth(100); // TODO: temp REWRITE EVERYTHING!!!!!!!
game.onPlayerHealthChanged = function(oldHealth, newHealth) {
    hud.setHealth(newHealth);
    if (~~newHealth <= 0) state = States.GAME_OVER;
}
game.onPlayerScoreChanged = function(oldScore, newScore) {
    hud.setScore(newScore);
    gameOver.setScore(newScore);
}
game.setLevel(new Level(100, 9.8, canvas.width, 1000, 1));
game.onLevelEnd = function(){
	currentLevel++;
	game.addLevel(new Level((1/(currentLevel/2))*100, 9.8, canvas.width, 5000, currentLevel * 2, game.getLevel().height + game.getLevel().offset));
}
menu.onStartClicked = function() {
    state = States.GAME;
    menu.dissable();
};
gameOver.onStartClicked = function() {
    //game.setLevel(new Level(100, 9.8, canvas.width, 1000, 1));
    //state = States.GAME;
    //gameOver.dissable();
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