#version 300 es

precision mediump float;

in vec3 textureCoords;
out vec4 outColor;

uniform samplerCube cubeMap;
uniform samplerCube cubeMap2;

uniform float blendFactor;

uniform vec3 fogColor;

const float upperLimit = 30.0;
const float lowerLimit = 0.0;

void main(void){
    vec3 newTextureCoords = textureCoords;
    newTextureCoords.y = newTextureCoords.y * -1.0;

    float fogFactor = (textureCoords.y - lowerLimit) / (upperLimit - lowerLimit);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    vec4 textureColor1 = texture(cubeMap, newTextureCoords);
    vec4 textureColor2 = texture(cubeMap2, newTextureCoords);
    vec4 finalColor = mix(textureColor1, textureColor2, blendFactor);
    outColor = mix(vec4(fogColor, 1.0), finalColor, fogFactor);
}
