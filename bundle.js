(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const MathUtil = require('../Util/MathUtil.js');

class Camera {
    constructor(player) {
        this.position = [0, 0, 0];
        this.pitch = MathUtil.toRadians(30);
        this.yaw = 0;
        this.roll = 0;

        this.player = player;
        this.distanceFromPlayer = 30.0;
        this.angleAroundPlayer = 0;

        mouseInfo.mouseWheelCallback = this.calculateZoom(this);
    }

    move() {
        this.calculatePitch();
        this.calculateAngleAroundPlayer();

        this.calculateCameraPosition();

        this.yaw = Math.PI - (this.player.rotation[1] + this.angleAroundPlayer);
    }

    calculateZoom(self) {
        return (zoomLevel) => {
            self.distanceFromPlayer -= zoomLevel * 0.01;
            self.distanceFromPlayer = MathUtil.clamp(self.distanceFromPlayer, 5, 100);
        };
    }

    calculatePitch() {
        if (mouseInfo.buttonPressed[2]) {
            const pitchChange = mouseInfo.buttonDelta[2][1] * 0.01;
            this.pitch -= pitchChange;
            this.pitch = MathUtil.clamp(this.pitch, -Math.PI / 2, Math.PI / 2);
        }
    }

    calculateAngleAroundPlayer() {
        if (mouseInfo.buttonPressed[0]) {
            const angleChange = mouseInfo.buttonDelta[0][0] * 0.01;
            this.angleAroundPlayer -= angleChange;
        }
    }

    calculateCameraPosition() {
        const horizontalDistance = (this.distanceFromPlayer * Math.cos(this.pitch));
        const verticalDistance = (this.distanceFromPlayer * Math.sin(this.pitch));

        this.position[1] = this.player.position[1] + verticalDistance;
        const angleXZ = this.player.rotation[1] + this.angleAroundPlayer;
        const dx = horizontalDistance * Math.sin(angleXZ);
        const dz = horizontalDistance * Math.cos(angleXZ);

        this.position[0] = this.player.position[0] - dx;
        this.position[2] = this.player.position[2] - dz;
    }
}

module.exports = {
    Camera,
};

},{"../Util/MathUtil.js":35}],2:[function(require,module,exports){
// TexturedModel
class Entity {
    constructor(texturedModel, position, rot, scale, textureIndex = 0) {
        this.texturedModel = texturedModel;
        this.position = position;
        this.rotation = rot;
        this.scale = scale;

        this.textureIndex = textureIndex;
    }

    increasePosition(dv) {
        vec3.add(this.position, this.position, dv);
    }

    increaseRotation(dv) {
        vec3.add(this.rotation, this.rotation, dv);
    }

    getTextureXYOffset() {
        const column = (this.textureIndex % this.texturedModel.texture.numberOfRows) / this.texturedModel.texture.numberOfRows;
        const row = Math.floor(this.textureIndex / this.texturedModel.texture.numberOfRows) / this.texturedModel.texture.numberOfRows;

        return [column, row];
    }
}

module.exports = {
    Entity,
};

},{}],3:[function(require,module,exports){
class Light {
    constructor(position, color, attenuation = undefined) {
        this.position = position;
        this.color = color;
        this.attenuation = attenuation || [1, 0, 0];
    }
}

module.exports = {
    Light,
};

},{}],4:[function(require,module,exports){
const Entity = require('./Entity.js');
const Display = require('../RenderEngine/Display.js');
const MathUtil = require('../Util/MathUtil.js');

const RUN_SPEED = 20;
const TURN_SPEED = MathUtil.toRadians(160);
const GRAVITY = -2;
const JUMP_POWER = 1;

class Player extends Entity.Entity {
    constructor(texturedModel, position, rot, scale) {
        super(texturedModel, position, rot, scale);

        this.currentSpeed = 0;
        this.currentTurnSpeed = 0;
        this.upwardSpeed = 0;
        this.isInAir = false;
    }

    checkInputs() {
        if (currentlyPressedKeys[87]) { // W
            this.currentSpeed = RUN_SPEED;
        } else if (currentlyPressedKeys[83]) { // S
            this.currentSpeed = -RUN_SPEED;
        } else {
            this.currentSpeed = 0;
        }

        if (currentlyPressedKeys[68]) { // D
            this.currentTurnSpeed = -TURN_SPEED;
        } else if (currentlyPressedKeys[65]) { // A
            this.currentTurnSpeed = TURN_SPEED;
        } else {
            this.currentTurnSpeed = 0;
        }

        if (currentlyPressedKeys[32] && !this.isInAir) { // SPACE
            this.upwardSpeed = JUMP_POWER;
            this.isInAir = true;
        }
    }

    move(terrain) {
        this.checkInputs();
        this.increaseRotation([0, this.currentTurnSpeed * Display.delta, 0]);

        const distance = this.currentSpeed * Display.delta;
        const dx = Math.sin(this.rotation[1]) * distance;
        const dz = Math.cos(this.rotation[1]) * distance;

        this.upwardSpeed += GRAVITY * Display.delta;

        this.increasePosition([dx, this.upwardSpeed, dz]);

        const terrainHeight = terrain.getTerrainHeight(this.position[0], this.position[2]);
        if (this.position[1] < terrainHeight) {
            this.isInAir = false;
            this.upwardSpeed = 0;
            this.position[1] = terrainHeight;
        }
        if (this.lastHeight !== terrainHeight) {
            // console.log(terrainHeight);
        }
        this.lastHeight = terrainHeight;
    }
}

module.exports = {
    Player,
};

},{"../RenderEngine/Display.js":12,"../Util/MathUtil.js":35,"./Entity.js":2}],5:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
" \n" +" \n" +
"precision mediump float; \n" +" \n" +
" \n" +" \n" +
"in vec2 textureCoords; \n" +" \n" +
"out vec4 outColor; \n" +" \n" +
" \n" +" \n" +
"uniform sampler2D guiTexture; \n" +" \n" +
" \n" +" \n" +
"void main(void){ \n" +" \n" +
"	outColor = texture(guiTexture,textureCoords); \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],6:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
" \n" +" \n" +
"in vec2 position; \n" +" \n" +
" \n" +" \n" +
"out vec2 textureCoords; \n" +" \n" +
" \n" +" \n" +
"uniform mat4 transformationMatrix; \n" +" \n" +
" \n" +" \n" +
"void main(void){ \n" +" \n" +
"	gl_Position = transformationMatrix * vec4(position, 0.0, 1.0); \n" +" \n" +
"	textureCoords = vec2((position.x + 1.0) / 2.0, (position.y + 1.0) / 2.0); \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],7:[function(require,module,exports){
const Loader = require('../RenderEngine/Loader.js');
const GUIShader = require('./GUIShader.js');
const MathUtil = require('../Util/MathUtil.js');

let quad;
let shader;

function initialize() {
    const positions = [-1, 1, -1, -1, 1, 1, 1, -1];
    quad = Loader.loadPositionsToVAO(positions, 2);
    shader = new GUIShader.GUIShader();
}

function render(guis) {
    shader.start();

    gl.bindVertexArray(quad.vaoID);
    gl.enableVertexAttribArray(0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    guis.forEach((gui) => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gui.texture.textureID);

        const transformationMatrix = MathUtil.create2DTransformationMatrix(gui.position, gui.scale);
        shader.loadTransMatrix(transformationMatrix);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, quad.vertexCount);
    });
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disableVertexAttribArray(0);
    gl.bindVertexArray(null);

    shader.stop();
}

function cleanUp() {
    shader.cleanUp();
}


module.exports = {
    initialize,
    render,
    cleanUp,
};

},{"../RenderEngine/Loader.js":14,"../Util/MathUtil.js":35,"./GUIShader.js":8}],8:[function(require,module,exports){
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

},{"../Shader/ShaderProgram.js":22,"./GLSL/GUIFragmentShader.c":5,"./GLSL/GUIVertexShader.c":6}],9:[function(require,module,exports){
class GUITexture {
    constructor(texture, position, scale) {
        this.texture = texture;
        this.position = position;
        this.scale = scale;
    }
}

module.exports = {
    GUITexture,
};

},{}],10:[function(require,module,exports){
let serialNumber = 0;

class RawModel {
    constructor(id, count) {
        this.vaoID = id;
        this.vertexCount = count;

        this.serialNumber = serialNumber;
        serialNumber += 1;
    }
}

module.exports = {
    RawModel,
};

},{}],11:[function(require,module,exports){
class TexturedModel {
    constructor(model, texture) {
        this.rawModel = model;
        this.texture = texture; // ModeelTexture
    }
}

module.exports = {
    TexturedModel,
};

},{}],12:[function(require,module,exports){
let lastFrameTime;

function getCurrentTime() {
    return new Date().getTime();
}

function createDisplay() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    lastFrameTime = getCurrentTime();
}

function updateDisplay() {
    const currentFrameTime = getCurrentTime();
    self.delta = (currentFrameTime - lastFrameTime) / 1000;
    lastFrameTime = currentFrameTime;

    return true;
}

function closeDisplay() {

}

module.exports = {
    createDisplay,
    updateDisplay,
    closeDisplay,
    delta: undefined,
};
const self = module.exports;

},{}],13:[function(require,module,exports){
const MathUtil = require('../Util/MathUtil.js');
const Util = require('../Util/Util.js');

let projectionMatrix;
let shader;

function initialize(_shader, _projectionMatrix) {
    shader = _shader;
    projectionMatrix = _projectionMatrix;

    shader.start();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.stop();
}

function render(texturedModelEntities) {
    texturedModelEntities.forEach((texturedModelEntitiesPair) => {
        const texturedModel = texturedModelEntitiesPair[0];
        const entities = texturedModelEntitiesPair[1];

        preparedTexturedModel(texturedModel);
        entities.forEach((entity) => {
            prepareInstance(entity);
            gl.drawElements(
                gl.TRIANGLES, texturedModel.rawModel.vertexCount, gl.UNSIGNED_INT, 0);
        });
        unbindTexturedModel();
    });
}

function preparedTexturedModel(texturedModel) {
    const model = texturedModel.rawModel;

    gl.bindVertexArray(model.vaoID);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    const texture = texturedModel.texture;
    shader.loadNumberOfRows(texture.numberOfRows);
    if (texture.hasTransparency) {
        Util.disableCulling();
    }
    shader.loadUseFakeNormal(texture.useFakeNormal);
    shader.loadShineVariables(texture.shineDamper, texture.reflectivity);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.textureID);
}

function unbindTexturedModel() {
    Util.enableCulling();

    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);

    gl.bindVertexArray(null);
}

function prepareInstance(entity) {
    const mvMatrix = MathUtil.createTransformationMatrix(
        entity.position, entity.rotation, entity.scale);
    shader.loadTransMatrix(mvMatrix);
    shader.loadOffset(entity.getTextureXYOffset());
}

module.exports = {
    initialize,
    render,
};

},{"../Util/MathUtil.js":35,"../Util/Util.js":36}],14:[function(require,module,exports){
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

},{"../Model/RawModel.js":10}],15:[function(require,module,exports){
const StaticShader = require('../Shader/StaticShader.js');
const EntityRenderer = require('./EntityRenderer.js');
const TerrainShader = require('../Shader/TerrainShader.js');
const TerrainRenderer = require('./TerrainRenderer.js');
const SkyboxRenderer = require('../Skybox/SkyboxRenderer.js');
const Util = require('../Util/Util.js');

let shader;
let terrainShader;

const texturedModelEntities = [];
let texturedModelIndicesLookUp = {};

const terrains = [];

// ProjectionMatrix related
const FOV = 70;
const NEAR_PLANE = 0.1;
const FAR_PLANE = 1000;
const projectionMatrix = mat4.create();

const skyColor = [0.5, 0.5, 0.5];

function initialize() {
    mat4.perspective(projectionMatrix, FOV, gl.viewportWidth / gl.viewportHeight, NEAR_PLANE, FAR_PLANE);
    Util.enableCulling();

    // Initialize Entity Renderer
    shader = new StaticShader.StaticShader();
    EntityRenderer.initialize(shader, projectionMatrix);

    // Initialize Terrain Renderer
    terrainShader = new TerrainShader.TerrainShader();
    TerrainRenderer.initialize(terrainShader, projectionMatrix);

    SkyboxRenderer.initialize(projectionMatrix);
}

function render(lights, camera) {
    prepare();

    shader.start();
    shader.loadSkyColor(skyColor);
    shader.loadLights(lights);
    shader.loadViewMatrix(camera);
    EntityRenderer.render(texturedModelEntities);
    shader.stop();

    terrainShader.start();
    terrainShader.loadSkyColor(skyColor);
    terrainShader.loadLights(lights);
    terrainShader.loadViewMatrix(camera);
    TerrainRenderer.render(terrains);
    terrainShader.stop();

    SkyboxRenderer.render(camera, skyColor);

    texturedModelEntities.length = 0;
    texturedModelIndicesLookUp = {};

    terrains.length = 0;
}

function processEntity(entity) {
    const texturedModel = entity.texturedModel;
    const key = `${texturedModel.rawModel.serialNumber}, ${texturedModel.texture.serialNumber}`;
    if (key in texturedModelIndicesLookUp) {
        texturedModelEntities[texturedModelIndicesLookUp[key]][1].push(entity);
    } else {
        const value = texturedModelEntities.length;
        texturedModelIndicesLookUp[key] = value;
        texturedModelEntities.push([texturedModel, [entity]]);
    }
}

function processTerrain(terrain) {
    terrains.push(terrain);
}

function cleanUp() {
    shader.cleanUp();
    terrainShader.cleanUp();
    SkyboxRenderer.cleanUp();
}

function prepare() {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(skyColor[0], skyColor[1], skyColor[2], 1.0);
}

module.exports = {
    render,
    processEntity,
    processTerrain,
    cleanUp,
    initialize,
};

},{"../Shader/StaticShader.js":23,"../Shader/TerrainShader.js":24,"../Skybox/SkyboxRenderer.js":27,"../Util/Util.js":36,"./EntityRenderer.js":13,"./TerrainRenderer.js":17}],16:[function(require,module,exports){
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

},{"../Util/Util.js":36,"./Loader.js":14}],17:[function(require,module,exports){
const MathUtil = require('../Util/MathUtil.js');

let projectionMatrix;
let shader;

function initialize(_shader, _projectionMatrix) {
    shader = _shader;
    projectionMatrix = _projectionMatrix;

    shader.start();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.connectTextureUnits();
    shader.stop();
}

function render(terrains) {
    terrains.forEach((terrain) => {
        prepareTerrain(terrain);
        loadModelMatrix(terrain);

        gl.drawElements(
            gl.TRIANGLES, terrain.rawModel.vertexCount, gl.UNSIGNED_INT, 0);

        unbindTexturedModel(terrain);
    });
}

function prepareTerrain(terrain) {
    const model = terrain.rawModel;
    gl.bindVertexArray(model.vaoID);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    // const texture = terrain.texture;
    bindTextures(terrain);
    shader.loadShineVariables(1, 0);
}

function bindTextures(terrain) {
    const texturePack = terrain.texturePack;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texturePack.backgroundTexture.textureID);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texturePack.rTexture.textureID);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texturePack.gTexture.textureID);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texturePack.bTexture.textureID);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, terrain.blendMap.textureID);
}

function unbindTexturedModel() {
    gl.disableVertexAttribArray(0);
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);

    gl.bindVertexArray(null);
}

function loadModelMatrix(terrain) {
    const mvMatrix = MathUtil.createTransformationMatrix(
        [terrain.x, 0, terrain.z], [0, 0, 0], [1, 1, 1]);
    shader.loadTransMatrix(mvMatrix);
}

module.exports = {
    initialize,
    render,
};

},{"../Util/MathUtil.js":35}],18:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
" \n" +" \n" +
"precision mediump float; \n" +" \n" +
" \n" +" \n" +
"in vec2 pass_texCoord; \n" +" \n" +
"in vec3 surfaceNormal; \n" +" \n" +
"in vec3 toLightVector[4]; \n" +" \n" +
"in vec3 toCameraVector; \n" +" \n" +
"in float visibility; \n" +" \n" +
" \n" +" \n" +
"out vec4 outColor; \n" +" \n" +
" \n" +" \n" +
"uniform sampler2D textureSampler; \n" +" \n" +
"uniform vec3 lightColor[4]; \n" +" \n" +
"uniform vec3 attenuation[4]; \n" +" \n" +
"uniform float shineDamper; \n" +" \n" +
"uniform float reflectivity; \n" +" \n" +
" \n" +" \n" +
"uniform vec3 skyColor; \n" +" \n" +
" \n" +" \n" +
"void main(void) { \n" +" \n" +
"    vec3 unitSurfaceNormal = normalize(surfaceNormal); \n" +" \n" +
"    vec3 unitToCameraVector = normalize(toCameraVector); \n" +" \n" +
" \n" +" \n" +
"    vec3 totalDiffuse = vec3(0.0); \n" +" \n" +
"    vec3 totalSpecular = vec3(0.0); \n" +" \n" +
" \n" +" \n" +
"    for (int i = 0; i < 4; i++) { \n" +" \n" +
"        float distanceToLight = length(toLightVector[i]); \n" +" \n" +
"        float attenuationFactor = (attenuation[i].x) + \n" +" \n" +
"                                  (attenuation[i].y * distanceToLight) + \n" +" \n" +
"                                  (attenuation[i].z * distanceToLight * distanceToLight); \n" +" \n" +
"        vec3 unitToLightVector = normalize(toLightVector[i]); \n" +" \n" +
"        float brightness = max(dot(unitSurfaceNormal, unitToLightVector), 0.0f); \n" +" \n" +
" \n" +" \n" +
"        vec3 reflectedLightDirection = reflect(-unitToLightVector, unitSurfaceNormal); \n" +" \n" +
"        float specularFactor = max(dot(reflectedLightDirection, unitToCameraVector), 0.0f); \n" +" \n" +
"        float dampedFactor = pow(specularFactor, shineDamper); \n" +" \n" +
" \n" +" \n" +
"        vec3 diffuse = (brightness * lightColor[i]) / attenuationFactor; \n" +" \n" +
"        vec3 specular = (dampedFactor * reflectivity * lightColor[i]) / attenuationFactor; \n" +" \n" +
" \n" +" \n" +
"        totalDiffuse += diffuse; \n" +" \n" +
"        totalSpecular += specular; \n" +" \n" +
"    } \n" +" \n" +
" \n" +" \n" +
"    totalDiffuse = max(totalDiffuse, 0.2); \n" +" \n" +
" \n" +" \n" +
"    vec4 textureColor = texture(textureSampler, pass_texCoord); \n" +" \n" +
"    if (textureColor.a < 0.5) { \n" +" \n" +
"        discard; \n" +" \n" +
"    } \n" +" \n" +
" \n" +" \n" +
"    outColor = vec4(totalDiffuse, 1.0) *  textureColor + vec4(totalSpecular, 1.0); \n" +" \n" +
"    outColor = mix(vec4(skyColor, 1.0), outColor, visibility); \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],19:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
" \n" +" \n" +
"precision mediump float; \n" +" \n" +
" \n" +" \n" +
"in vec2 pass_texCoord; \n" +" \n" +
"in vec3 surfaceNormal; \n" +" \n" +
"in vec3 toLightVector[4]; \n" +" \n" +
"in vec3 toCameraVector; \n" +" \n" +
"in float visibility; \n" +" \n" +
" \n" +" \n" +
"out vec4 outColor; \n" +" \n" +
" \n" +" \n" +
"uniform sampler2D backgroundTexture; \n" +" \n" +
"uniform sampler2D rTexture; \n" +" \n" +
"uniform sampler2D gTexture; \n" +" \n" +
"uniform sampler2D bTexture; \n" +" \n" +
"uniform sampler2D blendMap; \n" +" \n" +
" \n" +" \n" +
"uniform vec3 lightColor[4]; \n" +" \n" +
"uniform vec3 attenuation[4]; \n" +" \n" +
" \n" +" \n" +
"uniform float shineDamper; \n" +" \n" +
"uniform float reflectivity; \n" +" \n" +
"uniform vec3 skyColor; \n" +" \n" +
" \n" +" \n" +
"void main(void) { \n" +" \n" +
"    vec4 blendMapColor = texture(blendMap, pass_texCoord); \n" +" \n" +
"    float backgroundTextureAmount = 1.0 - (blendMapColor.r + blendMapColor.g + blendMapColor.b); \n" +" \n" +
" \n" +" \n" +
"    vec2 tileCoords = pass_texCoord * 40.0; \n" +" \n" +
"    vec4 backgroundTextureColor = texture(backgroundTexture, tileCoords) * backgroundTextureAmount; \n" +" \n" +
"    vec4 rTextureColor = texture(rTexture, tileCoords) * blendMapColor.r; \n" +" \n" +
"    vec4 gTextureColor = texture(gTexture, tileCoords) * blendMapColor.g; \n" +" \n" +
"    vec4 bTextureColor = texture(bTexture, tileCoords) * blendMapColor.b; \n" +" \n" +
" \n" +" \n" +
"    vec4 totalColor = backgroundTextureColor + rTextureColor + gTextureColor + bTextureColor; \n" +" \n" +
" \n" +" \n" +
"    vec3 unitSurfaceNormal = normalize(surfaceNormal); \n" +" \n" +
"    vec3 unitToCameraVector = normalize(toCameraVector); \n" +" \n" +
" \n" +" \n" +
"    vec3 totalDiffuse = vec3(0.0); \n" +" \n" +
"    vec3 totalSpecular = vec3(0.0); \n" +" \n" +
"    for (int i = 0; i < 4; i++) { \n" +" \n" +
"        float distanceToLight = length(toLightVector[i]); \n" +" \n" +
"        float attenuationFactor = (attenuation[i].x) + \n" +" \n" +
"                                  (attenuation[i].y * distanceToLight) + \n" +" \n" +
"                                  (attenuation[i].z * distanceToLight * distanceToLight); \n" +" \n" +
"        vec3 unitToLightVector = normalize(toLightVector[i]); \n" +" \n" +
"        float brightness = max(dot(unitSurfaceNormal, unitToLightVector), 0.0f); \n" +" \n" +
" \n" +" \n" +
"        vec3 reflectedLightDirection = reflect(-unitToLightVector, unitSurfaceNormal); \n" +" \n" +
"        float specularFactor = max(dot(reflectedLightDirection, unitToCameraVector), 0.0f); \n" +" \n" +
"        float dampedFactor = pow(specularFactor, shineDamper); \n" +" \n" +
" \n" +" \n" +
"        vec3 diffuse = (brightness * lightColor[i]) / attenuationFactor; \n" +" \n" +
"        vec3 specular = (dampedFactor * reflectivity * lightColor[i]) / attenuationFactor; \n" +" \n" +
" \n" +" \n" +
"        totalDiffuse += diffuse; \n" +" \n" +
"        totalSpecular += specular; \n" +" \n" +
"    } \n" +" \n" +
"    totalDiffuse = max(totalDiffuse, 0.2); \n" +" \n" +
" \n" +" \n" +
"    outColor = vec4(totalDiffuse, 1.0) * totalColor + vec4(totalSpecular, 1.0); \n" +" \n" +
"    outColor = mix(vec4(skyColor, 1.0), outColor, visibility); \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],20:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
"in vec3 position; \n" +" \n" +
"in vec2 texCoord; \n" +" \n" +
"in vec3 normal; \n" +" \n" +
" \n" +" \n" +
"out vec2 pass_texCoord; \n" +" \n" +
"out vec3 surfaceNormal; \n" +" \n" +
"out vec3 toLightVector[4]; \n" +" \n" +
"out vec3 toCameraVector; \n" +" \n" +
"out float visibility; \n" +" \n" +
" \n" +" \n" +
"uniform mat4 transformationMatrix; \n" +" \n" +
"uniform mat4 projectionMatrix; \n" +" \n" +
"uniform mat4 viewMatrix; \n" +" \n" +
" \n" +" \n" +
"uniform vec3 lightPosition[4]; \n" +" \n" +
" \n" +" \n" +
"const float fogDensity = 0.0035; \n" +" \n" +
"const float fogGradient = 5.0; \n" +" \n" +
" \n" +" \n" +
"void main(void) { \n" +" \n" +
"    vec4 worldPos = transformationMatrix * vec4(position, 1.0); \n" +" \n" +
"    vec4 positionRelativeToCam = viewMatrix * worldPos; \n" +" \n" +
"    gl_Position = projectionMatrix * positionRelativeToCam; \n" +" \n" +
"    pass_texCoord = texCoord; \n" +" \n" +
" \n" +" \n" +
"    surfaceNormal = (transformationMatrix * vec4(normal, 0.0)).xyz; \n" +" \n" +
"    for (int i = 0; i < 4; i++) { \n" +" \n" +
"        toLightVector[i] = lightPosition[i] - worldPos.xyz; \n" +" \n" +
"    } \n" +" \n" +
" \n" +" \n" +
"    toCameraVector = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz - worldPos.xyz; \n" +" \n" +
" \n" +" \n" +
"    float distanceRelativeToCam = length(positionRelativeToCam.xyz); \n" +" \n" +
"    visibility = clamp(exp(-pow(distanceRelativeToCam * fogDensity, fogGradient)), 0.0, 1.0); \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],21:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
"in vec3 position; \n" +" \n" +
"in vec2 texCoord; \n" +" \n" +
"in vec3 normal; \n" +" \n" +
" \n" +" \n" +
"out vec2 pass_texCoord; \n" +" \n" +
"out vec3 surfaceNormal; \n" +" \n" +
"out vec3 toLightVector[4]; \n" +" \n" +
"out vec3 toCameraVector; \n" +" \n" +
"out float visibility; \n" +" \n" +
" \n" +" \n" +
"uniform mat4 transformationMatrix; \n" +" \n" +
"uniform mat4 projectionMatrix; \n" +" \n" +
"uniform mat4 viewMatrix; \n" +" \n" +
" \n" +" \n" +
"uniform vec3 lightPosition[4]; \n" +" \n" +
" \n" +" \n" +
"uniform float useFakeNormal; \n" +" \n" +
" \n" +" \n" +
"uniform float numberOfRows; \n" +" \n" +
"uniform vec2 offset; \n" +" \n" +
" \n" +" \n" +
"const float fogDensity = 0.0035; \n" +" \n" +
"const float fogGradient = 5.0; \n" +" \n" +
" \n" +" \n" +
"void main(void) { \n" +" \n" +
"    vec4 worldPos = transformationMatrix * vec4(position, 1.0); \n" +" \n" +
"    vec4 positionRelativeToCam = viewMatrix * worldPos; \n" +" \n" +
"    gl_Position = projectionMatrix * positionRelativeToCam; \n" +" \n" +
"    pass_texCoord = (texCoord / numberOfRows) + offset; \n" +" \n" +
" \n" +" \n" +
"    vec3 actualNormal = normal; \n" +" \n" +
"    if (useFakeNormal > 0.5) { \n" +" \n" +
"        actualNormal = vec3(0.0, 1.0, 0.0); \n" +" \n" +
"    } \n" +" \n" +
" \n" +" \n" +
"    surfaceNormal = (transformationMatrix * vec4(actualNormal, 0.0)).xyz; \n" +" \n" +
"    for (int i = 0; i < 4; i++) { \n" +" \n" +
"        toLightVector[i] = lightPosition[i] - worldPos.xyz; \n" +" \n" +
"    } \n" +" \n" +
"    toCameraVector = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz - worldPos.xyz; \n" +" \n" +
" \n" +" \n" +
"    float distanceRelativeToCam = length(positionRelativeToCam.xyz); \n" +" \n" +
"    visibility = clamp(exp(-pow(distanceRelativeToCam * fogDensity, fogGradient)), 0.0, 1.0); \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
const ShaderProgram = require('./ShaderProgram.js');
const MathUtil = require('../Util/MathUtil.js');
const Const = require('../Util/Const.js');

const VERTEX_SHADER = require('./GLSL/VertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/FragmentShader.c');

class StaticShader extends ShaderProgram.ShaderProgram {
    constructor() {
        super(VERTEX_SHADER, FRAGMENT_SHADER);
    }

    bindAttributes() {
        this.bindAttribute(0, 'position');
        this.bindAttribute(1, 'texCoord');
        this.bindAttribute(2, 'normal');
    }

    getAllUniformLocations() {
        this.transformationMatrixLocation = this.getUniformLocation('transformationMatrix');
        this.projectionMatrixLocation = this.getUniformLocation('projectionMatrix');
        this.viewMatrixLocation = this.getUniformLocation('viewMatrix');
        this.shineDamperLocation = this.getUniformLocation('shineDamper');
        this.reflectivityLocation = this.getUniformLocation('reflectivity');
        this.useFakeNormalLocation = this.getUniformLocation('useFakeNormal');
        this.skyColorLocation = this.getUniformLocation('skyColor');
        this.numberOfRowsLocation = this.getUniformLocation('numberOfRows');
        this.offsetLocation = this.getUniformLocation('offset');

        this.lightPositionLocations = [];
        this.lightColorLocations = [];
        this.attenuationLocations = [];
        for (let i = 0; i < Const.MAX_LIGHTS; i++) {
             this.lightPositionLocations.push(this.getUniformLocation(`lightPosition[${i}]`));
             this.lightColorLocations.push(this.getUniformLocation(`lightColor[${i}]`));
             this.attenuationLocations.push(this.getUniformLocation(`attenuation[${i}]`));
        }
    }

    loadTransMatrix(matrix) {
        this.loadMatrix(this.transformationMatrixLocation, matrix);
    }

    loadProjectionMatrix(matrix) {
        this.loadMatrix(this.projectionMatrixLocation, matrix);
    }

    loadViewMatrix(camera) {
        const matrix = MathUtil.createViewMatrix(
            camera.position, [camera.pitch, camera.yaw, camera.roll]);
        this.loadMatrix(this.viewMatrixLocation, matrix);
    }

    loadLights(lights) {
        for (let i = 0; i < Const.MAX_LIGHTS; i++) {
            if (i < lights.length) {
                this.loadVector(this.lightPositionLocations[i], lights[i].position);
                this.loadVector(this.lightColorLocations[i], lights[i].color);
                this.loadVector(this.attenuationLocations[i], lights[i].attenuation);
            } else {
                this.loadVector(this.lightPositionLocations[i], [0, 0, 0]);
                this.loadVector(this.lightColorLocations[i], [0, 0, 0]);
                this.loadVector(this.attenuationLocations[i], [1, 0, 0]);
            }
        }
    }

    loadShineVariables(shineDamper, reflectivity) {
        this.loadFloat(this.shineDamperLocation, shineDamper);
        this.loadFloat(this.reflectivityLocation, reflectivity);
    }

    loadUseFakeNormal(useFakeNormal) {
        this.loadBool(this.useFakeNormalLocation, useFakeNormal);
    }

    loadSkyColor(skyColor) {
        this.loadVector(this.skyColorLocation, skyColor);
    }

    loadNumberOfRows(numberOfRows) {
        this.loadFloat(this.numberOfRowsLocation, numberOfRows);
    }

    loadOffset(offset) {
        this.load2DVector(this.offsetLocation, offset);
    }
}

module.exports = {
    StaticShader,
};

},{"../Util/Const.js":34,"../Util/MathUtil.js":35,"./GLSL/FragmentShader.c":18,"./GLSL/VertexShader.c":21,"./ShaderProgram.js":22}],24:[function(require,module,exports){
const ShaderProgram = require('./ShaderProgram.js');
const MathUtil = require('../Util/MathUtil.js');
const Const = require('../Util/Const.js');

const VERTEX_SHADER = require('./GLSL/TerrainVertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/TerrainFragmentShader.c');

class TerrainShader extends ShaderProgram.ShaderProgram {
    constructor() {
        super(VERTEX_SHADER, FRAGMENT_SHADER);
    }

    bindAttributes() {
        this.bindAttribute(0, 'position');
        this.bindAttribute(1, 'texCoord');
        this.bindAttribute(2, 'normal');
    }

    getAllUniformLocations() {
        this.transformationMatrixLocation = this.getUniformLocation('transformationMatrix');
        this.projectionMatrixLocation = this.getUniformLocation('projectionMatrix');
        this.viewMatrixLocation = this.getUniformLocation('viewMatrix');
        this.shineDamperLocation = this.getUniformLocation('shineDamper');
        this.reflectivityLocation = this.getUniformLocation('reflectivity');
        this.skyColorLocation = this.getUniformLocation('skyColor');

        this.backgroundTextureLocation = this.getUniformLocation('backgroundTexture');
        this.rTextureLocation = this.getUniformLocation('rTexture');
        this.gTextureLocation = this.getUniformLocation('gTexture');
        this.bTextureLocation = this.getUniformLocation('bTexture');
        this.blendMapLocation = this.getUniformLocation('blendMap');

        this.lightPositionLocations = [];
        this.lightColorLocations = [];
        this.attenuationLocations = [];
        for (let i = 0; i < Const.MAX_LIGHTS; i++) {
            this.lightPositionLocations.push(this.getUniformLocation(`lightPosition[${i}]`));
            this.lightColorLocations.push(this.getUniformLocation(`lightColor[${i}]`));
            this.attenuationLocations.push(this.getUniformLocation(`attenuation[${i}]`));
        }
    }

    loadTransMatrix(matrix) {
        this.loadMatrix(this.transformationMatrixLocation, matrix);
    }

    loadProjectionMatrix(matrix) {
        this.loadMatrix(this.projectionMatrixLocation, matrix);
    }

    loadViewMatrix(camera) {
        const matrix = MathUtil.createViewMatrix(
            camera.position, [camera.pitch, camera.yaw, camera.roll]);
        this.loadMatrix(this.viewMatrixLocation, matrix);
    }

    loadLights(lights) {
        for (let i = 0; i < Const.MAX_LIGHTS; i++) {
            if (i < lights.length) {
                this.loadVector(this.lightPositionLocations[i], lights[i].position);
                this.loadVector(this.lightColorLocations[i], lights[i].color);
                this.loadVector(this.attenuationLocations[i], lights[i].attenuation);
            } else {
                this.loadVector(this.lightPositionLocations[i], [0, 0, 0]);
                this.loadVector(this.lightColorLocations[i], [0, 0, 0]);
                this.loadVector(this.attenuationLocations[i], [1, 0, 0]);
            }
        }
    }

    loadShineVariables(shineDamper, reflectivity) {
        this.loadFloat(this.shineDamperLocation, shineDamper);
        this.loadFloat(this.reflectivityLocation, reflectivity);
    }

    loadSkyColor(skyColor) {
        this.loadVector(this.skyColorLocation, skyColor);
    }

    connectTextureUnits() {
        this.loadInt(this.backgroundTextureLocation, 0);
        this.loadInt(this.rTextureLocation, 1);
        this.loadInt(this.gTextureLocation, 2);
        this.loadInt(this.bTextureLocation, 3);
        this.loadInt(this.blendMapLocation, 4);
    }
}

module.exports = {
    TerrainShader,
};

},{"../Util/Const.js":34,"../Util/MathUtil.js":35,"./GLSL/TerrainFragmentShader.c":19,"./GLSL/TerrainVertexShader.c":20,"./ShaderProgram.js":22}],25:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
" \n" +" \n" +
"precision mediump float; \n" +" \n" +
" \n" +" \n" +
"in vec3 textureCoords; \n" +" \n" +
"out vec4 outColor; \n" +" \n" +
" \n" +" \n" +
"uniform samplerCube cubeMap; \n" +" \n" +
"uniform samplerCube cubeMap2; \n" +" \n" +
" \n" +" \n" +
"uniform float blendFactor; \n" +" \n" +
" \n" +" \n" +
"uniform vec3 fogColor; \n" +" \n" +
" \n" +" \n" +
"const float upperLimit = 30.0; \n" +" \n" +
"const float lowerLimit = 0.0; \n" +" \n" +
" \n" +" \n" +
"void main(void){ \n" +" \n" +
"    vec3 newTextureCoords = textureCoords; \n" +" \n" +
"    newTextureCoords.y = newTextureCoords.y * -1.0; \n" +" \n" +
" \n" +" \n" +
"    float fogFactor = (textureCoords.y - lowerLimit) / (upperLimit - lowerLimit); \n" +" \n" +
"    fogFactor = clamp(fogFactor, 0.0, 1.0); \n" +" \n" +
" \n" +" \n" +
"    vec4 textureColor1 = texture(cubeMap, newTextureCoords); \n" +" \n" +
"    vec4 textureColor2 = texture(cubeMap2, newTextureCoords); \n" +" \n" +
"    vec4 finalColor = mix(textureColor1, textureColor2, blendFactor); \n" +" \n" +
"    outColor = mix(vec4(fogColor, 1.0), finalColor, fogFactor); \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],26:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
" \n" +" \n" +
"in vec3 position; \n" +" \n" +
"out vec3 textureCoords; \n" +" \n" +
" \n" +" \n" +
"uniform mat4 projectionMatrix; \n" +" \n" +
"uniform mat4 viewMatrix; \n" +" \n" +
" \n" +" \n" +
"void main(void){ \n" +" \n" +
"	gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); \n" +" \n" +
"	textureCoords = position; \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],27:[function(require,module,exports){
const Loader = require('../RenderEngine/Loader.js');
const SkyboxShader = require('./SkyboxShader.js');

const SIZE = 500.0;
const VERTICES = [
    -SIZE, SIZE, -SIZE,
    -SIZE, -SIZE, -SIZE,
    SIZE, -SIZE, -SIZE,
    SIZE, -SIZE, -SIZE,
    SIZE, SIZE, -SIZE,
    -SIZE, SIZE, -SIZE,

    -SIZE, -SIZE, SIZE,
    -SIZE, -SIZE, -SIZE,
    -SIZE, SIZE, -SIZE,
    -SIZE, SIZE, -SIZE,
    -SIZE, SIZE, SIZE,
    -SIZE, -SIZE, SIZE,

    SIZE, -SIZE, -SIZE,
    SIZE, -SIZE, SIZE,
    SIZE, SIZE, SIZE,
    SIZE, SIZE, SIZE,
    SIZE, SIZE, -SIZE,
    SIZE, -SIZE, -SIZE,

    -SIZE, -SIZE, SIZE,
    -SIZE, SIZE, SIZE,
    SIZE, SIZE, SIZE,
    SIZE, SIZE, SIZE,
    SIZE, -SIZE, SIZE,
    -SIZE, -SIZE, SIZE,

    -SIZE, SIZE, -SIZE,
    SIZE, SIZE, -SIZE,
    SIZE, SIZE, SIZE,
    SIZE, SIZE, SIZE,
    -SIZE, SIZE, SIZE,
    -SIZE, SIZE, -SIZE,

    -SIZE, -SIZE, -SIZE,
    -SIZE, -SIZE, SIZE,
    SIZE, -SIZE, -SIZE,
    SIZE, -SIZE, -SIZE,
    -SIZE, -SIZE, SIZE,
    SIZE, -SIZE, SIZE,
];

const TEXTURE_FILES = [
    'res/cubeMap/day/right.png',
    'res/cubeMap/day/left.png',
    'res/cubeMap/day/bottom.png',
    'res/cubeMap/day/top.png',
    'res/cubeMap/day/back.png',
    'res/cubeMap/day/front.png',
];

const NIGHT_TEXTURE_FILES = [
    'res/cubeMap/night/nightRight.png',
    'res/cubeMap/night/nightLeft.png',
    'res/cubeMap/night/nightBottom.png',
    'res/cubeMap/night/nightTop.png',
    'res/cubeMap/night/nightBack.png',
    'res/cubeMap/night/nightFront.png',
];

let cube;
let texture;
let nightTexture;
let shader;

function initialize(projectionMatrix) {
    cube = Loader.loadPositionsToVAO(VERTICES, 3);
    Loader.loadCubeMap(TEXTURE_FILES, (t) => {
        texture = t;
    });

    Loader.loadCubeMap(NIGHT_TEXTURE_FILES, (t) => {
        nightTexture = t;
    });

    shader = new SkyboxShader.SkyboxShader();

    shader.start();
    shader.connectTextureUnits();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.stop();
}

function render(camera, fogColor) {
    if (texture === undefined || nightTexture === undefined) {
        return;
    }

    shader.start();

    shader.loadViewMatrix(camera);
    shader.loadFogColor(fogColor);

    gl.bindVertexArray(cube.vaoID);
    gl.enableVertexAttribArray(0);

    bindTextures();

    gl.drawArrays(gl.TRIANGLES, 0, cube.vertexCount);

    gl.disableVertexAttribArray(0);
    gl.bindVertexArray(null);

    shader.stop();
}

function cleanUp() {
    shader.cleanUp();
}

function bindTextures() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture); // texture is texture_id

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, nightTexture); // texture is texture_id

    shader.loadBlendFactor(0.5);
}

module.exports = {
    initialize,
    render,
    cleanUp,
};

},{"../RenderEngine/Loader.js":14,"./SkyboxShader.js":28}],28:[function(require,module,exports){
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

    loadViewMatrix(camera) {
        const matrix = MathUtil.createViewMatrix(
            [0, 0, 0], [camera.pitch, camera.yaw, camera.roll]);
        this.rotation += Display.delta * ROTATION_SPEED;
        mat4.rotateY(matrix, matrix, this.rotation);
        this.loadMatrix(this.viewMatrixLocation, matrix);
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

},{"../RenderEngine/Display.js":12,"../Shader/ShaderProgram.js":22,"../Util/MathUtil.js":35,"./GLSL/SkyboxFragmentShader.c":25,"./GLSL/SkyboxVertexShader.c":26}],29:[function(require,module,exports){
const MAX_PIXEL_COLOR = 256 * 256 * 256;
const MAX_HEIGHT = 40;

class HeightMap {
    constructor(image) {
        this.image = image;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;

        this.context = this.canvas.getContext('2d');
        this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height);

        this.height = this.image.height;
    }

    getPixel(x, y) {
        return this.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
    }

    getHeight(x, y) {
        if (x < 0 || x > this.image.width || y < 0 || y > this.image.height) {
            return 0;
        }

        const pixel = this.getPixel(x, y);
        let height = (pixel[0] << 16) + (pixel[1] << 8) + pixel[2];
        height -= (MAX_PIXEL_COLOR / 2);
        height /= (MAX_PIXEL_COLOR / 2);
        height *= MAX_HEIGHT;

        return height;
    }

    getNormal(x, y) {
        const heightL = this.getHeight(x - 1, y);
        const heightR = this.getHeight(x + 1, y);
        const heightD = this.getHeight(x, y - 1);
        const heightU = this.getHeight(x, y + 1);
        const normal = [heightL - heightR, 2.0, heightD - heightU];
        vec3.normalize(normal, normal);

        return normal;
    }
}

module.exports = {
    HeightMap,
};

},{}],30:[function(require,module,exports){
const Loader = require('../RenderEngine/Loader.js');
const MathUtil = require('../Util/MathUtil.js');

const SIZE = 800;
let vertexCount;
let gridSquareSize;

class Terrain {
    constructor(gridX, gridZ, texturePack, blendMap, heightMap) {
        this.texturePack = texturePack;
        this.blendMap = blendMap;
        this.x = gridX * SIZE;
        this.z = gridZ * SIZE;
        this.heightMap = heightMap;

        vertexCount = this.heightMap.height;
        gridSquareSize = SIZE / (vertexCount - 1);

        this.heights = new Array(vertexCount * vertexCount);
        this.rawModel = this.generateTerrain();
    }

    generateTerrain() {
        let count = vertexCount * vertexCount;

        let vertices = Array(count * 3);
        let normals = Array(count * 3);
        let textureCoords = Array(count * 2);
        let indices = Array(6 * (vertexCount - 1) * (vertexCount - 1));
        let vertexPointer = 0;

        for (let i = 0; i < vertexCount; i++) {
            for (let j = 0; j < vertexCount; j++) {
                let height = this.heightMap.getHeight(j, i);
                this.heights[j * vertexCount + i] = height;
                vertices[vertexPointer * 3] = (j / (vertexCount - 1)) * SIZE;
                vertices[vertexPointer * 3 + 1] = height;
                vertices[vertexPointer * 3 + 2] = (i / (vertexCount - 1)) * SIZE;

                let normal = this.heightMap.getNormal(j, i);
                normals[vertexPointer * 3] = normal[0];
                normals[vertexPointer * 3 + 1] = normal[1];
                normals[vertexPointer * 3 + 2] = normal[2];

                textureCoords[vertexPointer * 2] = j / (vertexCount - 1);
                textureCoords[vertexPointer * 2 + 1] = i / (vertexCount - 1);

                vertexPointer++;
            }
        }

        let pointer = 0;
        for (let gz = 0; gz < vertexCount - 1; gz++) {
            for (let gx = 0; gx < vertexCount - 1; gx++) {
                let topLeft = (gz * vertexCount) + gx;
                let topRight = topLeft + 1;
                let bottomLeft = ((gz + 1) * vertexCount) + gx;
                let bottomRight = bottomLeft + 1;

                indices[pointer++] = topLeft;
                indices[pointer++] = bottomLeft;
                indices[pointer++] = topRight;

                indices[pointer++] = topRight;
                indices[pointer++] = bottomLeft;
                indices[pointer++] = bottomRight;
            }
        }

        return Loader.loadToVAO(vertices, textureCoords, normals, indices);
    }

    getTerrainHeight(worldX, worldZ) {
        let terrainX = worldX - this.x;
        let terrainZ = worldZ - this.z;

        let gridX = Math.floor(terrainX / gridSquareSize);
        let gridZ = Math.floor(terrainZ / gridSquareSize);

        if (gridX < 0 || gridX > vertexCount - 1 || gridZ < 0 || gridZ > vertexCount - 1) {
            return 0;
        }

        let xCoord = (terrainX % gridSquareSize) / gridSquareSize;
        let zCoord = (terrainZ % gridSquareSize) / gridSquareSize;

        let terrainHeight = 0;
        if (xCoord <= 1 - zCoord) {
            terrainHeight = MathUtil.barryCentric(
                [0, this.heights[gridX * vertexCount + gridZ], 0],
                [1, this.heights[(gridX + 1) * vertexCount + gridZ], 0],
                [0, this.heights[gridX * vertexCount + (gridZ + 1)], 1],
                [xCoord, zCoord]);
        } else {
            terrainHeight = MathUtil.barryCentric(
                [1, this.heights[(gridX + 1) * vertexCount + gridZ], 0],
                [1, this.heights[(gridX + 1) * vertexCount + (gridZ + 1)], 1],
                [0, this.heights[gridX * vertexCount + (gridZ + 1)], 1],
                [xCoord, zCoord]);
        }
        return terrainHeight;
    }
}

module.exports = {
    Terrain,
};

},{"../RenderEngine/Loader.js":14,"../Util/MathUtil.js":35}],31:[function(require,module,exports){
let serialNumber = 0;

class ModelTexture {
    constructor(id) {
        this.textureID = id;

        this.shineDamper = 1;
        this.reflectivity = 0;

        this.hasTransparency = false;
        this.useFakeNormal = false;

        this.serialNumber = serialNumber;
        serialNumber += 1;

        this.numberOfRows = 1;
    }
}

module.exports = {
    ModelTexture,
};

},{}],32:[function(require,module,exports){
class TerrainTexture {
    constructor(id) {
        this.textureID = id;
    }
}

module.exports = {
    TerrainTexture,
};

},{}],33:[function(require,module,exports){
class TerrainTexturePack {
    constructor(backgroundTexture, rTexture, gTexture, bTexture) {
        this.backgroundTexture = backgroundTexture;
        this.rTexture = rTexture;
        this.gTexture = gTexture;
        this.bTexture = bTexture;
    }
}

module.exports = {
    TerrainTexturePack,
};

},{}],34:[function(require,module,exports){
module.exports = {
    MAX_LIGHTS: 4,
};

},{}],35:[function(require,module,exports){
function toQuaternion(rotation) {
    let q = quat.create();
    quat.rotateX(q, q, rotation[0]);
    quat.rotateY(q, q, rotation[1]);
    quat.rotateZ(q, q, rotation[2]);
    return q;
}

function barryCentric(p1, p2, p3, pos) {
    let det = (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
    let l1 = ((p2[2] - p3[2]) * (pos[0] - p3[0]) + (p3[0] - p2[0]) * (pos[1] - p3[2])) / det;
    let l2 = ((p3[2] - p1[2]) * (pos[0] - p3[0]) + (p1[0] - p3[0]) * (pos[1] - p3[2])) / det;
    let l3 = 1.0 - l1 - l2;
    return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
}

function toRadians(angle) {
    return (angle / 180) * Math.PI;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function createTransformationMatrix(translation, rotation, scale) {
    let matrix = mat4.create();
    mat4.fromRotationTranslationScale(matrix, toQuaternion(rotation), translation, scale);

    return matrix;
}

function create2DTransformationMatrix(translation, scale) {
    let matrix = mat4.create();
    mat4.fromRotationTranslationScale(matrix, quat.create(), translation.concat([0]), scale.concat([1]));

    return matrix;
}

function createViewMatrix(translation, rotation) {
    let matrix = mat4.create();
    mat4.fromQuat(matrix, toQuaternion(rotation));
    // mat4.rotate(matrix, matrix, rotation[0], [1, 0, 0]);
    // mat4.rotate(matrix, matrix, rotation[1], [0, 1, 0]);

    let negateTranslation = vec3.create();
    vec3.negate(negateTranslation, translation);
    mat4.translate(matrix, matrix, negateTranslation);

    return matrix;
}

module.exports = {
    createTransformationMatrix,

    create2DTransformationMatrix,

    createViewMatrix,

    toRadians,

    clamp,
    barryCentric,
};

},{}],36:[function(require,module,exports){
const currentlyPressedKeys = {};
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

const mouseInfo = {
    buttonPressed: [false, false, false],
    buttonLastPos: [[0, 0], [0, 0], [0, 0]],
    buttonDelta: [[0, 0], [0, 0], [0, 0]],
    wheelDelta: 0,

    mouseWheelCallback: undefined,
};

function handleMouseDown(event) {
    mouseInfo.buttonPressed[event.button] = true;
    mouseInfo.buttonLastPos[event.button][0] = event.clientX;
    mouseInfo.buttonLastPos[event.button][1] = event.clientY;
}

function handleMouseUp(event) {
    mouseInfo.buttonPressed[event.button] = false;
}

function handleMouseMove(event) {
    mouseInfo.buttonPressed.forEach((button, i) => {
        mouseInfo.buttonDelta[i][0] = event.clientX - mouseInfo.buttonLastPos[i][0];
        mouseInfo.buttonDelta[i][1] = event.clientY - mouseInfo.buttonLastPos[i][1];
        mouseInfo.buttonLastPos[i][0] = event.clientX;
        mouseInfo.buttonLastPos[i][1] = event.clientY;
    });
}

function handeMouseWheel(event) {
    mouseInfo.wheelDelta = event.wheelDelta;

    if (mouseInfo.mouseWheelCallback) {
        mouseInfo.mouseWheelCallback(event.wheelDelta);
    }
}

function enableCulling() {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
}

function disableCulling() {
    gl.disable(gl.CULL_FACE);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function initGL(canvas) {
    try {
        window.gl = canvas.getContext('webgl2');
        window.gl.viewportWidth = canvas.width;
        window.gl.viewportHeight = canvas.height;
    } catch (e) {
        // TODO: show error
    }

    if (!window.gl) {
        alert('Could not initialise WebGL, sorry :-( ');
    }
}

function initKeyboard() {
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    window.currentlyPressedKeys = currentlyPressedKeys;
}

function initMouse() {
    canvas.onmousedown = handleMouseDown;
    canvas.onmousewheel = handeMouseWheel;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    window.mouseInfo = mouseInfo;
}

function Ajax() {
    const self = this;
    self.xmlhttp = new XMLHttpRequest();

    self.get = (url, callback) => {
        self.xmlhttp.onreadystatechange = () => {
            if (self.xmlhttp.readyState === 4) {
                callback(self.xmlhttp.responseText, self.xmlhttp.status);
            }
        };
        self.xmlhttp.open('GET', url, true);
        self.xmlhttp.send();
    };
}

module.exports = {
    degToRad,
    initGL,
    initKeyboard,
    initMouse,
    Ajax,
    enableCulling,
    disableCulling,
};

},{}],37:[function(require,module,exports){
const Display = require('./RenderEngine/Display.js');
const Loader = require('./RenderEngine/Loader.js');
const MasterRenderer = require('./RenderEngine/MasterRenderer.js');
const OBJLoader = require('./RenderEngine/OBJLoader.js');

const Util = require('./Util/Util.js');

const ModelTexture = require('./Texture/ModelTexture.js');
const TerrainTexture = require('./Texture/TerrainTexture.js');
const TerrainTexturePack = require('./Texture/TerrainTexturePack.js');

const TexturedModel = require('./Model/TexturedModel.js');

const Entity = require('./Entities/Entity.js');
const Camera = require('./Entities/Camera.js');
const Light = require('./Entities/Light.js');
const Player = require('./Entities/Player.js');

const Terrain = require('./Terrain/Terrain.js');
const HeightMap = require('./Terrain/HeightMap.js');

const GUITexture = require('./GUI/GUITexture.js');
const GUIRenderer = require('./GUI/GUIRenderer.js');


let player;
let entities;
let camera;
let lights;

const textures = {};
const models = {};

let terrain;
let heightMap;

let guis;

let numResRequiredToLoad = 17;

window.onload = main;

function main() {
    // initialize WEBGL
    const canvas = document.getElementById('canvas');
    Util.initGL(canvas);
    Display.createDisplay();

    Util.initKeyboard();
    Util.initMouse();

    window.addEventListener('resize', () => { // resize GL on resize
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        Util.initGL(canvas);
        Display.createDisplay();
    });

    // Load shaders
    MasterRenderer.initialize();
    GUIRenderer.initialize();

    // Load graphics
    OBJLoader.loadOBJModel('res/tree.obj', (m) => {
        models.treeModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/grassModel.obj', (m) => {
        models.grassModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/fern.obj', (m) => {
        models.fernModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/person.obj', (m) => {
        models.playerModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/lamp.obj', (m) => {
        models.lampModel = m;
        finishedLoadingItem();
    });

    const heightMapImage = new Image();
    heightMapImage.src = 'res/heightmap.png';
    heightMapImage.onload = () => {
        heightMap = new HeightMap.HeightMap(heightMapImage);
        finishedLoadingItem();
    };

    Loader.loadTexture('res/playerTexture.png', (t) => {
        textures.playerTexture = new ModelTexture.ModelTexture(t);
        textures.playerTexture.shineDamper = 10;
        textures.playerTexture.reflectivity = 1.5;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/tree.png', (t) => {
        textures.treeTexture = new ModelTexture.ModelTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grassTexture.png', (t) => {
        textures.grassTexture = new ModelTexture.ModelTexture(t);
        textures.grassTexture.hasTransparency = true;
        textures.grassTexture.useFakeNormal = true;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/fern2.png', (t) => {
        textures.fernTexture = new ModelTexture.ModelTexture(t);
        textures.fernTexture.hasTransparency = true;
        textures.fernTexture.numberOfRows = 2;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grass.png', (t) => {
        textures.backgroundTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/mud.png', (t) => {
        textures.rTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grassFlowers.png', (t) => {
        textures.gTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/path.png', (t) => {
        textures.bTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/blendMap.png', (t) => {
        textures.blendMap = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/lamp.png', (t) => {
        textures.lampTexture = new ModelTexture.ModelTexture(t);
        textures.lampTexture.useFakeNormal = true;
        finishedLoadingItem();
    });

    guis = [];
    Loader.loadTexture('res/health.png', (t) => {
        const guiTexture = new ModelTexture.ModelTexture(t);
        const gui = new GUITexture.GUITexture(guiTexture, [-0.6, 0.8], [0.25, 0.25]);
        guis.push(gui);
        finishedLoadingItem();
    });
}

function finishedLoadingItem() {
    numResRequiredToLoad -= 1;
    if (numResRequiredToLoad === 0) {
        allResLoaded();
    }
}


function allResLoaded() {
     const treeTexturedModel = new TexturedModel.TexturedModel(models.treeModel, textures.treeTexture);
     const grassTexturedModel = new TexturedModel.TexturedModel(models.grassModel, textures.grassTexture);
     const fernTexturedModel = new TexturedModel.TexturedModel(models.fernModel, textures.fernTexture);
     const lampTexturedModel = new TexturedModel.TexturedModel(models.lampModel, textures.lampTexture);

    player = new Player.Player(
        new TexturedModel.TexturedModel(models.playerModel, textures.playerTexture), [0, 0, 0], [0, 0, 0], [0.3, 0.3, 0.3]);
    camera = new Camera.Camera(player);

     const texturePack = new TerrainTexturePack.TerrainTexturePack(
        textures.backgroundTexture, textures.rTexture, textures.gTexture, textures.bTexture);
    terrain = new Terrain.Terrain(0, -1, texturePack, textures.blendMap, heightMap);

    // Load Entities
    entities = [];
    for (let i = 0; i < 500; i++) {
        let x = Math.random() * 800;
        let z = Math.random() * -600;
        let y = terrain.getTerrainHeight(x, z);
        entities.push(new Entity.Entity(treeTexturedModel, [x, y, z], [0, 0, 0], [3, 3, 3]));

        x = Math.random() * 800;
        z = Math.random() * -600;
        y = terrain.getTerrainHeight(x, z);
        entities.push(new Entity.Entity(grassTexturedModel, [x, y, z], [0, 0, 0], [1, 1, 1]));

        x = Math.random() * 800;
        z = Math.random() * -600;
        y = terrain.getTerrainHeight(x, z);
        entities.push(new Entity.Entity(fernTexturedModel, [x, y, z], [0, 0, 0], [0.6, 0.6, 0.6], Math.floor(Math.random() * 4)));
    }

    lights = [
        new Light.Light([0, 1000, -7000], [0.4, 0.4, 0.4]),
        new Light.Light([185, 10, -293], [2, 0, 0], [1, 0.01, 0.002]),
        new Light.Light([370, 17, -300], [0, 2, 0], [1, 0.01, 0.002]),
        new Light.Light([293, 7, -305], [0, 0, 2], [1, 0.01, 0.002]),
    ];
    entities.push(new Entity.Entity(lampTexturedModel, [185, -4.7, -293], [0, 0, 0], [1, 1, 1]));
    entities.push(new Entity.Entity(lampTexturedModel, [370, 4.2, -300], [0, 0, 0], [1, 1, 1]));
    entities.push(new Entity.Entity(lampTexturedModel, [293, -6.8, -305], [0, 0, 0], [1, 1, 1]));

    tick();
}

function tick() {
    const next = Display.updateDisplay();
    if (next) {
        requestAnimationFrame(tick);
    } else {
        end();
        return;
    }

    camera.move();
    // camera.position = [player.position[0] - 20, player.position[1] + 20, player.position[2] + 60];
    player.move(terrain);

    MasterRenderer.processEntity(player);
    entities.forEach((entity) => { MasterRenderer.processEntity(entity); });
    MasterRenderer.processTerrain(terrain);
    MasterRenderer.render(lights, camera);

    GUIRenderer.render(guis);
}

function end() {
    MasterRenderer.cleanUp();
    GUIRenderer.cleanUp();
    Loader.cleanUp();
    Display.closeDisplay();
}

},{"./Entities/Camera.js":1,"./Entities/Entity.js":2,"./Entities/Light.js":3,"./Entities/Player.js":4,"./GUI/GUIRenderer.js":7,"./GUI/GUITexture.js":9,"./Model/TexturedModel.js":11,"./RenderEngine/Display.js":12,"./RenderEngine/Loader.js":14,"./RenderEngine/MasterRenderer.js":15,"./RenderEngine/OBJLoader.js":16,"./Terrain/HeightMap.js":29,"./Terrain/Terrain.js":30,"./Texture/ModelTexture.js":31,"./Texture/TerrainTexture.js":32,"./Texture/TerrainTexturePack.js":33,"./Util/Util.js":36}]},{},[37]);
