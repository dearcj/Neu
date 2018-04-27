/**
 * Created by Михаил on 27.06.2014.
 */
define(["require", "exports", "../main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function binarySearch(array, target, comparator) {
        var l = 0, h = array.length - 1, m, comparison;
        comparator = comparator || function (a, b) {
            return (a < b ? -1 : (a > b ? 1 : 0)); /* default comparison method if one was not provided */
        };
        while (l <= h) {
            m = (l + h) >>> 1; /* equivalent to Math.floor((l + h) / 2) but faster */
            comparison = comparator(array[m], target);
            if (comparison < 0) {
                l = m + 1;
            }
            else if (comparison > 0) {
                h = m - 1;
            }
            else {
                return m;
            }
        }
        return ~l;
    }
    exports.binarySearch = binarySearch;
    function binaryInsert(array, target, duplicate, comparator) {
        var i = binarySearch(array, target, comparator);
        if (i >= 0) {
            if (!duplicate) {
                return i;
            }
        }
        else {
            i = ~i;
        }
        array.splice(i, 0, target);
        return i;
    }
    exports.binaryInsert = binaryInsert;
    var M = /** @class */ (function () {
        function M() {
        }
        M.prototype.v2cp = function (v) {
            return [v[0], v[1]];
        };
        M.prototype.perp = function (v) {
            return [-v[1], v[0]];
        };
        M.prototype.dot = function (v1, v2) {
            return v1[0] * v2[0] + v1[1] * v2[1];
        };
        M.prototype.v2len = function (v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        };
        M.prototype.subv2 = function (v1, v2) {
            return [v1[0] - v2[0], v1[1] - v2[1]];
        };
        M.prototype.v2prod = function (v1, v2) {
            return [v1[0] * v2[0], v1[1] * v2[1]];
        };
        M.prototype.av2 = function (v, v2) {
            return [v[0] + v2[0], v[1] + v2[1]];
        };
        M.prototype.mv2 = function (v, delta) {
            return [v[0] * delta, v[1] * delta];
        };
        M.prototype.normalizeV2 = function (v) {
            var l = Math.sqrt(v[0] * v[0] + v[1] * v[1]) + 0.0000001;
            v[0] /= l;
            v[1] /= l;
            return v;
        };
        M.prototype.shuffle = function (a) {
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                _a = [a[j], a[i]], a[i] = _a[0], a[j] = _a[1];
            }
            return a;
            var _a;
        };
        M.prototype.numhexToRgb = function (numhex) {
            var r = numhex >> 16;
            var g = numhex >> 8 & 0xFF;
            var b = numhex & 0xFF;
            return [255, r, g, b];
        };
        M.prototype.numhexToRgbNormal = function (numhex) {
            var r = numhex >> 16;
            var g = numhex >> 8 & 0xFF;
            var b = numhex & 0xFF;
            return [r / 255., g / 255., b / 255.];
        };
        M.prototype.decimalAdjust = function (type, value, exp) {
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
        };
        M.prototype.rv2 = function (v, r) {
            var ca = Math.cos(r);
            var sa = Math.sin(r);
            return [ca * v[0] - sa * v[1], sa * v[0] + ca * v[1]];
        };
        M.prototype.round10 = function (value, exp) {
            if (exp === void 0) { exp = -1; }
            return this.decimalAdjust('round', value, exp);
        };
        M.prototype.lerp = function (a, b, d) {
            return a + (b - a) * d;
        };
        M.prototype.sign = function (v) {
            if (v == 0)
                return 0;
            if (v > 0)
                return 1;
            else
                return -1;
        };
        M.prototype.rint = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        M.prototype.getRand = function (obj) {
            return obj[Math.floor(Math.random() * obj.length)];
        };
        M.prototype.hexToRgb = function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16),
                parseInt(result[4], 16),
            ] : null;
        };
        M.prototype.hslToRgb = function (h, s, l) {
            var r, g, b;
            if (s == 0) {
                r = g = b = l; // achromatic
            }
            else {
                var hue2rgb = function hue2rgb(p, q, t) {
                    if (t < 0)
                        t += 1;
                    if (t > 1)
                        t -= 1;
                    if (t < 1 / 6)
                        return p + (q - p) * 6 * t;
                    if (t < 1 / 2)
                        return q;
                    if (t < 2 / 3)
                        return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return this.rgbtoint(r * 255, g * 255, b * 255); // [Math.round(r* 255), Math.round(g * 255), Math.round(b * 255)];
        };
        M.prototype.rgbtoint = function (r, g, b) {
            return ((1 << 24) + (r << 16) + (g << 8) + b);
        };
        M.prototype.getAngles = function (a, b, c) {
            // calculate the angle between ab and ac
            var angleAB = Math.atan2(b[1] - a[1], b[0] - a[0]);
            var angleAC = Math.atan2(c[1] - a[1], c[0] - a[0]);
            var angleBC = Math.atan2(b[1] - c[1], b[0] - c[0]);
            var angleA = Math.abs((angleAB - angleAC) * (180 / Math.PI));
            var angleB = Math.abs((angleAB - angleBC) * (180 / Math.PI));
            return [angleA, angleB];
        };
        M.prototype.fastSin = function (inValue) {
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
        };
        M.prototype.rectCircleColliding = function (cPos, radius, rectPos, rectSize) {
            var distX = Math.abs(cPos[0] - rectPos[0] - rectSize[0] / 2);
            var distY = Math.abs(cPos[1] - rectPos[1] - rectSize[1] / 2);
            var res = false;
            if (distX > (rectSize[0] / 2 + radius)) {
                return null;
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
                if (dx * dx + dy * dy <= (radius * radius))
                    res = true;
                else
                    res = false;
            }
            if (res == true) {
                if (cPos[1] < rectPos[1])
                    return (rectPos[1] - radius) - cPos[1];
                else {
                    return (rectPos[1] + rectSize[1] + radius) - cPos[1];
                }
            }
            else
                return null;
        };
        M.prototype.mul = function (v, n) {
            return [v[0] * n, v[1] * n];
        };
        M.prototype.rv2fast = function (anchorDelta, rotation) {
            var ca = main_1._.fMath.cos(rotation);
            var sa = main_1._.fMath.sin(rotation);
            var prev0 = anchorDelta[0];
            anchorDelta[0] = ca * anchorDelta[0] - sa * anchorDelta[1];
            anchorDelta[1] = sa * prev0 + ca * anchorDelta[1];
        };
        M.prototype.sqdist = function (pos, pos2) {
            return (pos[0] - pos2[0]) * (pos[0] - pos2[0]) + (pos[1] - pos2[1]) * (pos[1] - pos2[1]);
        };
        M.prototype.radiusOver = function (pos, rad) {
            return [pos[0] + (Math.random() - 0.5) * rad, pos[1] + (Math.random() - 0.5) * rad];
        };
        M.prototype.angleDist = function (pos, dist, angle) {
            return [pos[0] + dist * main_1._.fMath.cos(angle), pos[1] + dist * main_1._.fMath.sin(angle)];
        };
        M.prototype.merge = function (dataObject, state) {
            for (var x in state) {
                if (!dataObject[x] || (typeof dataObject[x] != 'object')) {
                    dataObject[x] = state[x];
                }
                else {
                    dataObject[x] = this.merge(dataObject[x], state[x]);
                }
            }
            return dataObject;
        };
        M.prototype.strhexToRgbNormal = function (hexstr) {
            var r = parseInt(hexstr.slice(4, 6), 16), g = parseInt(hexstr.slice(6, 8), 16), b = parseInt(hexstr.slice(8, 10), 16);
            return [r / 255., g / 255., b / 255.];
        };
        return M;
    }());
    exports.m = new M();
});
