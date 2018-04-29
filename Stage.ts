import {IO} from "../Neu/BaseObjects/IO";
import {_} from "../main";
import DisplayObject = PIXI.DisplayObject;
import {O} from "../Neu/BaseObjects/O";
/**
 * Created by MSI on 04.01.2017.
 */

export class Stage {
    visible: boolean;
    doProcess: boolean;
    public currentFocus: number = null;
    private focusable: Array<IO> = [];
    private container: PIXI.Container = new PIXI.Container();
    public layers: Object = {}; //MAP OF PIXI CONTAINERS


    setFocusable(f: Array<IO>): void {
        this.focusable = f;
    }

    addControllerHandlers(): void{
        _.controls.onBtnPress = (btn) => {
            if (this.currentFocus == null) {
                this.currentFocus = 0
            }

            if (btn == 1 && this.currentFocus != null) {
                this.focusable[this.currentFocus].click()
            }
        };

        _.controls.onRight = () => {
            if (this.currentFocus != null)
                this.focusable[this.currentFocus].setFocus(false); else {
                this.currentFocus = 0;
            }
            this.currentFocus = (this.currentFocus + 1) % this.focusable.length;
            this.focusable[this.currentFocus].setFocus(true)
        };

        _.controls.onLeft = () => {
            if (this.currentFocus != null)
            this.focusable[this.currentFocus].setFocus(false); else {
                this.currentFocus = 0;
            }
            this.currentFocus--;// = (this.currentFocus  1) % this.focusable.length
            if (this.currentFocus < 0) this.currentFocus = this.focusable.length - 1;

            this.focusable[this.currentFocus].setFocus(true);
        }
    }

    process() {
    };

    onHide(newStage: Stage) {
        _.sm.removeObjects();
        _.sm.main.removeChild(this.container);
    };

    onShow() {
        _.sm.main.addChild(this.container);
    };

    addLayer(name: string, l: any, is3d: boolean): any {
        if (l) {
            this.layers[name] = l;
        } else {
            if (is3d) {
                this.layers[name] = new PIXI.Container();
            } else {
                this.layers[name] = new PIXI.projection.Container3d();
            }
        }

        this.container.addChild(this.layers[name]);
        return this.layers[name];
    }


}