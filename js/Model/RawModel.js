let serialNumber = 0;

class RawModel {
    constructor(id, count) {
        this.vaoID = id;
        this.vertexCount = count;

        this.serialNumber = serialNumber;
        serialNumber += 1;
    }
}

module.exports = {
    RawModel,
};
