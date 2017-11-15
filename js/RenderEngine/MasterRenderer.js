const EntityRenderer = require('./EntityRenderer.js');
const TerrainRenderer = require('./TerrainRenderer.js');
const SkyboxRenderer = require('../Skybox/SkyboxRenderer.js');
const WaterRenderer = require('../Water/WaterRenderer.js');
const Util = require('../Util/Util.js');

const texturedModelEntities = [];
let texturedModelIndicesLookUp = {};

const terrains = [];
const skyColor = [0.5, 0.5, 0.5];

function initialize(camera) {
    Util.enableCulling();

    EntityRenderer.initialize(camera);
    TerrainRenderer.initialize(camera);
    SkyboxRenderer.initialize(camera);
    WaterRenderer.initialize(camera);
}

function renderScene(entities, terrain, lights, camera, waters) {
    entities.forEach((entity) => { processEntity(entity); });
    processTerrain(terrain);

    render(lights, camera, waters);
}

function render(lights, camera, waters) {
    prepare();

    EntityRenderer.render(camera, lights, skyColor, texturedModelEntities);
    TerrainRenderer.render(camera, lights, skyColor, terrains);
    SkyboxRenderer.render(camera, skyColor);

    if (waters !== undefined) {
        WaterRenderer.render(camera, waters);
    }

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
    EntityRenderer.cleanUp();
    TerrainRenderer.cleanUp();
    SkyboxRenderer.cleanUp();
    WaterRenderer.cleanUp();
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
    renderScene,
};
