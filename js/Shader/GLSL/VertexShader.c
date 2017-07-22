#version 300 es
in vec3 position;
in vec2 texCoord;
in vec3 normal;

out vec2 pass_texCoord;
out vec3 surfaceNormal;
out vec3 toLightVector[4];
out vec3 toCameraVector;
out float visibility;

uniform mat4 transformationMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

uniform vec3 lightPosition[4];

uniform float useFakeNormal;

uniform float numberOfRows;
uniform vec2 offset;

const float fogDensity = 0.0035;
const float fogGradient = 5.0;

void main(void) {
    vec4 worldPos = transformationMatrix * vec4(position, 1.0);
    vec4 positionRelativeToCam = viewMatrix * worldPos;
    gl_Position = projectionMatrix * positionRelativeToCam;
    pass_texCoord = (texCoord / numberOfRows) + offset;

    vec3 actualNormal = normal;
    if (useFakeNormal > 0.5) {
        actualNormal = vec3(0.0, 1.0, 0.0);
    }

    surfaceNormal = (transformationMatrix * vec4(actualNormal, 0.0)).xyz;
    for (int i = 0; i < 4; i++) {
        toLightVector[i] = lightPosition[i] - worldPos.xyz;
    }
    toCameraVector = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz - worldPos.xyz;

    float distanceRelativeToCam = length(positionRelativeToCam.xyz);
    visibility = clamp(exp(-pow(distanceRelativeToCam * fogDensity, fogGradient)), 0.0, 1.0);
}
