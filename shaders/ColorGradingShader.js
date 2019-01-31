var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../../main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Filter = PIXI.Filter;
    var ColorGradingShader = /** @class */ (function (_super) {
        __extends(ColorGradingShader, _super);
        function ColorGradingShader(texturename, num) {
            var _this = this;
            var LUTSpriteTex = PIXI.Texture.fromFrame(texturename);
            LUTSpriteTex.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
            LUTSpriteTex.baseTexture.mipmap = false;
            _this = _super.call(this, main_1._.rm.shaders['default.vert'], main_1._.rm.shaders['colorgrade.frag'], {
                lut: { type: 'sampler2D', value: LUTSpriteTex },
                textureNum: { type: 'float', value: num },
            }) || this;
            _this.uniforms.lut = LUTSpriteTex;
            return _this;
        }
        return ColorGradingShader;
    }(Filter));
    exports.ColorGradingShader = ColorGradingShader;
});
