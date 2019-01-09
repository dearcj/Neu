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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Created by MSI on 18.10.2017.
     */
    var AnimClip = /** @class */ (function (_super) {
        __extends(AnimClip, _super);
        function AnimClip(textures, autoUpdate) {
            var _this = _super.call(this, textures) || this;
            _this.endFrame = 0;
            _this.startFrame = 0;
            _this.convertToHeaven();
            _this.endFrame = textures.length - 1;
            _this.startFrame = 0;
            return _this;
        }
        Object.defineProperty(AnimClip.prototype, "currentFrame", {
            get: function () {
                if (isNaN(this._currentTime))
                    return this.startFrame;
                var currentFrame = this.startFrame + Math.floor(this._currentTime) % (this.endFrame - this.startFrame + 1);
                if (currentFrame < 0) {
                    currentFrame += this._textures.length;
                }
                return isNaN(currentFrame) ? 1 : currentFrame;
            },
            enumerable: true,
            configurable: true
        });
        AnimClip.prototype.loopFromTo = function (startFrame, endFrame) {
            this.endFrame = endFrame;
            this.startFrame = startFrame;
            if (startFrame == endFrame) {
                this.loop = false;
                this.gotoAndStop(startFrame);
            }
            else {
                this.loop = true;
                this.gotoAndPlay(this.startFrame);
            }
        };
        return AnimClip;
    }(PIXI.extras.AnimatedSprite));
    exports.AnimClip = AnimClip;
});
