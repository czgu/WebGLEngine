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
