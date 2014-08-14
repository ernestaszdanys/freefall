// TODO: sanitize tokenized property path before eval in compiled versions
// TODO: documentation...
// TODO: tests would be great...
/**
 * See performace camparison between simple and compiled checks here: 
 * http://jsperf.com/nested-property-checker-performance
 * mind = blown, right? :D
 */
var PropertyChecker = (function() {
    var COMPILED_OBJECT_PARAMETER_NAME = "o";
    
    function generateIfClauseAndPropertyName(path) {
        // Tokenize property path
        if (typeof path === "string") {
            path = path.split(".");
            // TODO: sanitize tokens
        } else {
            throw new Error("Bad property path. The path must be a string.");   
        } 
        
        // Prepend object parameter name
        path.unshift(COMPILED_OBJECT_PARAMETER_NAME);
        
        // Generate "if" clause and fully chained property name
        var property = path[0],
            clause = property + " !== void 0";
        
        for (var i = 1; i < path.length; i++) {
            property += "." + path[i];
            clause += " && " + property + " !== void 0";
        }
        
        return {
            clause: clause,
            property: property
        };
    }
    
    return {    
        propertyExists: function(object, path) {
            if (typeof path === "string") {
                path = path.split(".");                
                var property = object;
                if (property === void 0) {
                    return false;
                }
                for (var i = 0; i < path.length; i++) {
                    property = property[path[i]];
                    if (property === void 0) {
                        return false;
                    }
                }
                return true;
            } else if (path === void 0 || path === null) {
                return object !== void 0;
            } else {
                throw new Error("Bad property path. The path must be a string.");   
            }

        },
        
        getProperty: function(object, path) {
            if (typeof path === "string") {
                path = path.split(".");
                var property = object;
                if (property === void 0) {
                    return void 0;
                }
                for (var i = 0; i < path.length; i++) {
                    property = property[path[i]];
                    if (property === void 0) {
                        return void 0;
                    }
                }
                return property;
            } else if (path === void 0 || path === null) {
                return object;
            } else {
                throw new Error("Bad property path. The path must be a string.");   
            }

        },
        
        compilePropertyChecker: function(path) {
            if (path === void 0 || path === null) {
                return eval("(function(" + COMPILED_OBJECT_PARAMETER_NAME + "){return " + COMPILED_OBJECT_PARAMETER_NAME + " !== void 0;});");
            } else {
                var generated = generateIfClauseAndPropertyName(path);
                try {
                    return eval("(function(" + COMPILED_OBJECT_PARAMETER_NAME + "){return " + generated.clause + ";});");
                } catch(error) {
                    throw new Error("Invalid property path.");        
                }
            }
        },
        
        compilePropertyGetter: function(path) {
            if (path === void 0 || path === null) {
                return eval("(function(" + COMPILED_OBJECT_PARAMETER_NAME + "){return " + COMPILED_OBJECT_PARAMETER_NAME + ";});");
            } else {
                var generated = generateIfClauseAndPropertyName(path);            
                try {
                    return eval("(function(" + COMPILED_OBJECT_PARAMETER_NAME + "){return " + generated.clause + " ? " + generated.property + " : void 0;});");
                } catch(error) {
                    throw new Error("Invalid property path.");        
                }
            }
        }
    };
})();