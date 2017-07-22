var RawModel = require('../Model/RawModel.js');

var vaos = [];
var vbos = [];
var textures = [];

function createVAO() {
    var vaoID = gl.createVertexArray();
    vaos.push(vaoID);

    gl.bindVertexArray(vaoID);
    return vaoID;
}

function storeDataInAttributeList(attribute, itemSize, data) {
    var vboID = gl.createBuffer();
    vbos.push(vboID);

    gl.bindBuffer(gl.ARRAY_BUFFER, vboID);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute, itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function bindIndicesBuffer(indices) {
    var vboID = gl.createBuffer();
    vbos.push(vboID);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vboID);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function unbindVAO() {
    gl.bindVertexArray(null);
}

function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

function loadToVAO(positions, textureCoords, normals, indices) {
    var vaoID = createVAO();

    storeDataInAttributeList(0, 3, positions);
    storeDataInAttributeList(1, 2, textureCoords);
    storeDataInAttributeList(2, 3, normals);
    bindIndicesBuffer(indices);
    unbindVAO();
    return new RawModel.RawModel(vaoID, indices.length);
}

function loadPositionsToVAO(positions, dimensions) {
    let vaoID = createVAO();
    storeDataInAttributeList(0, dimensions, positions);
    unbindVAO();

    return new RawModel.RawModel(vaoID, positions.length / dimensions);
}

function loadTexture(imageUrl, callback) {
    var image = new Image();
    var texture = gl.createTexture();

    textures.push(texture);

    texture.image = image;
    image.onload = function () {
        handleLoadedTexture(texture);
        callback(texture);
    }
    image.src = imageUrl;

    return texture;
}

function loadCubeMapTextureCompleted(texture, callback) {
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    textures.push(texture);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    callback(texture);
}

function loadCubeMapTexture(texture, textureFiles, index, callback) {
    if (index === textureFiles.length) {
        loadCubeMapTextureCompleted(texture, callback);
        return;
    }

    let image = new Image();
    image.src = textureFiles[index];
    image.onload = () => {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index,  0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        loadCubeMapTexture(texture, textureFiles, index + 1, callback);
    };
}

function loadCubeMap(textureFiles, callback) {
    let texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    loadCubeMapTexture(texture, textureFiles, 0, callback);
}

var self = module.exports = {
    loadToVAO: loadToVAO,

    loadPositionsToVAO: loadPositionsToVAO,

    loadTexture: loadTexture,

    loadCubeMap: loadCubeMap,

    cleanUp: function() {
        for (let vao of vaos) {
            gl.deleteVertexArray(vao);
        }

        for (let vbo of vbos) {
            gl.deleteBuffer(vbo);
        }

        for (let texture of textures) {
            gl.deleteTexture(texture);
        }
    },
};
