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

var GUITexture = require('./GUI/GUITexture.js');
var GUIRenderer = require('./GUI/GUIRenderer.js');

window.onload = main;

var player;
var entities;
var camera;
var lights;

var textures = {};
var models = {};

var terrain;
var heightMap;

var guis;

let numResRequiredToLoad = 17;

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
    GUIRenderer.initialize();

    // Load graphics
    OBJLoader.loadOBJModel('res/tree.obj', function(m) {
        models.treeModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/grassModel.obj', function(m) {
        models.grassModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/fern.obj', function(m) {
        models.fernModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/person.obj', function(m) {
        models.playerModel = m;
        finishedLoadingItem();
    });

    OBJLoader.loadOBJModel('res/lamp.obj', function(m) {
        models.lampModel = m;
        finishedLoadingItem();
    });

    var heightMapImage = new Image(); heightMapImage.src = 'res/heightmap.png';
    heightMapImage.onload = () => {
        heightMap = new HeightMap.HeightMap(heightMapImage);
        finishedLoadingItem();
    };

    Loader.loadTexture('res/playerTexture.png', function(t) {
        textures.playerTexture = new ModelTexture.ModelTexture(t);
        textures.playerTexture.shineDamper = 10;
        textures.playerTexture.reflectivity = 1.5;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/tree.png', function(t) {
        textures.treeTexture = new ModelTexture.ModelTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grassTexture.png', function(t) {
        textures.grassTexture = new ModelTexture.ModelTexture(t);
        textures.grassTexture.hasTransparency = true;
        textures.grassTexture.useFakeNormal = true;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/fern2.png', function(t) {
        textures.fernTexture = new ModelTexture.ModelTexture(t);
        textures.fernTexture.hasTransparency = true;
        textures.fernTexture.numberOfRows = 2;
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grass.png', function(t) {
        textures.backgroundTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/mud.png', function(t) {
        textures.rTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/grassFlowers.png', function(t) {
        textures.gTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/path.png', function(t) {
        textures.bTexture = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/blendMap.png', function(t) {
        textures.blendMap = new TerrainTexture.TerrainTexture(t);
        finishedLoadingItem();
    });

    Loader.loadTexture('res/lamp.png', function(t) {
        textures.lampTexture = new ModelTexture.ModelTexture(t);
        textures.lampTexture.useFakeNormal = true;
        finishedLoadingItem();
    });

    guis = [];
    Loader.loadTexture('res/health.png', function(t) {
        let guiTexture = new ModelTexture.ModelTexture(t);
        let gui = new GUITexture.GUITexture(guiTexture, [-0.6, 0.8], [0.25, 0.25]);
        guis.push(gui);
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
    let treeTexturedModel = new TexturedModel.TexturedModel(models.treeModel, textures.treeTexture);
    let grassTexturedModel =  new TexturedModel.TexturedModel(models.grassModel, textures.grassTexture);
    let fernTexturedModel =  new TexturedModel.TexturedModel(models.fernModel, textures.fernTexture);
    let lampTexturedModel = new TexturedModel.TexturedModel(models.lampModel, textures.lampTexture);

    player = new Player.Player(
        new TexturedModel.TexturedModel(models.playerModel, textures.playerTexture), [0, 0, 0], [0, 0, 0], [0.3, 0.3, 0.3]);
    camera = new Camera.Camera(player);

    let texturePack = new TerrainTexturePack.TerrainTexturePack(
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
    MasterRenderer.render(lights, camera);

    GUIRenderer.render(guis);
}

function end() {
    MasterRenderer.cleanUp();
    GUIRenderer.cleanUp();
    Loader.cleanUp();
    Display.closeDisplay();
}
