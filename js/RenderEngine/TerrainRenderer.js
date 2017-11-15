const MathUtil = require('../Util/MathUtil.js');
const TerrainShader = require('../Shader/TerrainShader.js');

let shader;

function initialize(camera) {
    shader = new TerrainShader.TerrainShader();

    shader.start();
    shader.loadProjectionMatrix(camera.projectionMatrix);
    shader.connectTextureUnits();
    shader.stop();
}

function render(camera, lights, skyColor, terrains) {
    prepareRender(camera, lights, skyColor);

    terrains.forEach((terrain) => {
        prepareTerrain(terrain);
        loadModelMatrix(terrain);

        gl.drawElements(
            gl.TRIANGLES, terrain.rawModel.vertexCount, gl.UNSIGNED_INT, 0);

        unbindTexturedModel(terrain);
    });
    stopRender();
}

function prepareRender(camera, lights, skyColor) {
    shader.start();
    shader.loadSkyColor(skyColor);
    shader.loadLights(lights);
    shader.loadCamera(camera);
}

function stopRender() {
    shader.stop();
}

function prepareTerrain(terrain) {
    const model = terrain.rawModel;
    gl.bindVertexArray(model.vaoID);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    // const texture = terrain.texture;
    bindTextures(terrain);
    shader.loadShineVariables(1, 0);
}

function bindTextures(terrain) {
    const texturePack = terrain.texturePack;
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
    const mvMatrix = MathUtil.createTransformationMatrix(
        [terrain.x, 0, terrain.z], [0, 0, 0], [1, 1, 1]);
    shader.loadTransMatrix(mvMatrix);
}

function cleanUp() {
    shader.cleanUp();
}

module.exports = {
    initialize,
    render,
    cleanUp,
};
