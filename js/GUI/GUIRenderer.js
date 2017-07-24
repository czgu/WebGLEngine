const Loader = require('../RenderEngine/Loader.js');
const GUIShader = require('./GUIShader.js');
const MathUtil = require('../Util/MathUtil.js');

let quad;
let shader;

function initialize() {
    const positions = [-1, 1, -1, -1, 1, 1, 1, -1];
    quad = Loader.loadPositionsToVAO(positions, 2);
    shader = new GUIShader.GUIShader();
}

function render(guis) {
    shader.start();

    gl.bindVertexArray(quad.vaoID);
    gl.enableVertexAttribArray(0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    guis.forEach((gui) => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gui.texture.textureID);

        const transformationMatrix = MathUtil.create2DTransformationMatrix(gui.position, gui.scale);
        shader.loadTransMatrix(transformationMatrix);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, quad.vertexCount);
    });
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
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
