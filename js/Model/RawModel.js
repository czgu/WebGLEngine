let serialNumber = 0;

var self = module.exports = {
    RawModel:  function (id, count) {
        this.vaoID = id;
        this.vertexCount = count;

        this.serialNumber = serialNumber;
        serialNumber += 1;
    },
};
