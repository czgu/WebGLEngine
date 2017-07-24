const Entity = require('./Entity.js');
const Display = require('../RenderEngine/Display.js');
const MathUtil = require('../Util/MathUtil.js');

const RUN_SPEED = 20;
const TURN_SPEED = MathUtil.toRadians(160);
const GRAVITY = -2;
const JUMP_POWER = 1;

class Player extends Entity.Entity {
    constructor(texturedModel, position, rot, scale) {
        super(texturedModel, position, rot, scale);

        this.currentSpeed = 0;
        this.currentTurnSpeed = 0;
        this.upwardSpeed = 0;
        this.isInAir = false;
    }

    checkInputs() {
        if (currentlyPressedKeys[87]) { // W
            this.currentSpeed = RUN_SPEED;
        } else if (currentlyPressedKeys[83]) { // S
            this.currentSpeed = -RUN_SPEED;
        } else {
            this.currentSpeed = 0;
        }

        if (currentlyPressedKeys[68]) { // D
            this.currentTurnSpeed = -TURN_SPEED;
        } else if (currentlyPressedKeys[65]) { // A
            this.currentTurnSpeed = TURN_SPEED;
        } else {
            this.currentTurnSpeed = 0;
        }

        if (currentlyPressedKeys[32] && !this.isInAir) { // SPACE
            this.upwardSpeed = JUMP_POWER;
            this.isInAir = true;
        }
    }

    move(terrain) {
        this.checkInputs();
        this.increaseRotation([0, this.currentTurnSpeed * Display.delta, 0]);

        const distance = this.currentSpeed * Display.delta;
        const dx = Math.sin(this.rotation[1]) * distance;
        const dz = Math.cos(this.rotation[1]) * distance;

        this.upwardSpeed += GRAVITY * Display.delta;

        this.increasePosition([dx, this.upwardSpeed, dz]);

        const terrainHeight = terrain.getTerrainHeight(this.position[0], this.position[2]);
        if (this.position[1] < terrainHeight) {
            this.isInAir = false;
            this.upwardSpeed = 0;
            this.position[1] = terrainHeight;
        }
        if (this.lastHeight !== terrainHeight) {
            // console.log(terrainHeight);
        }
        this.lastHeight = terrainHeight;
    }
}

module.exports = {
    Player,
};
