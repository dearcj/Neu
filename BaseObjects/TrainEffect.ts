import {O} from "./O";
import {Vec2} from "../Math";
import RopePoint = PIXI.heaven.mesh.RopePoint;
import DRAW_MODES = PIXI.DRAW_MODES;
import {Application} from "../Application";

type PointFunc =  (RopePoint, number) => void
export class TrainEffect extends O {
    private points: Array<RopePoint>;

    private totalPoints: number;
    private historyX: number[];
    private historyY: number[];
    private historyPoints: number;
    private pos2: Vec2 = [0, 0];
    public pointFunc: PointFunc = (c: RopePoint, prop: number) => {};
    private lastHistoryX: number = Infinity;
    private lastHistoryY: number = Infinity;
    public delta: number = 4;
    init(props: { gfx: string, blendmode: number, layer: PIXI.Container, totalPoints: number, historyPoints: number, scaleX: number, scaleY: number} = null) {
        this.points = [];
        this.totalPoints = props.totalPoints ? props.totalPoints : 40;
        this.historyX = [];
        this.historyY = [];
        if (!props.scaleX) props.scaleX = 1;
        if (!props.scaleY) props.scaleY = 1;
        for (let x = 0; x < this.totalPoints; x++) {
            this.points.push(new RopePoint(this.pos[0] / props.scaleX, this.pos[1] / props.scaleY))
        }

        this.historyPoints = props.historyPoints ? props.historyPoints : 40;

        for (let i = 0; i < this.historyPoints; i++) {
            this.historyX.push(this.pos[0] / props.scaleX);
            this.historyY.push(this.pos[1] / props.scaleY);
        }
        let trailTexture = PIXI.Texture.fromImage(props.gfx);


        //ANUS
        this.gfx = new PIXI.heaven.mesh.Rope(trailTexture, this.points);
        this.gfx.enableColors();
        this.gfx.drawMode = PIXI.heaven.mesh.Mesh.DRAW_MODES.TRIANGLES;
        this.gfx.scale.x = props.scaleX;
        this.gfx.scale.y = props.scaleY;
        this.gfx.blendMode = props.blendmode;
        props.layer.addChild(this.gfx);

        Application.One.sm.camera.transformPoint([0,0], 1, this.pos2);
    }

    process(): void {
        let curHistoryX = this.pos[0] / this.gfx.scale.x;
        let curHistoryY = this.pos[1] / this.gfx.scale.y;
        if (Math.abs(this.lastHistoryX - curHistoryX) > this.delta &&
        Math.abs(this.lastHistoryY - curHistoryY) > this.delta) {
            this.lastHistoryY = curHistoryY;
            this.lastHistoryX = curHistoryX;
            this.historyX.pop();
            this.historyX.unshift(curHistoryX);
            this.historyY.pop();
            this.historyY.unshift(curHistoryY);
        } else {
            this.historyX[0] = curHistoryX;
            this.historyY[0] = curHistoryY;
        }

        let plen = this.points.length;
        for (let i = 0; i < plen; i++) {
            let p = this.points[i];
            let prop = i / (plen - 1);
            this.pointFunc(p, prop);
            //p.offset = Math.random();
            let ix = cubicInterpolation(this.historyX, i / this.totalPoints * this.historyPoints, null);
            let iy = cubicInterpolation(this.historyY, i / this.totalPoints * this.historyPoints, null);
            p.x = ix;
            p.y = iy;
        }

        this.pos[0] += this.v[0];// * Application.One.worldSpeed * Application.One.delta2;
        this.pos[1] += this.v[1];// * Application.One.worldSpeed * Application.One.delta2;

        if (!this.noCameraOffset) {
            Application.One.sm.camera.transformPoint([0,0], 1, this.pos2);
            this.gfx.x = this.pos2[0];
            this.gfx.y = this.pos2[1];
        }
    }


    onDestroy() {
        this.pointFunc = null;
        this.historyX = null;
        this.historyY = null;
        this.points = null;
        super.onDestroy();
    }

}

function clipInput(k, arr, maxL) {
    if (k < 0)
        k = 0;
    if (k > maxL - 1)
        k = maxL - 1;
    return arr[k];
}

function getTangent(k, factor, array, maxL) {
    return factor * (clipInput(k + 1, array, maxL) - clipInput(k - 1, array, maxL)) / 2;
}

function cubicInterpolation(array, t, tangentFactor: number = 1) {
    let maxL = array.length;
    let k = Math.floor(t);
    let m = [getTangent(k, tangentFactor, array, maxL), getTangent(k + 1, tangentFactor, array, maxL)];
    let p = [clipInput(k, array, maxL), clipInput(k + 1, array, maxL)];
    t -= k;
    let t2 = t * t;
    let t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}