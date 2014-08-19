// Function.name pollyfill 
// http://stackoverflow.com/questions/6903762/function-name-not-supported-in-ie
// TODO: test
if (!(function f() {}).name) {
    Object.defineProperty(Function.prototype, "name", {
        get: function() {
            var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
            // For better performance only parse once, and then cache the result through a new accessor for repeated access.
            Object.defineProperty(this, "name", {value: name});
            return name;
        }
    });
}

function Behaviour() {
    var behaviours = {};

    this.set = function(a, b, func) {

        if (typeof a !== "function" || a.name === void 0 || a.name === "") {
            throw new Error("Parameter 1 must be non-anonymous function (constructor).");
        }
        
        if (typeof b !== "function" || b.name === void 0 || b.name === "") {
            throw new Error("Parameter 2 must be non-anonymous function (constructor).");
        }
        
        if (behaviours[a.name] === void 0) {
            behaviours[a.name] = {};
        }
        behaviours[a.name][b.name] = func;
    };

    this.apply = function() {
        var aType = arguments[0].constructor.name,
            bType = arguments[1].constructor.name;
        
        // TODO: check aName and bName...?
        
        if (behaviours[aType] !== void 0 && behaviours[aType][bType] !== void 0) {
            return behaviours[aType][bType].apply(void 0, arguments);
        } else {
            throw new Error("Behaviour between " + aType + " and " + bType + " is not defined.");
        }
    };
}