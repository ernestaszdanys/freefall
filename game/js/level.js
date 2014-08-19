function generateObstacles(numberOfObstacles, width, height, offsetY, resources) {
    var obstacleArray = [],
        obstacleVerticleSpacing = height / numberOfObstacles,
        random,
        body;

    var leftWall = new Body(0, offsetY + height / 2, {solid: new Poly(Vec2.parseVectorPrimitiveArray([0, 0, 0, height]))}),
        rightWall = new Body(width, offsetY + height / 2, {solid: new Poly(Vec2.parseVectorPrimitiveArray([0, 0, 0, height]))});

    obstacleArray.push(leftWall);
    obstacleArray.push(rightWall);

    for (var i = 0; i < numberOfObstacles; i++){
        offsetY += obstacleVerticleSpacing;
        random = Math.floor(Math.random() * resources.obstacleTextureVertices.length);

        body = new Body(
            Math.random() * width,
            offsetY, 
            {solid: new Poly(Vec2.parseVectorPrimitiveArray(resources.obstacleTextureVertices[random]), resources.obstacleTextures[random])}
        );

        obstacleArray.push(body);
    }
    
    return obstacleArray;
}

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
