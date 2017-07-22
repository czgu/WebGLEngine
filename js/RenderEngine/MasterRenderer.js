var StaticShader = require('../Shader/StaticShader.js');
var EntityRenderer = require('./EntityRenderer.js');
var TerrainShader = require('../Shader/TerrainShader.js');
var TerrainRenderer = require('./TerrainRenderer.js');
var SkyboxRenderer = require('../Skybox/SkyboxRenderer.js');
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

    SkyboxRenderer.render(camera);

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
    SkyboxRenderer.cleanUp();
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
