/**
 * Created by MSI on 06.05.2017.
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Created by MSI on 12.03.2017.
     */
    var Controls = /** @class */ (function () {
        function Controls() {
            var _this = this;
            this.buttonStates = {};
            var nav = navigator;
            var gamepads = navigator.getGamepads ? navigator.getGamepads() : (nav.webkitGetGamepads ? nav.webkitGetGamepads : []);
            this.gp = gamepads[0];
            window.addEventListener("gamepaddisconnected", function (e) {
                _this.gp = null;
            }, false);
            window.addEventListener("gamepadconnected", function (e) {
                if (e.gamepad) {
                    _this.gp = navigator.getGamepads()[e.gamepad.index];
                    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", _this.gp.index, _this.gp.id, _this.gp.buttons.length, _this.gp.axes.length);
                }
                else {
                    _this.gp = null;
                }
            });
        }
        Controls.prototype.buttonPressed = function (b) {
            if (typeof (b) == "object") {
                return b.pressed;
            }
            return b == 1.0;
        };
        Controls.prototype.onJoystickButtonPress = function (btn, state) {
            if (state) {
                if (this.onBtnPress)
                    this.onBtnPress(btn);
                if (this.onBtnRelease)
                    this.onBtnRelease(btn);
            }
        };
        Controls.prototype.update = function () {
            if (this.gp) {
                if (this.gp.axes[0] != this.prevX && this.gp.axes[0] > .99 && this.onRight)
                    this.onRight();
                if (this.gp.axes[0] != this.prevX && this.gp.axes[0] < -.99 && this.onLeft)
                    this.onLeft();
                if (this.gp.axes[1] != this.prevY && this.gp.axes[1] > .99 && this.onUp)
                    this.onUp();
                if (this.gp.axes[1] != this.prevY && this.gp.axes[1] < -.99 && this.onDown)
                    this.onDown();
                this.prevX = this.gp.axes[0];
                this.prevY = this.gp.axes[1];
                for (var x = 0; x < this.gp.buttons.length; ++x) {
                    var newBtnState = this.buttonPressed(this.gp.buttons[x]);
                    if (newBtnState != this.buttonStates[x]) {
                        this.onJoystickButtonPress(x, newBtnState);
                    }
                    this.buttonStates[x] = newBtnState;
                }
            }
        };
        return Controls;
    }());
    exports.Controls = Controls;
});
