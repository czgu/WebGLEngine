const Display = require('./RenderEngine/Display.js');
const Loader = require('./RenderEngine/Loader.js');

const MasterRenderer = require('./RenderEngine/MasterRenderer.js');

const Util = require('./Util/Util.js');
const MousePicker = require('./Util/MousePicker.js');

const TerrainTexturePack = require('./Texture/TerrainTexturePack.js');

const TexturedModel = require('./Model/TexturedModel.js');

const Entity = require('./Entities/Entity.js');
const Camera = require('./Entities/Camera.js');
const Light = require('./Entities/Light.js');
const Player = require('./Entities/Player.js');

const Terrain = require('./Terrain/Terrain.js');

const GUITexture = require('./GUI/GUITexture.js');
const GUIRenderer = require('./GUI/GUIRenderer.js');

const AsyncResource = require('./Resource/AsyncResource.js');

const WaterTile = require('./Water/WaterTile.js');
const WaterFrameBuffers = require('./Water/WaterFrameBuffers.js');

let player;
let entities;
let camera;
let lights;
let fbos;

let terrain;
let guis;
let waters;

window.onload = main;

function main() {
    // initialize WEBGL
    Display.initDisplay();

    Util.initKeyboard();
    Util.initMouse();

    AsyncResource.loadAllResources(() => {
        allResLoaded();
    });
}

function allResLoaded() {
    const resource = AsyncResource.resource;
    const models = resource.models;
    const textures = resource.textures;
    const terrainTextures = resource.terrainTextures;

    const tree = new TexturedModel.TexturedModel(models.tree, textures.tree);
    const grass = new TexturedModel.TexturedModel(models.grass, textures.grass);
    const fern = new TexturedModel.TexturedModel(models.fern, textures.fern);
    const lamp = new TexturedModel.TexturedModel(models.lamp, textures.lamp);
    const person = new TexturedModel.TexturedModel(models.person, textures.person);

    player = new Player.Player(person, [0, 0, 0], [0, 0, 0], [0.3, 0.3, 0.3]);
    camera = new Camera.Camera(player);

    // Load shaders
    MasterRenderer.initialize(camera);
    GUIRenderer.initialize();
    MousePicker.initialize(camera);

     const texturePack = new TerrainTexturePack.TerrainTexturePack(
        terrainTextures.grass, terrainTextures.rTexture, terrainTextures.gTexture, terrainTextures.bTexture);
    terrain = new Terrain.Terrain(0, -1, texturePack, terrainTextures.waterBlendMap, resource.heightMaps.waterHeightMap);

    // Load Entities
    entities = [player];
    for (let i = 0; i < 500; i++) {
        let x = Math.random() * 800;
        let z = Math.random() * -600;
        let y = terrain.getTerrainHeight(x, z);
        entities.push(new Entity.Entity(tree, [x, y, z], [0, 0, 0], [3, 3, 3]));

        x = Math.random() * 800;
        z = Math.random() * -600;
        y = terrain.getTerrainHeight(x, z);
        entities.push(new Entity.Entity(grass, [x, y, z], [0, 0, 0], [1, 1, 1]));

        x = Math.random() * 800;
        z = Math.random() * -600;
        y = terrain.getTerrainHeight(x, z);
        entities.push(new Entity.Entity(fern, [x, y, z], [0, 0, 0], [0.6, 0.6, 0.6], Math.floor(Math.random() * 4)));
    }

    lights = [
        new Light.Light([0, 1000, -7000], [0.9, 0.9, 0.9]),
        // new Light.Light([185, 10, -293], [2, 0, 0], [1, 0.01, 0.002]),
        // new Light.Light([370, 17, -300], [0, 2, 0], [1, 0.01, 0.002]),
        // new Light.Light([293, 7, -305], [0, 0, 2], [1, 0.01, 0.002]),
    ];
    // entities.push(new Entity.Entity(lamp, [185, -4.7, -293], [0, 0, 0], [1, 1, 1]));
    // entities.push(new Entity.Entity(lamp, [370, 4.2, -300], [0, 0, 0], [1, 1, 1]));
    // entities.push(new Entity.Entity(lamp, [293, -6.8, -305], [0, 0, 0], [1, 1, 1]));

    fbos = new WaterFrameBuffers.WaterFrameBuffers();
    guis = [
        new GUITexture.GUITexture(textures.heart, [-0.6, 0.8], [0.25, 0.25]),
        new GUITexture.GUITexture(fbos.reflection, [0.75, 0.75], [0.25, 0.25]),
    ];

    waters = [new WaterTile.WaterTile(75, -75, 0)];
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
    MousePicker.update();

    fbos.reflection.bindFrameBuffer();
    MasterRenderer.renderScene(entities, terrain, lights, camera);
    fbos.reflection.unbindFrameBuffer();

    MasterRenderer.renderScene(entities, terrain, lights, camera, waters);
    GUIRenderer.render(guis);
}

function end() {
    MasterRenderer.cleanUp();
    GUIRenderer.cleanUp();
    Loader.cleanUp();
    fbos.cleanUp();
    Display.closeDisplay();
}
