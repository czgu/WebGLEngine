var RawModel = require('../Model/TexturedModel.js');

// TexturedModel
function Entity(texturedModel, position, rot, scale) {
    this.texturedModel = texturedModel;
    this.position = position;
    this.rotation = rot;
    this.scale = scale;
}

Entity.prototype.increasePosition = function(dv) {
    vec3.add(this.position, this.position, dv);
}

Entity.prototype.increaseRotation = function(dv) {
    vec3.add(this.rotation, this.rotation, dv);
}

var self = module.exports = {
    Entity: Entity,
}
