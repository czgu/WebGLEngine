const ShaderProgram = require('../Shader/ShaderProgram.js');

const VERTEX_SHADER = require('./GLSL/GUIVertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/GUIFragmentShader.c');

class GUIShader extends ShaderProgram.ShaderProgram {
    constructor() {
        super(VERTEX_SHADER, FRAGMENT_SHADER);
    }

    bindAttributes() {
        this.bindAttribute(0, 'position');
    }

    getAllUniformLocations() {
        this.transformationMatrixLocation = this.getUniformLocation('transformationMatrix');
    }

    loadTransMatrix(matrix) {
        this.loadMatrix(this.transformationMatrixLocation, matrix);
    }
}

module.exports = {
    GUIShader,
};
