var MathUtil = require('../Util/MathUtil.js');

function Camera(player) {
    this.position = [0,0,0];
    this.pitch = MathUtil.toRadians(30);
    this.yaw = 0;
    this.roll = 0;

    this.player = player;
    this.distanceFromPlayer = 30.0;
    this.angleAroundPlayer = 0;

    mouseInfo.mouseWheelCallback = this.calculateZoom(this);
}

const SPEED = 0.5;

Camera.prototype.move = function() {
    this.calculatePitch();
    this.calculateAngleAroundPlayer();

    this.calculateCameraPosition();

    this.yaw = Math.PI - (this.player.rotation[1] + this.angleAroundPlayer);
}


Camera.prototype.calculateZoom = (_this) => {
    return (zoomLevel) => {
        _this.distanceFromPlayer -= zoomLevel * 0.01;
        _this.distanceFromPlayer = MathUtil.clamp(_this.distanceFromPlayer, 5, 100);
    };
}

Camera.prototype.calculatePitch = function() {
    if(mouseInfo.buttonPressed[2]) {
        let pitchChange = mouseInfo.buttonDelta[2][1] * 0.01;
        this.pitch -= pitchChange;
        this.pitch = MathUtil.clamp(this.pitch, 0, Math.PI / 2);
    }
}

Camera.prototype.calculateAngleAroundPlayer = function() {
    if (mouseInfo.buttonPressed[0]) {
        let angleChange = mouseInfo.buttonDelta[0][0] * 0.01;
        this.angleAroundPlayer -= angleChange;
    }
}

Camera.prototype.calculateCameraPosition = function() {
    let horizontalDistance = (this.distanceFromPlayer * Math.cos(this.pitch));
    let verticalDistance = (this.distanceFromPlayer * Math.sin(this.pitch));

    this.position[1] = this.player.position[1] + verticalDistance;
    let angleXZ = this.player.rotation[1] + this.angleAroundPlayer;
    let dx = horizontalDistance * Math.sin(angleXZ);
    let dz = horizontalDistance * Math.cos(angleXZ);

    this.position[0] = this.player.position[0] - dx;
    this.position[2] = this.player.position[2] - dz;
}

var self = module.exports = {
    Camera: Camera,
}
