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
define(["require", "exports", "./O", "../Application"], function (require, exports, O_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RopePoint = PIXI.heaven.mesh.RopePoint;
    var NeuRope = /** @class */ (function (_super) {
        __extends(NeuRope, _super);
        function NeuRope() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NeuRope.prototype.addPoint = function (x, y) {
            this.verticesX++;
            this.updatePoints();
            var p = this.points[this.verticesX - 1];
            p.x = x;
            p.y = y;
            this.calculatedPoints[this.verticesX - 1].x = x;
            this.calculatedPoints[this.verticesX - 1].y = y;
        };
        NeuRope.prototype.updatePoints = function () {
            this._checkPointsLen();
        };
        return NeuRope;
    }(PIXI.heaven.mesh.Rope));
    exports.NeuRope = NeuRope;
    var TrainEffect = /** @class */ (function (_super) {
        __extends(TrainEffect, _super);
        function TrainEffect() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.pos2 = [0, 0];
            _this.pointsEnabled = 0;
            _this.pointFunc = function (c, prop) {
            };
            _this.lastHistoryX = Infinity;
            _this.lastHistoryY = Infinity;
            _this.delta = 4;
            return _this;
        }
        TrainEffect.prototype.init = function (props) {
            if (props === void 0) { props = null; }
            this.points = [];
            this.totalPoints = props.totalPoints ? props.totalPoints : 40;
            this.historyX = [];
            this.historyY = [];
            if (!props.scaleX)
                props.scaleX = 1;
            if (!props.scaleY)
                props.scaleY = 1;
            this.points.push(new RopePoint(this.pos[0] / props.scaleX, this.pos[1] / props.scaleY));
            this.historyPoints = props.historyPoints ? props.historyPoints : 40;
            this.historyX.push((this.pos[0]) / props.scaleX);
            this.historyY.push((this.pos[1]) / props.scaleY);
            var trailTexture = PIXI.Texture.fromImage(props.gfx);
            this.gfx = new NeuRope(trailTexture, this.points);
            this.gfx.enableColors();
            this.gfx.drawMode = PIXI.heaven.mesh.Mesh.DRAW_MODES.TRIANGLES;
            this.gfx.scale.x = props.scaleX;
            this.gfx.scale.y = props.scaleY;
            this.gfx.blendMode = props.blendmode;
            props.layer.addChild(this.gfx);
            Application_1.Application.One.sm.camera.transformPoint([0, 0], 1, this.pos2);
        };
        TrainEffect.prototype.process = function () {
            var curHistoryX = this.pos[0] / this.gfx.scale.x;
            var curHistoryY = this.pos[1] / this.gfx.scale.y;
            if (Math.abs(this.lastHistoryX - curHistoryX) > this.delta &&
                Math.abs(this.lastHistoryY - curHistoryY) > this.delta) {
                this.lastHistoryY = curHistoryY;
                this.lastHistoryX = curHistoryX;
                if (this.historyX.length >= this.historyPoints) {
                    this.historyX.pop();
                }
                this.historyX.unshift(curHistoryX);
                if (this.historyY.length >= this.historyPoints) {
                    this.historyY.pop();
                }
                this.historyY.unshift(curHistoryY);
                this.pointsEnabled++;
            }
            else {
                this.historyX[0] = curHistoryX;
                this.historyY[0] = curHistoryY;
            }
            if (this.gfx.verticesX < this.totalPoints) {
                this.gfx.addPoint(this.pos[0] / this.gfx.scale.x + Math.random() * 300, this.pos[1] / this.gfx.scale.y + Math.random() * 300);
            }
            var points = this.gfx.points;
            var delta = [0, 0];
            for (var i = 0; i < points.length; i++) {
                var p = points[i];
                var prop = i / (points.length - 1);
                this.pointFunc(p, prop);
                var ix = cubicInterpolation(this.historyX, (i + 1) / points.length * this.historyPoints);
                var iy = cubicInterpolation(this.historyY, (i + 1) / points.length * this.historyPoints);
                p.x = ix;
                p.y = iy;
                if (i > 0) {
                    delta[0] = .5 * delta[0] + .5 * (points[i - 1].x - points[i].x) / 1000;
                    delta[1] = .5 * delta[1] + .5 * (points[i - 1].y - points[i].y) / 1000;
                    p.x += delta[0];
                    p.y += delta[0];
                }
            }
            this.x += this.v[0]; // * Application.One.worldSpeed * Application.One.delta2;
            this.y += this.v[1]; // * Application.One.worldSpeed * Application.One.delta2;
            if (!this.noCameraOffset) {
                Application_1.Application.One.sm.camera.transformPoint([0, 0], 1, this.pos2);
                this.gfx.x = this.pos2[0];
                this.gfx.y = this.pos2[1];
            }
        };
        TrainEffect.prototype.onDestroy = function () {
            this.pointFunc = null;
            this.historyX = null;
            this.historyY = null;
            this.points = null;
            _super.prototype.onDestroy.call(this);
        };
        return TrainEffect;
    }(O_1.O));
    exports.TrainEffect = TrainEffect;
    function clipInput(k, arr, maxL) {
        if (k < 0)
            k = 0;
        if (k > maxL - 1)
            k = maxL - 1;
        return arr[k];
    }
    function getTangent(k, array, maxL) {
        return (clipInput(k + 1, array, maxL) - clipInput(k - 1, array, maxL)) / 2;
    }
    function cubicInterpolation(array, t) {
        var maxL = array.length;
        var k = Math.floor(t);
        var m = [getTangent(k, array, maxL), getTangent(k + 1, array, maxL)];
        var p = [clipInput(k, array, maxL), clipInput(k + 1, array, maxL)];
        t -= k;
        var t2 = t * t;
        var t3 = t * t2;
        return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
    }
});
