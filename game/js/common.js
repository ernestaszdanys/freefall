"use strict";

// http://jsperf.com/typeof-number-vs-isfinite-vs-nan/9
function isFiniteNumber(number) {
    return typeof number === "number" && number !== NaN && number !== Infinity && number !== -Infinity;
};


