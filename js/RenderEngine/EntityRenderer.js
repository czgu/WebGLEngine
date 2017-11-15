const MathUtil = require('../Util/MathUtil.js');
const Util = require('../Util/Util.js');
const StaticShader = require('../Shader/StaticShader.js');

let shader;

function initialize(camera) {
    shader = new StaticShader.StaticShader();

    shader.start();
    shader.loadProjectionMatrix(camera.projectionMatrix);
    shader.stop();
}

function render(camera, lights, skyColor, texturedModelEntities) {
    prepareRender(camera, lights, skyColor);

    texturedModelEntities.forEach((texturedModelEntitiesPair) => {
        const texturedModel = texturedModelEntitiesPair[0];
        const entities = texturedModelEntitiesPair[1];

        preparedTexturedModel(texturedModel);
        entities.forEach((entity) => {
            prepareInstance(entity);
            gl.drawElements(
                gl.TRIANGLES, texturedModel.rawModel.vertexCount, gl.UNSIGNED_INT, 0);
        });
        unbindTexturedModel();
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

function preparedTexturedModel(texturedModel) {
    const model = texturedModel.rawModel;

    gl.bindVertexArray(model.vaoID);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    const texture = texturedModel.texture;
    shader.loadNumberOfRows(texture.numberOfRows);
    if (texture.hasTransparency) {
        Util.disableCulling();
    }
    shader.loadUseFakeNormal(texture.useFakeNormal);
    shader.loadShineVariables(texture.shineDamper, texture.reflectivity);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.textureID);
}

function unbindTexturedModel() {
    Util.enableCulling();

    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);

    gl.bindVertexArray(null);
}

function prepareInstance(entity) {
    const mvMatrix = MathUtil.createTransformationMatrix(
        entity.position, entity.rotation, entity.scale);
    shader.loadTransMatrix(mvMatrix);
    shader.loadOffset(entity.getTextureXYOffset());
}

function cleanUp() {
    shader.cleanUp();
}

module.exports = {
    initialize,
    render,
    cleanUp,
};
