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
