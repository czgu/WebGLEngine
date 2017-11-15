const Loader = require('../RenderEngine/Loader.js');
const OBJLoader = require('../RenderEngine/OBJLoader.js');
const ModelTexture = require('../Texture/ModelTexture.js');
const TerrainTexture = require('../Texture/TerrainTexture.js');
const HeightMap = require('../Terrain/HeightMap.js');

const RESOURCE_FOLDER = 'res/';
const MODEL_FOLDER = 'model/';
const TEXTURE_FOLDER = 'texture/';
const CUBEMAP_FOLDER = 'cubeMap/';

const heightMapsToLoad = {
    heightMap: ['heightmap.png'],
    waterHeightMap: ['waterHeightMap.png'],
};

const terrainTexturesToLoad = {
    grass: ['grass.png'],
    rTexture: ['mud.png'],
    gTexture: ['grassFlowers.png'],
    bTexture: ['path.png'],
    blendMap: ['blendMap.png'],
    waterBlendMap: ['waterBlendMap.png'],
};

const texturesToLoad = {
    person: ['playerTexture.png', { shineDamper: 10, reflectivity: 1.5 }],
    tree: ['tree.png', {}],
    grass: ['grassTexture.png', { hasTransparency: true, useFakeNormal: true }],
    fern: ['fern2.png', { hasTransparency: true, numberOfRows: 2 }],
    lamp: ['lamp.png', { useFakeNormal: true }],
    pine: ['pine.png', {}],
    heart: ['health.png', {}],
};

const modelsToLoad = {
    tree: ['tree.obj'],
    grass: ['grassModel.obj'],
    fern: ['fern.obj'],
    person: ['person.obj'],
    lamp: ['lamp.obj'],
    pine: ['pine.obj'],
};

const cubeMapsToLoad = {
    day: [
        'day/right.png',
        'day/left.png',
        'day/bottom.png',
        'day/top.png',
        'day/back.png',
        'day/front.png',
    ],
    night: [
        'night/nightRight.png',
        'night/nightLeft.png',
        'night/nightBottom.png',
        'night/nightTop.png',
        'night/nightBack.png',
        'night/nightFront.png',
    ],
};

const resourceMeta = {
    textures: [texturesToLoad, loadTextures],
    models: [modelsToLoad, loadModels],
    heightMaps: [heightMapsToLoad, loadHeightMaps],
    terrainTextures: [terrainTexturesToLoad, loadTerrainTextures],
    cubeMaps: [cubeMapsToLoad, loadCubeMaps],
};

const resource = {
    textures: {},
    models: {},
    texturedModels: {},
    heightMaps: {},
    terrainTextures: {},
    cubeMaps: {},
};

function isLoadCompleted(count, onload) {
    const minusOne = count - 1;
    if (minusOne <= 0) {
        onload();
    }
    return minusOne;
}

function loadTextures(key, res, onload) {
    const FILE_PREFIX = RESOURCE_FOLDER + TEXTURE_FOLDER;
    let numberOfResourcesToLoad = Object.keys(res).length;

    Object.keys(res).forEach((name) => {
        const value = res[name];
        const path = FILE_PREFIX + value[0];
        const fields = value[1];

        Loader.loadTexture(path, (t) => {
            const texture = new ModelTexture.ModelTexture(t);
            Object.assign(texture, fields);
            resource[key][name] = texture;

            numberOfResourcesToLoad = isLoadCompleted(numberOfResourcesToLoad, onload);
        });
    });
}

function loadModels(key, res, onload) {
    const FILE_PREFIX = RESOURCE_FOLDER + MODEL_FOLDER;
    let numberOfResourcesToLoad = Object.keys(res).length;

    Object.keys(res).forEach((name) => {
        const value = res[name];
        const path = FILE_PREFIX + value[0];

        OBJLoader.loadOBJModel(path, (m) => {
            resource[key][name] = m;
            numberOfResourcesToLoad = isLoadCompleted(numberOfResourcesToLoad, onload);
        });
    });
}

function loadHeightMaps(key, res, onload) {
    const FILE_PREFIX = RESOURCE_FOLDER + TEXTURE_FOLDER;
    let numberOfResourcesToLoad = Object.keys(res).length;

    Object.keys(res).forEach((name) => {
        const value = res[name];
        const path = FILE_PREFIX + value[0];

        const image = new Image();
        image.src = path;
        image.onload = () => {
            resource[key][name] = new HeightMap.HeightMap(image);
            numberOfResourcesToLoad = isLoadCompleted(numberOfResourcesToLoad, onload);
        };
    });
}

function loadTerrainTextures(key, res, onload) {
    const FILE_PREFIX = RESOURCE_FOLDER + TEXTURE_FOLDER;
    let numberOfResourcesToLoad = Object.keys(res).length;

    Object.keys(res).forEach((name) => {
        const value = res[name];
        const path = FILE_PREFIX + value[0];

        Loader.loadTexture(path, (t) => {
            const texture = new TerrainTexture.TerrainTexture(t);
            resource[key][name] = texture;

            numberOfResourcesToLoad = isLoadCompleted(numberOfResourcesToLoad, onload);
        });
    });
}

function loadCubeMaps(key, res, onload) {
    const FILE_PREFIX = RESOURCE_FOLDER + CUBEMAP_FOLDER;
    let numberOfResourcesToLoad = Object.keys(res).length;

    Object.keys(res).forEach((name) => {
        const value = res[name];
        const paths = value.map(path => FILE_PREFIX + path);

        Loader.loadCubeMap(paths, (t) => {
            resource[key][name] = t;

            numberOfResourcesToLoad = isLoadCompleted(numberOfResourcesToLoad, onload);
        });
    });
}

function loadAllResources(onload) {
    let numberOfResourcesToLoad = Object.keys(resourceMeta).length;
    Object.keys(resourceMeta).forEach((key) => {
        const meta = resourceMeta[key];
        const res = meta[0];
        const func = meta[1];

        func(key, res, () => {
            console.log(key);
            numberOfResourcesToLoad = isLoadCompleted(numberOfResourcesToLoad, onload);
        });
    });
}

module.exports = {
    resource,
    loadAllResources,
};
