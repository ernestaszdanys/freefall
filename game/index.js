var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    choreographer = new Choreographer(window);

// Set canvas size
canvas.width = 480;
canvas.height = 720;

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
    eggImages: [
        "assets/images/egg_25.png",
        "assets/images/egg_50.png",
        "assets/images/egg_75.png",
        "assets/images/egg_100.png"
    ],
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
    imageEggBroken: "assets/images/egg_broken.png",
    imageButtonPlay: "assets/images/button_play.png",
    imageButtonRetry: "assets/images/button_retry.png",
    imageButtonFacebookShare: "assets/images/button_f_s.png",
    imageButtonSound: "assets/images/button_red_sound.png",
    imageButtonPause: "assets/images/button_pause_small.png",

    // Sounds
    soundBackground: "assets/sounds/game" + (isSafari ? ".mp3" : ".ogg"),
    soundClick: "assets/sounds/click" + (isSafari ? ".mp3" : ".ogg"),
    soundBounce: "assets/sounds/bounce" + (isSafari ? ".mp3" : ".ogg"),
    soundGameOver: "assets/sounds/game_over" + (isSafari ? ".mp3" : ".ogg")
};

Loader.loadResourceTree(resourceDescription,
    function onSuccess(resources) {
        
        var soundManager = new SoundManager(createAudioContext(window)),
            soundBounce = new soundManager.Sound(resources.soundBounce, 1, false),
            soundBackground = new soundManager.Sound(resources.soundBackground, 0.2, true),
            soundClicked = new soundManager.Sound(resources.soundClick, 1, false),
            soundGameOver = new soundManager.Sound(resources.soundGameOver, 0.6, false);
        
        if (localStorage.getItem("soundState") === null) {
            localStorage.setItem("soundState", "play");
        }
        
        if (localStorage.getItem("soundState") === "mute") {
            soundManager.setMasterGain(0);
        }
        
        // Start frame loop
        choreographer.startFrameLoop();
        choreographer.addEventListener(Choreographer.EVENT_ON_FRAME, onFrame);

        var menu = new Menu(context, resources),
            game = new Game(context, resources, 50),
            hud = new Hud(context, resources),
            gameOver = new GameOver(context, resources),
            pause = new Pause(context, resources);
        
        var AppState = {
                MENU: 0,
                GAME: 1,
                GAME_PAUSE: 2,
                DEATH: 3,
                GAME_OVER: 4
            },
            appState;

        function setAppState(newState) {
            switch(newState) {
                case AppState.MENU:
                    gameOver.dissable();
                    menu.enable();
                    hud.dissable();
                    break;
                 
                case AppState.GAME:
                    game.enableControls();
                    menu.dissable();
                    hud.enable();
                    pause.dissable();
                    gameOver.dissable();
                    break;
                
                case AppState.GAME_PAUSE:
                    game.dissableControls();
                    pause.enable();
                    hud.dissable();
                    break;
                    
                case AppState.DEATH:
                    menu.dissable();
                    gameOver.dissable();
                    hud.dissable();
                    break;
                    
                case AppState.GAME_OVER:
                    menu.dissable();
                    gameOver.enable();
                    hud.dissable();
                    break;
            }
            appState = newState;
        }
        
        setAppState(AppState.MENU);
        
        menu.addEventListener(Menu.EVENT_START_CLICKED, function() {
            hud.setHighScore();
            soundClicked.play();
            soundBackground.play(true);
            setAppState(AppState.GAME);
        });

        hud.setScore(game.getPlayerScore());
        game.addEventListener(Game.EVENT_PLAYER_SCORE_CHANGED, function(eventName, score) {
            hud.setScore(~~score);
            gameOver.setScore(~~score);
        });
        
        hud.addEventListener(Hud.EVENT_PAUSE_CLICKED, function(eventName) {
            setAppState(AppState.GAME_PAUSE);
        });
        
        hud.setHealth(game.getPlayerHealth());
		
        game.addEventListener(Game.EVENT_PLAYER_HEALTH_CHANGED, function(eventName, health) {
            hud.setHealth(~~health);
            if (~~health === 0) {
                soundGameOver.play();
                soundBackground.stop();
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
            } else {
                if (health < 100) soundBounce.play();
            }
        });
        /*
        game.addEventListener(Game.EVENT_LEVEL_END_VISIBLE, function(eventName, levelEndY) {
            game.addObstacles(generateObstacles(10, canvas.width, canvas.height * 3, levelEndY, resources));
            game.addBackgroundObjects(generateRandomBackgroundObjects(50, resources.backgroundObstaclesBlur2, canvas.width, canvas.height * 3, -200, 0, levelEndY, 0));
        });
        */
		
	pause.addEventListener(Pause.EVENT_RESTART_CLICKED, function(eventName) {
            game.resetPlayer();
            hud.setHighScore();
            game.setTimeScale(1);
            setAppState(AppState.GAME);
            pause.dissable();
        });
		
	pause.addEventListener(Pause.EVENT_RESUME_CLICKED, function(eventName) {
            setAppState(AppState.GAME);
            pause.dissable();
        });
		
	pause.addEventListener(Pause.EVENT_SOUND_CLICKED, function(eventName) {
            if (localStorage.getItem("soundState") === "play") {
                soundManager.setMasterGain(0);
                localStorage.setItem("soundState", "mute");
            } else {
                localStorage.setItem("soundState", "play");
                soundManager.setMasterGain(1);
            };
        });
		
        gameOver.addEventListener(GameOver.EVENT_RESTART_CLICKED, function(eventName) {
            soundClicked.play();
            soundBackground.play(true);
            game.resetPlayer();
            hud.setHighScore();
            game.setTimeScale(1);
            setAppState(AppState.GAME);
        });
    
	gameOver.addEventListener(GameOver.EVENT_FACEBOOK_SCORE_SHARE_CLICKED, function(eventName) {
            soundClicked.play();
            openFbPopUp(~~game.getPlayerScore());
	});
            
        function onFrame(eventName, dt) {
            /*console.clear();*/
            // context.clearRect(0, 0, canvas.width, canvas.height);

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
            } else if (appState === AppState.GAME_PAUSE) {
                game.draw();
                pause.draw();
            }
        }
    },
    function onError(error) {
        // Error
        
        throw error;
    }
);