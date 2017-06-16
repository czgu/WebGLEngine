var Entity = require('./Entity.js');
var Display = require('../RenderEngine/Display.js');
var MathUtil = require('../Util/MathUtil.js');

function Player(texturedModel, position, rot, scale) {
    Entity.Entity.call(this, texturedModel, position, rot, scale);

    this.currentSpeed = 0;
    this.currentTurnSpeed = 0;
    this.upwardSpeed = 0;
    this.isInAir = false;
}

Player.prototype = Object.create(Entity.Entity.prototype);
Player.prototype.constructor = Player;

const RUN_SPEED = 20;
const TURN_SPEED = MathUtil.toRadians(160);
const GRAVITY = -2;
const JUMP_POWER = 1;

Player.prototype.checkInputs = function() {
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

Player.prototype.move = function(terrain) {
    this.checkInputs();
    this.increaseRotation([0, this.currentTurnSpeed * Display.delta, 0]);

    let distance = this.currentSpeed * Display.delta;
    let dx = Math.sin(this.rotation[1]) * distance;
    let dz = Math.cos(this.rotation[1]) * distance;

    this.upwardSpeed += GRAVITY * Display.delta;

    this.increasePosition([dx, this.upwardSpeed, dz]);

    let terrainHeight = terrain.getTerrainHeight(this.position[0], this.position[2]);
    if (this.position[1] < terrainHeight) {
        this.isInAir = false;
        this.upwardSpeed = 0;
        this.position[1] = terrainHeight;
    }
    if (this.lastHeight != terrainHeight) {
        console.log(terrainHeight);
    }
    this.lastHeight = terrainHeight;
}

var self = module.exports = {
    Player: Player,
}
