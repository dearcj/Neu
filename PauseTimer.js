define(["require", "exports", "../main", "./Application"], function (require, exports, main_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PauseTimer = /** @class */ (function () {
        function PauseTimer() {
            this.paused = false;
            this.pauseStart = 0;
            this.totalPauseTime = 0;
            this.intervals = [];
            this.timeouts = [];
        }
        PauseTimer.prototype.since = function (time) {
            return this.getTimer() - time;
        };
        PauseTimer.prototype.process = function () {
        };
        PauseTimer.prototype.removeListener = function (f) {
            for (var i = 0; i < this.intervals.length; ++i) {
                if (this.intervals[i] == f) {
                    this.intervals.splice(i, 1);
                    i--;
                }
            }
            for (var i = 0; i < this.timeouts.length; ++i) {
                if (this.timeouts[i] == f) {
                    this.timeouts.splice(i, 1);
                    i--;
                }
            }
        };
        PauseTimer.prototype.getTimer = function () {
            return main_1._.time - this.totalPauseTime;
        };
        PauseTimer.prototype.isPaused = function () {
            return this.paused;
        };
        PauseTimer.prototype.pause = function () {
            this.pauseStart = main_1._.time;
            Application_1.TweenMax.pauseAll();
            this.paused = true;
        };
        PauseTimer.prototype.resume = function () {
            if (!this.paused)
                return;
            this.totalPauseTime += (main_1._.time - this.pauseStart);
            Application_1.TweenMax.resumeAll();
            this.paused = false;
        };
        return PauseTimer;
    }());
    exports.PauseTimer = PauseTimer;
});
