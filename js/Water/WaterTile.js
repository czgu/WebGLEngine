class WaterTile {
    constructor(x, z, height) {
        this.x = x;
        this.z = z;
        this.height = height;
        this.tile_size = 60;
    }
}

module.exports = {
    WaterTile,
};
