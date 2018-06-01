/**
 * Created by Михаил on 27.06.2014.
 */

import {_} from "../main";

export class LoadQueue {
    private onEnd: Function;
    private total: number = 0;
    constructor(cb: Function) {
        this.onEnd = cb;
    }

    onLoad(...any): Function{
        this.total++;

        return () => {
            this.total--;
            if (this.total == 0) {
                this.onEnd();
            }
        }
    }
}

export type Vec2 = [number, number]

export type ARGBColor = [number, number, number, number]

export type RGBColor = [number, number, number]

export  function binarySearch(array, target, comparator) {
    var l = 0,
        h = array.length - 1,
        m, comparison;
    comparator = comparator || function (a, b) {
            return (a < b ? -1 : (a > b ? 1 : 0)); /* default comparison method if one was not provided */
        };
    while (l <= h) {
        m = (l + h) >>> 1; /* equivalent to Math.floor((l + h) / 2) but faster */
        comparison = comparator(array[m], target);
        if (comparison < 0) {
            l = m + 1;
        } else if (comparison > 0) {
            h = m - 1;
        } else {
            return m;
        }
    }
    return~l;
}
export  function binaryInsert (array, target, duplicate, comparator) {
    var i = binarySearch(array, target, comparator);
    if (i >= 0) { /* if the binarySearch return value was zero or positive, a matching object was found */
        if (!duplicate) {
            return i;
        }
    } else { /* if the return value was negative, the bitwise complement of the return value is the correct index for this object */
        i = ~i;
    }
    array.splice(i, 0, target);
    return i;
}

class M {
    v2cp(v: Vec2): Vec2{
        return [v[0], v[1]]
    }

    perp(v:Vec2): Vec2 {
        return [-v[1], v[0]]
    }

    dot(v1: Vec2, v2:Vec2): number{
        return v1[0]*v2[0] + v1[1]*v2[1]
    }

    v2len(v: Vec2): number {
        return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
    }

    subv2(v1, v2: Vec2): Vec2 {
        return [v1[0] - v2[0], v1[1] - v2[1]]
    }

    v2prod(v1: Vec2, v2:Vec2): Vec2 {
        return [v1[0]*v2[0], v1[1]*v2[1]]
    }

    av2(v: Vec2, v2: Vec2): Vec2 {
        return [v[0] + v2[0], v[1] + v2[1]]
    }

    mv2 (v: Vec2, delta: number): Vec2 {
        return [v[0]*delta, v[1]*delta]
    }

    normalizeV2(v: Vec2) : Vec2 {
        let l = Math.sqrt(v[0]*v[0] + v[1]*v[1]) + 0.0000001;
        v[0] /= l;
        v[1] /= l;
        return v
    }

    shuffle(a: any[]): any[] {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }


    numhexToRgb(numhex: number): ARGBColor{
        let r = numhex >> 16;
        let g = numhex >> 8 & 0xFF;
        let b = numhex & 0xFF;
        return [255, r,g,b];
    }

    numhexToRgbNormal(numhex: number): RGBColor{
        let r = numhex >> 16;
        let g = numhex >> 8 & 0xFF;
        let b = numhex & 0xFF;
        return [r / 255.,g / 255.,b / 255.];
    }

    decimalAdjust(type: string, value: any, exp:number) {
        // Если степень не определена, либо равна нулю...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // Если значение не является числом, либо степень не является целым числом...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Сдвиг разрядов
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Обратный сдвиг
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    rv2(v: Vec2, r: number): Vec2 {
        let ca = Math.cos(r);
        let sa = Math.sin(r);
        return [ca*v[0] - sa*v[1], sa*v[0] + ca*v[1]];
    }

    round10(value, exp = -1) {
        return this.decimalAdjust('round', value, exp);
    }


    lerp(a, b, d) {
        return a + (b - a) * d;
    }

    sign(v: number) {
        if (v == 0) return 0;
        if (v > 0) return 1; else return -1;
    }

    rint(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRand(obj: Array<any>): any {
        return obj[Math.floor(Math.random() * obj.length)];
    }

    hexToRgb(hex): ARGBColor {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16),
                parseInt(result[4], 16),
            ] : null;
    }

    hslToRgb(h: number, s: number, l: number): number {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return this.rgbtoint(r * 255, g * 255, b * 255);// [Math.round(r* 255), Math.round(g * 255), Math.round(b * 255)];
    }

    rgbtoint(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b);
    }

    getAngles(a: Array<number>, b: Array<number>, c: Array<number>) {
        // calculate the angle between ab and ac
        var angleAB = Math.atan2(b[1] - a[1], b[0] - a[0]);
        var angleAC = Math.atan2(c[1] - a[1], c[0] - a[0]);
        var angleBC = Math.atan2(b[1] - c[1], b[0] - c[0]);
        var angleA = Math.abs((angleAB - angleAC) * (180 / Math.PI));
        var angleB = Math.abs((angleAB - angleBC) * (180 / Math.PI));
        return [angleA, angleB];
    }

    fastSin(inValue) {
        // See  for graph and equations
        // https://www.desmos.com/calculator/8nkxlrmp7a
        // logic explained here : http://devmaster.net/posts/9648/fast-and-accurate-sine-cosine
        var B = 1.27323954474; // 4/pi
        var C = -0.405284734569; // -4 / (pi²)
        //return B*inValue + C * inValue*Math.abs(inValue);

        if (inValue > 0) {
            return B * inValue + C * inValue * inValue;
        }
        return B * inValue - C * inValue * inValue;
    }

    rectCircleColliding(cPos: Vec2, radius: number, rectPos: Vec2, rectSize: Vec2): number {
        var distX = Math.abs(cPos[0] - rectPos[0] - rectSize[0] / 2);
        var distY = Math.abs(cPos[1] - rectPos[1] - rectSize[1] / 2);

        var res = false;
        if (distX > (rectSize[0] / 2 + radius)) {
            return null
        }
        if (distY > (rectSize[1] / 2 + radius)) {
            return null;
        }

        if (distX <= (rectSize[0] / 2)) {
            res = true;
        }
        if (!res && distY <= (rectSize[1] / 2)) {
            res = true;
        }

        if (!res) {
            var dx = distX - rectSize[0] / 2;
            var dy = distY - rectSize[1] / 2;
            if (dx * dx + dy * dy <= (radius * radius)) res = true; else res = false;
        }

        if (res == true) {
            if (cPos[1] < rectPos[1]) return (rectPos[1] - radius) - cPos[1]; else {
                return (rectPos[1] + rectSize[1] + radius) - cPos[1];
            }
        } else return null;
    }

    mul(v: Vec2, n: number):Vec2 {
        return [v[0]*n, v[1]*n]
    }

    rv2fast(anchorDelta: Vec2, rotation: number) {
        let ca = _.fMath.cos(rotation);
        let sa = _.fMath.sin(rotation);
        let prev0 = anchorDelta[0];
        anchorDelta[0] = ca*anchorDelta[0] - sa*anchorDelta[1];
        anchorDelta[1] = sa*prev0 + ca*anchorDelta[1];
    }

    sqdist(pos: Vec2, pos2: Vec2) {
        return (pos[0] - pos2[0])*(pos[0] - pos2[0]) + (pos[1] - pos2[1])*(pos[1] - pos2[1])
    }

    radiusOver(pos: Vec2, rad: number): Vec2 {
        return [pos[0] + (Math.random() - 0.5)*rad, pos[1] + (Math.random() - 0.5)*rad];
    }

    angleDist(pos: Vec2, dist: number, angle: number): Vec2 {
        return [pos[0] + dist*_.fMath.cos(angle), pos[1] + dist*_.fMath.sin(angle)]
    }

    merge(dataObject: any, state: any): any {
        for (let x in state) {
            if (!dataObject[x] || (typeof dataObject[x] != 'object')) {
                dataObject[x] = state[x]
            } else {
                    dataObject[x] = this.merge(dataObject[x], state[x])
            }
        }
        return dataObject;
    }

    strhexToRgbNormal(hexstr: string): RGBColor {
        let r = parseInt(hexstr.slice(4, 6), 16),
            g = parseInt(hexstr.slice(6, 8), 16),
            b = parseInt(hexstr.slice(8, 10), 16);

        return [r / 255., g / 255., b / 255.]
    }
}

export var m = new M();

