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
define(["require", "exports", "./IO", "../PIXIPlugins/HeavenBitmapText", "../Application"], function (require, exports, IO_1, HeavenBitmapText_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Created by KURWINDALLAS on 11.07.2014.
     */ ///
    var TextBox = /** @class */ (function (_super) {
        __extends(TextBox, _super);
        function TextBox() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TextBox.hashCode = function (str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return hash;
        };
        TextBox.convertSpaces = function (a) {
            var c = a.match(/==/g);
            return a.replace(/==/g, '\n');
        };
        TextBox.createTextField = function (obj, props) {
            var fontName;
            if (props.fontName) {
                fontName = props.fontName;
            }
            else {
                fontName = TextBox.DEFAULT_FONT;
            }
            obj.text = props.text;
            if (obj.text) {
                obj.text = this.convertSpaces(obj.text);
            }
            if (obj.text == undefined)
                obj.text = "";
            var pt = new HeavenBitmapText_1.HeavenBitmapText(obj.text, { font: fontName });
            pt.fontInitialSize = pt.font.size;
            if (props.fontscale && props.fontscale != '') {
                pt.font.size = pt.fontInitialSize * parseFloat(props.fontscale);
            }
            pt.y = 0;
            pt.x = 0;
            //pt.bitmap = true;
            pt.scale.x = pt.scale.y;
            if (props.fontTint != "0xffffff" && props.fontTint != undefined)
                pt.tint = parseInt(props.fontTint);
            pt.anchor.x = 0.5;
            return pt;
        };
        TextBox.prototype.process = function () {
            _super.prototype.process.call(this);
        };
        TextBox.prototype.onDestroy = function () {
            _super.prototype.onDestroy.call(this);
        };
        TextBox.prototype.init = function (props) {
            this.gfx = new PIXI.Container();
            this.pos[0] -= this.width / 2;
            this.pos[1] -= this.height / 2;
            this.noCameraOffset = true;
            _super.prototype.init.call(this, props);
            this.textField = TextBox.createTextField(this, props);
            this.fontInitialSize = this.textField.maxLineHeight;
            this.gfx.position.x = Math.round(this.gfx.position.x);
            this.gfx.position.y = Math.round(this.gfx.position.y);
            if (props.color && this.gfx) {
                this.textField.tint = parseInt(props.color.replace('#', '0x'));
            }
            this.gfx.addChild(this.textField);
            var gfx = this.layer ? this.layer : Application_1.Application.One.sm.gui;
            gfx.addChild(this.gfx);
            this.text = this.text;
        };
        return TextBox;
    }(IO_1.IO));
    exports.TextBox = TextBox;
});
