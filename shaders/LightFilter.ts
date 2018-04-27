/**
 * The ability to adjust gamma, contrast, saturation, brightness, alpha or color-channel shift. This is a faster
 * and much simpler to use than {@link http://pixijs.download/release/docs/PIXI.filters.ColorMatrixFilter.html ColorMatrixFilter}
 * because it does not use a matrix.<br>
 * ![original](../tools/screenshots/dist/original.png)![filter](../tools/screenshots/dist/adjustment.png)
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 *
 * @param {object|number} [options] - The optional parameters of the filter.
 * @param {number} [options.gamma=1] - The amount of luminance
 * @param {number} [options.saturation=1] - The amount of color saturation
 * @param {number} [options.contrast=1] - The amount of contrast
 * @param {number} [options.brightness=1] - The overall brightness
 * @param {number} [options.red=1] - The multipled red channel
 * @param {number} [options.green=1] - The multipled green channel
 * @param {number} [options.blue=1] - The multipled blue channel
 * @param {number} [options.alpha=1] - The overall alpha amount
 */
import {_} from "../../main";

type LightFilterParam = {lightSampler: any, gamma?: number, saturation?: number, contrast?: number, brightness?: number, red?: number, green?: number, blue?: number, alpha?: number};
export class LightFilter extends PIXI.Filter<LightFilterParam> {


    constructor(options: LightFilterParam) {
        super(_.rm.shaders["default.vert"], _.rm.shaders["lightfilter.frag"],  {
            lightSampler: {type: 'sampler2D', value: options.lightSampler},
            gamma: {type: 'float', value: 1},
            saturation: {type: 'float', value: 0.1},
            contrast: {type: 'float', value: 1},
            brightness: {type: 'float', value: 1},
            red: {type: 'float', value: 1},
            green: {type: 'float', value: 1},
            blue: {type: 'float', value: 1},
            alpha: {type: 'float', value: 1},
        });

        if (options.gamma)
            this.uniforms.gamma = options.gamma;

        this.uniforms.gamma = Math.max(this.uniforms.gamma, 0.0001);

        if (options.saturation)
            this.uniforms.saturation = options.saturation;

        if (options.contrast)
            this.uniforms.contrast = options.contrast;

        if (options.brightness)
            this.uniforms.brightness = options.brightness;

        if (options.red)
            this.uniforms.red = options.red;

        if (options.green)
            this.uniforms.green = options.green;

        if (options.blue)
            this.uniforms.blue = options.blue;

        if (options.alpha)
            this.uniforms.alpha = options.alpha;
    }

    /**
     * Override existing apply method in PIXI.Filter
     * @private
     */
    apply(filterManager, input, output, clear) {

        filterManager.applyFilter(this, input, output, clear);
    }
}