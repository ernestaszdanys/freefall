var canvas = document.getElementById("maingui"),
    ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;


var background = new Image();
background.src = "assets/images/gui/main.png";

background.onload = function(){
    ctx.drawImage(background,0,0);   

//Drawing logo image
      var imageObj = new Image();

      imageObj.onload = function() {
        ctx.drawImage(imageObj, 360, 100);
      };
      imageObj.src = 'assets/images/gui/logo.png';

//Drawing rectangle
      ctx.beginPath();
      ctx.rect(450, 500, 300, 70);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'black';
      ctx.stroke();

      ctx.font = 'italic 40pt Calibri';
      ctx.fillStyle = 'black';
      ctx.fillText('PLAY!', 535, 555);







}