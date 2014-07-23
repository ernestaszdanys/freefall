// TODO: make this mess readable...
function SpatialHashMap(shift) {
    if (!shift) shift = 5; // default cell size 2^5 = 32;
    
    var toArrayOfUnique = function(array) {
        // taken form http://jsperf.com/unique-in-array
        // TODO: fix for browsers that don't support Array.indexOf
        var a = [];
        for (var i=0, l=array.length; i<l; i++) if (a.indexOf(array[i]) === -1) a.push(array[i]);
        return a;
    }
    
    var createUid = (function() {
        var id = 1;
        return function() {return id++;};
    })();
    
    var ids = [],
        keys = [],
        cells = {},
        hash = function(object) {
            var sx = object.shape.x >> shift,
                sy = object.shape.y >> shift,
                ex = (object.shape.x + object.shape.width) >> shift,
                ey = (object.shape.y + object.shape.height) >> shift,
                x, y, keys = [];
            for(y = sy; y <= ey; y++) for(x = sx; x <= ex; x++) keys.push(x + ":" + y);
            return keys;
        };

    this.contains = function(object) {
        return (typeof object.__uid !== "undefined") && (typeof ids[object.__uid] !== "undefined");
    };
    
    this.add = function(object) {
        if (this.contains(object)) throw new Error("Object is already in the map. Use SpatialHashMap.rehash() to update its position.");
               
        // create unique id... TODO: what if object belongs to another map... this will mess things up
        var uid = createUid();
        object.__uid = uid; // TODO: non-enumerable
        
        // map object
        ids[uid] = object;
        keys[uid] = hash(object);
        
        var key;
        for(var i = 0; i < keys[uid].length; i++) {
            key = keys[uid][i];
            if (typeof cells[key] === "undefined") cells[key] = {};
            cells[key][uid] = true;
        }
    };
    
    this.remove = function(object) {
        if (this.contains(object)) {
            var uid = object.__uid,
                i, key;
            for(i = 0; i < keys[uid].length; i++) {
                key = keys[uid][i];
                delete cells[key][uid];  
            }
            delete keys[uid];
            delete ids[uid];
        } else {
            throw new Error("Map doesn't contain the object.");
        }
    };
    
    this.rehash =  function(object) {
        if (this.contains(object)) {
            var uid = object.__uid,
                i, key;
            for(i = 0; i < keys[uid].length; i++) {
                key = keys[uid][i];
                delete cells[key][uid];  
            }
            keys[uid] = this.hash(object);
            for(i = 0; i < keys[uid].length; i++) {
                key = keys[uid][i];
                if (typeof cells[key] === "undefined") cells[key] = {};
                cells[key][uid] = true;
            }
        } else {
            throw new Error("Map doesn't contain the object.");          
        }
    };
    
    this.query = function(x, y, width, height) {
		var rectObj = {};
		rectObj.shape.x = x;
		rectObj.shape.y = y;
		rectObj.shape.width = width;
		rectObj.shape.height = height;
        var rectKeys = hash(rectObj),
            objectIds,
            results = [];
        for(var i = 0; i < rectKeys.length; i++) {
            //for(var uid in cells[rectKeys[i]])results.push(ids[uid]);
            if (cells[rectKeys[i]]) {
                objectIds = Object.keys(cells[rectKeys[i]]);
                for(var j = 0; j < objectIds.length; j++) results.push(ids[objectIds[j]]);
			}
        }
        return toArrayOfUnique(results);
    };
    
    this.toString = function() {
        return JSON.stringify(cells);
    };
}
