var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    choreographer = new Choreographer(window);

// Set canvas size
canvas.width = 480;
canvas.height = 720;

// Load resources
var resourceDescription = {
    // Egg
    eggTexture: "assets/images/egg.png",
    eggVertices: "assets/images/egg.json",

    // Obstacles
    obstacleTextures: [
        "assets/images/obstacle_1.png",
        "assets/images/obstacle_2.png",
        "assets/images/obstacle_3.png",
        "assets/images/obstacle_4.png"
    ],
    obstacleTextureVertices: [
        "assets/images/obstacle_1.json",
        "assets/images/obstacle_2.json",
        "assets/images/obstacle_3.json",
        "assets/images/obstacle_4.json"
    ],
    
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
            game = new Game(context, resources),
            hud = new Hud(context, resources),
            gameOver = new GameOver(context, resources);
        
        var AppState = {
                MENU: 0,
                GAME: 1,
                GAME_OVER: 2
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
                    
                case AppState.GAME_OVER:
                    menu.dissable();
                    gameOver.enable();
                    break;
            }
            
            appState = newState;
        }
        
        setAppState(AppState.MENU);
        
        menu.addEventListener(Menu.EVENT_START_CLICKED, function() {
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
                setAppState(AppState.GAME_OVER);
            }
        });
        
        game.addEventListener(Game.EVENT_LEVEL_END_VISIBLE, function(eventName, levelEndY) {
            game.addObstacles(generateObstacles(10, canvas.width, canvas.height * 3, levelEndY, resources));
            game.addBackgroundObjects(generateRandomBackgroundObjects(50, resources.backgroundObstaclesBlur2, canvas.width, canvas.height * 3, -200, 0, levelEndY, 0));
        });
        
        gameOver.addEventListener(GameOver.EVENT_RESTART_CLICKED, function(eventName) {
            game.resetPlayer();
            setAppState(AppState.GAME);
        });
        
        function onFrame(eventName, dt) {
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (appState === AppState.MENU) {
                menu.draw();
            } else if (appState === AppState.GAME) {
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






    /*
    hud.setHealth(100); // TODO: temp REWRITE EVERYTHING!!!!!!!
    game.onPlayerHealthChanged = function(oldHealth, newHealth) {
        hud.setHealth(newHealth);
        if (~~newHealth <= 0) appState = AppState.GAME_OVER;
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
        appState = AppState.GAME;
        menu.dissable();
    };
    gameOver.onStartClicked = function() {
        //game.setLevel(new Level(100, 9.8, canvas.width, 1000, 1));
        //state = States.GAME;
        //gameOver.dissable();
    };

    */
