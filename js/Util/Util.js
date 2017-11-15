const currentlyPressedKeys = {};
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

const mouseInfo = {
    buttonPressed: [false, false, false],
    buttonLastPos: [[0, 0], [0, 0], [0, 0]],
    buttonDelta: [[0, 0], [0, 0], [0, 0]],
    wheelDelta: 0,
    position: [0, 0],
    mouseWheelCallback: undefined,
};

function handleMouseDown(event) {
    mouseInfo.buttonPressed[event.button] = true;
    mouseInfo.buttonLastPos[event.button][0] = event.clientX;
    mouseInfo.buttonLastPos[event.button][1] = event.clientY;
}

function handleMouseUp(event) {
    mouseInfo.buttonPressed[event.button] = false;
}

function handleMouseMove(event) {
    mouseInfo.buttonPressed.forEach((button, i) => {
        mouseInfo.buttonDelta[i][0] = event.clientX - mouseInfo.buttonLastPos[i][0];
        mouseInfo.buttonDelta[i][1] = event.clientY - mouseInfo.buttonLastPos[i][1];
        mouseInfo.buttonLastPos[i][0] = event.clientX;
        mouseInfo.buttonLastPos[i][1] = event.clientY;
    });
    mouseInfo.position = [event.clientX, event.clientY];
}

function handeMouseWheel(event) {
    mouseInfo.wheelDelta = event.wheelDelta;

    if (mouseInfo.mouseWheelCallback) {
        mouseInfo.mouseWheelCallback(event.wheelDelta);
    }
}

function enableCulling() {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
}

function disableCulling() {
    gl.disable(gl.CULL_FACE);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function initKeyboard() {
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    window.currentlyPressedKeys = currentlyPressedKeys;
}

function initMouse() {
    canvas.onmousedown = handleMouseDown;
    canvas.onmousewheel = handeMouseWheel;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    window.mouseInfo = mouseInfo;
}

function Ajax() {
    const self = this;
    self.xmlhttp = new XMLHttpRequest();

    self.get = (url, callback) => {
        self.xmlhttp.onreadystatechange = () => {
            if (self.xmlhttp.readyState === 4) {
                callback(self.xmlhttp.responseText, self.xmlhttp.status);
            }
        };
        self.xmlhttp.open('GET', url, true);
        self.xmlhttp.send();
    };
}

module.exports = {
    degToRad,
    initKeyboard,
    initMouse,
    Ajax,
    enableCulling,
    disableCulling,
};
