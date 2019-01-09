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
    var BaseParticleSystem = /** @class */ (function (_super) {
        __extends(BaseParticleSystem, _super);
        function BaseParticleSystem(pos, gfx) {
            if (pos === void 0) { pos = null; }
            if (gfx === void 0) { gfx = null; }
            var _this = _super.call(this, pos, new PIXI.particles.ParticleContainer(300, {
                scale: true,
                position: true,
                rotation: true,
                uvs: true,
                tint: true,
                alpha: true,
            })) || this;
            _this.particles = [];
            _this.globalAlpha = 1;
            return _this;
        }
        BaseParticleSystem.prototype.add = function (p, gfx) {
            this.particles.push(p);
            this.gfx.addChild(gfx);
            this.processParticle(this.gfx.children.length - 1, Application_1.Application.One.delta);
            p.alpha = this.globalAlpha;
            return p;
        };
        BaseParticleSystem.prototype.init = function (props) {
            if (this.layer)
                this.layer.addChild(this.gfx);
            this.width = Application_1.Application.One.SCR_WIDTH;
            this.height = Application_1.Application.One.SCR_HEIGHT;
            _super.prototype.init.call(this, props);
        };
        BaseParticleSystem.prototype.onDestroy = function () {
            _super.prototype.onDestroy.call(this);
        };
        BaseParticleSystem.prototype.processParticle = function (i, delta) {
            var p = this.gfx.children[i];
            var pobj = this.particles[i];
            p.x = pobj.x;
            p.y = pobj.y;
            p.alpha = pobj.alpha;
        };
        BaseParticleSystem.prototype.processParticles = function (timeDelta) {
            var len = this.particles.length;
            if (len != this.gfx.children.length)
                console.log("!!!! ", len, " xx ", this.gfx.children.length);
            for (var i = 0; i < len; ++i) {
                var part = this.particles[i];
                part.lifeTime -= timeDelta;
                this.processParticle(i, timeDelta);
                if (part.lifeTime < 0) {
                    this.particles.splice(i, 1);
                    Application_1.Application.One.free(this.gfx.children[i]);
                    i--;
                    len--;
                }
            }
        };
        BaseParticleSystem.prototype.process = function () {
            _super.prototype.process.call(this);
            this.processParticles(Application_1.Application.One.deltaSec * Application_1.Application.One.timeScale);
            //TODO: WEIRD OVERRIDE VISIBLE
            this.gfx.visible = (this.parent != null) || this.alwaysVisible || ((Math.abs(this.gfx.x - Application_1.Application.One.SCR_WIDTH_HALF + this.width / 2) <= this.width / 2 + Application_1.Application.One.SCR_WIDTH_HALF) &&
                (Math.abs(this.gfx.y - Application_1.Application.One.SCR_HEIGHT_HALF) <= this.height / 2 + Application_1.Application.One.SCR_HEIGHT_HALF));
        };
        return BaseParticleSystem;
    }(O_1.O));
    exports.BaseParticleSystem = BaseParticleSystem;
    var CustomParticleSystem = /** @class */ (function (_super) {
        __extends(CustomParticleSystem, _super);
        function CustomParticleSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CustomParticleSystem.prototype.processParticle = function (i, delta) {
            var p = this.gfx.children[i];
            var pobj = this.particles[i];
            if (this.customProcess) {
                this.customProcess(pobj, p);
            }
        };
        return CustomParticleSystem;
    }(BaseParticleSystem));
    exports.CustomParticleSystem = CustomParticleSystem;
});
