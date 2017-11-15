const MathUtil = require('../Util/MathUtil.js');

let camera;
let viewMatrix;
let projectionMatrix;

function initialize(_camera) {
    camera = _camera;
    projectionMatrix = _camera.projectionMatrix;
    viewMatrix = MathUtil.createViewMatrix(
        camera.position, [camera.pitch, camera.yaw, camera.roll]);
}

function update() {
    viewMatrix = MathUtil.createViewMatrix(
        camera.position, [camera.pitch, camera.yaw, camera.roll]);
    self.currentRay = calculateMouseRay();
}

function calculateMouseRay() {
    const mouseX = mouseInfo.position[0];
    const mouseY = mouseInfo.position[1];

    const normalizedDeviceCoords = getNormalizedDeviceCoords(mouseX, mouseY);
    const clipCoords = [normalizedDeviceCoords[0], normalizedDeviceCoords[1], -1, 1];
    const eyeCoords = toEyeCoords(clipCoords);
    const worldRay = toWorldCoords(eyeCoords);

    return worldRay;
}

function getNormalizedDeviceCoords(mouseX, mouseY) {
    const x = ((2 * mouseX) / gl.viewportWidth) - 1;
    const y = 1 - ((2 * mouseY) / gl.viewportHeight);
    return [x, y];
}

function toEyeCoords(clipCoords) {
    let invertedProjection = mat4.create();
    mat4.invert(invertedProjection, projectionMatrix);
    let eyeCoords = vec4.create();
    vec4.transformMat4(eyeCoords, clipCoords, invertedProjection);

    return [eyeCoords[0], eyeCoords[1], -1.0, 0.0];
}

function toWorldCoords(eyeCoords) {
    let invertedView = mat4.create();
    mat4.invert(invertedView, viewMatrix);
    let worldCoords = vec4.create();
    vec4.transformMat4(worldCoords, eyeCoords, invertedView);
    let mouseRay = [worldCoords[0], worldCoords[1], worldCoords[2]];
    vec3.normalize(mouseRay, mouseRay);
    return mouseRay;
}

module.exports = {
    initialize,
    currentRay: undefined,
    update,

};
const self = module.exports;
