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
define(["require", "exports", "./O", "../Math", "../Application"], function (require, exports, O_1, Math_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Camera = /** @class */ (function (_super) {
        __extends(Camera, _super);
        function Camera(pos) {
            var _this = _super.call(this, pos) || this;
            _this.anchorDelta = [0, 0];
            _this.operator = false;
            _this.voX = 0;
            _this.voY = 0;
            _this.boardLU = [0, 0];
            _this.boardRD = [0, 0];
            _this._zoom = 1;
            _this.zoom = 1;
            _this.removeable = false;
            _this.rect = new PIXI.Rectangle(0, 0, Application_1.Application.One.SCR_WIDTH, Application_1.Application.One.SCR_HEIGHT);
            return _this;
        }
        Camera.prototype.setTo = function (z, dur, ease) {
            if (dur === void 0) { dur = .8; }
            if (ease === void 0) { ease = Application_1.Power2.easeOut; }
            console.log("zooming camera to", z.zoom);
            Application_1.TweenMax.killTweensOf(this);
            var tween = {
                zoom: z.zoom,
                ease: ease,
            };
            var tween2 = {
                y: z.posY,
                ease: Application_1.Power3.easeOut,
            };
            if (z.posX)
                tween2.x = z.posX;
            Application_1.TweenMax.to(this, dur, tween);
            Application_1.TweenMax.to(this, dur * 2, tween2);
        };
        Object.defineProperty(Camera.prototype, "zoom", {
            get: function () {
                return this._zoom;
            },
            set: function (value) {
                this._zoom = value;
                this.layerOfsX = Application_1.Application.One.SCR_WIDTH * (1 - this._zoom) / 2;
                this.layerOfsY = Application_1.Application.One.SCR_HEIGHT * (1 - this._zoom) / 2;
                var app = Application_1.Application.One;
                app.sm.main.x = this.layerOfsX;
                app.sm.main.y = this.layerOfsY;
                app.sm.main.scale.x = value;
                app.sm.main.scale.y = value;
                app.sm.uppermain.x = this.layerOfsX;
                app.sm.uppermain.y = this.layerOfsY;
                app.sm.uppermain.scale.x = value;
                app.sm.uppermain.scale.y = value;
                app.sm.olgui.scale.x = value;
                app.sm.olgui.scale.y = value;
                app.sm.olgui.x = this.layerOfsX;
                app.sm.olgui.y = this.layerOfsY;
                app.sm.effects.scale.x = value;
                app.sm.effects.scale.y = value;
                app.sm.effects.x = this.layerOfsX;
                app.sm.effects.y = this.layerOfsY;
            },
            enumerable: true,
            configurable: true
        });
        Camera.prototype.follow = function (o) {
            this.followObj = o;
        };
        Camera.prototype.makeShake = function (powerPercentage, duration) {
            Application_1.TweenMax.to(this, duration, { zoom: this.zoom * (1 + powerPercentage), yoyo: true, repeat: 1, ease: Application_1.Power2.easeOut });
        };
        Camera.prototype.stop = function () {
            this.v[0] = 0;
            this.v[1] = 0;
        };
        Camera.prototype.t = function (oldP) {
            return [oldP[0] - this.pos[0], oldP[1] - this.pos[1]];
        };
        Camera.prototype.onDestroy = function () {
            _super.prototype.onDestroy.call(this);
            this.followObj = null;
        };
        Camera.prototype.boundaryCheck = function (p) {
            if (p[0] < this.boardLU[0]) {
                p[0] = this.boardLU[0];
            }
            if (p[1] < this.boardLU[1]) {
                p[1] = this.boardLU[1];
            }
            if (p[0] > this.boardRD[0]) {
                p[0] = this.boardRD[0];
            }
            if (p[1] > this.boardRD[1]) {
                p[1] = this.boardRD[1];
            }
        };
        Camera.prototype.reset = function (x, y, doBoundaryCheck) {
            this.v[0] = 0;
            this.v[1] = 0;
            this.followObj = null;
            this.pos[0] = x;
            this.pos[1] = y;
            /*if (doBoundaryCheck) {
                this.boundaryCheck(this.pos)
            }*/
            this.voX = 0;
            this.voY = 0;
        };
        Camera.prototype.worldToScreen = function (s) {
            var centrObjCoordX = this.pos[0] - Application_1.Application.One.SCR_WIDTH * 0.5;
            var centrObjCoordY = this.pos[1] - Application_1.Application.One.SCR_HEIGHT * 0.5;
            return [s[0] - centrObjCoordX, s[1] - centrObjCoordY];
        };
        Camera.prototype.screenToWorld = function (s) {
            var centrObjCoordX = this.pos[0] - Application_1.Application.One.SCR_WIDTH * 0.5;
            var centrObjCoordY = this.pos[1] - Application_1.Application.One.SCR_HEIGHT * 0.5;
            return [s[0] + centrObjCoordX, s[1] + centrObjCoordY];
        };
        Camera.prototype.focusPlace = function (worldPos) {
            var app = Application_1.Application.One;
            var prevPos = [this.pos[0], this.pos[1]];
            Application_1.TweenMax.killChildTweensOf(app.sm.camera, true);
            Application_1.TweenMax.killChildTweensOf(this, true);
            console.log("FOCUS PLACE");
            new Application_1.TweenMax(this, .6, { x: worldPos[0], y: worldPos[1] });
            new Application_1.TweenMax(app.sm.camera, .6, { z: 20 });
            new Application_1.TweenMax(this, 0.5, { delay: 0.6, x: prevPos[0], y: prevPos[1] });
            new Application_1.TweenMax(app.sm.camera, 0.5, { delay: 0.6, z: 0 });
        };
        Camera.prototype.updateTransform = function (obj, clip, offsX, offsY) {
            if (offsX === void 0) { offsX = 0; }
            if (offsY === void 0) { offsY = 0; }
            switch (obj.CameraMode) {
                case O_1.CAMERA_MODE.CM_UPDATE_NO_OFFSET:
                    clip.x = obj.pos[0] + offsX;
                    clip.y = obj.pos[1] + offsY;
                    break;
                case O_1.CAMERA_MODE.CM_UPDATE:
                    clip.x = obj.pos[0] - this.pos[0] + Application_1.Application.One.SCR_WIDTH_HALF;
                    clip.y = obj.pos[1] - this.pos[1] + Application_1.Application.One.SCR_HEIGHT_HALF;
                    break;
            }
            //if (clip.visible) {
            //    clip.rotation = obj.a  + this.a;
            //}
        };
        Camera.prototype.offsetX = function () {
            return this.pos[0] - Application_1.Application.One.SCR_WIDTH_HALF;
        };
        Camera.prototype.offsetY = function () {
            return this.pos[1] - Application_1.Application.One.SCR_HEIGHT_HALF;
        };
        Camera.prototype.process = function () {
            if (this.boundaries) {
                this.x = this.checkXBoundary(this.boundaries);
                this.y = this.checkYBoundary(this.boundaries);
            }
        };
        Camera.prototype.isVisible = function (g) {
            g.getBounds(false, this.rect);
            var gg = g;
            if (gg.anchor && gg.anchor.x != 0.5 && gg.anchor.y != 0.5) {
                this.anchorDelta[0] = (gg.anchor.x - 0.5) * gg.width;
                this.anchorDelta[1] = (gg.anchor.y - 0.5) * gg.height;
                Math_1.m.rv2fast(this.anchorDelta, g.rotation);
            }
            else {
                this.anchorDelta[0] = 0;
                this.anchorDelta[1] = 0;
            }
            return ((Math.abs(g.position.x - Application_1.Application.One.SCR_WIDTH_HALF - this.anchorDelta[0]) <= this.rect.width + Application_1.Application.One.SCR_WIDTH_HALF / this._zoom) && (Math.abs(g.position.y - Application_1.Application.One.SCR_HEIGHT_HALF - this.anchorDelta[1]) <= this.rect.height + Application_1.Application.One.SCR_HEIGHT_HALF / this._zoom));
        };
        Camera.prototype.hitAnimation = function (charPos) {
            //let pos = [(charPos[0] - this.pos[0]) / 15, (charPos[1] - this.pos[1]) / 15];
            //new TweenMax(this, 0.25, {x: this.pos[0] + pos[0], zoom: DEFAULT_ZOOM + .05, yoyo: true, repeat: 1});
        };
        Camera.prototype.worldScreenToUI = function (p) {
            p[0] -= Application_1.Application.One.SCR_WIDTH_HALF * (1 - this.zoom);
            p[1] -= Application_1.Application.One.SCR_HEIGHT_HALF * (1 - this.zoom);
            return p;
        };
        Camera.prototype.transformPoint = function (point, dir, pos2) {
            pos2[0] = point[0] + (-this.pos[0] + Application_1.Application.One.SCR_WIDTH_HALF) * dir;
            pos2[1] = point[1] + (-this.pos[1] + Application_1.Application.One.SCR_HEIGHT_HALF) * dir;
        };
        Camera.prototype.checkYBoundary = function (boundaries) {
            var h = Application_1.Application.One.SCR_HEIGHT / this.zoom;
            var t = this.y + h / 2;
            var b = this.y - h / 2;
            if (t > boundaries.maxY)
                return boundaries.maxY - h / 2;
            if (b < boundaries.minY)
                return boundaries.minY + h / 2;
            return this.y;
        };
        Camera.prototype.checkXBoundary = function (boundaries) {
            var w = Application_1.Application.One.SCR_WIDTH / this.zoom;
            var r = this.x + w / 2;
            var l = this.x - w / 2;
            if (r > boundaries.maxX)
                return boundaries.maxX - w / 2;
            if (l < boundaries.minX)
                return boundaries.minX + w / 2;
            return this.x;
        };
        return Camera;
    }(O_1.O));
    exports.Camera = Camera;
});
