var ShaderProgram = require('./ShaderProgram.js');
var MathUtil = require('../Util/MathUtil.js');
var Const = require('../Util/Const.js');

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
    this.shineDamperLocation = this.getUniformLocation("shineDamper");
    this.reflectivityLocation = this.getUniformLocation("reflectivity");
    this.useFakeNormalLocation = this.getUniformLocation("useFakeNormal");
    this.skyColorLocation = this.getUniformLocation("skyColor");
    this.numberOfRowsLocation = this.getUniformLocation("numberOfRows");
    this.offsetLocation = this.getUniformLocation("offset");

    this.lightPositionLocations = [];
    this.lightColorLocations = [];
    this.attenuationLocations = [];
    for (let i = 0; i < Const.MAX_LIGHTS; i++) {
         this.lightPositionLocations.push(this.getUniformLocation("lightPosition[" + i + "]"));
         this.lightColorLocations.push(this.getUniformLocation("lightColor[" + i + "]"));
         this.attenuationLocations.push(this.getUniformLocation("attenuation[" + i + "]"));
    }
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

StaticShader.prototype.loadLights = function(lights) {
    for (let i = 0; i < Const.MAX_LIGHTS; i++) {
        if (i < lights.length) {
            this.loadVector(this.lightPositionLocations[i], lights[i].position);
            this.loadVector(this.lightColorLocations[i], lights[i].color);
            this.loadVector(this.attenuationLocations[i], lights[i].attenuation);
        } else {
            this.loadVector(this.lightPositionLocations[i], [0, 0, 0]);
            this.loadVector(this.lightColorLocations[i], [0, 0, 0]);
            this.loadVector(this.attenuationLocations[i], [1, 0, 0]);
        }
    }
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

StaticShader.prototype.loadNumberOfRows = function(numberOfRows) {
    this.loadFloat(this.numberOfRowsLocation, numberOfRows);
};

StaticShader.prototype.loadOffset = function(offset) {
    this.load2DVector(this.offsetLocation, offset);
};

var self = module.exports = {
    StaticShader: StaticShader,
}
