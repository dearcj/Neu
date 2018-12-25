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
define(["require", "exports", "./O", "./Light", "../Application", "../../main", "../../ClientSettings", "../shaders/LightFilter"], function (require, exports, O_1, Light_1, Application_1, main_1, ClientSettings_1, LightFilter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BaseLighting = /** @class */ (function (_super) {
        __extends(BaseLighting, _super);
        function BaseLighting() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.envColor = [1, 1, 1, 1];
            _this.envColorDark = [1, 0, 0, 0];
            _this.defaultColor = [1, 1, 1, 1];
            _this.lights = [];
            _this.illum = [0.5, 0.5, 0.5];
            return _this;
        }
        BaseLighting.prototype.onDestroy = function () {
            if (this.gfx) {
                this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.NORMAL;
                this.gfx.filters = null;
                this.gfx.filterArea = null;
                Application_1.TweenMax.killTweensOf(this);
            }
            main_1._.rp(this.ambientContainer);
            this.ambientContainer = null;
            this.ambient = null;
            this.lights = [];
            console.log("LIGHT DESTROYED");
            _super.prototype.onDestroy.call(this);
        };
        BaseLighting.prototype.addLight = function (l) {
            l.gfx.blendMode = PIXI.BLEND_MODES.ADD;
            main_1._.rp(l.gfx);
            this.addChild(l);
        };
        BaseLighting.prototype.tweenColorTo = function (col, darkCol, deltaTimeSec) {
            if (darkCol === void 0) { darkCol = null; }
            if (deltaTimeSec === void 0) { deltaTimeSec = 0.9; }
            /*   this.lerp = 0;
               let obj: any = {
                   ease: Sine.easeOut, lerp: 1, onComplete: () => {
                       this.tweenDest = null;
                   }
               };
       
               if (repeat) {
                   obj.yoyo = true;
                   obj.repeat = -1;
               }
       
               TweenMax.to(this, deltaTimeSec, {envColor: col});
       
               if (darkCol)
               TweenMax.to(this, deltaTimeSec, {illum: darkCol});*/
        };
        BaseLighting.prototype.updateEnvironmentColor = function (col) {
        };
        BaseLighting.prototype.init = function (props) {
            _super.prototype.init.call(this, props);
            this.alwaysVisible = true;
            var delta = 0;
            this.filterArea = new PIXI.Rectangle(-delta, -delta, Application_1.Application.One.SCR_WIDTH + 2 * delta, Application_1.Application.One.SCR_HEIGHT + 2 * delta);
            this.gfx = Application_1.Application.One.cc();
            this.ambient = Application_1.Application.One.cs(BaseLighting.DEFAULT_GFX);
            this.ambient.anchor.x = 0.5;
            this.ambient.anchor.y = 0.5;
            this.ambient.x = Application_1.Application.One.SCR_WIDTH / 2;
            this.ambient.y = Application_1.Application.One.SCR_HEIGHT / 2;
            this.ambient.width = Application_1.Application.One.SCR_WIDTH;
            this.ambient.height = Application_1.Application.One.SCR_HEIGHT;
            this.ambientContainer = new PIXI.Container();
            this.ambientContainer.addChild(this.ambient);
            this.envColor = this.defaultColor;
            this.gfx.addChild(this.ambientContainer);
            this.layer.addChild(this.gfx);
            var lf = new LightFilter_1.LightFilter(null);
            this.layer.filters = [lf];
            this.gfx.filters = [new PIXI.filters.AlphaFilter()];
            this.gfx.filterArea = this.filterArea;
            this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.MULTIPLY;
            this.redraw();
            this.updateLights();
        };
        BaseLighting.prototype.process = function () {
            this.gfx.x = -main_1._.sm.camera.x + ClientSettings_1.MAX_SCR_WIDTH / 2; //c.offset[0];
            this.gfx.y = -main_1._.sm.camera.y + ClientSettings_1.MAX_SCR_HEIGHT / 2; //c.offset[1];
            if (this.tweenDest) {
                var l = this.lerp;
                var il = 1 - this.lerp;
                this.envColor[0] = this.tweenStart[0] * il + l * this.tweenDest[0];
                this.envColor[1] = this.tweenStart[1] * il + l * this.tweenDest[1];
                this.envColor[2] = this.tweenStart[2] * il + l * this.tweenDest[2];
                this.envColor[3] = this.tweenStart[3] * il + l * this.tweenDest[3];
                this.envColorDark[0] = this.tweenStartDark[0] * il + l * this.tweenDestDark[0];
                this.envColorDark[1] = this.tweenStartDark[1] * il + l * this.tweenDestDark[1];
                this.envColorDark[2] = this.tweenStartDark[2] * il + l * this.tweenDestDark[2];
                this.envColorDark[3] = this.tweenStartDark[3] * il + l * this.tweenDestDark[3];
                this.redraw();
            }
        };
        BaseLighting.prototype.updateLights = function () {
            for (var x = 1; x < this.gfx.children.length; ++x) { //SKIP AMBIENT CONTAINER
                main_1._.rp(x);
            }
            this.lights = Application_1.Application.One.sm.findByType(Light_1.Light);
            for (var _i = 0, _a = this.lights; _i < _a.length; _i++) {
                var x = _a[_i];
                this.addLight(x);
            }
        };
        BaseLighting.prototype.redraw = function () {
            this.gfx.color.setLight(this.envColor[1], this.envColor[2], this.envColor[3]);
            this.gfx.color.setDark(this.envColorDark[1], this.envColorDark[2], this.envColorDark[3]);
        };
        return BaseLighting;
    }(O_1.O));
    exports.BaseLighting = BaseLighting;
});
