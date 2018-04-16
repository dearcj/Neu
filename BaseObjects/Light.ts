import {O} from "./O";
import {Camera} from "./Camera";
import {m, Vec2} from "../Math";
import {Lighting} from "./Lighting";
import {Application} from "../Application";

export class Light extends O{
    public initSize: Vec2;
    public rndSeed: number = 0;
    public isCandle: boolean = false;

    onDestroy() {
        super.onDestroy();
        let li = <Lighting>Application.One.sm.findByType(Lighting)[0];
    }

    init(props: any) {
        if (props.polygon) {
            this.gfx = <PIXI.Graphics>Application.One.lm.createPolygon(props.polygon, props);
        }

        this.initSize = [this.gfx.width, this.gfx.height];
        this.isCandle = props.candle == "true";
        super.init(props)
    }

    addToScene() {
        let li = <Lighting>Application.One.sm.findByType(Lighting)[0];
        if (li) {
            li.addLight(this);
        }
    }

    process() {
        if (this.gfx.visible) {

            if (this.isCandle) {
                let coef = (this.gfx.height / 1640);
                let as =  Application.One.fMath.sin(Application.One.time / 120 + this.rndSeed / 10) * coef;


                this.rndSeed += Math.random();
                this.gfx.width = this.initSize[0] + 8*Application.One.fMath.cos(Application.One.time / 70 + this.rndSeed / 10);
                this.gfx.height = this.initSize[1] + 8*as;
                this.y += as;
            }

        }
        super.process();
    }
}