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
define(["require", "exports", "./O", "../Application", "../PIXIPlugins/PoolBitmapText"], function (require, exports, O_1, Application_1, PoolBitmapText_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TOOLTIP_WIDTH = 260, exports.TOOLTIP_HEIGHT = 260;
    var SPACE_SIZE = 8;
    var LINE_BREAK = 18;
    var Tooltip = /** @class */ (function (_super) {
        __extends(Tooltip, _super);
        function Tooltip() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Tooltip.prototype, "currentTip", {
            get: function () {
                return this._currentTip;
            },
            set: function (value) {
                if (this._currentTip)
                    Application_1.Application.One.free(this._currentTip);
                if (value) {
                    Application_1.Application.One.sm.fonts.addChild(value);
                }
                else {
                    this.currentObject = null;
                }
                this._currentTip = value;
            },
            enumerable: true,
            configurable: true
        });
        Tooltip.prototype.addSpaces = function (texts, y, boundWidth) {
            var line = [];
            var total = 0;
            var spaces = 0;
            for (var _i = 0, texts_1 = texts; _i < texts_1.length; _i++) {
                var x = texts_1[_i];
                if (x.y == y) {
                    var bounds = x.getLocalBounds(x.worldTransform);
                    total += bounds.width;
                    line.push(x);
                }
            }
            for (var x = 0; x < line.length - 1; ++x) {
                spaces += SPACE_SIZE;
            }
            var addSpaces = line.length - 1;
            var freeSpace = boundWidth - (total + spaces);
            var addSpace = freeSpace / addSpaces;
            if (addSpace < 0)
                return;
            var xx = 0;
            for (var x = 0; x < line.length; ++x) {
                var tf = line[x];
                var bounds = tf.getLocalBounds(tf.worldTransform);
                tf.x = xx;
                xx += bounds.width + SPACE_SIZE + addSpace;
            }
        };
        Tooltip.prototype.createTF = function (t, fontName) {
            return new PoolBitmapText_1.PoolHeavenBitmapText(t, PIXI.extras.BitmapText.fonts[fontName]);
        };
        //test tooltip
        // Adds r[25% damage ] with bla bla bla
        Tooltip.prototype.makeTooltip = function (text, boundWidth, boundHeight, obj, wordToColorFunc, fontName, fontScale, center) {
            if (fontName === void 0) { fontName = 'smallfontx1'; }
            if (fontScale === void 0) { fontScale = 1; }
            if (center === void 0) { center = false; }
            var desc = new PIXI.Container();
            var lines = text.split("\n");
            var leftBorder = 22;
            var x = 0;
            var y = -25;
            var lb;
            var tags = [];
            for (var l = 0; l < lines.length; ++l) {
                var words = lines[l].split(/[\s]+/);
                for (var i = 0; i < words.length; ++i) {
                    var w = words[i];
                    if (w.length > 0 && w[2] == '{') {
                        tags.push(w.slice(0, 2));
                        w = w.slice(3);
                    }
                    if (w[0] == '}') {
                        tags.pop();
                        w = w.slice(1);
                    }
                    if (w[w.length - 1] == '}') {
                        w = w.slice(0, w.length - 1);
                    }
                    var o = wordToColorFunc(obj, w, tags);
                    if (words[i][words[i].length - 1] == '}') {
                        tags.pop();
                    }
                    var pt = this.createTF(o.word, fontName);
                    pt.font.size *= fontScale;
                    lb = pt.font.size / 2;
                    pt.tint = o.color;
                    pt.x = x;
                    pt.y = y - pt.font.size;
                    desc.addChild(pt);
                    var bounds = pt.getLocalBounds(pt.worldTransform);
                    if (pt.x + bounds.width > boundWidth) {
                        //linebreak
                        x = 0;
                        var prevY = y - pt.font.size;
                        y += lb;
                        pt.x = 0;
                        pt.y = y - pt.font.size;
                        this.addSpaces(desc.children, prevY, boundWidth);
                    }
                    x += bounds.width + SPACE_SIZE;
                }
                y += lb;
                x = 0;
            }
            for (var _i = 0, _a = desc.children; _i < _a.length; _i++) {
                var x_1 = _a[_i];
                x_1.x += leftBorder;
            }
            desc.x = this.pos[0];
            desc.y = this.pos[1];
            return desc;
        };
        return Tooltip;
    }(O_1.O));
    exports.Tooltip = Tooltip;
});
