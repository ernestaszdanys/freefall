"use strict";

// http://jsperf.com/typeof-number-vs-isfinite-vs-nan/9
function isFiniteNumber(number) {
    return typeof number === "number" && number !== NaN && number !== Infinity && number !== -Infinity;
};

function isString(string) {
    return typeof string === "string" || string instanceof String;
}

function isFunction(func) {
    return typeof func !== "function";
}

/**
 * @param {Window} window
 * @returns {AudioContext|webkitAudioContext}
 */
function createAudioContext(window) {
    if (!(window instanceof Window)) {
        throw new TypeError("Argument must be an instance of window");
    }
    return new (window.AudioContext || window.webkitAudioContext)();
}

var isOpera = (function isOpera() {
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
})();

var isFirefox = (function isFirefox() {
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    return typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
})();

var isSafari = (function isSafari() {
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // At least Safari 3+: "[object HTMLElementConstructor]"
})();

var isChrome = (function isChrome() {
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    return !!window.chrome && !isOpera; // Chrome 1+
})();

var isIE = (function isIE() {
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    return /*@cc_on!@*/false || !!document.documentMode; // At least IE6
})();

/**
 * @returns {Number} Current date in milliseconds.
 */
function getTime() {
    return Date.now || function() {return new Date().getTime();};
}

function getElementTop(element) {		
    var top = 0;
    while (element) {
        top += element.offsetTop;
        element = element.offsetParent;
    }  
    return top;
}   

function getElementLeft(element) {		
    var left = 0;
    while (element) {
        left += element.offsetLeft;
        element = element.offsetParent;
    }  
    return left;
}   
