const Util = require('../Util/Util.js');
const Loader = require('./Loader.js');

function processVertex(vertexData, vertices, indices) {
    const vertexIndex = parseInt(vertexData[0], 10) - 1;
    const vertex = vertices[vertexIndex];

    const textureIndex = parseInt(vertexData[1], 10) - 1;
    const normalIndex = parseInt(vertexData[2], 10) - 1;

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
        const similarVertex = vertex.duplicateVertex;
        if (similarVertex == null) {
            const duplicateVertex = new Vertex(vertices.length, vertex.position);
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

        const position = vertex.position;
        const textureCoord = textures[vertex.textureIndex];
        const normalVector = normals[vertex.normalIndex];

        verticesArray[i * 3] = position[0];
        verticesArray[i * 3 + 1] = position[1];
        verticesArray[i * 3 + 2] = position[2];

        texturesArray[i * 2] = textureCoord[0];
        texturesArray[i * 2 + 1] = textureCoord[1];

        normalsArray[i * 3] = normalVector[0];
        normalsArray[i * 3 + 1] = normalVector[1];
        normalsArray[i * 3 + 2] = normalVector[2];

         i += 1;
    });

    return furthestPoint;
}

function loadOBJModel(fileName, callback) {
    new Util.Ajax().get(fileName, (data, status) => {
        if (status === 200) {
            parseOBJModel(data, callback);
        } else {
            alert(`Failed to load ${fileName}`);
        }
    });
}

function parseOBJModel(file, callback) {
    const lines = file.split('\n');

    const vertices = [];
    const textures = [];
    const normals = [];
    const indices = [];

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const currentLine = line.split(' ');
        if (line.startsWith('v ')) {
            const vertex = new Vertex(
                vertices.length, [parseFloat(currentLine[1]), parseFloat(currentLine[2]), parseFloat(currentLine[3])]);
            vertices.push(vertex);
        } else if (line.startsWith('vt ')) {
            const texture = [parseFloat(currentLine[1]), parseFloat(currentLine[2])];
            textures.push(texture);
        } else if (line.startsWith('vn ')) {
            const normal = [parseFloat(currentLine[1]), parseFloat(currentLine[2]), parseFloat(currentLine[3])];
            normals.push(normal);
        } else if (line.startsWith('f ')) {
            break;
        }
        i += 1;
    }


    while (i < lines.length) {
        const line = lines[i];
        i += 1;

        if (!line.startsWith('f ')) {
            continue;
        }

        const currentLine = line.split(' ');
        const verticesData = [1, 2, 3].map(n => currentLine[n].split('/'));

        verticesData.forEach((vertexData) => {
            processVertex(vertexData, vertices, indices);
        });
    }

    removeUnusedVertices(vertices);

    const verticesArray = new Array(vertices.length * 3);
    const texturesArray = new Array(vertices.length * 2);
    const normalsArray = new Array(vertices.length * 3);

    const furthestPoint = convertDataToArrays(vertices, textures, normals, verticesArray, texturesArray, normalsArray);
    const modelData = new ModelData(verticesArray, texturesArray, normalsArray, indices, furthestPoint);
    const model = Loader.loadToVAO(modelData.vertices, modelData.textures, modelData.normals, modelData.indices);
    callback(model, modelData);
}

class ModelData {
    constructor(vertices, textures, normals, indices, furthestPoint) {
        this.vertices = vertices;
        this.textures = textures;
        this.normals = normals;
        this.indices = indices;
        this.furthestPoint = furthestPoint;
    }
}

class Vertex {
    constructor(index, position) {
        this.index = index;
        this.position = position;
        this.length = vec3.length(position);

        this.textureIndex = undefined;
        this.normalIndex = undefined;
        this.duplicateVertex = null;
    }

    isSet() {
        return this.textureIndex !== undefined && this.normalIndex !== undefined;
    }

    hasSameTextureAndNormal(textureIndex, normalIndex) {
        return this.textureIndex === textureIndex && this.normalIndex === normalIndex;
    }
}

module.exports = {
    loadOBJModel,
    parseOBJModel,
    ModelData,
};
