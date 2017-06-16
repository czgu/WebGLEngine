#version 300 es

precision mediump float;

in vec2 pass_texCoord;
in vec3 surfaceNormal;
in vec3 toLightVector;
in vec3 toCameraVector;
in float visibility;

out vec4 outColor;

uniform sampler2D backgroundTexture;
uniform sampler2D rTexture;
uniform sampler2D gTexture;
uniform sampler2D bTexture;
uniform sampler2D blendMap;

uniform vec3 lightColor;

uniform float shineDamper;
uniform float reflectivity;
uniform vec3 skyColor;

void main(void) {
    vec4 blendMapColor = texture(blendMap, pass_texCoord);
    float backgroundTextureAmount = 1.0 - (blendMapColor.r + blendMapColor.g + blendMapColor.b);

    vec2 tileCoords = pass_texCoord * 40.0;
    vec4 backgroundTextureColor = texture(backgroundTexture, tileCoords) * backgroundTextureAmount;
    vec4 rTextureColor = texture(rTexture, tileCoords) * blendMapColor.r;
    vec4 gTextureColor = texture(gTexture, tileCoords) * blendMapColor.g;
    vec4 bTextureColor = texture(bTexture, tileCoords) * blendMapColor.b;

    vec4 totalColor = backgroundTextureColor + rTextureColor + gTextureColor + bTextureColor;

    vec3 unitSurfaceNormal = normalize(surfaceNormal);
    vec3 unitToLightVector = normalize(toLightVector);
    vec3 unitToCameraVector = normalize(toCameraVector);

    float brightness = max(dot(unitSurfaceNormal, unitToLightVector), 0.2f);
    vec3 diffuse = brightness * lightColor;

    vec3 reflectedLightDirection = reflect(-unitToLightVector, unitSurfaceNormal);
    float specularFactor = max(dot(reflectedLightDirection, unitToCameraVector), 0.0f);
    float dampedFactor = pow(specularFactor, shineDamper);
    vec3 specular = dampedFactor * reflectivity * lightColor;

    outColor = vec4(diffuse, 1.0) * totalColor + vec4(specular, 1.0);
    outColor = mix(vec4(skyColor, 1.0), outColor, visibility);
}
