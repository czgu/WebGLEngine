(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MathUtil = require('../Util/MathUtil.js');

function Camera(player) {
    this.position = [0,0,0];
    this.pitch = MathUtil.toRadians(30);
    this.yaw = 0;
    this.roll = 0;

    this.player = player;
    this.distanceFromPlayer = 30.0;
    this.angleAroundPlayer = 0;

    mouseInfo.mouseWheelCallback = this.calculateZoom(this);
}

const SPEED = 0.5;

Camera.prototype.move = function() {
    this.calculatePitch();
    this.calculateAngleAroundPlayer();

    this.calculateCameraPosition();

    this.yaw = Math.PI - (this.player.rotation[1] + this.angleAroundPlayer);
}


Camera.prototype.calculateZoom = (_this) => {
    return (zoomLevel) => {
        _this.distanceFromPlayer -= zoomLevel * 0.01;
        _this.distanceFromPlayer = MathUtil.clamp(_this.distanceFromPlayer, 5, 100);
    };
}

Camera.prototype.calculatePitch = function() {
    if(mouseInfo.buttonPressed[2]) {
        let pitchChange = mouseInfo.buttonDelta[2][1] * 0.01;
        this.pitch -= pitchChange;
        this.pitch = MathUtil.clamp(this.pitch, 0, Math.PI / 2);
    }
}

Camera.prototype.calculateAngleAroundPlayer = function() {
    if (mouseInfo.buttonPressed[0]) {
        let angleChange = mouseInfo.buttonDelta[0][0] * 0.01;
        this.angleAroundPlayer -= angleChange;
    }
}

Camera.prototype.calculateCameraPosition = function() {
    let horizontalDistance = (this.distanceFromPlayer * Math.cos(this.pitch));
    let verticalDistance = (this.distanceFromPlayer * Math.sin(this.pitch));

    this.position[1] = this.player.position[1] + verticalDistance;
    let angleXZ = this.player.rotation[1] + this.angleAroundPlayer;
    let dx = horizontalDistance * Math.sin(angleXZ);
    let dz = horizontalDistance * Math.cos(angleXZ);

    this.position[0] = this.player.position[0] - dx;
    this.position[2] = this.player.position[2] - dz;
}

var self = module.exports = {
    Camera: Camera,
}

},{"../Util/MathUtil.js":25}],2:[function(require,module,exports){
var RawModel = require('../Model/TexturedModel.js');

// TexturedModel
function Entity(texturedModel, position, rot, scale) {
    this.texturedModel = texturedModel;
    this.position = position;
    this.rotation = rot;
    this.scale = scale;
}

Entity.prototype.increasePosition = function(dv) {
    vec3.add(this.position, this.position, dv);
}

Entity.prototype.increaseRotation = function(dv) {
    vec3.add(this.rotation, this.rotation, dv);
}

var self = module.exports = {
    Entity: Entity,
}

},{"../Model/TexturedModel.js":6}],3:[function(require,module,exports){
function Light(position, color) {
    this.position = position;
    this.color = color;
}

var self = module.exports = {
    Light: Light
};

},{}],4:[function(require,module,exports){
var Entity = require('./Entity.js');
var Display = require('../RenderEngine/Display.js');
var MathUtil = require('../Util/MathUtil.js');

function Player(texturedModel, position, rot, scale) {
    Entity.Entity.call(this, texturedModel, position, rot, scale);

    this.currentSpeed = 0;
    this.currentTurnSpeed = 0;
    this.upwardSpeed = 0;
    this.isInAir = false;
}

Player.prototype = Object.create(Entity.Entity.prototype);
Player.prototype.constructor = Player;

const RUN_SPEED = 20;
const TURN_SPEED = MathUtil.toRadians(160);
const GRAVITY = -2;
const JUMP_POWER = 1;

Player.prototype.checkInputs = function() {
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

Player.prototype.move = function(terrain) {
    this.checkInputs();
    this.increaseRotation([0, this.currentTurnSpeed * Display.delta, 0]);

    let distance = this.currentSpeed * Display.delta;
    let dx = Math.sin(this.rotation[1]) * distance;
    let dz = Math.cos(this.rotation[1]) * distance;

    this.upwardSpeed += GRAVITY * Display.delta;

    this.increasePosition([dx, this.upwardSpeed, dz]);

    let terrainHeight = terrain.getTerrainHeight(this.position[0], this.position[2]);
    if (this.position[1] < terrainHeight) {
        this.isInAir = false;
        this.upwardSpeed = 0;
        this.position[1] = terrainHeight;
    }
    if (this.lastHeight != terrainHeight) {
        console.log(terrainHeight);
    }
    this.lastHeight = terrainHeight;
}

var self = module.exports = {
    Player: Player,
}

},{"../RenderEngine/Display.js":7,"../Util/MathUtil.js":25,"./Entity.js":2}],5:[function(require,module,exports){
let serialNumber = 0;

var self = module.exports = {
    RawModel:  function (id, count) {
        this.vaoID = id;
        this.vertexCount = count;

        this.serialNumber = serialNumber;
        serialNumber += 1;
    },
};

},{}],6:[function(require,module,exports){
var RawModel = require('./RawModel.js');

function TexturedModel(model, texture) {
    this.rawModel = model;
    this.texture = texture; // ModeelTexture
}

var self = module.exports = {
    TexturedModel: TexturedModel,
}

},{"./RawModel.js":5}],7:[function(require,module,exports){
var lastFrameTime;

function getCurrentTime() {
    return new Date().getTime();
}

var self = module.exports = {
    createDisplay: function() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        lastFrameTime = getCurrentTime();
    },

    updateDisplay: function() {
        let currentFrameTime = getCurrentTime();
        self.delta = (currentFrameTime - lastFrameTime) / 1000;
        lastFrameTime = currentFrameTime;

        return true;
    },

    closeDisplay: function() {

    },

    delta: undefined,
};

},{}],8:[function(require,module,exports){
var RawModel = require('../Model/RawModel.js');
var MathUtil = require('../Util/MathUtil.js');
var Util = require('../Util/Util.js');
var TexturedModel = require('../Model/TexturedModel.js');
var Entity = require('../Entities/Entity.js');
var MasterRenderer = require('./MasterRenderer.js');

var projectionMatrix;
var shader;

function initialize(_shader, _projectionMatrix) {
    shader = _shader;
    projectionMatrix = _projectionMatrix;

    shader.start();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.stop();
}

function render(texturedModelEntities) {
    texturedModelEntities.forEach(function(texturedModelEntitiesPair) {
        let texturedModel = texturedModelEntitiesPair[0];
        let entities = texturedModelEntitiesPair[1];

        preparedTexturedModel(texturedModel);
        entities.forEach(function(entity) {
            prepareInstance(entity);
            gl.drawElements(
                gl.TRIANGLES, texturedModel.rawModel.vertexCount, gl.UNSIGNED_INT, 0);
        });
        unbindTexturedModel();
    });
}

function preparedTexturedModel(texturedModel) {
    var model = texturedModel.rawModel;

    gl.bindVertexArray(model.vaoID);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    var texture = texturedModel.texture;
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
    var mvMatrix = MathUtil.createTransformationMatrix(
        entity.position, entity.rotation, entity.scale);
    shader.loadTransMatrix(mvMatrix);
}

var self = module.exports = {
    initialize: initialize,
    render: render,
};

},{"../Entities/Entity.js":2,"../Model/RawModel.js":5,"../Model/TexturedModel.js":6,"../Util/MathUtil.js":25,"../Util/Util.js":26,"./MasterRenderer.js":10}],9:[function(require,module,exports){
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

},{"../Model/RawModel.js":5}],10:[function(require,module,exports){
var StaticShader = require('../Shader/StaticShader.js');
var EntityRenderer = require('./EntityRenderer.js');
var TerrainShader = require('../Shader/TerrainShader.js');
var TerrainRenderer = require('./TerrainRenderer.js');
var Util = require('../Util/Util.js');

var shader;
var terrainShader;

var texturedModelEntities = [];
var texturedModelIndicesLookUp = {};

var terrains = [];

// ProjectionMatrix related
const FOV = 70;
const NEAR_PLANE = 0.1;
const FAR_PLANE = 1000;
var projectionMatrix = mat4.create();

var skyColor = [0.5, 0.5, 0.5];

function initialize() {
    mat4.perspective(projectionMatrix, FOV, gl.viewportWidth / gl.viewportHeight, NEAR_PLANE, FAR_PLANE);
    Util.enableCulling();

    // Initialize Entity Renderer
    shader = new StaticShader.StaticShader();
    EntityRenderer.initialize(shader, projectionMatrix);

    // Initialize Terrain Renderer
    terrainShader = new TerrainShader.TerrainShader();
    TerrainRenderer.initialize(terrainShader, projectionMatrix);
}

function render(light, camera) {
    prepare();

    shader.start();
    shader.loadSkyColor(skyColor);
    shader.loadLight(light);
    shader.loadViewMatrix(camera);
    EntityRenderer.render(texturedModelEntities);
    shader.stop();

    terrainShader.start();
    terrainShader.loadSkyColor(skyColor);
    terrainShader.loadLight(light);
    terrainShader.loadViewMatrix(camera);
    TerrainRenderer.render(terrains);
    terrainShader.stop();

    texturedModelEntities.length = 0;
    texturedModelIndicesLookUp = {};

    terrains.length = 0;
}

function processEntity(entity) {
    let texturedModel = entity.texturedModel;
    let key = texturedModel.rawModel.serialNumber + "," + texturedModel.texture.serialNumber;

    if (key in texturedModelIndicesLookUp) {
        texturedModelEntities[texturedModelIndicesLookUp[key]][1].push(entity);
    } else {
        let value = texturedModelEntities.length;
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
}

function prepare() {
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(skyColor[0], skyColor[1], skyColor[2], 1.0);
}



var self = module.exports = {
    render: render,
    processEntity: processEntity,
    processTerrain: processTerrain,
    cleanUp: cleanUp,
    initialize: initialize,
}

},{"../Shader/StaticShader.js":18,"../Shader/TerrainShader.js":19,"../Util/Util.js":26,"./EntityRenderer.js":8,"./TerrainRenderer.js":12}],11:[function(require,module,exports){
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

},{"../Util/Util.js":26,"./Loader.js":9}],12:[function(require,module,exports){
var RawModel = require('../Model/RawModel.js');
var MathUtil = require('../Util/MathUtil.js');
var TexturedModel = require('../Model/TexturedModel.js');
var Terrain = require('../Terrain/Terrain.js');

var projectionMatrix;
var shader;

function initialize(_shader, _projectionMatrix) {
    shader = _shader;
    projectionMatrix = _projectionMatrix;

    shader.start();
    shader.loadProjectionMatrix(projectionMatrix);
    shader.connectTextureUnits();
    shader.stop();
}

function render(terrains) {
    terrains.forEach(function(terrain) {
        prepareTerrain(terrain);
        loadModelMatrix(terrain);

        gl.drawElements(
            gl.TRIANGLES, terrain.rawModel.vertexCount, gl.UNSIGNED_INT, 0);

        unbindTexturedModel(terrain);
    })
}

function prepareTerrain(terrain) {
    var model = terrain.rawModel;
    gl.bindVertexArray(model.vaoID);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    var texture = terrain.texture;
    bindTextures(terrain);
    shader.loadShineVariables(1, 0);
}

function bindTextures(terrain) {
    let texturePack = terrain.texturePack;
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
    var mvMatrix = MathUtil.createTransformationMatrix(
        [terrain.x, 0, terrain.z], [0, 0, 0], [1, 1, 1]);
    shader.loadTransMatrix(mvMatrix);
}

var self = module.exports = {
    initialize: initialize,
    render: render,
};

},{"../Model/RawModel.js":5,"../Model/TexturedModel.js":6,"../Terrain/Terrain.js":21,"../Util/MathUtil.js":25}],13:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
" \n" +" \n" +
"precision mediump float; \n" +" \n" +
" \n" +" \n" +
"in vec2 pass_texCoord; \n" +" \n" +
"in vec3 surfaceNormal; \n" +" \n" +
"in vec3 toLightVector; \n" +" \n" +
"in vec3 toCameraVector; \n" +" \n" +
"in float visibility; \n" +" \n" +
" \n" +" \n" +
"out vec4 outColor; \n" +" \n" +
" \n" +" \n" +
"uniform sampler2D textureSampler; \n" +" \n" +
"uniform vec3 lightColor; \n" +" \n" +
" \n" +" \n" +
"uniform float shineDamper; \n" +" \n" +
"uniform float reflectivity; \n" +" \n" +
" \n" +" \n" +
"uniform vec3 skyColor; \n" +" \n" +
" \n" +" \n" +
"void main(void) { \n" +" \n" +
"    vec3 unitSurfaceNormal = normalize(surfaceNormal); \n" +" \n" +
"    vec3 unitToLightVector = normalize(toLightVector); \n" +" \n" +
"    vec3 unitToCameraVector = normalize(toCameraVector); \n" +" \n" +
" \n" +" \n" +
"    float brightness = max(dot(unitSurfaceNormal, unitToLightVector), 0.2f); \n" +" \n" +
"    vec3 diffuse = brightness * lightColor; \n" +" \n" +
" \n" +" \n" +
"    vec3 reflectedLightDirection = reflect(-unitToLightVector, unitSurfaceNormal); \n" +" \n" +
"    float specularFactor = max(dot(reflectedLightDirection, unitToCameraVector), 0.0f); \n" +" \n" +
"    float dampedFactor = pow(specularFactor, shineDamper); \n" +" \n" +
"    vec3 specular = dampedFactor * reflectivity * lightColor; \n" +" \n" +
" \n" +" \n" +
"    vec4 textureColor = texture(textureSampler, pass_texCoord); \n" +" \n" +
"    if (textureColor.a < 0.5) { \n" +" \n" +
"        discard; \n" +" \n" +
"    } \n" +" \n" +
" \n" +" \n" +
"    outColor = vec4(diffuse, 1.0) *  textureColor + vec4(specular, 1.0); \n" +" \n" +
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

},{}],14:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
" \n" +" \n" +
"precision mediump float; \n" +" \n" +
" \n" +" \n" +
"in vec2 pass_texCoord; \n" +" \n" +
"in vec3 surfaceNormal; \n" +" \n" +
"in vec3 toLightVector; \n" +" \n" +
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
"uniform vec3 lightColor; \n" +" \n" +
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
"    vec3 unitToLightVector = normalize(toLightVector); \n" +" \n" +
"    vec3 unitToCameraVector = normalize(toCameraVector); \n" +" \n" +
" \n" +" \n" +
"    float brightness = max(dot(unitSurfaceNormal, unitToLightVector), 0.2f); \n" +" \n" +
"    vec3 diffuse = brightness * lightColor; \n" +" \n" +
" \n" +" \n" +
"    vec3 reflectedLightDirection = reflect(-unitToLightVector, unitSurfaceNormal); \n" +" \n" +
"    float specularFactor = max(dot(reflectedLightDirection, unitToCameraVector), 0.0f); \n" +" \n" +
"    float dampedFactor = pow(specularFactor, shineDamper); \n" +" \n" +
"    vec3 specular = dampedFactor * reflectivity * lightColor; \n" +" \n" +
" \n" +" \n" +
"    outColor = vec4(diffuse, 1.0) * totalColor + vec4(specular, 1.0); \n" +" \n" +
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

},{}],15:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
"in vec3 position; \n" +" \n" +
"in vec2 texCoord; \n" +" \n" +
"in vec3 normal; \n" +" \n" +
" \n" +" \n" +
"out vec2 pass_texCoord; \n" +" \n" +
"out vec3 surfaceNormal; \n" +" \n" +
"out vec3 toLightVector; \n" +" \n" +
"out vec3 toCameraVector; \n" +" \n" +
"out float visibility; \n" +" \n" +
" \n" +" \n" +
"uniform mat4 transformationMatrix; \n" +" \n" +
"uniform mat4 projectionMatrix; \n" +" \n" +
"uniform mat4 viewMatrix; \n" +" \n" +
" \n" +" \n" +
"uniform vec3 lightPosition; \n" +" \n" +
" \n" +" \n" +
"const float fogDensity = 0.0035; \n" +" \n" +
"const float fogGradient = 5.0; \n" +" \n" +
" \n" +" \n" +
"void main(void) { \n" +" \n" +
"  vec4 worldPos = transformationMatrix * vec4(position, 1.0); \n" +" \n" +
"  vec4 positionRelativeToCam = viewMatrix * worldPos; \n" +" \n" +
"  gl_Position = projectionMatrix * positionRelativeToCam; \n" +" \n" +
"  pass_texCoord = texCoord; \n" +" \n" +
" \n" +" \n" +
"  surfaceNormal = (transformationMatrix * vec4(normal, 0.0)).xyz; \n" +" \n" +
"  toLightVector = lightPosition - worldPos.xyz; \n" +" \n" +
" \n" +" \n" +
"  toCameraVector = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz - worldPos.xyz; \n" +" \n" +
" \n" +" \n" +
"  float distanceRelativeToCam = length(positionRelativeToCam.xyz); \n" +" \n" +
"  visibility = clamp(exp(-pow(distanceRelativeToCam * fogDensity, fogGradient)), 0.0, 1.0); \n" +" \n" +
"} \n" +" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],16:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#version 300 es \n" +" \n" +
"in vec3 position; \n" +" \n" +
"in vec2 texCoord; \n" +" \n" +
"in vec3 normal; \n" +" \n" +
" \n" +" \n" +
"out vec2 pass_texCoord; \n" +" \n" +
"out vec3 surfaceNormal; \n" +" \n" +
"out vec3 toLightVector; \n" +" \n" +
"out vec3 toCameraVector; \n" +" \n" +
"out float visibility; \n" +" \n" +
" \n" +" \n" +
"uniform mat4 transformationMatrix; \n" +" \n" +
"uniform mat4 projectionMatrix; \n" +" \n" +
"uniform mat4 viewMatrix; \n" +" \n" +
" \n" +" \n" +
"uniform vec3 lightPosition; \n" +" \n" +
" \n" +" \n" +
"uniform float useFakeNormal; \n" +" \n" +
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
"    vec3 actualNormal = normal; \n" +" \n" +
"    if (useFakeNormal > 0.5) { \n" +" \n" +
"        actualNormal = vec3(0.0, 1.0, 0.0); \n" +" \n" +
"    } \n" +" \n" +
" \n" +" \n" +
"    surfaceNormal = (transformationMatrix * vec4(actualNormal, 0.0)).xyz; \n" +" \n" +
"    toLightVector = lightPosition - worldPos.xyz; \n" +" \n" +
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
var ShaderProgram = require('./ShaderProgram.js');
var MathUtil = require('../Util/MathUtil.js');

const VERTEX_SHADER = require('./GLSL/VertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/FragmentShader.c');

function StaticShader() {
    ShaderProgram.ShaderProgram.call(this, VERTEX_SHADER, FRAGMENT_SHADER);
}
StaticShader.prototype = Object.create(ShaderProgram.ShaderProgram.prototype);
StaticShader.prototype.constructor = StaticShader;

StaticShader.prototype.bindAttributes = function() {
    this.bindAttribute(0, "position");
    this.bindAttribute(1, "texCoord");
    this.bindAttribute(2, "normal");
}

StaticShader.prototype.getAllUniformLocations = function() {
    this.transformationMatrixLocation = this.getUniformLocation("transformationMatrix");
    this.projectionMatrixLocation = this.getUniformLocation("projectionMatrix");
    this.viewMatrixLocation = this.getUniformLocation("viewMatrix");
    this.lightPositionLocation = this.getUniformLocation("lightPosition");
    this.lightColorLocation = this.getUniformLocation("lightColor");
    this.shineDamperLocation = this.getUniformLocation("shineDamper");
    this.reflectivityLocation = this.getUniformLocation("reflectivity");
    this.useFakeNormalLocation = this.getUniformLocation("useFakeNormal");
    this.skyColorLocation = this.getUniformLocation("skyColor");
};

StaticShader.prototype.loadTransMatrix = function(matrix) {
    this.loadMatrix(this.transformationMatrixLocation, matrix);
};

StaticShader.prototype.loadProjectionMatrix = function(matrix) {
    this.loadMatrix(this.projectionMatrixLocation, matrix);
};

StaticShader.prototype.loadViewMatrix = function(camera) {
    let matrix = MathUtil.createViewMatrix(
        camera.position, [camera.pitch, camera.yaw, camera.roll])
    this.loadMatrix(this.viewMatrixLocation, matrix);
};

StaticShader.prototype.loadLight = function(light) {
    this.loadVector(this.lightPositionLocation, light.position);
    this.loadVector(this.lightColorLocation, light.color);
};

StaticShader.prototype.loadShineVariables = function(shineDamper, reflectivity) {
    this.loadFloat(this.shineDamperLocation, shineDamper);
    this.loadFloat(this.reflectivityLocation, reflectivity);
};

StaticShader.prototype.loadUseFakeNormal = function(useFakeNormal) {
    this.loadBool(this.useFakeNormalLocation, useFakeNormal);
};

StaticShader.prototype.loadSkyColor = function(skyColor) {
    this.loadVector(this.skyColorLocation, skyColor);
};

var self = module.exports = {
    StaticShader: StaticShader,
}

},{"../Util/MathUtil.js":25,"./GLSL/FragmentShader.c":13,"./GLSL/VertexShader.c":16,"./ShaderProgram.js":17}],19:[function(require,module,exports){
var ShaderProgram = require('./ShaderProgram.js');
var MathUtil = require('../Util/MathUtil.js');

const VERTEX_SHADER = require('./GLSL/TerrainVertexShader.c');
const FRAGMENT_SHADER = require('./GLSL/TerrainFragmentShader.c');

function TerrainShader() {
    ShaderProgram.ShaderProgram.call(this, VERTEX_SHADER, FRAGMENT_SHADER);
}
TerrainShader.prototype = Object.create(ShaderProgram.ShaderProgram.prototype);
TerrainShader.prototype.constructor = TerrainShader;

TerrainShader.prototype.bindAttributes = function() {
    this.bindAttribute(0, "position");
    this.bindAttribute(1, "texCoord");
    this.bindAttribute(2, "normal");
}

TerrainShader.prototype.getAllUniformLocations = function() {
    this.transformationMatrixLocation = this.getUniformLocation("transformationMatrix");
    this.projectionMatrixLocation = this.getUniformLocation("projectionMatrix");
    this.viewMatrixLocation = this.getUniformLocation("viewMatrix");
    this.lightPositionLocation = this.getUniformLocation("lightPosition");
    this.lightColorLocation = this.getUniformLocation("lightColor");
    this.shineDamperLocation = this.getUniformLocation("shineDamper");
    this.reflectivityLocation = this.getUniformLocation("reflectivity");
    this.skyColorLocation = this.getUniformLocation("skyColor");

    this.backgroundTextureLocation = this.getUniformLocation("backgroundTexture");
    this.rTextureLocation = this.getUniformLocation("rTexture");
    this.gTextureLocation = this.getUniformLocation("gTexture");
    this.bTextureLocation = this.getUniformLocation("bTexture");
    this.blendMapLocation = this.getUniformLocation("blendMap");
};

TerrainShader.prototype.loadTransMatrix = function(matrix) {
    this.loadMatrix(this.transformationMatrixLocation, matrix);
};

TerrainShader.prototype.loadProjectionMatrix = function(matrix) {
    this.loadMatrix(this.projectionMatrixLocation, matrix);
};

TerrainShader.prototype.loadViewMatrix = function(camera) {
    let matrix = MathUtil.createViewMatrix(
        camera.position, [camera.pitch, camera.yaw, camera.roll])
    this.loadMatrix(this.viewMatrixLocation, matrix);
};

TerrainShader.prototype.loadLight = function(light) {
    this.loadVector(this.lightPositionLocation, light.position);
    this.loadVector(this.lightColorLocation, light.color);
};

TerrainShader.prototype.loadShineVariables = function(shineDamper, reflectivity) {
    this.loadFloat(this.shineDamperLocation, shineDamper);
    this.loadFloat(this.reflectivityLocation, reflectivity);
};

TerrainShader.prototype.loadSkyColor = function(skyColor) {
    this.loadVector(this.skyColorLocation, skyColor);
};

TerrainShader.prototype.connectTextureUnits = function() {
    this.loadInt(this.backgroundTextureLocation, 0);
    this.loadInt(this.rTextureLocation, 1);
    this.loadInt(this.gTextureLocation, 2);
    this.loadInt(this.bTextureLocation, 3);
    this.loadInt(this.blendMapLocation, 4);
}

var self = module.exports = {
    TerrainShader: TerrainShader,
}

},{"../Util/MathUtil.js":25,"./GLSL/TerrainFragmentShader.c":14,"./GLSL/TerrainVertexShader.c":15,"./ShaderProgram.js":17}],20:[function(require,module,exports){
const MAX_PIXEL_COLOR = 256 * 256 * 256;
const MAX_HEIGHT = 40;


function HeightMap(image) {
    this.image = image;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;

    this.context = this.canvas.getContext('2d');
    this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height);

    this.height = this.image.height;
}

HeightMap.prototype.getPixel = function(x, y) {
    return this.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
}

HeightMap.prototype.getHeight = function(x, y) {
    if (x < 0 || x > this.image.width || y < 0 || y > this.image.height) {
        return 0;
    }

    let pixel = this.getPixel(x, y);
    let height = (pixel[0] << 16) + (pixel[1] << 8) + pixel[2];
    height -= (MAX_PIXEL_COLOR / 2);
    height /= (MAX_PIXEL_COLOR / 2);
    height *= MAX_HEIGHT;

    return height;
}

HeightMap.prototype.getNormal = function(x, y) {
    let heightL = this.getHeight(x - 1, y);
    let heightR = this.getHeight(x + 1, y);
    let heightD = this.getHeight(x, y - 1);
    let heightU = this.getHeight(x, y + 1);
    let normal = [heightL - heightR, 2.0, heightD - heightU];
    vec3.normalize(normal, normal);

    return normal;
}

var self = module.exports = {
    HeightMap: HeightMap,
};

},{}],21:[function(require,module,exports){
var Loader = require('../RenderEngine/Loader.js');
var MathUtil = require('../Util/MathUtil.js');

const SIZE = 800;
var vertexCount;
var gridSquareSize;

function Terrain(gridX, gridZ, texturePack, blendMap, heightMap) {
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

Terrain.prototype.generateTerrain = function() {
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
            vertices[vertexPointer * 3 + 1] =  height;
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

Terrain.prototype.getTerrainHeight = function(worldX, worldZ) {
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
            [1, this.heights[(gridX + 1) * vertexCount +  (gridZ + 1)], 1],
            [0, this.heights[gridX * vertexCount + (gridZ + 1)], 1],
            [xCoord, zCoord]);
    }
    return terrainHeight;
}

var self = module.exports = {
    Terrain: Terrain,
};

},{"../RenderEngine/Loader.js":9,"../Util/MathUtil.js":25}],22:[function(require,module,exports){
let serialNumber = 0;

function ModelTexture(id) {
    this.textureID = id;

    this.shineDamper = 1;
    this.reflectivity = 0;

    this.hasTransparency = false;
    this.useFakeNormal = false;

    this.serialNumber = serialNumber;
    serialNumber += 1;
}

var self = module.exports = {
    ModelTexture: ModelTexture,
};

},{}],23:[function(require,module,exports){
function TerrainTexture(id) {
    this.textureID = id;

}

var self = module.exports = {
    TerrainTexture: TerrainTexture,
};

},{}],24:[function(require,module,exports){
function TerrainTexturePack(backgroundTexture, rTexture, gTexture, bTexture) {
    this.backgroundTexture = backgroundTexture;
    this.rTexture = rTexture;
    this.gTexture = gTexture;
    this.bTexture = bTexture;
}

var self = module.exports = {
    TerrainTexturePack: TerrainTexturePack,
};

},{}],25:[function(require,module,exports){
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

var self = module.exports = {
    createTransformationMatrix: (translation, rotation, scale) => {
        var matrix = mat4.create();
        mat4.fromRotationTranslationScale(matrix,toQuaternion(rotation), translation, scale);

        return matrix;
    },

    createViewMatrix: function(translation, rotation) {
        var matrix = mat4.create();
        mat4.fromQuat(matrix, toQuaternion(rotation));
        //mat4.rotate(matrix, matrix, rotation[0], [1, 0, 0]);
        //mat4.rotate(matrix, matrix, rotation[1], [0, 1, 0]);

        var negateTranslation = vec3.create();
        vec3.negate(negateTranslation, translation);
        mat4.translate(matrix, matrix, negateTranslation);

        return matrix;
    },

    toRadians: toRadians,

    clamp: clamp,
    barryCentric: barryCentric,
};

},{}],26:[function(require,module,exports){
var currentlyPressedKeys = {};
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

var mouseInfo = {
    buttonPressed: [false, false, false],
    buttonLastPos: [[0,0],[0,0],[0,0]],
    buttonDelta: [[0,0],[0,0],[0,0]],
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

var self = module.exports = {
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },

    initGL: function(canvas) {
        try {
            window.gl = canvas.getContext("webgl2");
            window.gl.viewportWidth = canvas.width;
            window.gl.viewportHeight = canvas.height;
        } catch(e) {

        }

        if (!window.gl) {
            alert("Could not initialise WebGL, sorry :-( ");
        }
    },

    initKeyboard: function() {
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

        window.currentlyPressedKeys = currentlyPressedKeys;
    },

    initMouse: function() {
        canvas.onmousedown = handleMouseDown;
        canvas.onmousewheel = handeMouseWheel;
        document.onmouseup = handleMouseUp;
        document.onmousemove = handleMouseMove;

        window.mouseInfo = mouseInfo;
    },

    Ajax: function () {
        var _this = this;
        this.xmlhttp = new XMLHttpRequest();

        this.get = function(url, callback){
            _this.xmlhttp.onreadystatechange = function(){
                if(_this.xmlhttp.readyState === 4){
                    callback(_this.xmlhttp.responseText, _this.xmlhttp.status);
                }
            };
            _this.xmlhttp.open('GET', url, true);
            _this.xmlhttp.send();
        }
    },

    enableCulling: enableCulling,
    disableCulling: disableCulling,
};

},{}],27:[function(require,module,exports){
var Display = require('./RenderEngine/Display.js');
var Loader = require('./RenderEngine/Loader.js');
var MasterRenderer = require('./RenderEngine/MasterRenderer.js');
var OBJLoader = require('./RenderEngine/OBJLoader.js');

var Util = require('./Util/Util.js');

var ModelTexture = require('./Texture/ModelTexture.js');
var TerrainTexture = require('./Texture/TerrainTexture.js');
var TerrainTexturePack = require('./Texture/TerrainTexturePack.js');

var TexturedModel = require('./Model/TexturedModel.js');

var Entity = require('./Entities/Entity.js');
var Camera = require('./Entities/Camera.js');
var Light = require('./Entities/Light.js');
var Player = require('./Entities/Player.js');

var Terrain = require('./Terrain/Terrain.js');
var HeightMap = require('./Terrain/HeightMap.js');

window.onload = main;

var player;
var entities;
var camera;
var light;

var playerModel;
var playerTexture;

var treeModel;
var treeTexture;

var grassModel;
var grassTexture;

var fernModel;
var fernTexture;

var backgroundTexture;
var rTexture, gTexture, bTexture;
var blendMap;

var terrain;
var heightMap;

let numResRequiredToLoad = 14;

function main() {
    // initialize WEBGL
    var canvas = document.getElementById("canvas");
    Util.initGL(canvas);
    Display.createDisplay();

    Util.initKeyboard();
    Util.initMouse();

    window.addEventListener("resize", function() { // resize GL on resize
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        Util.initGL(canvas);
        Display.createDisplay();
    });


    // Load shaders
    MasterRenderer.initialize();

    // Load graphics
    OBJLoader.loadOBJModel('res/tree.obj', function(m) {
        treeModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/grassModel.obj', function(m) {
        grassModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/fern.obj', function(m) {
        fernModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/person.obj', function(m) {
        playerModel = m;
        finishedLoadingItem();
    });

    var heightMapImage = new Image(); heightMapImage.src = 'res/heightmap.png';
    heightMapImage.onload = () => {
        heightMap = new HeightMap.HeightMap(heightMapImage);
        finishedLoadingItem();
    };

    Loader.loadTexture('res/playerTexture.png', function(t) {
        playerTexture = new ModelTexture.ModelTexture(t);
        this.shineDamper = 10;
        this.reflectivity = 1.5;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/tree.png', function(t) {
        treeTexture = new ModelTexture.ModelTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grassTexture.png', function(t) {
        grassTexture = new ModelTexture.ModelTexture(t);
        grassTexture.hasTransparency = true;
        grassTexture.useFakeNormal = true;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/fern.png', function(t) {
        fernTexture = new ModelTexture.ModelTexture(t);
        fernTexture.hasTransparency = true;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grass.png', function(t) {
        backgroundTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/mud.png', function(t) {
        rTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grassFlowers.png', function(t) {
        gTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/path.png', function(t) {
        bTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/blendMap.png', function(t) {
        blendMap = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });
}

function finishedLoadingItem() {
    numResRequiredToLoad -= 1;
    if (numResRequiredToLoad == 0) {
        allResLoaded();
    }
}

function allResLoaded() {
    var treeTexturedModel = new TexturedModel.TexturedModel(treeModel, treeTexture);
    var grassTexturedModel =  new TexturedModel.TexturedModel(grassModel, grassTexture);
    var fernTexturedModel =  new TexturedModel.TexturedModel(fernModel, fernTexture);

    light = new Light.Light([20000, 20000, 2000], [1, 1, 1]);
    player = new Player.Player(
        new TexturedModel.TexturedModel(playerModel, playerTexture), [100, 0, -90], [0, 0, 0], [0.3, 0.3, 0.3]);
    camera = new Camera.Camera(player);

    let texturePack = new TerrainTexturePack.TerrainTexturePack(backgroundTexture, rTexture, gTexture, bTexture);
    terrain = new Terrain.Terrain(0, -1, texturePack, blendMap, heightMap);

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
        entities.push(new Entity.Entity(fernTexturedModel, [x, y, z], [0, 0, 0], [0.6, 0.6, 0.6]));
    }

    tick();
}

function tick() {
    let next = Display.updateDisplay();
    if (next) {
        requestAnimationFrame(tick);
    } else {
        end();
        return;
    }

    camera.move();
    //camera.position = [player.position[0] - 20, player.position[1] + 20, player.position[2] + 60];
    player.move(terrain);

    MasterRenderer.processEntity(player);
    entities.forEach((entity) => { MasterRenderer.processEntity(entity) });
    MasterRenderer.processTerrain(terrain);
    MasterRenderer.render(light, camera);
}

function end() {
    MasterRenderer.cleanUp();
    Loader.cleanUp();
    Display.closeDisplay();
}

},{"./Entities/Camera.js":1,"./Entities/Entity.js":2,"./Entities/Light.js":3,"./Entities/Player.js":4,"./Model/TexturedModel.js":6,"./RenderEngine/Display.js":7,"./RenderEngine/Loader.js":9,"./RenderEngine/MasterRenderer.js":10,"./RenderEngine/OBJLoader.js":11,"./Terrain/HeightMap.js":20,"./Terrain/Terrain.js":21,"./Texture/ModelTexture.js":22,"./Texture/TerrainTexture.js":23,"./Texture/TerrainTexturePack.js":24,"./Util/Util.js":26}]},{},[27]);
