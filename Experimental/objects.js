var can = document.getElementById('objects');
var ctx = can.getContext('2d');
can.tabIndex = 1; // quick way to get focus so keypresses register
ctx.font = '8px sans';

var thingsOnMap = [
[50,50],
[55,70],
[15,22],
[150,20],
[120,80],
[100,10],
[170,40],
[130,70],
[230,10],
[330,45],
[250,65]
];

// player's position
var playerX = 20;
var playerY = 20;

// how far offset the canvas is
var offsetX = 0;
var offsetY = 0;
    
function draw() {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    // clear the viewport
    ctx.clearRect(-offsetX, -offsetY, 1280,720);
    
    // draw the player
    ctx.fillStyle = 'red';
    ctx.fillRect(playerX-offsetX, playerY-offsetY, 50, 50);
    
    // draw the other stuff
    var l = thingsOnMap.length;
    for (var i = 0; i < l; i++) {
        // we should really only draw the things that intersect the viewport!
        // but I am lazy so we are drawing everything here
        var x = thingsOnMap[i][0];
        var y = thingsOnMap[i][1];
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = 'black';
        ctx.fillText(x + ', ' + y, x, y) // just to show where we are drawing these things
    }
    
    ctx.restore();
}
    
    can.addEventListener('keydown', function(e) {
        if (e.keyCode === 37) { // left
            offsetY--;
        } else if (e.keyCode === 39) { // right
            offsetY++;
        }
        draw();
    }, false);


draw();