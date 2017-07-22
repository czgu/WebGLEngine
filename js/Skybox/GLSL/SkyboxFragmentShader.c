#version 300 es

precision mediump float;

in vec3 textureCoords;
out vec4 outColor;

uniform samplerCube cubeMap;

void main(void){
    vec3 newTextureCoords = textureCoords;
    newTextureCoords.y = newTextureCoords.y * -1.0;
    outColor = texture(cubeMap, newTextureCoords);
}
