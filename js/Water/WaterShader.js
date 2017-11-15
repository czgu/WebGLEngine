const ShaderProgram = require('../Shader/ShaderProgram.js');
const MathUtil = require('../Util/MathUtil.js');

const VERTEX_SHADER = require('./GLSL/WaterVertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/WaterFragmentShader.c');

class WaterShader extends ShaderProgram.ShaderProgram {
    constructor() {
        super(VERTEX_SHADER, FRAGMENT_SHADER);
    }

    bindAttributes() {
        this.bindAttribute(0, 'position');
    }

    getAllUniformLocations() {
        this.projectionMatrixLocation = this.getUniformLocation('projectionMatrix');
        this.viewMatrixLocation = this.getUniformLocation('viewMatrix');
        this.modelMatrixLocation = this.getUniformLocation('modelMatrix');
    }

    loadProjectionMatrix(matrix) {
        this.loadMatrix(this.projectionMatrixLocation, matrix);
    }

    loadCamera(camera) {
        let { projection, view } = camera.calculateProjectionAndViewMatrices();
        this.loadMatrix(this.projectionMatrixLocation, projection);
        this.loadMatrix(this.viewMatrixLocation, view);
    }

    loadModelMatrix(matrix) {
        this.loadMatrix(this.modelMatrixLocation, matrix);
    }
}

module.exports = {
    WaterShader,
};
