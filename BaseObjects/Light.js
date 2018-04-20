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
        Light.prototype.createPolygon = function (polygon, properties) {
            var g = new PIXI.Graphics();
            var points = polygon;
            var pointsArr = points.split(' ');
            g.clear();
            g.beginFill(properties.color ? parseInt(properties.color.replace('#', '0x')) : 0xffffff, properties.alpha ? properties.alpha : 1);
            var arr = [];
            var minx = Infinity;
            var miny = Infinity;
            for (var _i = 0, pointsArr_1 = pointsArr; _i < pointsArr_1.length; _i++) {
                var x = pointsArr_1[_i];
                var p = x.split(',');
                var xx = parseFloat(p[0]);
                var yy = parseFloat(p[1]);
                minx = minx > xx ? xx : minx;
                miny = miny > yy ? yy : miny;
                arr.push(xx, yy);
            }
            g.drawPolygon(arr);
            var b = g.getBounds();
            var dx = g.width * 0.4;
            var dy = g.height * 0.4;
            g.x = -minx + dx / 2;
            g.y = -miny + dy / 2;
            g.endFill();
            var bf = new PIXI.filters.BlurFilter(1, 3);
            bf.blurX = properties.blurx ? parseFloat(properties.blurx) : 1;
            bf.blurY = properties.blury ? parseFloat(properties.blury) : 1;
            g.filters = [bf];
            var renderTexture = PIXI.RenderTexture.create(b.width + dx, b.height + dy);
            Application_1.Application.One.app.renderer.render(g, renderTexture);
            var container = new PIXI.Container();
            var spr = new PIXI.heaven.Sprite(renderTexture);
            // spr.anchor.x = 0.5;
            // spr.anchor.y = 0.5;
            spr.x = minx - dx / 2;
            spr.y = miny - dy / 2;
            container.addChild(spr);
            return container;
        };
        Light.prototype.init = function (props) {
            if (props.polygon) {
                this.gfx = this.createPolygon(props.polygon, props);
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
