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
    /**
     * Created by KURWINDALLAS on 17.11.2014.
     */
    var Aligner = /** @class */ (function (_super) {
        __extends(Aligner, _super);
        function Aligner() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.crossed = [0, 0];
            return _this;
        }
        Aligner.prototype.init = function (props) {
            _super.prototype.init.call(this, props);
            if (this.x - this.width / 2 < Application_1.Application.One.screenCenterOffset[0]) {
                this.crossed[0] = -1;
            }
            if (this.x + this.width / 2 > Application_1.Application.One.screenCenterOffset[0] + Application_1.Application.One.MIN_SCR_WIDTH) {
                this.crossed[0] = 1;
            }
            if (this.y - this.height / 2 < Application_1.Application.One.screenCenterOffset[1]) {
                this.crossed[1] = -1;
            }
            if (this.y + this.height / 2 > Application_1.Application.One.screenCenterOffset[1] + Application_1.Application.One.MIN_SCR_HEIGHT) {
                this.crossed[1] = 1;
            }
            var objectsUnderAligner = Aligner.collectObjectsUnder(this);
            var deltaX = Application_1.Application.One.screenCenterOffset[0] * this.crossed[0];
            var deltaY = Application_1.Application.One.screenCenterOffset[1] * this.crossed[1];
            for (var _i = 0, objectsUnderAligner_1 = objectsUnderAligner; _i < objectsUnderAligner_1.length; _i++) {
                var x = objectsUnderAligner_1[_i];
                x.x += deltaX;
                x.y += deltaY;
                x.process();
            }
            this.killNow();
        };
        Aligner.prototype.process = function () {
        };
        Aligner.collectObjectsUnder = function (o, fixlayers) {
            if (fixlayers === void 0) { fixlayers = [Application_1.Application.One.sm.gui, Application_1.Application.One.sm.gui2]; }
            var res = [];
            for (var _i = 0, _a = Application_1.Application.One.lm.objectsList; _i < _a.length; _i++) {
                var x = _a[_i];
                if (x != o && x.parent == null && (fixlayers.indexOf(x.layer) >= 0) && x.intersects(o)) {
                    res.push(x);
                }
            }
            return res;
        };
        return Aligner;
    }(O_1.O));
    exports.Aligner = Aligner;
});
