class ShaderProgram {
    constructor(vertexShaderCode, fragmentShaderCode) {
        this.vertexShaderID = this.loadShader(vertexShaderCode, gl.VERTEX_SHADER);
        this.fragmentShaderID = this.loadShader(fragmentShaderCode, gl.FRAGMENT_SHADER);

        this.programID = gl.createProgram();
        gl.attachShader(this.programID, this.vertexShaderID);
        gl.attachShader(this.programID, this.fragmentShaderID);

        this.bindAttributes();

        gl.linkProgram(this.programID);
        gl.validateProgram(this.programID);

        if (!gl.getProgramParameter(this.programID, gl.LINK_STATUS)) {
          alert('Could not initialise shaders');
        }

        this.getAllUniformLocations();
    }

    loadShader(code, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, code());
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    start() {
        gl.useProgram(this.programID);
    }

    stop() {
        gl.useProgram(null);
    }

    cleanUp() {
        this.stop();
        gl.detachShader(this.programID, this.vertexShaderID);
        gl.detachShader(this.programID, this.fragmentShaderID);
        gl.deleteShader(this.vertexShaderID);
        gl.deleteShader(this.fragmentShaderID);
        gl.deleteProgram(this.programID);
    }

    // Implement this for children!
    bindAttributes() {

    }

    bindAttribute(attribute, variableName) {
        gl.bindAttribLocation(this.programID, attribute, variableName);
        // shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "position");
    }

    // Implement this for children!
    getAllUniformLocations() {

    }

    getUniformLocation(uniformName) {
            return gl.getUniformLocation(this.programID, uniformName);
    }

    loadFloat(location, value) {
        gl.uniform1f(location, value);
    }

    loadVector(location, vector) {
        gl.uniform3fv(location, vector);
    }

    load2DVector(location, vector) {
        gl.uniform2fv(location, vector);
    }

    loadInt(location, value) {
        gl.uniform1i(location, value);
    }

    loadBool(location, bval) {
        const val = bval ? 1 : 0;
        gl.uniform1f(location, val);
    }

    loadMatrix(location, matrix) {
        gl.uniformMatrix4fv(location, false, matrix);
    }
}

module.exports = {
    ShaderProgram,
};
