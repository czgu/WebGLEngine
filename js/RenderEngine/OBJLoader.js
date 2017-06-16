var Util = require('../Util/Util.js');
var Loader = require('./Loader.js');

function processVertex(vertexData, vertices, indices) {
    let vertexIndex = parseInt(vertexData[0]) - 1;
    let vertex = vertices[vertexIndex];

    let textureIndex = parseInt(vertexData[1]) - 1;
    let normalIndex = parseInt(vertexData[2]) - 1;

    if (!vertex.isSet()) {
        vertex.textureIndex = textureIndex;
        vertex.normalIndex = normalIndex;
        indices.push(vertexIndex);
    } else {
        dealWithAlreadyProcessedVertex(vertex, textureIndex, normalIndex, indices, vertices);
    }
}

function dealWithAlreadyProcessedVertex(vertex, textureIndex, normalIndex, indices, vertices) {
    if (vertex.hasSameTextureAndNormal(textureIndex, normalIndex)) {
        indices.push(vertex.index);
    } else {
        let similarVertex = vertex.duplicateVertex;
        if (similarVertex == null) {
            let duplicateVertex = new Vertex(vertices.length, vertex.position);
            duplicateVertex.textureIndex = textureIndex;
            duplicateVertex.normalIndex = normalIndex;

            vertices.push(duplicateVertex);
            indices.push(duplicateVertex.index);
            vertex.duplicateVertex = duplicateVertex;
        } else {
            dealWithAlreadyProcessedVertex(similarVertex, textureIndex, normalIndex, indices, vertices);
        }
    }
}

function removeUnusedVertices(vertices) {
    vertices.forEach((vertex) => {
        if (!vertex.isSet()) {
            vertex.textureIndex = 0;
            vertex.normalIndex = 0;
        }
    });
}

function convertDataToArrays(vertices, textures, normals, verticesArray, texturesArray, normalsArray) {
    let furthestPoint = 0;
    let i = 0;
    vertices.forEach((vertex) => {
        furthestPoint = Math.max(vertex.length, furthestPoint);

        let position = vertex.position;
        let textureCoord = textures[vertex.textureIndex];
        let normalVector = normals[vertex.normalIndex];

        verticesArray[i * 3] = position[0];
        verticesArray[i * 3 + 1] = position[1];
        verticesArray[i * 3 + 2] = position[2];

        texturesArray[i * 2] = textureCoord[0];
        texturesArray[i * 2 + 1] = textureCoord[1];

        normalsArray[i * 3] = normalVector[0];
        normalsArray[i * 3 + 1] = normalVector[1];
        normalsArray[i * 3 + 2] = normalVector[2];

         i++;
    });

    return furthestPoint;
}

function loadOBJModel(fileName, callback) {
    new Util.Ajax().get(fileName, function(data, status) {
        if (status === 200) {
            self.parseOBJModel(data, callback);
        } else {
            alert('Failed to load ' + fileName);
        }
    })
}

function parseOBJModel(file, callback) {
    let lines = file.split('\n');

    var vertices = [];
    var textures = [];
    var normals = [];
    var indices = [];

    var texturesArray;
    var normalsArray;
    var verticesArray;

    var i = 0;
    while (i < lines.length) {
        let line = lines[i];
        let currentLine = line.split(' ');
        if (line.startsWith('v ')) {
            let vertex = new Vertex(
                vertices.length, [parseFloat(currentLine[1]), parseFloat(currentLine[2]), parseFloat(currentLine[3])]);
            vertices.push(vertex);
        } else if (line.startsWith('vt ')) {
            let texture = [parseFloat(currentLine[1]), parseFloat(currentLine[2])];
            textures.push(texture);
        } else if (line.startsWith('vn ')) {
            let normal = [parseFloat(currentLine[1]), parseFloat(currentLine[2]), parseFloat(currentLine[3])];
            normals.push(normal);
        } else if (line.startsWith('f ')) {
            break;
        }
        i += 1;
    }


    while (i < lines.length) {
        let line = lines[i];
        i += 1;

        if (!line.startsWith('f ')) {
            continue;
        }

        let currentLine = line.split(' ');
        let verticesData = [1, 2, 3].map((n) => currentLine[n].split('/'));

        verticesData.forEach((vertexData) => {
            processVertex(vertexData, vertices, indices);
        });
    }

    removeUnusedVertices(vertices);

    verticesArray = new Array(vertices.length * 3);
    texturesArray = new Array(vertices.length * 2);
    normalsArray = new Array(vertices.length * 3);

    let furthestPoint = convertDataToArrays(vertices, textures, normals, verticesArray, texturesArray, normalsArray);
    let modelData = new ModelData(verticesArray, texturesArray, normalsArray, indices, furthestPoint);
    let model = Loader.loadToVAO(modelData.vertices, modelData.textures, modelData.normals, modelData.indices);
    callback(model, modelData);
}

function ModelData(vertices, textures, normals, indices, furthestPoint) {
    this.vertices = vertices;
    this.textures = textures;
    this.normals = normals;
    this.indices = indices;
    this.furthestPoint = furthestPoint;
}

function Vertex(index, position) {
    this.index = index;
    this.position = position;
    this.length = vec3.length(position);

    this.textureIndex = undefined;
    this.normalIndex = undefined;
    this.duplicateVertex = null;
}

Vertex.prototype.isSet = function() {
    return this.textureIndex != undefined && this.normalIndex != undefined;
}

Vertex.prototype.hasSameTextureAndNormal = function(textureIndex, normalIndex) {
    return this.textureIndex == textureIndex && this.normalIndex == normalIndex;
}

var self = module.exports = {
    loadOBJModel: loadOBJModel,
    parseOBJModel: parseOBJModel,
    ModelData: ModelData,
}
