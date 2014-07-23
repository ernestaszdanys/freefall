var canvas = document.getElementById("maingui"),
    context = canvas.getContext("2d");

function resizeCanvas() {
    "use strict";
    canvas.width = 1280;
    canvas.height = 720;
}

function PIR(x, y, rect) {
    "use strict";
    return (x >= rect.x && x <= rect.x + rect.width) && (y >= rect.y && y <= rect.y + rect.height);
}

resizeCanvas();

var rect = {
    x : 440,
    y : 510,
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



var resourcesToLoad = {"background" : "assets/images/gui/main.png", "logo" : "assets/images/gui/logo.png", "button" : "assets/images/gui/button.png"};
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
    requestAnimationFrame(onDraw);
});

function onDraw() {
    context.drawImage(loadedImages["background"], 0,0);
    context.drawImage(loadedImages.logo, 360,150);
    
    var hover = PIR(lastMouseX, lastMouseY, rect);
    if (hover && !isMouseDown) {
        context.fillStyle = "rgb(255, 0, 0)";
            context.fillRect(rect.x, rect.y, rect.width, rect.height);
    } else if (hover) {
        context.fillStyle = "rgb(0, 0, 255)";
            context.fillRect(rect.x, rect.y, rect.width, rect.height);
        confirm("clicked");
    } else {
        context.drawImage(loadedImages.button, rect.x, rect.y);
        
    }

    
    context.font = 'italic 40pt Calibri';
    context.fillStyle = 'rgb(255, 255, 255)';
    context.fillText('PLAY!', 535, 555);
    
    requestAnimationFrame(onDraw);
}