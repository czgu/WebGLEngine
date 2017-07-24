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
