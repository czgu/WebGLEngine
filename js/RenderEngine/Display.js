var lastFrameTime;

function getCurrentTime() {
    return new Date().getTime();
}

var self = module.exports = {
    createDisplay: function() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        lastFrameTime = getCurrentTime();
    },

    updateDisplay: function() {
        let currentFrameTime = getCurrentTime();
        self.delta = (currentFrameTime - lastFrameTime) / 1000;
        lastFrameTime = currentFrameTime;

        return true;
    },

    closeDisplay: function() {

    },

    delta: undefined,
};
