// TODO

var DEG_TO_RAD = 0.0174532925;

function projectVec4(m, v) {
    return [
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3],
        m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3],
        m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3],
        m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3]
    ]
}

function multiplyMat44(a, b) {
    return [
        b[0] * a[0] + b[4] * a[1] + b[8] * a[2] + b[12] * a[3],
        b[1] * a[0] + b[5] * a[1] + b[9] * a[2] + b[13] * a[3],
        b[2] * a[0] + b[6] * a[1] + b[10] * a[2] + b[14] * a[3],
        b[3] * a[0] + b[7] * a[1] + b[11] * a[2] + b[15] * a[3],
        b[0] * a[4] + b[4] * a[5] + b[8] * a[6] + b[12] * a[7],
        b[1] * a[4] + b[5] * a[5] + b[9] * a[6] + b[13] * a[7],
        b[2] * a[4] + b[6] * a[5] + b[10] * a[6] + b[14] * a[7],
        b[3] * a[4] + b[7] * a[5] + b[11] * a[6] + b[15] * a[7],
        b[0] * a[8] + b[4] * a[9] + b[8] * a[10] + b[12] * a[11],
        b[1] * a[8] + b[5] * a[9] + b[9] * a[10] + b[13] * a[11],
        b[2] * a[8] + b[6] * a[9] + b[10] * a[10] + b[14] * a[11],
        b[3] * a[8] + b[7] * a[9] + b[11] * a[10] + b[15] * a[11],
        b[0] * a[12] + b[4] * a[13] + b[8] * a[14] + b[12] * a[15],
        b[1] * a[12] + b[5] * a[13] + b[9] * a[14] + b[13] * a[15],
        b[2] * a[12] + b[6] * a[13] + b[10] * a[14] + b[14] * a[15],
        b[3] * a[12] + b[7] * a[13] + b[11] * a[14] + b[15] * a[15]
    ];
}
    
function createIdentity() {
    return [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];
}

function createTranslation(x, y, z) {
    return [1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1];
}

function createRotationX(angle) {
    angle *= DEG_TO_RAD;
    var c = Math.cos(angle),
        s = Math.sin(angle);
    return [1, 0, 0, 0,
            0, c,-s, 0,
            0, s, c, 0,
            0, 0, 0, 1];
}

function createRotationY(angle) {
    angle *= DEG_TO_RAD;
    var c = Math.cos(angle),
        s = Math.sin(angle);
    return [c, 0, s, 0,
            0, 1, 0, 0, 
            -s,0, c, 0,
            0, 0, 0, 1];
}

function createRotationZ(angle) {
    angle *= DEG_TO_RAD;
    var c = Math.cos(angle),
        s = Math.sin(angle);
    return [c,-s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1];
}

function createScale(x, y, z) {
    return [x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1];
}

function createPerspective(d) {
    var p = 1 / -d;
    return [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1,-d,
            0, 0, p, 1];
}

function perspectiveProject(vector, perspective, perspectiveOriginX, perspectiveOriginY) {
    /* 
     * Creates perspective projection (x, y, scale) of a 3d point (x, y, z).
     * perspective - distance from viewers eye to the screen (use 800 for somewhat realistic look);
     * perspectiveOriginX, perspectiveOriginY - vanishing point;
     */
    var w = -perspective / (vector[2] - perspective),
        x = (vector[0] - perspectiveOriginX) * w + perspectiveOriginX,
        y = (vector[1] - perspectiveOriginY) * w + perspectiveOriginY;
    
	return [x, y, w];
}
