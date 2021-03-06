import {O} from "./O";
import DisplayObject = PIXI.DisplayObject;
import {Application} from "../Application";
import {Vec2} from "../Math";


export interface BaseParticle  {
    lifeTime: number,
    x: number,
    y: number
    alpha: number;
}

export class BaseParticleSystem extends O{
    public particles: BaseParticle[] = [];
    public globalAlpha: number = 1;
    constructor (pos: Vec2 = null, gfx: PIXI.DisplayObject = null) {
        super(pos, new PIXI.particles.ParticleContainer(300, {
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            tint: true,
            alpha: true,
        }))
    }

    add<T extends BaseParticle>(p: T, gfx: DisplayObject): any {
        this.particles.push(p);
        this.gfx.addChild(gfx);
        this.processParticle(this.gfx.children.length - 1, Application.One.delta);

        p.alpha = this.globalAlpha;

        return p;
    }

    init( props: any): void{
        if (this.layer)
            this.layer.addChild(this.gfx);
        this.width = Application.One.SCR_WIDTH;
        this.height = Application.One.SCR_HEIGHT;

        super.init(props);
    }

    onDestroy(): void{
        super.onDestroy();
    }

    processParticle(i: number, delta: number) {
        let p = this.gfx.children[i];
        let pobj: BaseParticle = this.particles[i];

        p.x = pobj.x;
        p.y = pobj.y;
        p.alpha = pobj.alpha;
    }

    processParticles(timeDelta: number) {
        let len = this.particles.length;
        if (len != this.gfx.children.length)
        console.log("!!!! ", len, " xx ", this.gfx.children.length);
        for (let i = 0; i < len; ++i) {
            let part = this.particles[i];
            part.lifeTime -= timeDelta;
            this.processParticle(i, timeDelta);

            if (part.lifeTime < 0) {

                this.particles.splice(i, 1);
                Application.One.free(this.gfx.children[i]);
                i--;
                len--;
            }
        }
    }

    process() {
        super.process();

        this.processParticles(Application.One.deltaSec * Application.One.timeScale);

        //TODO: WEIRD OVERRIDE VISIBLE
        this.gfx.visible = (this.parent != null) || this.alwaysVisible || ((Math.abs(this.gfx.x - Application.One.SCR_WIDTH_HALF + this.width / 2) <= this.width / 2 + Application.One.SCR_WIDTH_HALF) &&
            (Math.abs(this.gfx.y - Application.One.SCR_HEIGHT_HALF) <= this.height / 2 + Application.One.SCR_HEIGHT_HALF));
    }
}


export class CustomParticleSystem extends BaseParticleSystem {
    customProcess: (p: BaseParticle, gfx: DisplayObject) => void;

    processParticle(i: number, delta: number) {
        let p = this.gfx.children[i];
        let pobj: BaseParticle = this.particles[i];
        if (this.customProcess) {
            this.customProcess(pobj, p)
        }
    }


}