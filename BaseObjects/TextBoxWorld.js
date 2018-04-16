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
define(["require", "exports", "./IO"], function (require, exports, IO_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Created by MSI on 10.11.2017.
     */
    var TextBoxWorld = /** @class */ (function (_super) {
        __extends(TextBoxWorld, _super);
        function TextBoxWorld() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TextBoxWorld;
    }(IO_1.IO));
    exports.TextBoxWorld = TextBoxWorld;
});
