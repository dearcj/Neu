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
define(["require", "exports", "./BaseLighting", "../Application", "./Light", "../shaders/LightFilter", "./O"], function (require, exports, BaseLighting_1, Application_1, Light_1, LightFilter_1, O_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Lighting = /** @class */ (function (_super) {
        __extends(Lighting, _super);
        function Lighting() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Lighting.prototype.onDestroy = function () {
            O_1.O.rp(this.ambient);
            _super.prototype.onDestroy.call(this);
        };
        Lighting.prototype.init = function (props) {
            this.alwaysVisible = true;
            var delta = 0;
            this.ambient = Application_1.Application.One.cs(BaseLighting_1.BaseLighting.DEFAULT_GFX);
            this.ambient.width = Application_1.Application.One.SCR_WIDTH;
            this.ambient.height = Application_1.Application.One.SCR_HEIGHT;
            this.envColor = this.defaultColor;
            this.baseScaleX = this.ambient.scale.x;
            this.baseScaleY = this.ambient.scale.y;
            this.lightingLayer = new PIXI.display.Layer();
            this.lightingLayer.useRenderTexture = true;
            this.layer.addChild(this.lightingLayer);
            this.lightFilter = new LightFilter_1.LightFilter({ saturation: -3, brightness: 0.7, contrast: 0.5, gamma: 1, lightSampler: this.lightingLayer.getRenderTexture() });
            Application_1.Application.One.sm.main.filters = [this.lightFilter];
            Application_1.Application.One.sm.main.filterArea = Application_1.Application.One.app.screen;
            this.lightFilter.resolution = Application_1.Application.One.resolution;
            this.ambient.parentLayer = this.lightingLayer;
            this.layer.addChild(this.ambient);
            this.updateLights();
            this.redraw();
            this.process();
        };
        Lighting.prototype.updateLights = function () {
            this.lights = Application_1.Application.One.sm.findByType(Light_1.Light);
            for (var _i = 0, _a = this.lights; _i < _a.length; _i++) {
                var x = _a[_i];
                this.addLight(x);
            }
        };
        Lighting.prototype.tweenColorTo = function (col, illum, deltaTimeSec) {
            if (illum === void 0) { illum = null; }
            if (deltaTimeSec === void 0) { deltaTimeSec = 1.9; }
            Application_1.TweenMax.to(this.lightFilter.uniforms, deltaTimeSec, { red: col[0],
                green: col[1],
                blue: col[2],
            });
            if (illum)
                Application_1.TweenMax.to(this.ambient.color, deltaTimeSec, { lightR: illum[0], lightG: illum[1], lightB: illum[2] });
        };
        Lighting.prototype.redraw = function () {
        };
        Lighting.prototype.addLight = function (l) {
            O_1.O.rp(l.gfx);
            this.layer.addChild(l.gfx);
            l.gfx.blendMode = PIXI.BLEND_MODES.ADD;
            l.gfx.parentLayer = this.lightingLayer;
        };
        Lighting.prototype.process = function () {
            this.ambient.x = -Application_1.Application.One.SCR_WIDTH * (-0.5);
            this.ambient.y = -Application_1.Application.One.SCR_HEIGHT * (-0.5);
            this.ambient.scale.x = (this.baseScaleX / Application_1.Application.One.sm.camera.zoom); // -_.sm.camera.x - _.SCR_WIDTH_HALF;
            this.ambient.scale.y = (this.baseScaleY / Application_1.Application.One.sm.camera.zoom); // -_.sm.camera.y - _.SCR_HEIGHT_HALF;
            this.redraw();
        };
        Lighting.prototype.set = function (col, illum) {
            if (illum === void 0) { illum = null; }
            this.lightFilter.uniforms.red = col[0];
            this.lightFilter.uniforms.green = col[1];
            this.lightFilter.uniforms.blue = col[2];
            if (illum)
                this.ambient.color.setLight(illum[0], illum[1], illum[2]);
        };
        return Lighting;
    }(BaseLighting_1.BaseLighting));
    exports.Lighting = Lighting;
});
