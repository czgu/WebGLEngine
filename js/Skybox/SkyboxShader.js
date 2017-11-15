const ShaderProgram = require('../Shader/ShaderProgram.js');
const MathUtil = require('../Util/MathUtil.js');
const Display = require('../RenderEngine/Display.js');

const VERTEX_SHADER = require('./GLSL/SkyboxVertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/SkyboxFragmentShader.c');

const ROTATION_SPEED = Math.PI / 180;

class SkyboxShader extends ShaderProgram.ShaderProgram {
    constructor() {
        super(VERTEX_SHADER, FRAGMENT_SHADER);

        this.rotation = 0;
    }

    bindAttributes() {
        this.bindAttribute(0, 'position');
    }

    getAllUniformLocations() {
        this.projectionMatrixLocation = this.getUniformLocation('projectionMatrix');
        this.viewMatrixLocation = this.getUniformLocation('viewMatrix');
        this.fogColorLocation = this.getUniformLocation('fogColor');
        this.blendFactorLocation = this.getUniformLocation('blendFactor');
        this.cubeMapLocation = this.getUniformLocation('cubeMap');
        this.cubeMap2Location = this.getUniformLocation('cubeMap2');
    }

    loadProjectionMatrix(matrix) {
        this.loadMatrix(this.projectionMatrixLocation, matrix);
    }

    loadCamera(camera) {
        let { projection, view } = camera.calculateProjectionAndViewMatrices([0, 0, 0]);
        this.rotation += Display.delta * ROTATION_SPEED;
        mat4.rotateY(view, view, this.rotation);
        this.loadMatrix(this.viewMatrixLocation, view);
    }

    loadFogColor(color) {
        this.loadVector(this.fogColorLocation, color);
    }

    loadBlendFactor(blendFactor) {
        this.loadFloat(this.blendFactorLocation, blendFactor);
    }

    connectTextureUnits() {
        this.loadInt(this.cubeMapLocation, 0);
        this.loadInt(this.cubeMap2Location, 1);
    }
}

module.exports = {
    SkyboxShader,
};
