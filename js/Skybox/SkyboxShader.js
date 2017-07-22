var ShaderProgram = require('../Shader/ShaderProgram.js');
var MathUtil = require('../Util/MathUtil.js');

const VERTEX_SHADER = require('./GLSL/SkyboxVertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/SkyboxFragmentShader.c');

function SkyboxShader() {
    ShaderProgram.ShaderProgram.call(this, VERTEX_SHADER, FRAGMENT_SHADER);
}

SkyboxShader.prototype = Object.create(ShaderProgram.ShaderProgram.prototype);
SkyboxShader.prototype.constructor = SkyboxShader;

SkyboxShader.prototype.bindAttributes = function() {
    this.bindAttribute(0, "position");
}

SkyboxShader.prototype.getAllUniformLocations = function() {
    this.projectionMatrixLocation = this.getUniformLocation("projectionMatrix");
    this.viewMatrixLocation = this.getUniformLocation("viewMatrix");
}

SkyboxShader.prototype.loadProjectionMatrix = function(matrix) {
    this.loadMatrix(this.projectionMatrixLocation, matrix);
}

SkyboxShader.prototype.loadViewMatrix = function(camera) {
    let matrix = MathUtil.createViewMatrix(
        [0, 0, 0], [camera.pitch, camera.yaw, camera.roll]);
    this.loadMatrix(this.viewMatrixLocation, matrix);
}

var self = module.exports = {
    SkyboxShader: SkyboxShader,
}
