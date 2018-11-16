define(["require", "exports", "../Application", "../Application"], function (require, exports, Application_1, Application_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BlackTransition = /** @class */ (function () {
        function BlackTransition() {
        }
        BlackTransition.prototype.Run = function (prevStage, newStage) {
            var x = new PIXI.Graphics();
            x.width = Application_1.Application.One.SCR_WIDTH;
            x.height = Application_1.Application.One.SCR_HEIGHT;
            x.clear();
            x.beginFill(0x000000, 1);
            x.drawRect(0, 0, Application_1.Application.One.SCR_WIDTH, Application_1.Application.One.SCR_HEIGHT);
            x.endFill();
            var c = Application_1.Application.One.cc(Application_1.Application.One.sm.superstage);
            c.addChild(x);
            c.alpha = 0;
            var c2 = Application_1.Application.One.cc(c);
            for (var x_1 = 0; x_1 < 12; x_1++) {
                var sand1 = Application_1.Application.One.cs("dirtsand", c2);
                sand1.x = Application_1.Application.One.SCR_WIDTH_HALF + Math.random() * 5000;
                sand1.y = Application_1.Application.One.SCR_HEIGHT_HALF + (Math.random() - 0.5) * 0.8 * Application_1.Application.One.SCR_HEIGHT;
                sand1.alpha = 0.07; //.setLight(0.2, 0.2, 0.2);
                sand1.scale.x = 20;
                sand1.scale.y = 10;
            }
            Application_1.Application.One.sm.stage.doProcess = false;
            new Application_2.TweenMax(c, 0.07, {
                alpha: 1, onComplete: function () {
                    Application_1.Application.One.sm.switchStages(prevStage, newStage);
                    new Application_2.TweenMax(c2, 0.6, { x: -5000 });
                    new Application_2.TweenMax(c, 0.2, {
                        delay: 0.4,
                        alpha: 0, onComplete: function () {
                            Application_1.Application.One.sm.superstage.removeChild(c);
                        }
                    });
                }
            });
        };
        return BlackTransition;
    }());
    exports.BlackTransition = BlackTransition;
});
