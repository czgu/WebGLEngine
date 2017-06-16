const MAX_PIXEL_COLOR = 256 * 256 * 256;
const MAX_HEIGHT = 40;


function HeightMap(image) {
    this.image = image;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;

    this.context = this.canvas.getContext('2d');
    this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height);

    this.height = this.image.height;
}

HeightMap.prototype.getPixel = function(x, y) {
    return this.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
}

HeightMap.prototype.getHeight = function(x, y) {
    if (x < 0 || x > this.image.width || y < 0 || y > this.image.height) {
        return 0;
    }

    let pixel = this.getPixel(x, y);
    let height = (pixel[0] << 16) + (pixel[1] << 8) + pixel[2];
    height -= (MAX_PIXEL_COLOR / 2);
    height /= (MAX_PIXEL_COLOR / 2);
    height *= MAX_HEIGHT;

    return height;
}

HeightMap.prototype.getNormal = function(x, y) {
    let heightL = this.getHeight(x - 1, y);
    let heightR = this.getHeight(x + 1, y);
    let heightD = this.getHeight(x, y - 1);
    let heightU = this.getHeight(x, y + 1);
    let normal = [heightL - heightR, 2.0, heightD - heightU];
    vec3.normalize(normal, normal);

    return normal;
}

var self = module.exports = {
    HeightMap: HeightMap,
};
