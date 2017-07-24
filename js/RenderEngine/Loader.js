const RawModel = require('../Model/RawModel.js');

const vaos = [];
const vbos = [];
const textures = [];

function createVAO() {
    const vaoID = gl.createVertexArray();
    vaos.push(vaoID);

    gl.bindVertexArray(vaoID);
    return vaoID;
}

function storeDataInAttributeList(attribute, itemSize, data) {
    const vboID = gl.createBuffer();
    vbos.push(vboID);

    gl.bindBuffer(gl.ARRAY_BUFFER, vboID);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute, itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function bindIndicesBuffer(indices) {
    const vboID = gl.createBuffer();
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
    const vaoID = createVAO();

    storeDataInAttributeList(0, 3, positions);
    storeDataInAttributeList(1, 2, textureCoords);
    storeDataInAttributeList(2, 3, normals);
    bindIndicesBuffer(indices);
    unbindVAO();
    return new RawModel.RawModel(vaoID, indices.length);
}

function loadPositionsToVAO(positions, dimensions) {
    const vaoID = createVAO();
    storeDataInAttributeList(0, dimensions, positions);
    unbindVAO();

    return new RawModel.RawModel(vaoID, positions.length / dimensions);
}

function loadTexture(imageUrl, callback) {
    const image = new Image();
    const texture = gl.createTexture();

    textures.push(texture);

    texture.image = image;
    image.onload = () => {
        handleLoadedTexture(texture);
        callback(texture);
    };
    image.src = imageUrl;

    return texture;
}

function loadCubeMapTextureCompleted(texture, callback) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    textures.push(texture);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    callback(texture);
}

function loadCubeMapTexture(texture, textureFiles, index, callback) {
    if (index === textureFiles.length) {
        loadCubeMapTextureCompleted(texture, callback);
        return;
    }

    const image = new Image();
    image.src = textureFiles[index];
    image.onload = () => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        loadCubeMapTexture(texture, textureFiles, index + 1, callback);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    };
}

function loadCubeMap(textureFiles, callback) {
    const texture = gl.createTexture();
    loadCubeMapTexture(texture, textureFiles, 0, callback);
}

function cleanUp() {
    vaos.forEach((vao) => {
        gl.deleteVertexArray(vao);
    });

    vbos.forEach((vbo) => {
        gl.deleteBuffer(vbo);
    });

    textures.forEach((texture) => {
        gl.deleteTexture(texture);
    });
}

module.exports = {
    loadToVAO,
    loadPositionsToVAO,
    loadTexture,
    loadCubeMap,
    cleanUp,
};
