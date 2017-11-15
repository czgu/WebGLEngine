const Loader = require('../RenderEngine/Loader.js');
const SkyboxShader = require('./SkyboxShader.js');
const AsyncResource = require('../Resource/AsyncResource.js');

const SIZE = 500.0;
const VERTICES = [
    -SIZE, SIZE, -SIZE,
    -SIZE, -SIZE, -SIZE,
    SIZE, -SIZE, -SIZE,
    SIZE, -SIZE, -SIZE,
    SIZE, SIZE, -SIZE,
    -SIZE, SIZE, -SIZE,

    -SIZE, -SIZE, SIZE,
    -SIZE, -SIZE, -SIZE,
    -SIZE, SIZE, -SIZE,
    -SIZE, SIZE, -SIZE,
    -SIZE, SIZE, SIZE,
    -SIZE, -SIZE, SIZE,

    SIZE, -SIZE, -SIZE,
    SIZE, -SIZE, SIZE,
    SIZE, SIZE, SIZE,
    SIZE, SIZE, SIZE,
    SIZE, SIZE, -SIZE,
    SIZE, -SIZE, -SIZE,

    -SIZE, -SIZE, SIZE,
    -SIZE, SIZE, SIZE,
    SIZE, SIZE, SIZE,
    SIZE, SIZE, SIZE,
    SIZE, -SIZE, SIZE,
    -SIZE, -SIZE, SIZE,

    -SIZE, SIZE, -SIZE,
    SIZE, SIZE, -SIZE,
    SIZE, SIZE, SIZE,
    SIZE, SIZE, SIZE,
    -SIZE, SIZE, SIZE,
    -SIZE, SIZE, -SIZE,

    -SIZE, -SIZE, -SIZE,
    -SIZE, -SIZE, SIZE,
    SIZE, -SIZE, -SIZE,
    SIZE, -SIZE, -SIZE,
    -SIZE, -SIZE, SIZE,
    SIZE, -SIZE, SIZE,
];

let cube;
let shader;

function initialize(camera) {
    cube = Loader.loadPositionsToVAO(VERTICES, 3);
    shader = new SkyboxShader.SkyboxShader();

    shader.start();
    shader.connectTextureUnits();
    shader.loadProjectionMatrix(camera.projectionMatrix);
    shader.stop();
}

function render(camera, fogColor) {
    shader.start();

    shader.loadCamera(camera);
    shader.loadFogColor(fogColor);

    gl.bindVertexArray(cube.vaoID);
    gl.enableVertexAttribArray(0);

    bindTextures();

    gl.drawArrays(gl.TRIANGLES, 0, cube.vertexCount);

    gl.disableVertexAttribArray(0);
    gl.bindVertexArray(null);

    shader.stop();
}

function cleanUp() {
    shader.cleanUp();
}

function bindTextures() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, AsyncResource.resource.cubeMaps.day); // texture is texture_id

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, AsyncResource.resource.cubeMaps.night); // texture is texture_id

    shader.loadBlendFactor(0.5);
}

module.exports = {
    initialize,
    render,
    cleanUp,
};
