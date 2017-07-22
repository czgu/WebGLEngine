var RawModel = require('../Model/TexturedModel.js');

// TexturedModel
function Entity(texturedModel, position, rot, scale, textureIndex=0) {
    this.texturedModel = texturedModel;
    this.position = position;
    this.rotation = rot;
    this.scale = scale;

    this.textureIndex = textureIndex;
}

Entity.prototype.increasePosition = function(dv) {
    vec3.add(this.position, this.position, dv);
}

Entity.prototype.increaseRotation = function(dv) {
    vec3.add(this.rotation, this.rotation, dv);
}

Entity.prototype.getTextureXYOffset = function() {
    let column = (this.textureIndex % this.texturedModel.texture.numberOfRows) / this.texturedModel.texture.numberOfRows;
    let row = Math.floor(this.textureIndex / this.texturedModel.texture.numberOfRows) / this.texturedModel.texture.numberOfRows;

    return [column, row];
}

var self = module.exports = {
    Entity: Entity,
}
