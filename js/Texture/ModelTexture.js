let serialNumber = 0;

class ModelTexture {
    constructor(id) {
        this.textureID = id;

        this.shineDamper = 1;
        this.reflectivity = 0;

        this.hasTransparency = false;
        this.useFakeNormal = false;

        this.serialNumber = serialNumber;
        serialNumber += 1;

        this.numberOfRows = 1;
    }
}

module.exports = {
    ModelTexture,
};
