import {O} from "./O";
import {Camera} from "./Camera";
import {m, Vec2} from "../Math";
import {Application} from "../Application";
import {Lighting} from "./Lighting";
import {_} from "../../main";

export class Light extends O {
    public initSize: Vec2;
    public rndSeed: number = 0;
    public isCandle: boolean = false;
    static POWER: number = 1;
    public baseAlpha: number = 1;

    onDestroy() {
        console.log("Light with ID = ", this.stringID, " destroyed");
        if (this.gfx.parentLayer)
            this.gfx.parentLayer.removeChild(this.gfx);
        this.gfx.parentLayer = null;

        O.rp(this.gfx);
        super.onDestroy();
    }

    public createPolygon(polygon: any, properties: any) {
        let g = new PIXI.Graphics();
        let points = polygon;
        let pointsArr = points.split(' ');
        g.clear();
        g.beginFill(properties.color ? parseInt(properties.color.replace('#', '0x')) : 0xffffff, properties.alpha ? properties.alpha : 1);
        let arr: number[] = [];
        let minx: number = Infinity;
        let miny: number = Infinity;
        for (let x of pointsArr) {
            let p = x.split(',');
            let xx = parseFloat(p[0]);
            let yy = parseFloat(p[1]);
            minx = minx > xx ? xx : minx;
            miny = miny > yy ? yy : miny;
            arr.push(xx, yy);
        }
        g.drawPolygon(arr);
        let b = g.getBounds();

        let dx = g.width * 0.4;
        let dy = g.height * 0.4;
        g.x = -minx + dx / 2;
        g.y = -miny + dy / 2;
        g.endFill();

        let bf = new PIXI.filters.BlurFilter(1, 3);
        bf.blurX = properties.blurx ? parseFloat(properties.blurx) : 1;
        bf.blurY = properties.blury ? parseFloat(properties.blury) : 1;
        g.filters = [bf];
        let renderTexture = PIXI.RenderTexture.create(b.width + dx, b.height + dy);
        Application.One.app.renderer.render(g, renderTexture);

        let container = new PIXI.Container();
        let spr = new PIXI.heaven.Sprite(renderTexture);
        // spr.anchor.x = 0.5;
        // spr.anchor.y = 0.5;
        spr.x = minx - dx / 2;
        spr.y = miny - dy / 2;
        container.addChild(spr);
        return container;
    }


    init(props: any) {
        if (props.polygon) {
            this.gfx = this.createPolygon(props.polygon, props);
        }

        this.initSize = [this.gfx.width, this.gfx.height];
        this.isCandle = props.candle == "true";
        super.init(props)
        this.baseAlpha = this.gfx.alpha;
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
                let as = Application.One.fMath.sin(Application.One.time / 120 + this.rndSeed / 10) * coef;

                this.rndSeed += Math.random();
                this.gfx.width = Light.POWER * this.initSize[0] + 8 * Application.One.fMath.cos(Application.One.time / 70 + this.rndSeed / 10);
                this.gfx.height = Light.POWER * this.initSize[1] + 8 * as;
                this.y += as;
            }
        }

        super.process();
    }
}