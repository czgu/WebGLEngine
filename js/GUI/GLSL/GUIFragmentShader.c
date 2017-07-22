#version 300 es

precision mediump float;

in vec2 textureCoords;
out vec4 outColor;

uniform sampler2D guiTexture;

void main(void){
	outColor = texture(guiTexture,textureCoords);
}
