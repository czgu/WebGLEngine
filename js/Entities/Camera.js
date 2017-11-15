const MathUtil = require('../Util/MathUtil.js');
// ProjectionMatrix related
const FOV = 70;
const NEAR_PLANE = 0.1;
const FAR_PLANE = 1000;

class Camera {
    constructor(player) {
        this.position = [0, 0, 0];
        this.pitch = MathUtil.toRadians(30);
        this.yaw = 0;
        this.roll = 0;

        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, FOV, gl.viewportWidth / gl.viewportHeight, NEAR_PLANE, FAR_PLANE);
        this.clipPlane = [-0.9979565838860582, 0.046191432528962184, -0.04414849017158111, -8.465081607404844];

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

    sign(x) {
        if (x > 0) {
            return 1.0;
        } else if (x < 0) {
            return -1.0;
        }
        return 0;
    }

    translateClipPlane(plane, matrix) {
        let normal = [plane[0], plane[1], plane[2], 0];
        vec4.normalize(normal, normal);
        let point = [normal[0] * plane[3], normal[1] * plane[3], normal[2] * plane[3], 1];

        let transposeInvertMatrix = mat4.create();
        mat4.invert(transposeInvertMatrix, matrix);
        mat4.transpose(transposeInvertMatrix, transposeInvertMatrix);

        vec4.transformMat4(point, point, matrix);
        vec4.transformMat4(normal, normal, transposeInvertMatrix);

        const xyz = [normal[0], normal[1], normal[2]];
        vec4.normalize(xyz, xyz);
        const d = point[0] * xyz[0] + point[1] * xyz[1] + point[2] * xyz[2];

        return [xyz[0], xyz[1], xyz[2], d];
    }

    calculateProjectionAndViewMatrices(cameraPosition = null) {
        const position = cameraPosition || this.position;

        const view = MathUtil.createViewMatrix(
            position, [this.pitch, this.yaw, this.roll]);
        let projection;

        if (this.clipPlane) {
            projection = mat4.create();
            mat4.copy(projection, this.projectionMatrix);
            let p = this.translateClipPlane(this.clipPlane, view);
            //p = [-0.9979565838860582, 0.046191432528962184, -0.04414849017158111, -8.465081607404844];
            let q = vec4.create();
            q[0] = (this.sign(p[0]) + projection[8]) / projection[0];
            q[1] = (this.sign(p[1]) + projection[9]) / projection[5];
            q[2] = -1.0;
            q[3] = (1.0 + projection[10]) / projection[14];

            let m4 = [projection[3], projection[7], projection[11], projection[15]];
            let c = vec4.create();
            vec4.scale(c, p, 2.0 / vec4.dot(p, q));

            projection[2] = c[0] - m4[0];
            projection[6] = c[1] - m4[1];
            projection[10] = c[2] - m4[2];
            projection[14] = c[3] - m4[3];
        } else {
            projection = this.projectionMatrix;
        }

        return {
            projection,
            view,
        };
    }
}

module.exports = {
    Camera,
};
