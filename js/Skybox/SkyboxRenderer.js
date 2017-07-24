const Loader = require('../RenderEngine/Loader.js');
const SkyboxShader = require('./SkyboxShader.js');

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

const TEXTURE_FILES = [
    'res/cubeMap/day/right.png',
    'res/cubeMap/day/left.png',
    'res/cubeMap/day/bottom.png',
    'res/cubeMap/day/top.png',
    'res/cubeMap/day/back.png',
    'res/cubeMap/day/front.png',
];

const NIGHT_TEXTURE_FILES = [
    'res/cubeMap/night/nightRight.png',
    'res/cubeMap/night/nightLeft.png',
    'res/cubeMap/night/nightBottom.png',
    'res/cubeMap/night/nightTop.png',
    'res/cubeMap/night/nightBack.png',
    'res/cubeMap/night/nightFront.png',
];

let cube;
let texture;
let nightTexture;
let shader;

function initialize(projectionMatrix) {
    cube = Loader.loadPositionsToVAO(VERTICES, 3);
    Loader.loadCubeMap(TEXTURE_FILES, (t) => {
        texture = t;
    });

    Loader.loadCubeMap(NIGHT_TEXTURE_FILES, (t) => {
        nightTexture = t;
    });

    shader = new SkyboxShader.SkyboxShader();

    shader.start();
    shader.connectTextureUnits();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.stop();
}

function render(camera, fogColor) {
    if (texture === undefined || nightTexture === undefined) {
        return;
    }

    shader.start();

    shader.loadViewMatrix(camera);
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
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture); // texture is texture_id

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, nightTexture); // texture is texture_id

    shader.loadBlendFactor(0.5);
}

module.exports = {
    initialize,
    render,
    cleanUp,
};
