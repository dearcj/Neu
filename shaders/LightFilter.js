var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../../main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LightFilter = /** @class */ (function (_super) {
        __extends(LightFilter, _super);
        function LightFilter(options) {
            var _this = _super.call(this, main_1._.rm.shaders["default.vert"], main_1._.rm.shaders["lightfilter.frag"], {
                lightSampler: { type: 'sampler2D', value: options.lightSampler },
                gamma: { type: 'float', value: 1 },
                saturation: { type: 'float', value: 0.1 },
                contrast: { type: 'float', value: 1 },
                brightness: { type: 'float', value: 1 },
                red: { type: 'float', value: 1 },
                green: { type: 'float', value: 1 },
                blue: { type: 'float', value: 1 },
                alpha: { type: 'float', value: 1 },
            }) || this;
            if (options.gamma)
                _this.uniforms.gamma = options.gamma;
            _this.uniforms.gamma = Math.max(_this.uniforms.gamma, 0.0001);
            if (options.saturation)
                _this.uniforms.saturation = options.saturation;
            if (options.contrast)
                _this.uniforms.contrast = options.contrast;
            if (options.brightness)
                _this.uniforms.brightness = options.brightness;
            if (options.red)
                _this.uniforms.red = options.red;
            if (options.green)
                _this.uniforms.green = options.green;
            if (options.blue)
                _this.uniforms.blue = options.blue;
            if (options.alpha)
                _this.uniforms.alpha = options.alpha;
            return _this;
        }
        /**
         * Override existing apply method in PIXI.Filter
         * @private
         */
        LightFilter.prototype.apply = function (filterManager, input, output, clear) {
            filterManager.applyFilter(this, input, output, clear);
        };
        return LightFilter;
    }(PIXI.Filter));
    exports.LightFilter = LightFilter;
});
