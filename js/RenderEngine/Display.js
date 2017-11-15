let lastFrameTime;

function resizeCanvas(canvas) {
    let displayWidth = canvas.clientWidth;
    let displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    createDisplay();
}

function initDisplay() {
    const canvas = document.getElementById('canvas');
    try {
        window.gl = canvas.getContext('webgl2');
    } catch (e) {
        // TODO: show error
    }

    if (!window.gl) {
        alert('Could not initialise WebGL, sorry :-( ');
    }

    window.addEventListener('resize', resizeCanvas.bind(this, canvas));
    resizeCanvas(canvas);
}

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
    initDisplay,
};
const self = module.exports;
