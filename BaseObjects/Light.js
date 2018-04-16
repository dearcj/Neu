var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./O", "./Lighting", "../Application"], function (require, exports, O_1, Lighting_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Light = /** @class */ (function (_super) {
        __extends(Light, _super);
        function Light() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.rndSeed = 0;
            _this.isCandle = false;
            return _this;
        }
        Light.prototype.onDestroy = function () {
            _super.prototype.onDestroy.call(this);
            var li = Application_1.Application.One.sm.findByType(Lighting_1.Lighting)[0];
        };
        Light.prototype.init = function (props) {
            if (props.polygon) {
                this.gfx = Application_1.Application.One.lm.createPolygon(props.polygon, props);
            }
            this.initSize = [this.gfx.width, this.gfx.height];
            this.isCandle = props.candle == "true";
            _super.prototype.init.call(this, props);
        };
        Light.prototype.addToScene = function () {
            var li = Application_1.Application.One.sm.findByType(Lighting_1.Lighting)[0];
            if (li) {
                li.addLight(this);
            }
        };
        Light.prototype.process = function () {
            if (this.gfx.visible) {
                if (this.isCandle) {
                    var coef = (this.gfx.height / 1640);
                    var as = Application_1.Application.One.fMath.sin(Application_1.Application.One.time / 120 + this.rndSeed / 10) * coef;
                    this.rndSeed += Math.random();
                    this.gfx.width = this.initSize[0] + 8 * Application_1.Application.One.fMath.cos(Application_1.Application.One.time / 70 + this.rndSeed / 10);
                    this.gfx.height = this.initSize[1] + 8 * as;
                    this.y += as;
                }
            }
            _super.prototype.process.call(this);
        };
        return Light;
    }(O_1.O));
    exports.Light = Light;
});
