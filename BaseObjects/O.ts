import {m, Vec2} from "../Math";
//import {Shape} from "../ClientPhys";
import {Body, Composite} from "../../lib/matter";
import {Application, TweenMax, TimelineMax} from "../Application";


export let DEF_EVENTS = {
    killed: 'killed',
    collided: 'collided',
};


class Collision {
    box: Array<number> = [0, 0];
    radius: number = 0;
    isCircle: boolean = true;
}

class Context {
    c: Context;
    static globalID: number = 0;
    id: number = 0;
    f: Function = function () {

    };

    nextF(cb: (end: Function, params: any) => any) {
        let con = this;
        return function (params: any) {
            //all the previous goes here
            if (con.c)
                con.c.f.bind(con.c);
            cb(con.f, params);
        };
    }

    constructor(prev: Context, prevF: (end: Function, params: any) => any) {
        this.c = prev;
        this.id = Context.globalID;
        Context.globalID++;
        if (prevF)
            this.c.f = this.nextF(prevF);
    }
}

interface Contextable {
    context: Context;

    call(milliseconds: number, func: Function)

    wait(milliseconds: number)

    apply()
}

const PhysStatic = 1;
const PhysDynamic = 2;

class EngineEvent {
    event: string;
    listener: Function;

    constructor(e, l) {
        this.event = e;
        this.listener = l;
    }
}

interface Extension {
    process(o: O)
}

export class O implements Contextable {
    public polygon: string;
    public polyline: string;
    tileColRow: Vec2;
    public get parent(): O {
        return this._parent;
    }

    public set parent(value: O) {
        this._parent = value;
    }

    compositions: Extension[];
    protected _parent: O;
    protected _gfx: any;
    bounds: Array<number> = [0, 0];
    context: Context = new Context(null, null);
    layer: PIXI.Container;
    properties: any;
    private physType: number;
    stringID: string;
    colMask: number;
    doRemove: boolean = false;
    pos: Vec2 = [0, 0];
    v: Vec2 = [0, 0];
    offset: Array<number> = [0, 0, 0]; //x y a
    removeable: boolean = true;
    av: number = 0;
    a: number = 0;
    noCameraOffset: boolean = false;
    public type: number;
    public alwaysVisible: boolean = false;
    private events: Array<EngineEvent>;
    protected linkedObjects: O[];
    private _width: number = 0;
    private _height: number = 0;
    public createTime: number = 0;
    protected _children: O[] = [];



    overlapPoint(p: Vec2) {
        if (p[0] > this.pos[0] - this.bounds[0] / 2 &&
            p[0] < this.pos[0] + this.bounds[0] / 2 &&
            p[1] > this.pos[1] - this.bounds[1] / 2 &&
            p[1] < this.pos[1] + this.bounds[1] / 2) {
            return true
        } else {
            return false
        }
    }


    //Current O.x O.y goes to gfx offset
    removeChild(o: O) {
        if (this.doRemove) {
            return
        }
        let inx = this._children.indexOf(o);
        if (~inx) {
            this._children.splice(inx, 1);
        }
    }


    addChild(o: O, relOffset: Vec2 = null) {
        if (!o.gfx || !o.gfx.addChild) {
            throw "Can't add child to object without gfx, or gfx is not a container!";
        } else {
            this._children.push(o);
            o.gfx.visible = true;
            Application.One.rp(o.gfx);
            if (relOffset) {
                o.gfx.x = relOffset[0];
                o.gfx.y = relOffset[1];
            } else {
                o.gfx.x = o.x;
                o.gfx.y = o.y;
            }
            o.x = o.gfx.x;
            o.y = o.gfx.y;
            o._parent = this;
            this.gfx.addChild(o.gfx)
        }
    }

    addExtensions(c: Extension) {
        if (!this.compositions) {
            this.compositions = [];
        }

        this.compositions.push(c);
    }

    static cin<T extends O>(c: { new(p: Vec2, gfx: any): T; }, pos: Vec2 = null, gfx: PIXI.DisplayObject = null, props = {}): T {
        let res = new c(pos, gfx);
        res.init(props);
        return res;
    }

    set body(value: Matter.Body) {
        this._body = value;
        if (value) {
            this.pos[0] = value.position.x;
            this.pos[1] = value.position.y;
        }
    }

    get body(): Matter.Body {
        return this._body;
    }

    get gfx(): any {
        return this._gfx;
    }

    updateLink(x: number, y: number) {
        this.x += x;
        this.y += y;
    }

    set gfx(value: any) {
        this._gfx = value;
    }

    public set x(v: number) {
        if (this._parent) {
            this.gfx.x = v;
            //throw "Can't set X to embedded object <O>";
        } else {
            let d = v - this.pos[0];
            if (this.linkedObjects)
                this.updateLinked(d, 0);
            this.pos[0] = v
        }

    }

    public set y(v: number) {
        if (this._parent) {
            this.gfx.y = v;
            //throw "Can't set Y to embedded object <O>";
        } else {
            let d = v - this.pos[1];
            if (this.linkedObjects)
                this.updateLinked(0, d);
            this.pos[1] = v
        }
    }

    public get x(): number {
        if (this._parent) return this.gfx.x;
        return this.pos[0]
    }

    public get y(): number {
        if (this._parent) return this.gfx.y;
        return this.pos[1]
    }

    public set opacity(v) {
        if (this._gfx) this._gfx.alpha = v;
    }

    public get opacity(): number {
        if (this._gfx) return this._gfx.alpha
    }


    public set width(v) {
        this._width = v;
    }

    public get width(): number {
        return this._width;
    }

    public set height(v) {
        this._height = v;
    }

    public get height(): number {
        return this._height;
    }

    public intersects(o: O): boolean {
        return ((Math.abs(o.x - this.x) < (o.width + this.width) / 2) &&
            (Math.abs(o.y - this.y) < (o.height + this.height) / 2));
    }

    public set vx(v) {
        this.v[0] = v;
    }

    public get vx(): number {
        return this.v[0];
    }

    public set vy(v) {
        this.v[1] = v;
    }

    public get vy(): number {
        return this.v[1];
    }

    /*****
    * Link object list to this
    * any this movement will move linked objects
     ***/
    linkObj(...o: O[]) {
        if (!this.linkedObjects) this.linkedObjects = [];
        for (let x of o) {
            this.linkedObjects.push(x);
        }
    }

    unlinkObj(o: O) {
        let inx = 0;
        for (let x of this.linkedObjects) {
            if (x == o) {
                this.linkedObjects.splice(inx, 1);
                break;
            }
            inx++;
        }
    }

    private _body: Body;



    hasFlag(value, flag) {
        return ((value & flag) == value)
    }


    onCollide(b: O) {

    }



    static hideList(list: O[], visibility: boolean = false): void {
        for (let x of list) {
            if (x.gfx)
                x.gfx.visible = visibility;
        }
    }

    onDestroy() {
        if (this.body) {
            Composite.remove(Application.One.engine.world, this.body);
            this.body = null;
        }

        if (this._children) {
            for (let x of this._children) {
                x.killNow()
            }

            this._children = null;
        }

        if (this.parent) {
            this.parent.removeChild(this)
        }
        this.layer = null;
        this.linkedObjects = [];
        this.emmit(DEF_EVENTS.killed);

        if (this._gfx && this._gfx.parent) {
            this._gfx = Application.One.free(this._gfx);
        }
    }

    killNow(): null {
        this.doRemove = true;
        return null
    }

    kill(): O {
        this.context = new Context(this.context, (next: Function) => {
            this.doRemove = true;

            next()
        });

        return this;
    }

    constructor(pos: Vec2 = null, gfx: PIXI.DisplayObject = null) {
        if (!pos) {
            this.pos = [0, 0]
        } else {
            this.pos = m.v2cp(pos);
        }

        this.createTime = Application.One.timer.getTimer();

        if (gfx) {
            this._gfx = gfx;
        }
        if (this.stringID) {
            Application.One.sm.globalIds[this.stringID] = this;
        }
        Application.One.sm.objects.push(this);
    }


    static getSprite(texName) {
        if (texName.length > 4 && texName.charAt(texName.length - 4) != ".")
            var add = ".png"; else add = "";
        let s = new Application.One.PIXI.Sprite(Application.One.PIXI.Texture.fromFrame(texName + add));
        s.anchor.x = 0.5;
        s.anchor.y = 0.5;
        return s;
    }

    updateBounds() {
        if (!this._gfx) {
            this.bounds = [this.width, this.height];
            return;
        }

        if (this._gfx.parent)
            this._gfx.updateTransform();

        let b = this._gfx.getBounds();
        this.bounds = [b.width, b.height];
    }

    init(props: any = null) {
        if (props) {
            if (props.color && this.gfx && this.gfx.color) {
                (<PIXI.heaven.Sprite>this.gfx).color.tintBGR = parseInt(props.color.replace('#', '0x'));
            }

            if (props.light && this.gfx && this.gfx.color) {
                let col = m.hexToRgb(props.light);
                (<PIXI.heaven.Sprite>this.gfx).color.setDark(col[1], col[2], col[3]);
            }
        }
        this.createTime = Application.One.timer.getTimer();

        if (this._gfx && !this._parent && !this.noCameraOffset)
            Application.One.sm.camera.updateTransform(this, this._gfx, 0, 0);

        this.updateBounds();
    }

    call(func) {
        this.context = new Context(this.context, (next: Function, params: any) => {
            func(params);
            next();
        });

        return this;
    }

    delayedCall(milliseconds, func) {
        this.context = new Context(this.context, (next: Function, params: any) => {
            this.setTimeout(() => {
                func(params);
                next();
            }, milliseconds);
        });

        return this;
    }

    emmit(event, ...params) {
        if (!this.events) return;
        for (let i = 0, l = this.events.length; i < l; ++i) {
            if (this.events[i].event == event) {
                this.events[i].listener(...params);
                this.events.splice(i, 1);
                i--;
                l--;
            }
        }
    }

    on(event: string): O {
        if (!this.events) this.events = [];
        this.context = new Context(this.context, (next: Function) => {
            this.events.push(new EngineEvent(event, (p: any) => {
                next(p);
            }));
        });

        return this;
    }

    apply() {
        let initContext = this.context;
        let first = this.context;

        while (first.c) first = first.c;

        first.f(() => {
        });
        this.context = new Context(null, null);
        return initContext;
    }

    setTimeout(f: Function, delaySecs: number = 0): gsap.TweenMax {
        return TweenMax.delayedCall(delaySecs, () => {
            if (this.doRemove) return -1;
            return f();
        })
    }

    setIntervalTimeout(f: Function, delaySecs: number, timeoutSecs: number): gsap.Animation {
        if (delaySecs < 0.03) delaySecs = 0.03;

        let ff = this.setInterval(f, delaySecs);

        TweenMax.delayedCall(timeoutSecs, () => {
            ff = Application.One.killTweens(ff);
        });
        return ff;
    }

    setInterval(f: Function, delaySecs: number = 0.03): gsap.Animation {
        if (delaySecs < 0.03) delaySecs = 0.03;
        let interval = new TimelineMax({repeat: -1}).call(() => {
            if (this.doRemove) return Application.One.killTweens(interval);
            return f();
        }, null, null, delaySecs);

        return interval;
    }

    wait(seconds: number): O {
        this.context = new Context(this.context, (next: Function) => {
            this.setTimeout(
                () => {
                    next();
                }, seconds
            )
        });

        return this;
    }

    s(field: string, value: any): O {
        let prev = this.context.f;
        this.context.f = () => {
            if (prev)
                prev();
            this[field] = value;
        };

        return this;
    }

    process() {

        if (!this.physType) {
            this.pos[0] += this.v[0];
            this.pos[1] += this.v[1];
        }

        if (this.av != 0)
            this.a += this.av * Application.One.worldSpeed * Application.One.delta;

        if (this._gfx) {
            if (!this._parent) {
                Application.One.sm.camera.updateTransform(this, this._gfx, 0, 0);
            } else {
                this._gfx.x = this.pos[0];
                this._gfx.y = this.pos[1];
            }
        }
    }

    protected updateLinked(x: number, y: number) {
        for (let a of this.linkedObjects) {
            a.updateLink(x, y);
        }
    }

    changeGfxLayer(layer: PIXI.Container) {
        Application.One.rp(this.gfx);
        layer.addChild(this.gfx);
    }

    extendProcess(f: () => void) {
        let oldprocess = this.process.bind(this);

        this.process = () => {
            oldprocess();
            f();
        }
    }

    static totop(cl: PIXI.DisplayObject) {
        cl.parent.setChildIndex(cl, cl.parent.children.length - 1);
    }

    rotateTo(dest: Vec2, deltaAngle: number) {
        let dx = this.pos[0] - dest[0];
        let dy = this.pos[1] - dest[1];
        let d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) return;
        dx /= d;
        dy /= d;
        this.a = Math.atan2(dy, dx) + deltaAngle;
    }

    processCompositions() {
        for (let c of this.compositions) {
            c.process(this)
        }
    }

    getType() {
        return this.type;
    }
}