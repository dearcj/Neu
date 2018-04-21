define(["require", "exports", "./BaseObjects/O", "./Math", "../ObjectsList", "./Application"], function (require, exports, O_1, Math_1, ObjectsList_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    var FLIPPED_VERTICALLY_FLAG = 0x40000000;
    var FLIPPED_DIAGONALLY_FLAG = 0x20000000;
    for (var x in ObjectsList_1.ObjectNames) {
        ObjectsList_1.ObjectNames[x.toLowerCase()] = ObjectsList_1.ObjectNames[x];
    }
    var Loader = /** @class */ (function () {
        function Loader() {
            this.loading = false;
            this.levels = {};
            this.tilesets = {};
            this.SkipSpriteExt = false;
        }
        Loader.prototype.removeExt = function (t) {
            return t.replace(/\.[^/.]+$/, "");
        };
        Loader.prototype.add = function (name, data) {
            this.levels[name] = data;
        };
        Loader.extractShortSrc = function (src) {
            src = src.substring(src.lastIndexOf("\\") + 1);
            return src;
        };
        Loader.XMLtoJSON = function (x) {
            if (!x)
                return {};
            var o = {};
            for (var _i = 0, _a = x.children; _i < _a.length; _i++) {
                var c = _a[_i];
                o[c.tagName] = c.textContent;
            }
            return o;
        };
        Loader.addGfxToWorld = function (stage, layerName) {
            if (layerName == 'gui')
                return Application_1.Application.One.sm.gui;
            if (layerName == 'gui2')
                return Application_1.Application.One.sm.gui2;
            if (layerName == 'olgui')
                return Application_1.Application.One.sm.olgui;
            if (layerName == 'light')
                return Application_1.Application.One.sm.light;
            return stage.layers[layerName.toLowerCase()];
        };
        Loader.val = function (obj, tag) {
            var el = obj.getElementsByTagName(tag);
            if (!el.length)
                return;
            return el[0].textContent;
        };
        ///Idea is to load all the objects
        //then translate O to owner gfx
        Loader.prototype.loadToObject = function (stage, name, group, object) {
            var a = this.load(stage, name, null, null, null, group, true, false);
            var list = [];
            this.init(a, false);
            for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
                var x = a_1[_i];
                if (x.gfx) {
                    object.addChild(x);
                }
                list.push(x);
            }
            return list;
        };
        Loader.prototype.loadToContainer = function (stage, name, cb, noCameraOffset, offs, group) {
            if (noCameraOffset === void 0) { noCameraOffset = false; }
            if (offs === void 0) { offs = null; }
            if (group === void 0) { group = null; }
            var c = new PIXI.Container();
            var a = this.load(stage, name, cb, noCameraOffset, offs, group);
            for (var _i = 0, a_2 = a; _i < a_2.length; _i++) {
                var x = a_2[_i];
                if (x.gfx) {
                    O_1.O.rp(x.gfx);
                    c.addChild(x.gfx);
                }
            }
            return { list: a, container: c };
        };
        Loader.prototype.shouldAppear = function (c) {
            var properties = c.getElementsByTagName('properties')[0];
            if (properties) {
                var propertyArray = properties.getElementsByTagName('property');
                for (var _i = 0, propertyArray_1 = propertyArray; _i < propertyArray_1.length; _i++) {
                    var p = propertyArray_1[_i];
                    if (p.attributes.name.value.toLowerCase() == 'appear') {
                        var prob = parseFloat(p.attributes.value.value);
                        if (Math.random() * 100 > prob)
                            return false;
                    }
                }
            }
            return true;
        };
        Loader.prototype.load = function (stage, name, preInitCB, noCameraOffset, offs, restrictGroup, addObjects, doInit) {
            var _this = this;
            if (preInitCB === void 0) { preInitCB = null; }
            if (noCameraOffset === void 0) { noCameraOffset = false; }
            if (offs === void 0) { offs = null; }
            if (restrictGroup === void 0) { restrictGroup = null; }
            if (addObjects === void 0) { addObjects = true; }
            if (doInit === void 0) { doInit = true; }
            this.loading = true;
            var data = this.levels[name];
            if (!data) {
                console.log('No such level as ' + name);
                return;
            }
            var bigtilesets = [];
            var images = {};
            var map = this.levels[name].getElementsByTagName("map")[0];
            var tw = parseFloat(map.attributes['tilewidth'].value);
            var th = parseFloat(map.attributes['tileheight'].value);
            var objectsList = [];
            var globalProperties = this.getProps(map);
            if (addObjects)
                this.updateGlobalMapParams(globalProperties);
            var tilesets = map.getElementsByTagName("tileset");
            for (var _i = 0, tilesets_1 = tilesets; _i < tilesets_1.length; _i++) {
                var t = tilesets_1[_i];
                var firstgid = t.attributes['firstgid'] ? t.attributes['firstgid'].value : 0;
                if (t.attributes['source']) {
                    var source = t.attributes['source'].value;
                    var sourceNoExt = source.substring(0, source.length - 4);
                    t = this.tilesets[sourceNoExt].children[0];
                }
                var tilecount = t.attributes['tilecount'].value;
                var columns = t.attributes['columns'].value;
                var tiles = t.getElementsByTagName('tile');
                if (!tiles[0]) {
                    var img = t.getElementsByTagName('image')[0];
                    if (img)
                        bigtilesets.push({
                            firstgid: firstgid,
                            tilecount: tilecount,
                            tw: tw,
                            th: th,
                            columns: columns,
                            texname: img.attributes.source.value,
                        });
                }
                else {
                    for (var _a = 0, tiles_1 = tiles; _a < tiles_1.length; _a++) {
                        var t_1 = tiles_1[_a];
                        var img = t_1.getElementsByTagName('image')[0];
                        if (!img)
                            continue;
                        images[parseInt(t_1.attributes.id.value) + parseInt(firstgid)] = {
                            tilesetWidth: tw,
                            tilesetHeight: th,
                            width: img.attributes.width ? img.attributes.width.value : 0,
                            height: img.attributes.height ? img.attributes.height.value : 0,
                            source: img.attributes.source.value.replace(/^.*[\\\/]/, ''),
                        };
                    }
                }
            }
            var addObjectsFunc = function (c, ox, oy) {
                if (c.nodeName == 'layer') {
                    var name_1 = c.attributes.name.value.toLowerCase();
                    var offset = [c.attributes.offsetx ? parseFloat(c.attributes.offsetx.value) : 0, c.attributes.offsety ? parseFloat(c.attributes.offsety.value) : 0];
                    offset[0] += ox;
                    offset[1] += oy;
                    if (!stage.layers[name_1]) {
                        stage.addLayer(name_1, null);
                    }
                    if (!_this.shouldAppear(c)) {
                        return;
                    }
                    if (addObjects)
                        objectsList = objectsList.concat(_this.addLayer(stage, c, bigtilesets, images, offset));
                }
                if (c.nodeName == 'objectgroup') {
                    var name_2 = c.attributes.name.value.toLowerCase();
                    if (!stage.layers[name_2]) {
                        stage.addLayer(name_2, null);
                    }
                    if (!_this.shouldAppear(c)) {
                        return;
                    }
                    if (addObjects)
                        objectsList = objectsList.concat(_this.addObjectGroup(stage, c, images));
                }
            };
            for (var _b = 0, _c = map.childNodes; _b < _c.length; _b++) {
                var c = _c[_b];
                if (c.nodeName == 'group' && (!restrictGroup || c.attributes.name.value.toLowerCase() == restrictGroup.toLowerCase())) {
                    var ox = c.attributes.offsetx ? parseFloat(c.attributes.offsetx.value) : 0;
                    var oy = c.attributes.offsety ? parseFloat(c.attributes.offsety.value) : 0;
                    for (var _d = 0, _e = c.childNodes; _d < _e.length; _d++) {
                        var x = _e[_d];
                        addObjectsFunc(x, ox, oy);
                    }
                }
                else {
                    addObjectsFunc(c, 0, 0);
                }
            }
            if (offs != null) {
                for (var _f = 0, objectsList_1 = objectsList; _f < objectsList_1.length; _f++) {
                    var x = objectsList_1[_f];
                    x.pos[0] += offs[0];
                    x.pos[1] += offs[1];
                }
            }
            this.objectsList = objectsList;
            //let startLoad = (new Date()).getTime();
            if (preInitCB)
                preInitCB(objectsList, globalProperties);
            if (doInit)
                this.init(objectsList, noCameraOffset);
            //let total = ((new Date()).getTime() - startLoad) / 1000.;
            //console.log(objectsList.length, " objects. Load level ", total);
            this.objectsList = null;
            this.loading = false;
            return objectsList;
        };
        Loader.prototype.getProps = function (node) {
            var globalProperties = [];
            var props;
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var pchildren = _a[_i];
                if (pchildren.tagName == 'properties') {
                    props = pchildren;
                    break;
                }
            }
            if (props) {
                var propertyArray = props.getElementsByTagName('property');
                for (var _b = 0, propertyArray_2 = propertyArray; _b < propertyArray_2.length; _b++) {
                    var p = propertyArray_2[_b];
                    if (p.attributes.value)
                        globalProperties[p.attributes.name.value] = p.attributes.value.value;
                }
            }
            return globalProperties;
        };
        Loader.prototype.addObjectGroup = function (stage, objectGroup, images) {
            var objectsList = [];
            var name = objectGroup.attributes.name.value;
            var offsetx = objectGroup.attributes.offsetx ? parseFloat(objectGroup.attributes.offsetx.value) : 0;
            var offsety = objectGroup.attributes.offsety ? parseFloat(objectGroup.attributes.offsety.value) : 0;
            var objects = objectGroup.getElementsByTagName('object');
            var globalProperties = this.getProps(objectGroup);
            for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                var o = objects_1[_i];
                var gid = o.attributes.gid ? parseInt(o.attributes.gid.value) : -1;
                var flipped_horizontally = false;
                var flipped_vertically = false;
                var textureName = void 0;
                var image = void 0;
                if (gid > 0) {
                    flipped_horizontally = (gid & FLIPPED_HORIZONTALLY_FLAG) == -FLIPPED_HORIZONTALLY_FLAG;
                    flipped_vertically = (gid & FLIPPED_VERTICALLY_FLAG) == FLIPPED_VERTICALLY_FLAG;
                    if (flipped_horizontally)
                        gid &= ~FLIPPED_HORIZONTALLY_FLAG;
                    if (flipped_vertically)
                        gid &= ~FLIPPED_VERTICALLY_FLAG;
                    image = images[gid];
                    if (!image) {
                        console.log("Can't load texture with Tile Id: ", gid);
                    }
                    else {
                        textureName = image.source;
                        if (this.SkipSpriteExt) {
                            textureName = this.removeExt(textureName);
                        }
                    }
                }
                var oo = this.createObject(stage, o, textureName, offsetx, offsety, image ? image.source : null, name, globalProperties, flipped_horizontally, flipped_vertically);
                if (oo)
                    objectsList.push(oo);
            }
            if (globalProperties["color"])
                this.setLayerColor(objectsList, parseInt(globalProperties["color"].replace('#', '0x')));
            if (globalProperties["light"])
                this.setLayerLightColor(objectsList, parseInt(globalProperties["light"].replace('#', '0x')));
            return objectsList;
        };
        Loader.prototype.createGfx = function (o, textureName, x, y, frameName, properties) {
            var w = o.attributes.width.value;
            var h = o.attributes.height.value;
            var gfx;
            if (properties['movieclip'] == 'true') {
                var noExtensionFrameName = frameName.replace(/\.[^/.]+$/, "");
                var noDigitsFrameName = noExtensionFrameName.replace(/[0-9]/g, '');
                gfx = Application_1.Application.One.cm(noDigitsFrameName);
                if (properties['randomstart'] == 'true') {
                    gfx.gotoAndPlay(Math_1.m.rint(0, gfx.totalFrames - 1));
                }
                else {
                    gfx.gotoAndPlay(0);
                }
                gfx.loop = true;
                gfx.animationSpeed = 0.35;
            }
            else {
                //TODO: camera
                gfx = Application_1.Application.One.cs(textureName);
            }
            gfx.anchor.x = .5;
            gfx.anchor.y = .5;
            gfx.width = w;
            gfx.height = h;
            gfx.position.x = 0;
            gfx.position.y = 0;
            gfx.alpha = properties['alpha'] ? properties['alpha'] : 1;
            var blendMode = properties['blendMode'] ? properties['blendMode'].toLowerCase() : '';
            if (blendMode || blendMode == 'normal')
                gfx.blendMode = PIXI.BLEND_MODES.NORMAL;
            if (blendMode == 'add')
                gfx.blendMode = PIXI.BLEND_MODES.ADD;
            if (blendMode == 'multiply')
                gfx.blendMode = PIXI.BLEND_MODES.MULTIPLY;
            if (blendMode == 'screen')
                gfx.blendMode = PIXI.BLEND_MODES.SCREEN;
            if (blendMode == 'overlay')
                gfx.blendMode = PIXI.BLEND_MODES.OVERLAY;
            if (blendMode == 'darken')
                gfx.blendMode = PIXI.BLEND_MODES.DARKEN;
            //if (blendMode == 'lighten') gfx.blendMode = PIXI.BLEND_MODES.LIGTHEN;
            if (blendMode == 'dodge')
                gfx.blendMode = PIXI.BLEND_MODES.COLOR_DODGE;
            if (blendMode == 'burn')
                gfx.blendMode = PIXI.BLEND_MODES.COLOR_BURN;
            if (blendMode == 'hardLight')
                gfx.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
            if (blendMode == 'softLight')
                gfx.blendMode = PIXI.BLEND_MODES.SOFT_LIGHT;
            if (blendMode == 'difference')
                gfx.blendMode = PIXI.BLEND_MODES.DIFFERENCE;
            if (blendMode == 'exclusion')
                gfx.blendMode = PIXI.BLEND_MODES.EXCLUSION;
            if (blendMode == 'hue')
                gfx.blendMode = PIXI.BLEND_MODES.HUE;
            if (blendMode == 'saturation')
                gfx.blendMode = PIXI.BLEND_MODES.SATURATION;
            if (blendMode == 'color')
                gfx.blendMode = PIXI.BLEND_MODES.COLOR;
            if (blendMode == 'luminosity')
                gfx.blendMode = PIXI.BLEND_MODES.LUMINOSITY;
            return gfx;
        };
        Loader.prototype.createObject = function (stage, o, textureName, offsetx, offsety, frameName, layerName, groupProps, flipX, flipY) {
            var id = o.attributes.id.value;
            var x = parseFloat(o.attributes.x.value);
            var y = parseFloat(o.attributes.y.value);
            var w = o.attributes.width ? parseFloat(o.attributes.width.value) : 0;
            var h = o.attributes.height ? parseFloat(o.attributes.height.value) : 0;
            var name = o.attributes.name ? o.attributes.name.value : '';
            var type = o.attributes.type ? o.attributes.type.value : '';
            var rot = o.attributes.rotation ? o.attributes.rotation.value : 0;
            rot = Math.PI * (rot / 180);
            //DO THIS ONLY FOR GFX SPRITES
            var offsetVec;
            if (textureName) {
                offsetVec = [w / 2, -h / 2];
            }
            else {
                offsetVec = [w / 2, h / 2];
            }
            offsetVec = Math_1.m.rv2(offsetVec, rot);
            x += offsetVec[0];
            y += offsetVec[1];
            var polylines = o.getElementsByTagName('polyline');
            var polyline;
            if (polylines.length > 0)
                polyline = polylines[0];
            var polygons = o.getElementsByTagName('polygon');
            var polygon;
            if (polygons.length > 0)
                polygon = polygons[0];
            var props = o.getElementsByTagName('property');
            var properties = {};
            for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
                var x_1 = props_1[_i];
                properties[x_1.attributes.name.value] = x_1.attributes.value ? x_1.attributes.value.value : x_1.textContent;
            }
            for (var x_2 in groupProps) {
                properties[x_2] = groupProps[x_2];
            }
            if (properties.server)
                return;
            var className = '';
            if (properties["type"])
                className = properties["type"];
            if (type != '') {
                className = type;
            }
            if (properties["singleton"] == 'true') {
                //UniqueCheck
                if (ObjectsList_1.ObjectNames[className] && Application_1.Application.One.sm.findByType(ObjectsList_1.ObjectNames[className]).length > 0) {
                    return null;
                }
            }
            var obj;
            var startPos = [x + offsetx, y + offsety];
            if (className && className.toLowerCase() == 'skip') {
                return null;
            }
            if (className != '') {
                if (!ObjectsList_1.ObjectNames[className]) {
                    console.log('[LevelManager] Cant find class: ', className);
                }
                obj = new (ObjectsList_1.ObjectNames[className])(startPos);
            }
            else {
                obj = new O_1.O(startPos);
            }
            obj.stringID = name;
            if (polygon) {
                properties["polygon"] = polygon.attributes.points.value;
            }
            if (polyline) {
                properties["polyline"] = polyline.attributes.points.value;
            }
            obj.polygon = properties['polygon'];
            obj.polyline = properties['polyline'];
            if (textureName) { //has gfx
                obj.gfx = this.createGfx(o, textureName, 0, 0, frameName, properties);
            }
            var visibility = properties['visible'] == 'false' ? false : true;
            if (obj.gfx)
                obj.gfx.visible = visibility;
            var layer = Loader.addGfxToWorld(stage, layerName);
            obj.layer = layer;
            if (obj.gfx)
                layer.addChild(obj.gfx);
            if (obj.gfx) {
                if (flipX)
                    obj.gfx.scale.x = -obj.gfx.scale.x;
                if (flipY) {
                    obj.gfx.scale.y = -obj.gfx.scale.y;
                }
                obj.gfx.rotation = rot;
            }
            obj.a = rot;
            obj.width = w;
            obj.height = h;
            obj.properties = properties;
            return obj;
        };
        Loader.prototype.addLayer = function (stage, layer, bigtilesets, images, offset) {
            var objectsList = [];
            var data = layer.getElementsByTagName('data')[0];
            var str = data.textContent;
            str = str.replace(/\r?\n|\r/g, '');
            var name = layer.attributes.name.value;
            var arr = str.split(',');
            var len = arr.length;
            var layerWidth = layer.attributes.width.value;
            var layerHeight = layer.attributes.height.value;
            var globalProperties = this.getProps(layer);
            for (var i = 0; i < len; i++) {
                if (arr[i] > 0) {
                    var textureName = void 0;
                    var tileID = arr[i];
                    if (images[tileID]) {
                        textureName = images[tileID].source;
                    }
                    else {
                        for (var _i = 0, bigtilesets_1 = bigtilesets; _i < bigtilesets_1.length; _i++) {
                            var bt = bigtilesets_1[_i];
                            if (bt.firstgid >= tileID && tileID < bt.firstgid + bt.tilecount) {
                                break;
                            }
                        }
                        if (!bt)
                            continue;
                        textureName = bt.texname;
                    }
                    if (this.SkipSpriteExt) {
                        textureName = this.removeExt(textureName);
                    }
                    var col = Math.floor(i % layerWidth);
                    var row = Math.floor(i / layerWidth);
                    var posX = col * images[tileID].tilesetWidth;
                    var posY = row * images[tileID].tilesetHeight - (parseFloat(images[tileID].height) - images[tileID].tilesetHeight);
                    var type = globalProperties['type'];
                    var layername = globalProperties['name'];
                    var o = this.spawnTile(stage, textureName, posX + offset[0], posY + offset[1], name, type, layername);
                    o.properties = globalProperties;
                    objectsList.push(o);
                }
            }
            if (globalProperties["color"])
                this.setLayerColor(objectsList, parseInt(globalProperties["color"].replace('#', '0x')));
            if (globalProperties["light"])
                this.setLayerLightColor(objectsList, parseInt(globalProperties["light"].replace('#', '0x')));
            return objectsList;
        };
        Loader.prototype.spawnTile = function (stage, textureName, posX, posY, layerName, type, layerStringID) {
            var sprite = Application_1.Application.One.cs(textureName);
            sprite.anchor.x = 0.;
            sprite.anchor.y = 0.;
            var o;
            if (type && type != '') {
                o = new ObjectsList_1.ObjectNames[type.toLowerCase()]([posX, posY]);
            }
            else {
                o = new O_1.O([posX, posY]);
            }
            o.stringID = layerStringID;
            o.gfx = sprite;
            var layer = Loader.addGfxToWorld(stage, layerName);
            o.layer = layer;
            layer.addChild(sprite);
            return o;
        };
        Loader.prototype.init = function (list, noCameraOffset) {
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var o = list_1[_i];
                o.noCameraOffset = noCameraOffset;
                var start = (new Date()).getTime();
                o.init(o.properties);
                var end = (new Date()).getTime();
                if ((end - start) / 1000 > 0.05) {
                    console.log("ANUS");
                }
            }
        };
        Loader.prototype.getGroups = function (level, filter) {
            if (filter === void 0) { filter = null; }
            var map = this.levels[level].getElementsByTagName("map")[0];
            var arr = [];
            for (var _i = 0, _a = map.childNodes; _i < _a.length; _i++) {
                var c = _a[_i];
                if (c.nodeName == 'group') {
                    var name_3 = c.attributes.name.value.toLowerCase();
                    if (!filter) {
                        arr.push(name_3);
                    }
                    else {
                        if (~name_3.indexOf(filter)) {
                            arr.push(name_3);
                        }
                    }
                }
            }
            return arr;
        };
        Loader.prototype.setLayerLightColor = function (objectsList, color) {
            for (var _i = 0, objectsList_2 = objectsList; _i < objectsList_2.length; _i++) {
                var x = objectsList_2[_i];
                if (x.gfx && x.gfx.color) {
                    var col = Math_1.m.numhexToRgb(color);
                    x.gfx.color.setDark(col[1] / 255, col[2] / 255, col[3] / 255);
                }
            }
        };
        Loader.prototype.setLayerColor = function (objectsList, color) {
            for (var _i = 0, objectsList_3 = objectsList; _i < objectsList_3.length; _i++) {
                var x = objectsList_3[_i];
                if (x.gfx && x.gfx.color) {
                    var col = Math_1.m.numhexToRgb(color);
                    x.gfx.color.setLight(col[1] / 255, col[2] / 255, col[3] / 255);
                }
            }
        };
        Loader.prototype.loadLayersFromLevelGroup = function (stage, level, group) {
            this.load(stage, level, null, false, null, group, false);
        };
        Loader.prototype.loadGFXonly = function (stage, level, offs, container) {
            var list = this.load(stage, level, null, false, offs, null, true, false);
            var retList = [];
            for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
                var x = list_2[_i];
                if (x.gfx) {
                    O_1.O.rp(x.gfx);
                    x.gfx.x = x.x;
                    x.gfx.y = x.y;
                    container.addChild(x.gfx);
                    retList.push(x.gfx);
                    x.gfx = null;
                }
            }
            Application_1.Application.One.sm.removeList(list);
            return retList;
        };
        Loader.prototype.addTileset = function (result, data) {
            this.tilesets[result] = data;
        };
        Loader.prototype.updateGlobalMapParams = function (globalProperties) {
            if (this.customGlobalParamsCallback) {
                this.customGlobalParamsCallback(globalProperties);
            }
        };
        return Loader;
    }());
    exports.Loader = Loader;
});
