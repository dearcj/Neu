import {O} from "./O";
import {Vec2} from "../Math";
import {Application} from "../Application";

/**
 * Created by KURWINDALLAS on 17.11.2014.
 */
export class Aligner extends O {
    private crossed: Vec2 = [0, 0];

    init(props: any) {
        super.init(props);

        if (this.x - this.width / 2 < Application.One.screenCenterOffset[0]) {
            this.crossed[0] = -1;
        }

        if (this.x + this.width / 2 > Application.One.screenCenterOffset[0] + Application.One.MIN_SCR_WIDTH) {
            this.crossed[0] = 1;
        }

        if (this.y - this.height / 2 < Application.One.screenCenterOffset[1]) {
            this.crossed[1] = -1;
        }

        if (this.y + this.height / 2 > Application.One.screenCenterOffset[1] + Application.One.MIN_SCR_HEIGHT) {
            this.crossed[1] = 1;
        }

        let objectsUnderAligner = Aligner.collectObjectsUnder(this);
        console.log("Objects under: ", objectsUnderAligner.length);

        let deltaX = Application.One.screenCenterOffset[0] * this.crossed[0];
        let deltaY = Application.One.screenCenterOffset[1] * this.crossed[1];

        for (let x of objectsUnderAligner) {
            x.x += deltaX;
            x.y += deltaY;
            x.process()
        }

        this.killNow()
    }

    process() {
    }

    static collectObjectsUnder(o: O, fixlayers = [Application.One.sm.gui, Application.One.sm.gui2]): O[] {
        let res = [];

        for (let x of Application.One.lm.objectsList) {
            if (x != o && x.parent == null && (fixlayers.indexOf(x.layer) >= 0) && x.intersects(o)) {
                res.push(x);
            }
        }

        return res;
    }
}