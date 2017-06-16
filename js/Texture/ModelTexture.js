let serialNumber = 0;

function ModelTexture(id) {
    this.textureID = id;

    this.shineDamper = 1;
    this.reflectivity = 0;

    this.hasTransparency = false;
    this.useFakeNormal = false;

    this.serialNumber = serialNumber;
    serialNumber += 1;
}

var self = module.exports = {
    ModelTexture: ModelTexture,
};
