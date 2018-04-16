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
define(["require", "exports", "./O", "../Application"], function (require, exports, O_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BaseParticleSystem = /** @class */ (function (_super) {
        __extends(BaseParticleSystem, _super);
        function BaseParticleSystem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.particles = [];
            _this.doOProcess = true;
            return _this;
        }
        BaseParticleSystem.prototype.add = function (p, gfx) {
            this.particles.push(p);
            this.gfx.addChild(gfx);
            this.processParticle(this.particles.length - 1, Application_1.Application.One.delta);
            return p;
        };
        BaseParticleSystem.prototype.init = function (props) {
            _super.prototype.init.call(this, props);
            this.width = Application_1.Application.One.SCR_WIDTH;
            this.height = Application_1.Application.One.SCR_HEIGHT;
            this.gfx = new PIXI.particles.ParticleContainer(300, {
                scale: true,
                position: true,
                rotation: true,
                uvs: true,
                tint: true,
                alpha: true,
            });
            if (this.layer)
                this.layer.addChild(this.gfx);
        };
        BaseParticleSystem.prototype.onDestroy = function () {
            _super.prototype.onDestroy.call(this);
        };
        BaseParticleSystem.prototype.processParticle = function (i, delta) {
        };
        BaseParticleSystem.prototype.processParticles = function (timeDelta) {
            var len = this.particles.length;
            for (var i = 0; i < len; ++i) {
                var part = this.particles[i];
                part.lifeTime -= timeDelta;
                this.processParticle(i, timeDelta);
                if (part.lifeTime < 0) {
                    this.particles.splice(i, 1);
                    this.gfx.removeChildAt(i);
                    i--;
                    len--;
                }
            }
        };
        BaseParticleSystem.prototype.process = function () {
            if (this.doOProcess)
                _super.prototype.process.call(this);
            this.processParticles(Application_1.Application.One.deltaSec * Application_1.Application.One.timeScale);
            //TODO: WEIRD OVERRIDE VISIBLE
            this.gfx.visible = (this.parent != null) || this.alwaysVisible || ((Math.abs(this.gfx.x - Application_1.Application.One.SCR_WIDTH_HALF + this.width / 2) <= this.width / 2 + Application_1.Application.One.SCR_WIDTH_HALF) &&
                (Math.abs(this.gfx.y - Application_1.Application.One.SCR_HEIGHT_HALF) <= this.height / 2 + Application_1.Application.One.SCR_HEIGHT_HALF));
        };
        return BaseParticleSystem;
    }(O_1.O));
    exports.BaseParticleSystem = BaseParticleSystem;
});
