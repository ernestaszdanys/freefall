var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    choreographer = new Choreographer(window);

// Set canvas size
canvas.width = 480;
canvas.height = 720;

var touch = new TouchObserver(canvas);

var PXR;
resizeCanvas();

window.addEventListener("resize", resizeCanvas, false);
function resizeCanvas() {
    var width = window.innerWidth,
        height = window.innerHeight;

    if (width > 2/3 * height){
        width = 2/3 * height;
    } else {
        height = 3/2 * width;
    }
    
    PXR = width / canvas.width;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.top = (window.innerHeight - height)/2 + "px";
    canvas.style.left = (window.innerWidth - width)/2 + "px";
}

// Load resources
var resourceDescription = {
    // Egg
    eggImage: "assets/images/egg.png",
    eggDescription: "assets/images/egg.json",

    // Obstacles
    meteorImages: [
        "assets/images/obstacle_1.png",
        "assets/images/obstacle_2.png",
        "assets/images/obstacle_3.png",
        "assets/images/obstacle_4.png"
    ],
    meteorDescriptions: [
        "assets/images/obstacle_1.json",
        "assets/images/obstacle_2.json",
        "assets/images/obstacle_3.json",
        "assets/images/obstacle_4.json"
    ],
    
    metalBallImage: "assets/images/metal_ball.png",
    metalBallDescription: "assets/images/metal_ball.json",
    
    gravityGradientImage: "assets/images/gravity_gradient.png",
    
    
    // Blurred background objects
    backgroundObstaclesBlur1: [
        "assets/images/obstacle_1_blur_1.png",
        "assets/images/obstacle_2_blur_1.png",
        "assets/images/obstacle_3_blur_1.png",
        "assets/images/obstacle_4_blur_1.png"
    ],
    backgroundObstaclesBlur2: [
        "assets/images/obstacle_1_blur_2.png",
        "assets/images/obstacle_2_blur_2.png",
        "assets/images/obstacle_3_blur_2.png",
        "assets/images/obstacle_4_blur_2.png"
    ],

    // UI
    imageLogo: "assets/images/logo.png",
    imageRibbon: "assets/images/ribbon.png",
    imageButtonRedRound: "assets/images/button_red_round.png",
    iconPlay: "assets/images/icon_play.png",
    iconRefresh: "assets/images/icon_refresh.png",
    imageEggBroken: "assets/images/egg_broken.png"
};

Loader.loadResourceTree(resourceDescription,
    function onSuccess(resources) {
        // Game
        
        // Start frame loop
        choreographer.startFrameLoop();
        choreographer.addEventListener(Choreographer.EVENT_ON_FRAME, onFrame);

        var menu = new Menu(context, resources),
            game = new Game(context, resources, Metrics.PPM),
            hud = new Hud(context, resources),
            gameOver = new GameOver(context, resources);
        
        var AppState = {
                MENU: 0,
                GAME: 1,
                DEATH: 2,
                GAME_OVER: 3
            },
            appState;

        function setAppState(newState) {
            switch(newState) {
                case AppState.MENU:
                    gameOver.dissable();
                    menu.enable();
                    break;
                 
                case AppState.GAME:
                    menu.dissable();
                    gameOver.dissable();
                    break;
                    
                case AppState.DEATH:
                    menu.dissable();
                    gameOver.dissable();
                    break;
                    
                case AppState.GAME_OVER:
                    menu.dissable();
                    gameOver.enable();
                    break;
            }
            
            appState = newState;
        }
        
        setAppState(AppState.MENU);
        
        menu.addEventListener(Menu.EVENT_START_CLICKED, function() {
            hud.setHighScore();
            setAppState(AppState.GAME);
        });

        hud.setScore(game.getPlayerScore());
        game.addEventListener(Game.EVENT_PLAYER_SCORE_CHANGED, function(eventName, score) {
            hud.setScore(~~score);
            gameOver.setScore(~~score);
        });
        
        hud.setHealth(game.getPlayerHealth());
        game.addEventListener(Game.EVENT_PLAYER_HEALTH_CHANGED, function(eventName, health) {
            hud.setHealth(~~health);
            if (health === 0) {
                setAppState(AppState.DEATH);
                setTimeout(function(){
                    if (gameOver.getScore() > hud.getHighScore()) {
                        gameOver.setNewHighScore(true);
                        localStorage.setItem("highscore", gameOver.getScore());
                    } else {
                        gameOver.setNewHighScore(false);
                    }
                    gameOver.setHighScore(localStorage.getItem("highscore"));
                    setAppState(AppState.GAME_OVER);
                }, 2000);
            }
        });
        /*
        game.addEventListener(Game.EVENT_LEVEL_END_VISIBLE, function(eventName, levelEndY) {
            game.addObstacles(generateObstacles(10, canvas.width, canvas.height * 3, levelEndY, resources));
            game.addBackgroundObjects(generateRandomBackgroundObjects(50, resources.backgroundObstaclesBlur2, canvas.width, canvas.height * 3, -200, 0, levelEndY, 0));
        });
        */
        gameOver.addEventListener(GameOver.EVENT_RESTART_CLICKED, function(eventName) {
            game.resetPlayer();
            hud.setHighScore();
            game.setTimeScale(1);
            setAppState(AppState.GAME);
        });
        
        function onFrame(eventName, dt) {
            /*console.clear();*/
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (appState === AppState.MENU) {
                menu.draw();
            } else if (appState === AppState.GAME) {
                game.simulatePhysics(dt);
                game.draw();
                hud.draw();
            } else if (appState === AppState.DEATH) {
                game.setTimeScale(0.1);
                game.simulatePhysics(dt);
                game.draw();
                hud.draw();
            } else if (appState === AppState.GAME_OVER) {
                gameOver.draw();
            }
        }
    },
    function onError(error) {
        // Error
        
        throw error;
    }
);