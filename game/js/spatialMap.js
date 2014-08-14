// TODO: rewrite ("cells" should be 2d array)
// TODO: style
function SpatialMap(boundingBoxPropertyPath, shift) {
    
    // Dynamically create funtion that returns bounding box
    var getBoundingBox = PropertyChecker.compilePropertyGetter(boundingBoxPropertyPath);
        
    // Validate cell size parameter
    // TODO: maybe throwing error is better...
    if (typeof shift !== "number" || shift < 2 || shift > 10) {
        shift = 8; // Default cell size 2^8 = 256;
    } 
    
    var uidToObject = [],
        uidToKey = [],
        cells = {};
    
    function filterUnique(array) {
        // Taken form http://jsperf.com/unique-in-array
        // TODO: fix for browsers that don't support Array.indexOf
        var unique = [];
        for (var i = 0, length = array.length; i < length; i++) {
            if (unique.indexOf(array[i]) === -1) unique.push(array[i]);
        }
        return unique;
    };

    function generateRectKeys(x, y, width, height) {
        var sx = x >> shift,
            sy = y >> shift,
            ex = (x + width) >> shift,
            ey = (y + height) >> shift,
            i, j, // TODO: optimize
            keys = [];
        for(j = sy; j <= ey; j++) {
            for(i = sx; i <= ex; i++) {
                keys.push(i + ":" + j);
            }
        }
        return keys;
    };
    
    function generateKeys(object) {
        var boundingBox = getBoundingBox(object); // Get axis-aligned bounding box
        if (boundingBox !== void 0) {
            return generateRectKeys(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
        } else {
            return [];
        }
    };

    this.contains = function(object) {
        return (object.uid !== void 0) && (uidToObject[object.uid] === object);
    };
    
    this.add = function(object) {
        if (object.uid === void 0) {
            throw new Error("Object.uid is undefined.");
        } 
        
        if (this.contains(object)) {
            throw new Error("Object is already in the map. Use SpatialHashMap.update(object) to update its position.");
        }
               
        var uid = object.uid,
            i, key;
        
        // map object
        uidToObject[uid] = object;
        uidToKey[uid] = generateKeys(object);
        
        for(i = 0; i < uidToKey[uid].length; i++) {
            key = uidToKey[uid][i];
            if (cells[key] === void 0) cells[key] = {};
            cells[key][uid] = true;
        }
    };
    
    this.addArray = function(array) {
        for (var i = 0; i < array.length; i++) {
            this.add(array[i]);
        }
    };
	
    this.remove = function(object) {
        if (this.contains(object)) {
            var uid = object.uid,
                i, key;
            for(i = 0; i < uidToKey[uid].length; i++) {
                key = uidToKey[uid][i];
                delete cells[key][uid];  
            }
            delete uidToKey[uid];
            delete uidToObject[uid];
        } else {
            throw new Error("Map doesn't contain the object.");
        }
    };
    
    this.clear = function() {
        uidToObject = [];
        uidToKey = [];
        cells = {};
    };
    
    this.update =  function(object) {
        if (this.contains(object)) {
            var uid = object.uid,
                i, key;
            for(i = 0; i < uidToKey[uid].length; i++) {
                key = uidToKey[uid][i];
                delete cells[key][uid];  
            }
            uidToKey[uid] = this.generateKeys(object);
            for(i = 0; i < uidToKey[uid].length; i++) {
                key = uidToKey[uid][i];
                if (cells[key] === void 0) cells[key] = {};
                cells[key][uid] = true;
            }
        } else {
            throw new Error("Map doesn't contain the object.");          
        }
    };
    
    this.query = function(x, y, width, height) {
        var keys = generateRectKeys(x, y, width, height),
            uids,
            results = [];
        //console.log(keys);
        for(var i = 0; i < keys.length; i++) {
            if (cells[keys[i]]) {
                uids = Object.keys(cells[keys[i]]);
                for(var j = 0; j < uids.length; j++) {
                    results.push(uidToObject[uids[j]]);
                }
            }
        }
        //console.log(filterUnique(results));
        return filterUnique(results);
    };
    
    this.toString = function() {
        return JSON.stringify(cells);
    };
}
