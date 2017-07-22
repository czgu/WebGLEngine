function ShaderProgram(vertexShaderCode, fragmentShaderCode) {
    this.vertexShaderID = this.loadShader(vertexShaderCode, gl.VERTEX_SHADER);
    this.fragmentShaderID = this.loadShader(fragmentShaderCode, gl.FRAGMENT_SHADER);

    this.programID = gl.createProgram();
    gl.attachShader(this.programID, this.vertexShaderID);
    gl.attachShader(this.programID, this.fragmentShaderID);

    this.bindAttributes();

    gl.linkProgram(this.programID);
    gl.validateProgram(this.programID);

    if (!gl.getProgramParameter(this.programID, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    this.getAllUniformLocations();
}

ShaderProgram.prototype.loadShader = function (code, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, code());
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

ShaderProgram.prototype.start = function () {
    gl.useProgram(this.programID);
};

ShaderProgram.prototype.stop = function () {
    gl.useProgram(null);
};

ShaderProgram.prototype.cleanUp = function () {
    this.stop();
    gl.detachShader(this.programID, this.vertexShaderID);
    gl.detachShader(this.programID, this.fragmentShaderID);
    gl.deleteShader(this.vertexShaderID);
    gl.deleteShader(this.fragmentShaderID);
    gl.deleteProgram(this.programID);
};

// Implement this for children!
ShaderProgram.prototype.bindAttributes = function () {

};

ShaderProgram.prototype.bindAttribute = function (attribute, variableName) {
    gl.bindAttribLocation(this.programID, attribute, variableName);
    //shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "position");
};

// Implement this for children!
ShaderProgram.prototype.getAllUniformLocations = function() {

};

ShaderProgram.prototype.getUniformLocation = function(uniformName) {
        return gl.getUniformLocation(this.programID, uniformName);
};

ShaderProgram.prototype.loadFloat = function(location, value) {
    gl.uniform1f(location, value);
}

ShaderProgram.prototype.loadVector = function(location, vector) {
    gl.uniform3fv(location, vector);
}

ShaderProgram.prototype.load2DVector = function(location, vector) {
    gl.uniform2fv(location, vector);
}

ShaderProgram.prototype.loadInt = function(location, value) {
    gl.uniform1i(location, value);
}

ShaderProgram.prototype.loadBool = function(location, bval) {
    var val = bval ? 1 : 0;
    gl.uniform1f(location, val);
}

ShaderProgram.prototype.loadMatrix = function(location, matrix) {
    gl.uniformMatrix4fv(location, false, matrix);
}

var self = module.exports = {
    ShaderProgram: ShaderProgram,
};
