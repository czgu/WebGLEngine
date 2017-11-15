const ShaderProgram = require('./ShaderProgram.js');
const Const = require('../Util/Const.js');

const VERTEX_SHADER = require('./GLSL/VertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/FragmentShader.c');

class StaticShader extends ShaderProgram.ShaderProgram {
    constructor() {
        super(VERTEX_SHADER, FRAGMENT_SHADER);
    }

    bindAttributes() {
        this.bindAttribute(0, 'position');
        this.bindAttribute(1, 'texCoord');
        this.bindAttribute(2, 'normal');
    }

    getAllUniformLocations() {
        this.transformationMatrixLocation = this.getUniformLocation('transformationMatrix');
        this.projectionMatrixLocation = this.getUniformLocation('projectionMatrix');
        this.viewMatrixLocation = this.getUniformLocation('viewMatrix');
        this.shineDamperLocation = this.getUniformLocation('shineDamper');
        this.reflectivityLocation = this.getUniformLocation('reflectivity');
        this.useFakeNormalLocation = this.getUniformLocation('useFakeNormal');
        this.skyColorLocation = this.getUniformLocation('skyColor');
        this.numberOfRowsLocation = this.getUniformLocation('numberOfRows');
        this.offsetLocation = this.getUniformLocation('offset');

        this.lightPositionLocations = [];
        this.lightColorLocations = [];
        this.attenuationLocations = [];
        for (let i = 0; i < Const.MAX_LIGHTS; i++) {
             this.lightPositionLocations.push(this.getUniformLocation(`lightPosition[${i}]`));
             this.lightColorLocations.push(this.getUniformLocation(`lightColor[${i}]`));
             this.attenuationLocations.push(this.getUniformLocation(`attenuation[${i}]`));
        }
    }

    loadTransMatrix(matrix) {
        this.loadMatrix(this.transformationMatrixLocation, matrix);
    }

    loadProjectionMatrix(matrix) {
        this.loadMatrix(this.projectionMatrixLocation, matrix);
    }

    loadCamera(camera) {
        let { projection, view } = camera.calculateProjectionAndViewMatrices();
        this.loadMatrix(this.projectionMatrixLocation, projection);
        this.loadMatrix(this.viewMatrixLocation, view);
    }

    loadLights(lights) {
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
    }

    loadShineVariables(shineDamper, reflectivity) {
        this.loadFloat(this.shineDamperLocation, shineDamper);
        this.loadFloat(this.reflectivityLocation, reflectivity);
    }

    loadUseFakeNormal(useFakeNormal) {
        this.loadBool(this.useFakeNormalLocation, useFakeNormal);
    }

    loadSkyColor(skyColor) {
        this.loadVector(this.skyColorLocation, skyColor);
    }

    loadNumberOfRows(numberOfRows) {
        this.loadFloat(this.numberOfRowsLocation, numberOfRows);
    }

    loadOffset(offset) {
        this.load2DVector(this.offsetLocation, offset);
    }
}

module.exports = {
    StaticShader,
};
