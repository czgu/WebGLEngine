var ShaderProgram = require('../Shader/ShaderProgram.js');
var MathUtil = require('../Util/MathUtil.js');

const VERTEX_SHADER = require('./GLSL/GUIVertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/GUIFragmentShader.c');

function GUIShader() {
    ShaderProgram.ShaderProgram.call(this, VERTEX_SHADER, FRAGMENT_SHADER);
}
GUIShader.prototype = Object.create(ShaderProgram.ShaderProgram.prototype);
GUIShader.prototype.constructor = GUIShader;

GUIShader.prototype.bindAttributes = function() {
    this.bindAttribute(0, "position");
}

GUIShader.prototype.getAllUniformLocations = function() {
    this.transformationMatrixLocation = this.getUniformLocation("transformationMatrix");
}

GUIShader.prototype.loadTransMatrix = function(matrix) {
    this.loadMatrix(this.transformationMatrixLocation, matrix);
}

var self = module.exports = {
    GUIShader: GUIShader,
}
