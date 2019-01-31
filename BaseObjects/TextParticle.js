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
define(["require", "exports", "./TextBox"], function (require, exports, TextBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextParticle = /** @class */ (function (_super) {
        __extends(TextParticle, _super);
        function TextParticle() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TextParticle.prototype.process = function () {
            _super.prototype.process.call(this);
            this.v[1] *= 0.97;
        };
        return TextParticle;
    }(TextBox_1.TextBox));
    exports.TextParticle = TextParticle;
});
