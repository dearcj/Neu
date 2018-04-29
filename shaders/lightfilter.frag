varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D lightSampler;

uniform float gamma;
uniform float contrast;
uniform float saturation;
uniform float brightness;
uniform float red;
uniform float green;
uniform float blue;
uniform float alpha;

void main(void)
{
    vec4 c = texture2D(uSampler, vTextureCoord);
    vec4 c0 = c;

    if (c.a > 0.0) {
        c.rgb /= c.a;

        vec3 rgb = pow(c.rgb, vec3(1. / gamma));
        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);
        rgb.r *= red;
        rgb.g *= green;
        rgb.b *= blue;
        c.rgb = rgb * brightness;

        c.rgb *= c.a;
    }

    vec4 t = texture2D(lightSampler, vTextureCoord);

    gl_FragColor.r = mix(c.r, c0.r, t.r) * alpha;
    gl_FragColor.g = mix(c.g, c0.g, t.g) * alpha;
    gl_FragColor.b = mix(c.b, c0.b, t.b) * alpha;
}