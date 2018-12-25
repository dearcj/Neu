define(["require", "exports", "./BaseObjects/O", "./Math", "../ObjectsList", "./Application"], function (require, exports, O_1, Math_1, ObjectsList_1, Application_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    var FLIPPED_VERTICALLY_FLAG = 0x40000000;
    var FLIPPED_DIAGONALLY_FLAG = 0x20000000;
    for (var x in ObjectsList_1.ObjectNames) {
        ObjectsList_1.ObjectNames[x.toLowerCase()] = ObjectsList_1.ObjectNames[x];
    }
    function extractBlendMode(bm) {
        switch (bm) {
            case 'normal':
                return Application_1.PIXI.BLEND_MODES.NORMAL;
                break;
            case 'add':
                return Application_1.PIXI.BLEND_MODES.ADD;
                break;
            case 'multiply':
                return Application_1.PIXI.BLEND_MODES.MULTIPLY;
                break;
            case 'screen':
                return Application_1.PIXI.BLEND_MODES.SCREEN;
                break;
            case 'overlay':
                return Application_1.PIXI.BLEND_MODES.OVERLAY;
                break;
            case 'darken':
                return Application_1.PIXI.BLEND_MODES.DARKEN;
                break;
            case 'dodge':
                return Application_1.PIXI.BLEND_MODES.COLOR_DODGE;
                break;
            case 'burn':
                return Application_1.PIXI.BLEND_MODES.COLOR_BURN;
                break;
            case 'hardlight':
                return Application_1.PIXI.BLEND_MODES.HARD_LIGHT;
                break;
            case 'softlight':
                return Application_1.PIXI.BLEND_MODES.SOFT_LIGHT;
                break;
            case 'difference':
                return Application_1.PIXI.BLEND_MODES.DIFFERENCE;
                break;
            case 'exclusion':
                return Application_1.PIXI.BLEND_MODES.EXCLUSION;
                break;
            case 'hue':
                return Application_1.PIXI.BLEND_MODES.HUE;
                break;
            case 'saturation':
                return Application_1.PIXI.BLEND_MODES.SATURATION;
                break;
            case 'color':
                return Application_1.PIXI.BLEND_MODES.COLOR;
                break;
            case 'luminosity':
                return Application_1.PIXI.BLEND_MODES.LUMINOSITY;
                break;
        }
        return Application_1.PIXI.BLEND_MODES.NORMAL;
    }
    exports.extractBlendMode = extractBlendMode;
    var Loader = /** @class */ (function () {
        function Loader() {
            this.loading = false;
            this.levels = {};
            this.tilesets = {};
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
                /*if (x.constructor == O && x.gfx) {
                               Application.One.rp(x.gfx);
                                object.gfx.addChild(x.gfx);
                               x.gfx = null;
                               x.killNow();
                           } else {
                               list.push(x)
                           }*/
            }
            return list;
        };
        Loader.prototype.loadToContainer = function (stage, name, cb, noCameraOffset, offs, group) {
            if (noCameraOffset === void 0) { noCameraOffset = false; }
            if (offs === void 0) { offs = null; }
            if (group === void 0) { group = null; }
            var c = new Application_1.PIXI.Container();
            var a = this.load(stage, name, cb, noCameraOffset, offs, group);
            for (var _i = 0, a_2 = a; _i < a_2.length; _i++) {
                var x = a_2[_i];
                if (x.gfx) {
                    Application_1.Application.One.rp(x.gfx);
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
                    if (p.attributes.getNamedItem('name').nodeValue.toLowerCase() == 'appear') {
                        var prob = parseFloat(p.attributes.getNamedItem('value').nodeValue);
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
                throw 'No such level as ' + name;
                console.log('No such level as ', name);
                return;
            }
            var bigtilesets = [];
            var images = {};
            var map = this.levels[name].getElementsByTagName("map")[0];
            var tw = parseFloat(map.attributes.getNamedItem('tilewidth').nodeValue);
            var th = parseFloat(map.attributes.getNamedItem('tileheight').nodeValue);
            var objectsList = [];
            var globalProperties = this.getProps(map);
            if (addObjects)
                this.updateGlobalMapParams(globalProperties);
            var tilesets = map.getElementsByTagName("tileset");
            for (var _i = 0, tilesets_1 = tilesets; _i < tilesets_1.length; _i++) {
                var t = tilesets_1[_i];
                var firstgid = t.attributes.getNamedItem('firstgid') ? t.attributes.getNamedItem('firstgid').nodeValue : 0;
                var sourceAttr = t.attributes.getNamedItem('source');
                if (sourceAttr) {
                    var source = sourceAttr.nodeValue;
                    var sourceNoExt = source.substring(0, source.length - 4);
                    t = this.tilesets[sourceNoExt].childNodes[0];
                }
                var tilecount = t.attributes.getNamedItem('tilecount').nodeValue;
                var columns = t.attributes.getNamedItem('columns').nodeValue;
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
                            texname: img.attributes.getNamedItem('source').nodeValue,
                        });
                }
                else {
                    for (var _a = 0, tiles_1 = tiles; _a < tiles_1.length; _a++) {
                        var t_1 = tiles_1[_a];
                        var img = t_1.getElementsByTagName('image')[0];
                        if (!img)
                            continue;
                        var watr = img.attributes.getNamedItem('width');
                        var hatr = img.attributes.getNamedItem('height');
                        var sourceattr = img.attributes.getNamedItem('source');
                        images[parseInt(t_1.attributes.getNamedItem('id').nodeValue) + parseInt(firstgid)] = {
                            tilesetWidth: tw,
                            tilesetHeight: th,
                            width: watr ? watr.nodeValue : 0,
                            height: hatr ? hatr.nodeValue : 0,
                            source: sourceattr.nodeValue.replace(/^.*[\\\/]/, ''),
                        };
                    }
                }
            }
            var addObjectsFunc = function (c, ox, oy) {
                if (c.nodeName == 'layer') {
                    var name_1 = c.attributes.getNamedItem('name').nodeValue.toLowerCase();
                    var ofsXattr = c.attributes.getNamedItem('offsetx');
                    var ofsYattr = c.attributes.getNamedItem('offsety');
                    var offset = [ofsXattr ? parseFloat(ofsXattr.nodeValue) : 0, ofsYattr ? parseFloat(ofsYattr.nodeValue) : 0];
                    offset[0] += ox;
                    offset[1] += oy;
                    var layerProps = _this.getProps(c);
                    if (!stage.layers[name_1]) {
                        stage.addLayer(name_1, null);
                    }
                    if (!_this.shouldAppear(c)) {
                        return;
                    }
                    if (addObjects)
                        objectsList = objectsList.concat(_this.addLayer(stage, c, bigtilesets, images, offset, layerProps));
                }
                if (c.nodeName == 'objectgroup') {
                    var layerProps = _this.getProps(c);
                    var name_2 = c.attributes.getNamedItem('name').nodeValue.toLowerCase();
                    if (!stage.layers[name_2]) {
                        stage.addLayer(name_2, null);
                    }
                    if (!_this.shouldAppear(c)) {
                        return;
                    }
                    if (addObjects)
                        objectsList = objectsList.concat(_this.addObjectGroup(stage, c, images, layerProps));
                }
            };
            var haveRestrictedGroup = false;
            for (var _b = 0, _c = map.childNodes; _b < _c.length; _b++) {
                var c = _c[_b];
                if (c.nodeName == 'group' && (!restrictGroup || c.attributes.getNamedItem('name').nodeValue.toLowerCase() == restrictGroup.toLowerCase())) {
                    var offsXattr = c.attributes.getNamedItem('offsetx');
                    var offsYattr = c.attributes.getNamedItem('offsety');
                    var ox = offsXattr ? parseFloat(offsXattr.nodeValue) : 0;
                    var oy = offsYattr ? parseFloat(offsYattr.nodeValue) : 0;
                    haveRestrictedGroup = true;
                    for (var _d = 0, _e = c.childNodes; _d < _e.length; _d++) {
                        var x = _e[_d];
                        addObjectsFunc(x, ox, oy);
                    }
                }
                else {
                    addObjectsFunc(c, 0, 0);
                }
            }
            if (restrictGroup != null && !haveRestrictedGroup) {
                throw "No such restricted group";
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
            this.objectsList = null;
            this.loading = false;
            return objectsList;
        };
        Loader.prototype.getProps = function (node) {
            var globalProperties = [];
            var props;
            for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
                var pchildren = _a[_i];
                if (pchildren.nodeName == 'properties') {
                    props = pchildren;
                    break;
                }
            }
            if (props) {
                var propertyArray = props.childNodes;
                for (var _b = 0, propertyArray_2 = propertyArray; _b < propertyArray_2.length; _b++) {
                    var p = propertyArray_2[_b];
                    if (p.nodeName == 'property')
                        globalProperties[p.attributes.getNamedItem('name').nodeValue] = p.attributes.getNamedItem('value').nodeValue;
                }
            }
            return globalProperties;
        };
        Loader.prototype.addObjectGroup = function (stage, objectGroup, images, layerProps) {
            var objectsList = [];
            var name = objectGroup.attributes.getNamedItem('name').nodeValue;
            var ofsXattr = objectGroup.attributes.getNamedItem('offsetx');
            var ofsYattr = objectGroup.attributes.getNamedItem('offsety');
            var offsetx = ofsXattr ? parseFloat(ofsXattr.nodeValue) : 0;
            var offsety = ofsYattr ? parseFloat(ofsYattr.nodeValue) : 0;
            var objects = objectGroup.getElementsByTagName('object');
            for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                var o = objects_1[_i];
                var gidAttr = o.attributes.getNamedItem('gid');
                var gid = gidAttr ? parseInt(gidAttr.nodeValue) : -1;
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
                        if (Loader.SkipSpriteExt) {
                            textureName = this.removeExt(textureName);
                        }
                    }
                }
                var oo = this.createObject(stage, o, textureName, offsetx, offsety, image ? image.source : null, name, layerProps, flipped_horizontally, flipped_vertically);
                if (oo)
                    objectsList.push(oo);
            }
            if (layerProps["color"])
                this.setLayerColor(objectsList, layerProps["color"]);
            if (layerProps["light"])
                this.setLayerLightColor(objectsList, layerProps["light"]);
            return objectsList;
        };
        Loader.prototype.createGfx = function (o, textureName, x, y, frameName, properties) {
            var w = parseFloat(o.attributes.getNamedItem('width').nodeValue);
            var h = parseFloat(o.attributes.getNamedItem('height').nodeValue);
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
                gfx = Application_1.Application.One.cs(textureName);
            }
            gfx.anchor.x = .5;
            gfx.anchor.y = .5;
            gfx.width = w;
            gfx.height = h;
            gfx.position.x = 0;
            gfx.position.y = 0;
            gfx.alpha = properties['alpha'] ? properties['alpha'] : 1;
            if (properties['blendMode']) {
                gfx.blendMode = extractBlendMode(properties['blendMode'].toLowerCase());
            }
            return gfx;
        };
        Loader.prototype.createObject = function (stage, o, textureName, offsetx, offsety, frameName, layerName, groupProps, flipX, flipY) {
            var id = o.attributes.getNamedItem('id').value;
            var x = parseFloat(o.attributes.getNamedItem('x').nodeValue);
            var y = parseFloat(o.attributes.getNamedItem('y').nodeValue);
            var watr = o.attributes.getNamedItem('width');
            var hatr = o.attributes.getNamedItem('height');
            var w = watr ? parseFloat(watr.nodeValue) : 0;
            var h = hatr ? parseFloat(hatr.nodeValue) : 0;
            var nameAttr = o.attributes.getNamedItem('name');
            var typeAttr = o.attributes.getNamedItem('type');
            var rotAttr = o.attributes.getNamedItem('rotation');
            var name = nameAttr ? nameAttr.nodeValue : '';
            var type = typeAttr ? typeAttr.nodeValue : '';
            var rot = rotAttr ? rotAttr.nodeValue : 0;
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
                var name_3 = x_1.attributes.getNamedItem('name').nodeValue;
                var valattr = x_1.attributes.getNamedItem('value');
                properties[name_3] = valattr ? valattr.nodeValue : x_1.textContent;
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
                properties["polygon"] = polygon.attributes.getNamedItem('points').nodeValue;
            }
            if (polyline) {
                properties["polyline"] = polyline.attributes.getNamedItem('points').nodeValue;
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
        Loader.prototype.addLayer = function (stage, layer, bigtilesets, images, offset, layerProps) {
            var objectsList = [];
            var data = layer.getElementsByTagName('data')[0];
            var str = data.textContent;
            str = str.replace(/\r?\n|\r/g, '');
            var name = layer.attributes.getNamedItem('name').nodeValue;
            var arr = str.split(',');
            var len = arr.length;
            var layerWidth = layer.attributes.getNamedItem('width').nodeValue;
            var layerHeight = layer.attributes.getNamedItem('height').nodeValue;
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
                    if (Loader.SkipSpriteExt) {
                        textureName = this.removeExt(textureName);
                    }
                    var col = Math.floor(i % layerWidth);
                    var row = Math.floor(i / layerWidth);
                    var posX = col * images[tileID].tilesetWidth;
                    var posY = row * images[tileID].tilesetHeight - (parseFloat(images[tileID].height) - images[tileID].tilesetHeight);
                    var type = layerProps['type'];
                    var layername = layerProps['name'];
                    var o = this.spawnTile(stage, textureName, posX + offset[0], posY + offset[1], name, type, layername, col, row);
                    o.properties = layerProps;
                    objectsList.push(o);
                }
            }
            if (layerProps["color"])
                this.setLayerColor(objectsList, layerProps["color"]);
            if (layerProps["light"])
                this.setLayerLightColor(objectsList, layerProps["light"]);
            return objectsList;
        };
        Loader.prototype.spawnTile = function (stage, textureName, posX, posY, layerName, type, layerStringID, col, row) {
            var sprite = Application_1.Application.One.cs(textureName);
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            var o;
            if (type && type != '') {
                o = new ObjectsList_1.ObjectNames[type.toLowerCase()]([posX, posY]);
            }
            else {
                o = new O_1.O([posX, posY]);
            }
            o.x += sprite.width / 2;
            o.y += sprite.height / 2;
            o.tileColRow = [col, row];
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
                o.init(o.properties);
            }
        };
        Loader.prototype.getGroups = function (level, filter) {
            if (filter === void 0) { filter = null; }
            var map = this.levels[level].getElementsByTagName("map")[0];
            var arr = [];
            for (var _i = 0, _a = map.childNodes; _i < _a.length; _i++) {
                var c = _a[_i];
                if (c.nodeName == 'group') {
                    var name_4 = c.attributes.name.value.toLowerCase();
                    if (!filter) {
                        arr.push(name_4);
                    }
                    else {
                        if (~name_4.indexOf(filter)) {
                            arr.push(name_4);
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
                    var col = Math_1.m.strhexToRgbNormal(color);
                    x.gfx.color.setDark(col[0], col[1], col[2]);
                }
            }
        };
        Loader.prototype.setLayerColor = function (objectsList, color) {
            for (var _i = 0, objectsList_3 = objectsList; _i < objectsList_3.length; _i++) {
                var x = objectsList_3[_i];
                if (x.gfx && x.gfx.color) {
                    var col = Math_1.m.strhexToRgbNormal(color);
                    x.gfx.color.setLight(col[0], col[1], col[2]);
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
                    Application_1.Application.One.rp(x.gfx);
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
        Loader.SkipSpriteExt = false;
        return Loader;
    }());
    exports.Loader = Loader;
});
