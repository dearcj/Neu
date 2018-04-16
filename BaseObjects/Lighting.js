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
define(["require", "exports", "./O", "./Light", "../Application"], function (require, exports, O_1, Light_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Lighting = /** @class */ (function (_super) {
        __extends(Lighting, _super);
        function Lighting() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.defaultColor = [255, 150, 150, 150];
            _this.lights = [];
            return _this;
        }
        Object.defineProperty(Lighting.prototype, "envColor", {
            get: function () {
                return this._envColor;
            },
            set: function (col) {
                this._envColor = col;
            },
            enumerable: true,
            configurable: true
        });
        Lighting.prototype.onDestroy = function () {
            this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.NORMAL;
            this.gfx.filters = null;
            this.gfx.filterArea = null;
            Application_1.TweenMax.killTweensOf(this);
            O_1.O.rp(this.ambientContainer);
            this.ambientContainer = null;
            this.ambient = null;
            this.lights = [];
            console.log("LIGHT DESTROYED");
            _super.prototype.onDestroy.call(this);
        };
        Lighting.prototype.addLight = function (l) {
            l.gfx.blendMode = PIXI.BLEND_MODES.ADD;
            O_1.O.rp(l.gfx);
            this.gfx.addChild(l.gfx);
        };
        Lighting.prototype.tweenColorTo = function (col, repeat, deltaTimeSec) {
            var _this = this;
            if (repeat === void 0) { repeat = false; }
            if (deltaTimeSec === void 0) { deltaTimeSec = 0.9; }
            this.tweenStart = [this.envColor[0], this.envColor[1], this.envColor[2], this.envColor[3]];
            this.tweenDest = col;
            this.lerp = 0;
            var obj = {
                ease: Application_1.Sine.easeOut, lerp: 1, onComplete: function () {
                    _this.tweenDest = null;
                }
            };
            if (repeat) {
                obj.yoyo = true;
                obj.repeat = -1;
            }
            new Application_1.TweenMax(this, deltaTimeSec, obj);
        };
        Lighting.prototype.makeLightsDown = function () {
            this.tweenColorTo([0, 170, 170, 150]);
        };
        Lighting.prototype.makeSocialLight = function () {
            this.tweenColorTo([0, 180, 130, 180]);
        };
        Lighting.prototype.makeBattleMode = function () {
            this.tweenColorTo(Lighting.colBattle);
        };
        Lighting.prototype.makeRegularMode = function () {
            this.tweenColorTo(Lighting.colRegular);
        };
        Lighting.prototype.updateEnvironmentColor = function (col) {
        };
        Lighting.prototype.updateLight = function () {
            for (var _i = 0, _a = this.lights; _i < _a.length; _i++) {
                var x = _a[_i];
                //WE CAN REMOVE PREV SCENE WITH LIGHTS...
                if (!x.doRemove && x.gfx.visible) {
                    x.gfx.x = x.pos[0] - Application_1.Application.One.sm.camera.offset[0];
                    x.gfx.y = x.pos[1] - Application_1.Application.One.sm.camera.offset[1];
                }
            }
        };
        Lighting.prototype.init = function (props) {
            _super.prototype.init.call(this, props);
            this.alwaysVisible = true;
            var delta = 0;
            this.y = 1200;
            this.filterArea = new PIXI.Rectangle(-delta, -delta, Application_1.Application.One.SCR_WIDTH + 2 * delta, Application_1.Application.One.SCR_HEIGHT + 2 * delta);
            this.gfx = new PIXI.Sprite();
            this.ambient = Application_1.Application.One.cs('Camera-Shadow.png');
            this.ambient.anchor.x = 0;
            this.ambient.anchor.y = 0;
            this.ambient.width = Application_1.Application.One.SCR_WIDTH;
            this.ambient.height = Application_1.Application.One.SCR_HEIGHT;
            this.ambientContainer = new PIXI.Container();
            this.ambientContainer.addChild(this.ambient);
            console.log("ADDED LIGHT");
            this.envColor = this.defaultColor;
            this.gfx.addChild(this.ambientContainer);
            this.layer.addChild(this.gfx);
            this.gfx.filters = [new PIXI.filters.AlphaFilter()];
            this.gfx.filterArea = this.filterArea;
            this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.MULTIPLY;
            this.redraw();
            this.updateLights();
        };
        Lighting.prototype.process = function () {
            this.gfx.x = 0; //c.offset[0];
            this.gfx.y = 0; //c.offset[1];
            if (this.tweenDest) {
                var l = this.lerp;
                var il = 1 - this.lerp;
                this.envColor = [this.tweenStart[0] * il + l * this.tweenDest[0],
                    this.tweenStart[1] * il + l * this.tweenDest[1],
                    this.tweenStart[2] * il + l * this.tweenDest[2],
                    this.tweenStart[3] * il + l * this.tweenDest[3]];
                //console.log(this.envColor);
                this.redraw();
            }
        };
        Lighting.prototype.updateLights = function () {
            for (var x = 1; x < this.gfx.children.length; ++x) {
                O_1.O.rp(x);
            }
            this.lights = Application_1.Application.One.sm.findByType(Light_1.Light);
            for (var _i = 0, _a = this.lights; _i < _a.length; _i++) {
                var x = _a[_i];
                this.addLight(x);
            }
        };
        Lighting.prototype.redraw = function () {
            this.ambient.color.setLight(this.envColor[1] / 255, this.envColor[2] / 255, this.envColor[3] / 255);
        };
        return Lighting;
    }(O_1.O));
    exports.Lighting = Lighting;
});
