var RawModel = require('../Model/RawModel.js');
var MathUtil = require('../Util/MathUtil.js');
var Util = require('../Util/Util.js');
var TexturedModel = require('../Model/TexturedModel.js');
var Entity = require('../Entities/Entity.js');
var MasterRenderer = require('./MasterRenderer.js');

var projectionMatrix;
var shader;

function initialize(_shader, _projectionMatrix) {
    shader = _shader;
    projectionMatrix = _projectionMatrix;

    shader.start();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.stop();
}

function render(texturedModelEntities) {
    texturedModelEntities.forEach(function(texturedModelEntitiesPair) {
        let texturedModel = texturedModelEntitiesPair[0];
        let entities = texturedModelEntitiesPair[1];

        preparedTexturedModel(texturedModel);
        entities.forEach(function(entity) {
            prepareInstance(entity);
            gl.drawElements(
                gl.TRIANGLES, texturedModel.rawModel.vertexCount, gl.UNSIGNED_INT, 0);
        });
        unbindTexturedModel();
    });
}

function preparedTexturedModel(texturedModel) {
    var model = texturedModel.rawModel;

    gl.bindVertexArray(model.vaoID);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    var texture = texturedModel.texture;
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
    var mvMatrix = MathUtil.createTransformationMatrix(
        entity.position, entity.rotation, entity.scale);
    shader.loadTransMatrix(mvMatrix);
}

var self = module.exports = {
    initialize: initialize,
    render: render,
};
