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
