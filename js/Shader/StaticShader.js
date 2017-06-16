var ShaderProgram = require('./ShaderProgram.js');
var MathUtil = require('../Util/MathUtil.js');

const VERTEX_SHADER = require('./GLSL/VertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/FragmentShader.c');

function StaticShader() {
    ShaderProgram.ShaderProgram.call(this, VERTEX_SHADER, FRAGMENT_SHADER);
}
StaticShader.prototype = Object.create(ShaderProgram.ShaderProgram.prototype);
StaticShader.prototype.constructor = StaticShader;

StaticShader.prototype.bindAttributes = function() {
    this.bindAttribute(0, "position");
    this.bindAttribute(1, "texCoord");
    this.bindAttribute(2, "normal");
}

StaticShader.prototype.getAllUniformLocations = function() {
    this.transformationMatrixLocation = this.getUniformLocation("transformationMatrix");
    this.projectionMatrixLocation = this.getUniformLocation("projectionMatrix");
    this.viewMatrixLocation = this.getUniformLocation("viewMatrix");
    this.lightPositionLocation = this.getUniformLocation("lightPosition");
    this.lightColorLocation = this.getUniformLocation("lightColor");
    this.shineDamperLocation = this.getUniformLocation("shineDamper");
    this.reflectivityLocation = this.getUniformLocation("reflectivity");
    this.useFakeNormalLocation = this.getUniformLocation("useFakeNormal");
    this.skyColorLocation = this.getUniformLocation("skyColor");
};

StaticShader.prototype.loadTransMatrix = function(matrix) {
    this.loadMatrix(this.transformationMatrixLocation, matrix);
};

StaticShader.prototype.loadProjectionMatrix = function(matrix) {
    this.loadMatrix(this.projectionMatrixLocation, matrix);
};

StaticShader.prototype.loadViewMatrix = function(camera) {
    let matrix = MathUtil.createViewMatrix(
        camera.position, [camera.pitch, camera.yaw, camera.roll])
    this.loadMatrix(this.viewMatrixLocation, matrix);
};

StaticShader.prototype.loadLight = function(light) {
    this.loadVector(this.lightPositionLocation, light.position);
    this.loadVector(this.lightColorLocation, light.color);
};

StaticShader.prototype.loadShineVariables = function(shineDamper, reflectivity) {
    this.loadFloat(this.shineDamperLocation, shineDamper);
    this.loadFloat(this.reflectivityLocation, reflectivity);
};

StaticShader.prototype.loadUseFakeNormal = function(useFakeNormal) {
    this.loadBool(this.useFakeNormalLocation, useFakeNormal);
};

StaticShader.prototype.loadSkyColor = function(skyColor) {
    this.loadVector(this.skyColorLocation, skyColor);
};

var self = module.exports = {
    StaticShader: StaticShader,
}
