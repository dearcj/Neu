import {_} from "../../main";
export class ColorGradingShader extends PIXI.Filter<{lut: any, textureNum: number}> {

    constructor(texturename: string, num: number) {
        let LUTSpriteTex = PIXI.Texture.fromFrame(texturename);
        LUTSpriteTex.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
        LUTSpriteTex.baseTexture.mipmap = false;

        super(_.rm.shaders['default.vert'],_.rm.shaders['colorgrade.frag'],
            {
                lut: {type: 'sampler2D', value: LUTSpriteTex},
                textureNum: {type: 'float', value: num},
            });

        this.uniforms.lut = LUTSpriteTex;
    }

}