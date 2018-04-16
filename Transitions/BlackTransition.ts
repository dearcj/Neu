import {Application} from "../Application";
import {Stage} from "../../Stages/Stage";
import {ITransition} from "./ITransition";
import {TweenMax} from "../Application";

export class BlackTransition implements ITransition {

    Run(prevStage: Stage, newStage: Stage) {
        let x = new PIXI.Graphics();
        x.width = Application.One.SCR_WIDTH;
        x.height = Application.One.SCR_HEIGHT;
        x.clear();
        x.beginFill(0x000000, 1);
        x.drawRect(0, 0, Application.One.SCR_WIDTH, Application.One.SCR_HEIGHT);
        x.endFill();

        let c = Application.One.cp(Application.One.sm.superstage);
        c.addChild(x);
        c.alpha = 0;

        let c2 = Application.One.cp(c);
        for (let x = 0; x < 12; x ++) {
            let sand1 = Application.One.cs("dirtsand.png", c2);
            sand1.x = Application.One.SCR_WIDTH_HALF + Math.random()*5000;
            sand1.y = Application.One.SCR_HEIGHT_HALF + (Math.random() - 0.5)*0.8*Application.One.SCR_HEIGHT;
            sand1.alpha  = 0.07;//.setLight(0.2, 0.2, 0.2);
            sand1.scale.x = 20;
            sand1.scale.y = 10;
        }
        Application.One.sm.stage.doProcess = false;

        new TweenMax(c, 0.07, {
            alpha: 1, onComplete: () => {
                Application.One.sm.switchStages(prevStage, newStage);
                new TweenMax(c2, 0.6, {x: - 5000});

                new TweenMax(c, 0.2, {
                    delay: 0.4,
                    alpha: 0, onComplete: () => {
                        Application.One.sm.superstage.removeChild(c);
                    }
                });
            }
        });
    }
}