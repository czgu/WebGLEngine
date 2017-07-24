const MathUtil = require('../Util/MathUtil.js');

class Camera {
    constructor(player) {
        this.position = [0, 0, 0];
        this.pitch = MathUtil.toRadians(30);
        this.yaw = 0;
        this.roll = 0;

        this.player = player;
        this.distanceFromPlayer = 30.0;
        this.angleAroundPlayer = 0;

        mouseInfo.mouseWheelCallback = this.calculateZoom(this);
    }

    move() {
        this.calculatePitch();
        this.calculateAngleAroundPlayer();

        this.calculateCameraPosition();

        this.yaw = Math.PI - (this.player.rotation[1] + this.angleAroundPlayer);
    }

    calculateZoom(self) {
        return (zoomLevel) => {
            self.distanceFromPlayer -= zoomLevel * 0.01;
            self.distanceFromPlayer = MathUtil.clamp(self.distanceFromPlayer, 5, 100);
        };
    }

    calculatePitch() {
        if (mouseInfo.buttonPressed[2]) {
            const pitchChange = mouseInfo.buttonDelta[2][1] * 0.01;
            this.pitch -= pitchChange;
            this.pitch = MathUtil.clamp(this.pitch, -Math.PI / 2, Math.PI / 2);
        }
    }

    calculateAngleAroundPlayer() {
        if (mouseInfo.buttonPressed[0]) {
            const angleChange = mouseInfo.buttonDelta[0][0] * 0.01;
            this.angleAroundPlayer -= angleChange;
        }
    }

    calculateCameraPosition() {
        const horizontalDistance = (this.distanceFromPlayer * Math.cos(this.pitch));
        const verticalDistance = (this.distanceFromPlayer * Math.sin(this.pitch));

        this.position[1] = this.player.position[1] + verticalDistance;
        const angleXZ = this.player.rotation[1] + this.angleAroundPlayer;
        const dx = horizontalDistance * Math.sin(angleXZ);
        const dz = horizontalDistance * Math.cos(angleXZ);

        this.position[0] = this.player.position[0] - dx;
        this.position[2] = this.player.position[2] - dz;
    }
}

module.exports = {
    Camera,
};
