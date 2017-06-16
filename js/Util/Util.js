var currentlyPressedKeys = {};
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

var mouseInfo = {
    buttonPressed: [false, false, false],
    buttonLastPos: [[0,0],[0,0],[0,0]],
    buttonDelta: [[0,0],[0,0],[0,0]],
    wheelDelta: 0,

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

var self = module.exports = {
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },

    initGL: function(canvas) {
        try {
            window.gl = canvas.getContext("webgl2");
            window.gl.viewportWidth = canvas.width;
            window.gl.viewportHeight = canvas.height;
        } catch(e) {

        }

        if (!window.gl) {
            alert("Could not initialise WebGL, sorry :-( ");
        }
    },

    initKeyboard: function() {
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

        window.currentlyPressedKeys = currentlyPressedKeys;
    },

    initMouse: function() {
        canvas.onmousedown = handleMouseDown;
        canvas.onmousewheel = handeMouseWheel;
        document.onmouseup = handleMouseUp;
        document.onmousemove = handleMouseMove;

        window.mouseInfo = mouseInfo;
    },

    Ajax: function () {
        var _this = this;
        this.xmlhttp = new XMLHttpRequest();

        this.get = function(url, callback){
            _this.xmlhttp.onreadystatechange = function(){
                if(_this.xmlhttp.readyState === 4){
                    callback(_this.xmlhttp.responseText, _this.xmlhttp.status);
                }
            };
            _this.xmlhttp.open('GET', url, true);
            _this.xmlhttp.send();
        }
    },

    enableCulling: enableCulling,
    disableCulling: disableCulling,
};
