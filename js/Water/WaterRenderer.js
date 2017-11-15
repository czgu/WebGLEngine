const Loader = require('../RenderEngine/Loader.js');
const WaterShader = require('./WaterShader.js');
const MathUtil = require('../Util/MathUtil.js');

let shader;
let quad;

function initialize(camera) {
    shader = new WaterShader.WaterShader();
    shader.start();
    shader.loadProjectionMatrix(camera.projectionMatrix);
    shader.stop();

    quad = Loader.loadPositionsToVAO([-1, -1, -1, 1, 1, -1, 1, -1, -1, 1, 1, 1], 2);
}

function render(camera, waters) {
    prepareRender(camera);

    waters.forEach((water) => {
        const modelMatrix = MathUtil.createTransformationMatrix(
            [water.x, water.height, water.z], [0, 0, 0], [water.tile_size, water.tile_size, water.tile_size],
        );
        shader.loadModelMatrix(modelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, quad.vertexCount);
    });

    stopRender();
}

function prepareRender(camera) {
    shader.start();
    shader.loadCamera(camera);
    gl.bindVertexArray(quad.vaoID);
    gl.enableVertexAttribArray(0);
}

function stopRender() {
    gl.disableVertexAttribArray(0);
    gl.bindVertexArray(null);
    shader.stop();
}

function cleanUp() {
    shader.cleanUp();
}

module.exports = {
    initialize,
    render,
    cleanUp,
};
