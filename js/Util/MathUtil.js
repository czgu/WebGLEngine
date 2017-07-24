function toQuaternion(rotation) {
    let q = quat.create();
    quat.rotateX(q, q, rotation[0]);
    quat.rotateY(q, q, rotation[1]);
    quat.rotateZ(q, q, rotation[2]);
    return q;
}

function barryCentric(p1, p2, p3, pos) {
    let det = (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
    let l1 = ((p2[2] - p3[2]) * (pos[0] - p3[0]) + (p3[0] - p2[0]) * (pos[1] - p3[2])) / det;
    let l2 = ((p3[2] - p1[2]) * (pos[0] - p3[0]) + (p1[0] - p3[0]) * (pos[1] - p3[2])) / det;
    let l3 = 1.0 - l1 - l2;
    return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
}

function toRadians(angle) {
    return (angle / 180) * Math.PI;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function createTransformationMatrix(translation, rotation, scale) {
    let matrix = mat4.create();
    mat4.fromRotationTranslationScale(matrix, toQuaternion(rotation), translation, scale);

    return matrix;
}

function create2DTransformationMatrix(translation, scale) {
    let matrix = mat4.create();
    mat4.fromRotationTranslationScale(matrix, quat.create(), translation.concat([0]), scale.concat([1]));

    return matrix;
}

function createViewMatrix(translation, rotation) {
    let matrix = mat4.create();
    mat4.fromQuat(matrix, toQuaternion(rotation));
    // mat4.rotate(matrix, matrix, rotation[0], [1, 0, 0]);
    // mat4.rotate(matrix, matrix, rotation[1], [0, 1, 0]);

    let negateTranslation = vec3.create();
    vec3.negate(negateTranslation, translation);
    mat4.translate(matrix, matrix, negateTranslation);

    return matrix;
}

module.exports = {
    createTransformationMatrix,

    create2DTransformationMatrix,

    createViewMatrix,

    toRadians,

    clamp,
    barryCentric,
};
