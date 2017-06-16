var RawModel = require('./RawModel.js');

function TexturedModel(model, texture) {
    this.rawModel = model;
    this.texture = texture; // ModeelTexture
}

var self = module.exports = {
    TexturedModel: TexturedModel,
}
