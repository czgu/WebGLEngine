var RawModel = require('../Model/RawModel.js');
var MathUtil = require('../Util/MathUtil.js');
var TexturedModel = require('../Model/TexturedModel.js');
var Terrain = require('../Terrain/Terrain.js');

var projectionMatrix;
var shader;

function initialize(_shader, _projectionMatrix) {
    shader = _shader;
    projectionMatrix = _projectionMatrix;

    shader.start();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.connectTextureUnits();
    shader.stop();
}

function render(terrains) {
    terrains.forEach(function(terrain) {
        prepareTerrain(terrain);
        loadModelMatrix(terrain);

        gl.drawElements(
            gl.TRIANGLES, terrain.rawModel.vertexCount, gl.UNSIGNED_INT, 0);

        unbindTexturedModel(terrain);
    })
}

function prepareTerrain(terrain) {
    var model = terrain.rawModel;
    gl.bindVertexArray(model.vaoID);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    var texture = terrain.texture;
    bindTextures(terrain);
    shader.loadShineVariables(1, 0);
}

function bindTextures(terrain) {
    let texturePack = terrain.texturePack;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texturePack.backgroundTexture.textureID);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texturePack.rTexture.textureID);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texturePack.gTexture.textureID);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texturePack.bTexture.textureID);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, terrain.blendMap.textureID);
}

function unbindTexturedModel() {
    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);

    gl.bindVertexArray(null);
}

function loadModelMatrix(terrain) {
    var mvMatrix = MathUtil.createTransformationMatrix(
        [terrain.x, 0, terrain.z], [0, 0, 0], [1, 1, 1]);
    shader.loadTransMatrix(mvMatrix);
}

var self = module.exports = {
    initialize: initialize,
    render: render,
};
