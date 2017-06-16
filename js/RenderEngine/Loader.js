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

var self = module.exports = {
    loadToVAO: function(positions, textureCoords, normals, indices) {
        var vaoID = createVAO();

        storeDataInAttributeList(0, 3, positions);
        storeDataInAttributeList(1, 2, textureCoords);
        storeDataInAttributeList(2, 3, normals);
        bindIndicesBuffer(indices);
        unbindVAO();
        return new RawModel.RawModel(vaoID, indices.length);
    },

    loadTexture: function(imageUrl, callback) {
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
    },

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
