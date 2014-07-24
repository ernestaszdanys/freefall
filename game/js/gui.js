var game = { state : "stop" };

var gui = (function() {
    
    var rect = {
        x : 50,
        y : 500,
        width: 300,
        height: 60
    };


    var isMouseDown = false, lastMouseX = 0, lastMouseY = 0;


    function onMouseMove(event) {
        "use strict";
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }

    function onMouseUp() {
        "use strict";
        isMouseDown = false;
    }

    function onMouseDown() {
        "use strict";
        isMouseDown = true;
    }


    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("mouseup", onMouseUp, false);
    window.addEventListener("mousedown", onMouseDown, false);


    var resourcesToLoad = {"background" : "assets/images/gui/main.png", "logo" : "assets/images/gui/logoSmall.png", "button" : "assets/images/gui/button.png", "buttonOver" : "assets/images/gui/button1.png", "buttonClick" : "assets/images/gui/button2.png"};
    var loadedImages;

    function loadImages(resourcesToLoad, callback) {
        "use strict";
        var images = {},
            numberLoaded = 0,
            resourceName;

        for (resourceName in resourcesToLoad) {
            images[resourceName] = new Image();
            images[resourceName].src = resourcesToLoad[resourceName];
            images[resourceName].onload = function () {
                numberLoaded++;
                if (numberLoaded === Object.keys(resourcesToLoad).length) callback(images);
            };
        }
    }

    loadImages(resourcesToLoad, function(images) {
        loadedImages = images;
    });
    
    function onDraw(context) {

        if (loadedImages) {

            context.drawImage(loadedImages["background"], 0,0);
            context.drawImage(loadedImages.logo, 0,50);

            var hover = Intersection.pointRect(lastMouseX, lastMouseY, rect);
            if (hover && !isMouseDown) {
                context.drawImage(loadedImages.buttonOver, rect.x, rect.y);
            } else if (hover) {
                context.drawImage(loadedImages.buttonClick, rect.x, rect.y);
                game.state = "play";
            } else {
                context.drawImage(loadedImages.button, rect.x, rect.y);
            }
        } else {
//            console.log("test");
        }        
    }
    
    return {
        draw : onDraw
    };
})();