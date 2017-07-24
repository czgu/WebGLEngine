class Light {
    constructor(position, color, attenuation = undefined) {
        this.position = position;
        this.color = color;
        this.attenuation = attenuation || [1, 0, 0];
    }
}

module.exports = {
    Light,
};
