const ShaderProgram = require('./ShaderProgram.js');
const MathUtil = require('../Util/MathUtil.js');
const Const = require('../Util/Const.js');

const VERTEX_SHADER = require('./GLSL/TerrainVertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/TerrainFragmentShader.c');

class TerrainShader extends ShaderProgram.ShaderProgram {
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
        this.skyColorLocation = this.getUniformLocation('skyColor');

        this.backgroundTextureLocation = this.getUniformLocation('backgroundTexture');
        this.rTextureLocation = this.getUniformLocation('rTexture');
        this.gTextureLocation = this.getUniformLocation('gTexture');
        this.bTextureLocation = this.getUniformLocation('bTexture');
        this.blendMapLocation = this.getUniformLocation('blendMap');

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

    loadViewMatrix(camera) {
        const matrix = MathUtil.createViewMatrix(
            camera.position, [camera.pitch, camera.yaw, camera.roll]);
        this.loadMatrix(this.viewMatrixLocation, matrix);
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

    loadSkyColor(skyColor) {
        this.loadVector(this.skyColorLocation, skyColor);
    }

    connectTextureUnits() {
        this.loadInt(this.backgroundTextureLocation, 0);
        this.loadInt(this.rTextureLocation, 1);
        this.loadInt(this.gTextureLocation, 2);
        this.loadInt(this.bTextureLocation, 3);
        this.loadInt(this.blendMapLocation, 4);
    }
}

module.exports = {
    TerrainShader,
};
