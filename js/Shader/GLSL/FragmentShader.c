#version 300 es

precision mediump float;

in vec2 pass_texCoord;
in vec3 surfaceNormal;
in vec3 toLightVector;
in vec3 toCameraVector;
in float visibility;

out vec4 outColor;

uniform sampler2D textureSampler;
uniform vec3 lightColor;

uniform float shineDamper;
uniform float reflectivity;

uniform vec3 skyColor;

void main(void) {
    vec3 unitSurfaceNormal = normalize(surfaceNormal);
    vec3 unitToLightVector = normalize(toLightVector);
    vec3 unitToCameraVector = normalize(toCameraVector);

    float brightness = max(dot(unitSurfaceNormal, unitToLightVector), 0.2f);
    vec3 diffuse = brightness * lightColor;

    vec3 reflectedLightDirection = reflect(-unitToLightVector, unitSurfaceNormal);
    float specularFactor = max(dot(reflectedLightDirection, unitToCameraVector), 0.0f);
    float dampedFactor = pow(specularFactor, shineDamper);
    vec3 specular = dampedFactor * reflectivity * lightColor;

    vec4 textureColor = texture(textureSampler, pass_texCoord);
    if (textureColor.a < 0.5) {
        discard;
    }

    outColor = vec4(diffuse, 1.0) *  textureColor + vec4(specular, 1.0);
    outColor = mix(vec4(skyColor, 1.0), outColor, visibility);
}
