var Loader = require('../RenderEngine/Loader.js');
var SkyboxShader = require('./SkyboxShader.js');
var MathUtil = require('../Util/MathUtil.js');
var RawModel = require('../Model/RawModel.js');
var Util = require('../Util/Util.js');

const SIZE = 500.0;
const VERTICES = [
    -SIZE,  SIZE, -SIZE,
    -SIZE, -SIZE, -SIZE,
     SIZE, -SIZE, -SIZE,
     SIZE, -SIZE, -SIZE,
     SIZE,  SIZE, -SIZE,
    -SIZE,  SIZE, -SIZE,

    -SIZE, -SIZE,  SIZE,
    -SIZE, -SIZE, -SIZE,
    -SIZE,  SIZE, -SIZE,
    -SIZE,  SIZE, -SIZE,
    -SIZE,  SIZE,  SIZE,
    -SIZE, -SIZE,  SIZE,

     SIZE, -SIZE, -SIZE,
     SIZE, -SIZE,  SIZE,
     SIZE,  SIZE,  SIZE,
     SIZE,  SIZE,  SIZE,
     SIZE,  SIZE, -SIZE,
     SIZE, -SIZE, -SIZE,

    -SIZE, -SIZE,  SIZE,
    -SIZE,  SIZE,  SIZE,
     SIZE,  SIZE,  SIZE,
     SIZE,  SIZE,  SIZE,
     SIZE, -SIZE,  SIZE,
    -SIZE, -SIZE,  SIZE,

    -SIZE,  SIZE, -SIZE,
     SIZE,  SIZE, -SIZE,
     SIZE,  SIZE,  SIZE,
     SIZE,  SIZE,  SIZE,
    -SIZE,  SIZE,  SIZE,
    -SIZE,  SIZE, -SIZE,

    -SIZE, -SIZE, -SIZE,
    -SIZE, -SIZE,  SIZE,
     SIZE, -SIZE, -SIZE,
     SIZE, -SIZE, -SIZE,
    -SIZE, -SIZE,  SIZE,
     SIZE, -SIZE,  SIZE
];

const TEXTURE_FILES = [
    'res/cubeMap/right.png',
    'res/cubeMap/left.png',
    'res/cubeMap/bottom.png',
    'res/cubeMap/top.png',
    'res/cubeMap/back.png',
    'res/cubeMap/front.png',
];

let cube = undefined;
let texture = undefined;
let shader = undefined;

function initialize(projectionMatrix) {
    cube = Loader.loadPositionsToVAO(VERTICES, 3);
    Loader.loadCubeMap(TEXTURE_FILES, (t) => {
        texture = t;
    })
    shader = new SkyboxShader.SkyboxShader();
    shader.start();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.stop();
}

function render(camera) {
    if (texture === undefined) {
        return;
    }

    shader.start();

    shader.loadViewMatrix(camera);

    gl.bindVertexArray(cube.vaoID);
    gl.enableVertexAttribArray(0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture); // texture is texture_id

    gl.drawArrays(gl.TRIANGLES, 0, cube.vertexCount);

    gl.disableVertexAttribArray(0);
    gl.bindVertexArray(null);

    shader.stop();
}

function cleanUp() {
    shader.cleanUp();
}


var self = module.exports = {
    initialize: initialize,
    render, render,
    cleanUp: cleanUp,
}
