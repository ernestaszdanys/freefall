

function generateRandomBackgroundObjects(count, texturesArray, width, height, depth, offsetX, offsetY, offsetZ) {
    var backgroundObjects = [];
    
    for (var i = 0; i < count; i++) {
        backgroundObjects.push(new BackgroundObject(
            Math.random() * width + offsetX,
            Math.random() * height + offsetY,
            Math.random() * depth + offsetZ,
            texturesArray[Math.floor(Math.random() * texturesArray.length)]
        ));
    }
    
    return backgroundObjects;
};
