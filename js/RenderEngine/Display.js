let lastFrameTime;

function getCurrentTime() {
    return new Date().getTime();
}

function createDisplay() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    lastFrameTime = getCurrentTime();
}

function updateDisplay() {
    const currentFrameTime = getCurrentTime();
    self.delta = (currentFrameTime - lastFrameTime) / 1000;
    lastFrameTime = currentFrameTime;

    return true;
}

function closeDisplay() {

}

module.exports = {
    createDisplay,
    updateDisplay,
    closeDisplay,
    delta: undefined,
};
const self = module.exports;
