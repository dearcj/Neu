define(["require", "exports", "../main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Created by MSI on 04.01.2017.
     */
    var Stage = /** @class */ (function () {
        function Stage() {
            this.currentFocus = null;
            this.focusable = [];
            this.container = new PIXI.Container();
            this.layers = {}; //MAP OF PIXI CONTAINERS
        }
        Stage.prototype.setFocusable = function (f) {
            this.focusable = f;
        };
        Stage.prototype.addControllerHandlers = function () {
            var _this = this;
            main_1._.controls.onBtnPress = function (btn) {
                if (_this.currentFocus == null) {
                    _this.currentFocus = 0;
                }
                if (btn == 1 && _this.currentFocus != null) {
                    _this.focusable[_this.currentFocus].click();
                }
            };
            main_1._.controls.onRight = function () {
                if (_this.currentFocus != null)
                    _this.focusable[_this.currentFocus].setFocus(false);
                else {
                    _this.currentFocus = 0;
                }
                _this.currentFocus = (_this.currentFocus + 1) % _this.focusable.length;
                _this.focusable[_this.currentFocus].setFocus(true);
            };
            main_1._.controls.onLeft = function () {
                if (_this.currentFocus != null)
                    _this.focusable[_this.currentFocus].setFocus(false);
                else {
                    _this.currentFocus = 0;
                }
                _this.currentFocus--; // = (this.currentFocus  1) % this.focusable.length
                if (_this.currentFocus < 0)
                    _this.currentFocus = _this.focusable.length - 1;
                _this.focusable[_this.currentFocus].setFocus(true);
            };
        };
        Stage.prototype.process = function () {
        };
        ;
        Stage.prototype.onHide = function (newStage) {
            main_1._.sm.removeObjects();
            main_1._.sm.main.removeChild(this.container);
        };
        ;
        Stage.prototype.onShow = function () {
            main_1._.sm.main.addChild(this.container);
        };
        ;
        Stage.prototype.addLayer = function (name, l) {
            if (l) {
                this.layers[name] = l;
            }
            else {
                this.layers[name] = new PIXI.Container();
            }
            this.container.addChild(this.layers[name]);
            return this.layers[name];
        };
        return Stage;
    }());
    exports.Stage = Stage;
});
