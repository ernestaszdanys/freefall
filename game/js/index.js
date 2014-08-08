var canvas = document.getElementById("game"),
    context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight; 
    
var choreographer = new Choreographer(window);
choreographer.requestFrameLoop();
choreographer.addEventListener(Choreographer.EVENT_ON_FRAME, draw);

var player = new Player(new Circle(100, 100, 50), 100);

function draw(eventName, dt) {
    console.clear();
    console.log(dt);
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    player.applyForce(new Vec2(50, 50), dt * 0.001);
    player.draw(context);
}



/*
var currentLevel = 0;
var States = {MENU : 0, GAME : 1, GAME_OVER : 2};
var state = States.MENU;
var menu = new Menu(context);
var hud = new Hud(context);
var gameOver = new GameOver(context);
var game = new Game(context);
hud.setHealth(100); // TODO: temp REWRITE EVERYTHING!!!!!!!
game.getPlayer().getType().addObserver(Player.EVENT_HEALTH_CHANGED, function(newHealth) {
    hud.setHealth(newHealth);
    if (~~newHealth <= 0) state = States.GAME_OVER;
});
game.getPlayer().getType().addObserver(Player.EVENT_SCORE_CHANGED, function(newScore) {
    hud.setScore(newScore);
    gameOver.setScore(newScore);
});
game.setLevel(new Level(100, 9.8, canvas.width, 1000, 1));
game.onLevelEnd = function(){
	currentLevel++;
	game.addLevel(new Level((1/(currentLevel/2))*100, 9.8, canvas.width, 5000, currentLevel * 2, game.getLevel().height + game.getLevel().offset));
};
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
*/