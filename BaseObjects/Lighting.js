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
define(["require", "exports", "./BaseLighting", "../Application", "./Light", "../shaders/LightFilter", "./O", "../Math", "../../main", "../Loader"], function (require, exports, BaseLighting_1, Application_1, Light_1, LightFilter_1, O_1, Math_1, main_1, Loader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Lighting = /** @class */ (function (_super) {
        __extends(Lighting, _super);
        function Lighting() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.lights = [];
            _this.baseLight = [1, 1, 1];
            _this.baseIllum = [1, 1, 1];
            _this._darkness = 1;
            return _this;
        }
        Object.defineProperty(Lighting.prototype, "darkness", {
            get: function () {
                return this._darkness;
            },
            set: function (value) {
                this._darkness = value;
                if (this.lights)
                    for (var _i = 0, _a = this.lights; _i < _a.length; _i++) {
                        var l = _a[_i];
                        l.gfx.alpha = l.baseAlpha * this._darkness;
                    }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Lighting.prototype, "brightness", {
            get: function () {
                return this._brightness;
            },
            set: function (value) {
                this._brightness = value;
                this.lightFilter.uniforms.brightness = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Lighting.prototype, "gamma", {
            get: function () {
                return this._gamma;
            },
            set: function (value) {
                this._gamma = value;
                this.lightFilter.uniforms.gamma = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Lighting.prototype, "contrast", {
            get: function () {
                return this._contrast;
            },
            set: function (value) {
                this._contrast = value;
                this.lightFilter.uniforms.contrast = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Lighting.prototype, "saturation", {
            get: function () {
                return this._saturation;
            },
            set: function (value) {
                this._saturation = value;
                this.lightFilter.uniforms.saturation = value;
            },
            enumerable: true,
            configurable: true
        });
        Lighting.prototype.onDestroy = function () {
            if (this.gfx) {
                this.gfx.filters[0].blendMode = PIXI.BLEND_MODES.NORMAL;
                this.gfx.filters = null;
                this.gfx.filterArea = null;
                Application_1.TweenMax.killTweensOf(this);
            }
            O_1.O.rp(this.ambientContainer);
            O_1.O.rp(this.ambient);
            this.ambientContainer = null;
            this.ambient = null;
            this.lights = [];
            _super.prototype.onDestroy.call(this);
        };
        Lighting.prototype.init = function (props) {
            this.alwaysVisible = true;
            this.ambient = Application_1.Application.One.cs(BaseLighting_1.BaseLighting.DEFAULT_GFX);
            this.ambient.width = Application_1.Application.One.SCR_WIDTH;
            this.ambient.height = Application_1.Application.One.SCR_HEIGHT;
            this.baseScaleX = this.ambient.scale.x;
            this.baseScaleY = this.ambient.scale.y;
            this.lightingLayer = new PIXI.display.Layer();
            this.lightingLayer.useRenderTexture = true;
            this.layer.addChild(this.lightingLayer);
            this.lightFilter = new LightFilter_1.LightFilter({ saturation: 0, brightness: 0., contrast: 0., gamma: 1, lightSampler: this.lightingLayer.getRenderTexture() });
            this.saturation = -3;
            if (props["saturation"]) {
                this.saturation = parseFloat(props["saturation"]);
            }
            this.contrast = 0.5;
            if (props["contrast"]) {
                this.contrast = parseFloat(props["contrast"]);
            }
            this.gamma = 1;
            if (props["gamma"]) {
                this.gamma = parseFloat(props["gamma"]);
            }
            this.brightness = 1;
            if (props["brightness"]) {
                this.brightness = parseFloat(props["brightness"]);
            }
            this.lightFilter.resolution = main_1._.app.renderer.resolution; // 1 / window.devicePixelRatio;//Application.One.resolution;
            Application_1.Application.One.sm.main.filterArea = Application_1.Application.One.app.screen;
            Application_1.Application.One.sm.main.filters = [this.lightFilter];
            console.log("LIGHTING FILTER RESOLUTION: ", this.lightFilter.resolution);
            this.ambient.parentLayer = this.lightingLayer;
            this.layer.addChild(this.ambient);
            this.blendMode = PIXI.BLEND_MODES.ADD;
            if (props && !props["blendmode"])
                this.blendMode = PIXI.BLEND_MODES.ADD;
            else
                this.blendMode = Loader_1.extractBlendMode(props["blendmode"]);
            if (props['_darkness']) {
                this._darkness = parseFloat(props['_darkness']);
            }
            if (props['color']) {
                this.color = Math_1.m.ARGBtoRGB(Math_1.m.hexToRgb(props['color']));
            }
            if (props['illum']) {
                this.illum = Math_1.m.ARGBtoRGB(Math_1.m.hexToRgb(props['illum']));
            }
            this.wait(0).call(this.updateLights.bind(this)).apply();
            this.redraw();
            this.set(this.color, this.illum);
            this.process();
        };
        Lighting.prototype.updateLights = function () {
            if (this.lights) {
                for (var _i = 0, _a = this.lights; _i < _a.length; _i++) { //SKIP AMBIENT + LAYER CONTAINER
                    var x = _a[_i];
                    if (x.gfx) {
                        x.gfx.parentLayer = null;
                        O_1.O.rp(x.gfx);
                    }
                }
            }
            this.lights = Application_1.Application.One.sm.findByType(Light_1.Light);
            for (var _b = 0, _c = this.lights; _b < _c.length; _b++) {
                var x = _c[_b];
                this.addLight(x);
            }
            console.log(main_1._.sm.findByType(Lighting));
        };
        Lighting.prototype.tweenColorTo = function (col, illum, deltaTimeSec) {
            if (illum === void 0) { illum = null; }
            if (deltaTimeSec === void 0) { deltaTimeSec = 1.9; }
            var tweens = [
                Application_1.TweenMax.to(this.lightFilter.uniforms, deltaTimeSec, { red: col[0],
                    green: col[1],
                    blue: col[2],
                    ease: Application_1.Sine.easeIn,
                })
            ];
            if (illum)
                tweens.push(Application_1.TweenMax.to(this.ambient.color, deltaTimeSec, {
                    lightR: illum[0] * this.baseIllum[0],
                    lightG: illum[1] * this.baseIllum[1],
                    lightB: illum[2] * this.baseIllum[2],
                    ease: Application_1.Sine.easeIn,
                }));
            return tweens;
        };
        Lighting.prototype.redraw = function () {
        };
        Lighting.prototype.addLight = function (l) {
            if (l.stringID)
                console.log("Added light [", l.stringID, "]");
            l.gfx.parentLayer = null;
            O_1.O.rp(l.gfx);
            l.gfx.stringID = l.stringID;
            l.gfx.blendMode = this.blendMode;
            l.gfx.alpha = l.baseAlpha * this._darkness;
            l.gfx.parentLayer = this.lightingLayer;
            this.layer.addChild(l.gfx);
        };
        Lighting.prototype.process = function () {
            this.ambient.x = -Application_1.Application.One.SCR_WIDTH * (-0.5);
            this.ambient.y = -Application_1.Application.One.SCR_HEIGHT * (-0.5);
            this.ambient.scale.x = (this.baseScaleX / Application_1.Application.One.sm.camera.zoom); // -_.sm.camera.x - _.SCR_WIDTH_HALF;
            this.ambient.scale.y = (this.baseScaleY / Application_1.Application.One.sm.camera.zoom); // -_.sm.camera.y - _.SCR_HEIGHT_HALF;
            /*let arr  = [Math.round(this.lightFilter.uniforms.red*255), Math.round(this.lightFilter.uniforms.green*255), Math.round(this.lightFilter.uniforms.blue*255),
                Math.round(this.ambient.color.lightR*255), Math.round(this.ambient.color.lightG*255), Math.round(this.ambient.color.lightB*255),
    
                Math.round(100*this.lightFilter.uniforms.saturation)/ 100,
                Math.round(100*this.lightFilter.uniforms.contrast)/ 100,
                Math.round(100*this.lightFilter.uniforms.brightness)/ 100];
            console.log(arr);*/
            this.redraw();
        };
        Lighting.prototype.set = function (col, illum) {
            if (illum === void 0) { illum = null; }
            this.illum = illum;
            this.color = col;
            this.lightFilter.uniforms.red = col[0];
            this.lightFilter.uniforms.green = col[1];
            this.lightFilter.uniforms.blue = col[2];
            if (illum)
                this.ambient.color.setLight(illum[0], illum[1], illum[2]);
        };
        return Lighting;
    }(O_1.O));
    exports.Lighting = Lighting;
});
