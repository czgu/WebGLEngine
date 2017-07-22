function Light(position, color, attenuation=undefined) {
    this.position = position;
    this.color = color;
    this.attenuation = attenuation ? attenuation : [1, 0, 0] ;
}

var self = module.exports = {
    Light: Light
};
