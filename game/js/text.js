/*
WebFontConfig = {
	google: { families: [ 'Bitter:400,700:latin,latin-ext' ] }
};
(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
		'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();*/

function Text(context) {
    var fontStrokeRatio = 1/40,
        text = "",
        bold = false,
        size = 12,
        width = 0;
    
    measureWidth();

    function measureWidth() {
        applyFontStyle();
        width = context.measureText(text).width;
    };

    function applyFontStyle() {
        context.font = (bold ? "bold " : "") + size + 'px ' + 'Bitter';
    };

    this.setSize = function(newSize) {
        size = newSize;
    };

    this.setText = function(newText) {
        text = newText;
        measureWidth();
    };

    this.setBold = function(newBold) {
        bold = newBold;
        measureWidth();
    };

    this.getSize = function() {
        return size;
    };

    this.getText = function() {
        return text;
    };

    this.isBold = function() {
        return bold;
    };

    this.getWidth = function() {
        return width;
    };

    this.draw = function(x, y) {
        context.save();
        
        applyFontStyle();
        context.lineWidth = 7;
        context.strokeStyle = "rgba(0, 0, 0, 0.2)";
        context.strokeText(text, x - fontStrokeRatio * size, y + fontStrokeRatio * size);
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.fillText(text, x, y);
        context.fillStyle = "rgba(198, 212, 222, 1)";
        context.fillText(text, x, y + 2);
        
        context.restore();
    };
}