#version 300 es

precision mediump float;

in vec2 pass_texCoord;
in vec3 surfaceNormal;
in vec3 toLightVector[4];
in vec3 toCameraVector;
in float visibility;

out vec4 outColor;

uniform sampler2D textureSampler;
uniform vec3 lightColor[4];
uniform vec3 attenuation[4];
uniform float shineDamper;
uniform float reflectivity;

uniform vec3 skyColor;

void main(void) {
    vec3 unitSurfaceNormal = normalize(surfaceNormal);
    vec3 unitToCameraVector = normalize(toCameraVector);

    vec3 totalDiffuse = vec3(0.0);
    vec3 totalSpecular = vec3(0.0);

    for (int i = 0; i < 4; i++) {
        float distanceToLight = length(toLightVector[i]);
        float attenuationFactor = (attenuation[i].x) +
                                  (attenuation[i].y * distanceToLight) +
                                  (attenuation[i].z * distanceToLight * distanceToLight);
        vec3 unitToLightVector = normalize(toLightVector[i]);
        float brightness = max(dot(unitSurfaceNormal, unitToLightVector), 0.0f);

        vec3 reflectedLightDirection = reflect(-unitToLightVector, unitSurfaceNormal);
        float specularFactor = max(dot(reflectedLightDirection, unitToCameraVector), 0.0f);
        float dampedFactor = pow(specularFactor, shineDamper);

        vec3 diffuse = (brightness * lightColor[i]) / attenuationFactor;
        vec3 specular = (dampedFactor * reflectivity * lightColor[i]) / attenuationFactor;

        totalDiffuse += diffuse;
        totalSpecular += specular;
    }

    totalDiffuse = max(totalDiffuse, 0.2);

    vec4 textureColor = texture(textureSampler, pass_texCoord);
    if (textureColor.a < 0.5) {
        discard;
    }

    outColor = vec4(totalDiffuse, 1.0) *  textureColor + vec4(totalSpecular, 1.0);
    outColor = mix(vec4(skyColor, 1.0), outColor, visibility);
}
