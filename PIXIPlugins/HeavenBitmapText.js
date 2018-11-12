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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HeavenBitmapText = /** @class */ (function (_super) {
        __extends(HeavenBitmapText, _super);
        function HeavenBitmapText() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.color = new PIXI.heaven.ColorTransform();
            return _this;
        }
        HeavenBitmapText.prototype.updateText = function () {
            for (var _i = 0, _a = this._glyphs; _i < _a.length; _i++) {
                var x = _a[_i];
                var anyx = x;
                if (!anyx.color) {
                    anyx.convertToHeaven();
                    anyx.color = this.color;
                }
            }
            _super.prototype.updateText.call(this);
            for (var _b = 0, _c = this._glyphs; _b < _c.length; _b++) {
                var x = _c[_b];
                var anyx = x;
                if (!anyx.color) {
                    anyx.convertToHeaven();
                    anyx.color = this.color;
                }
            }
        };
        return HeavenBitmapText;
    }(PIXI.extras.BitmapText));
    exports.HeavenBitmapText = HeavenBitmapText;
});
