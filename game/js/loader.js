var Loader = (function() {
    
    var getTime = Date.now || function() {return new Date().getTime();}, // Date.now() pollyfill
        urlFileExtensionPattern = /.+\.([^?]+)/,
        extensionToLoader = {}, // Mappings between extensions (like "png", "json") and their loaders
        cache = true; // TODO
        
    extensionToLoader["json"] = getJson;
    extensionToLoader["png"] = getImage;
    extensionToLoader["jpg"] = getImage;
    extensionToLoader["jpeg"] = getImage;
    extensionToLoader["gif"] = getImage;

    function getUrlFileExtension(url) {
        var extensionTokens = url.match(urlFileExtensionPattern);
        if (extensionTokens !== null && extensionTokens[1] !== void 0) {
            return extensionTokens[1].toLowerCase();
        } else {
            return;
        }
    }
    
    // Based on https://github.com/emoller/WebGL101/blob/master/webgl-utils.js
    function getJson(url, successCallback, errorCallback) {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            if (request.readyState === 1) {
                request.overrideMimeType("application/json");
                request.send();
            } else if (request.readyState === 4) {
                if (request.status === 200) {
                    successCallback(JSON.parse(request.responseText));
                } else {
                    errorCallback({
                        status: request.status
                    });
                }
            }
        };

        var requestUrl = url;
        if (!cache) {
            requestUrl += "?" + getTime();
        }
        request.open("GET", requestUrl, true);
    }

    function getImage(url, successCallback, errorCallback) {
        var image = new Image();

        image.onload = function() {
            successCallback(image);
        };
        image.onerror = function() {
            errorCallback();
        };

        var requestUrl = url;
        if (!cache) {
            requestUrl += "?" + getTime();
        }
        image.src = requestUrl;
    }

    function setProperty(target, propertyPath, value) {
        if (typeof target !== "object") {
            throw new Error("Target is not an object.");
        }

        if (!(propertyPath instanceof  Array) || propertyPath.length === 0) {
            throw new Error("Invalid property path.");
        }

        if (propertyPath.length > 1) {
            for (var i = 0; i < propertyPath.length - 1; i++) {
                if (target[propertyPath[i]] === void 0) { // TODO: is hasOwnProperty better?
                    target[propertyPath[i]] = (typeof propertyPath[i + 1] === "number") ? [] : {};
                } 
                target = target[propertyPath[i]];
            }       
        }

        target[propertyPath[propertyPath.length - 1]] = value;
    }

    var iterateStringTree = (function() {
        
        function internalInterateStringTree(node, nodePath, callback) {        
            if (typeof node === "string" || node instanceof String) {
                if (typeof callback === "function") {
                    callback(node, nodePath.slice(0));
                }
            } else if (node instanceof Array) {
                for (var i = 0; i < node.length; i++) {
                    nodePath.push(i);
                    internalInterateStringTree(node[i], nodePath, callback);
                    nodePath.pop();
                }
            } else if (typeof node === "object" && node !== null) {
                for (var resourceName in node) {
                    if (node.hasOwnProperty(resourceName)) { 
                        nodePath.push(resourceName);
                        internalInterateStringTree(node[resourceName], nodePath, callback);
                        nodePath.pop();
                    }
                }
            } else {
                // Node is neither a string nor an object (or array) - throw error
                var nodePathString = "";
                for (var i = 0; i < nodePath.length; i++) {
                    if (typeof nodePath[i] === "number") {
                        nodePathString += "[" + nodePath[i] + "]";
                    } else {
                        nodePathString += (i !== 0) ? "." + nodePath[i] : nodePath[i];
                    }
                }
                throw new Error("Property " + nodePathString + " is not a string.");
            }
        }

        function iterateStringTree(resource, callback) {
            internalInterateStringTree(resource, [], callback);
        };

        return iterateStringTree;
    })();

    function loadResourceTree(resourceTree, successCallback, errorCallback) {
        if (typeof successCallback !== "function") {
            throw new TypeError("Parameter 2 (successCallback) must be a function.");
        } 
        
        if (typeof errorCallback !== "function") {
            throw new TypeError("Parameter 3 (errorCallback) must be a function.");
        } 
        
        var resourceData = [],
            loadedCount = 0,
            loadedResourceTree = (resourceTree instanceof Array) ? [] : {};

        iterateStringTree(resourceTree, function(string, path) {
            resourceData.push({
                url: string,
                propertyPath: path
            });
        });

        resourceData.forEach(function(resource) {
            var extension = getUrlFileExtension(resource.url);
            if (extension !== void 0) {
                var loadResource = extensionToLoader[extension];
                if (loadResource !== void 0) {
                    loadResource(
                        resource.url,
                        function onSuccess(result) {
                            // Set property
                            setProperty(loadedResourceTree, resource.propertyPath, result);
                            
                            // Check if everything is loaded
                            loadedCount++;
                            if (loadedCount === resourceData.length) {
                                successCallback(loadedResourceTree);
                            }
                        },
                        function onError(error) {
                            errorCallback(new Error("Failed to load resource \"" + resource.url + "\". Error: " + error));
                        }
                    );
                } else {
                    throw new Error("Can't load \"" + resource.url + "\". Resource loader for \"." +  extension + "\" extension is undefined.");
                }
            } else {
                throw new Error("Can't determine resource type (extension). " + resource.url);
            }
        });
    }
    
    return {
        loadResourceTree: loadResourceTree
    };
})();

