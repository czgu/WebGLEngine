const REFLECTION_WIDTH = 320;
const REFLECTION_HEIGHT = 180;

const REFRACTION_WIDTH = 1280;
const REFRACTION_HEIGHT = 720;

class WaterFrameBuffers {
    constructor() {
        this.reflection = new FrameBuffer(REFLECTION_WIDTH, REFLECTION_HEIGHT, false);
        this.refraction = new FrameBuffer(REFRACTION_WIDTH, REFRACTION_HEIGHT, true);
    }

    cleanUp() {
        this.reflection.cleanUp();
        this.refraction.cleanUp();
    }
}

class FrameBuffer {
    constructor(width, height, useDepthTexture) {
        this.width = width;
        this.height = height;

        this.createFrameBuffer();
        this.createTextureAttachment();

        if (useDepthTexture) {
            this.createDepthTextureAttachment();
        } else {
            this.createDepthBufferAttachment();
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    createFrameBuffer() {
        this.frameBufferID = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferID);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    }

    createTextureAttachment() {
        this.textureID = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.textureID);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureID, 0);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    createDepthTextureAttachment() {
        this.depthTextureID = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.depthTextureID);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTextureID, 0);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    createDepthBufferAttachment() {
        this.depthBufferID = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBufferID);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBufferID);

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    unbindFrameBuffer() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    }

    bindFrameBuffer() {
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferID);
        gl.viewport(0, 0, this.width, this.height);
    }

    cleanUp() {
        gl.deleteFramebuffer(this.frameBufferID);
        gl.deleteTexture(this.textureID);

        if (this.depthTextureID) {
            gl.deleteTexture(this.depthTextureID);
        }

        if (this.depthBufferID) {
            gl.deleteRenderBuffer(this.depthBufferID);
        }
    }
}

module.exports = {
    WaterFrameBuffers,
};
