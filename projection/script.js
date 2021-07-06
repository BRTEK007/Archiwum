'use strict';
//TODO
//save big as possible polygons, calculate their normal and later form triangles ?
//torus

class Vector3 {
    constructor(_x, _y, _z) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }
    add(_v) {
        return new Vector3(this.x + _v.x, this.y + _v.y, this.z + _v.z);
    }
    sub(_v) {
        return new Vector3(this.x - _v.x, this.y - _v.y, this.z - _v.z);
    }
    dot(_v) {
        return this.x * _v.x + this.y * _v.y + this.z * _v.z;
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    unit() {
        let m = this.mag();
        return new Vector3(this.x / m, this.y / m, this.z / m);
    }
    mult(_a) {
        return new Vector3(this.x * _a, this.y * _a, this.z * _a);
    }
}

class Vector2 {
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
    }
}

class Triangle {
    constructor(_p1, _p2, _p3) {
        this.points = [_p1, _p2, _p3];
        this.avg_z = null;
        this.normal = null;
    }
    calculateAvgZ() {
        this.avg_z = (this.points[0].z + this.points[1].z + this.points[2].z) / 3;
    }
    calculateNormal() {
        var v1 = this.points[1].sub(this.points[0]);
        var v2 = this.points[2].sub(this.points[0]);
        this.normal = new Vector3(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x
        );
        this.normal.x *= 0.1;
        this.normal.y *= 0.1;
        this.normal.z *= 0.1;
    }
}

function renderTriangle(_t) {
    var points = new Array(3);
    var behindPoints = [];
    for (let i = 0; i < 3; i++) {
        _t.points[i] = camera.transfomedPoint(_t.points[i]);
        points[i] = camera.projectPointToScreen(_t.points[i]);
    }

    _t.calculateNormal();
    let dp = Math.abs(light.dot(_t.normal.unit()));
    //dp = 1;


    if (!SETTINGS.wireframe) {
        ctx.fillStyle = rgb(dp * 255, dp * 255, dp * 255);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.closePath();
        ctx.stroke();
    }

}

function radians(_a) {
    return Math.PI * 2 * _a / 360;
}

function zSort(a, b) {
    return b.avg_z - a.avg_z;
}

function rgb(_r, _g, _b) {
    return 'rgb(' + _r + ',' + _g + ',' + _b + ')';
}

function frame() {
    requestAnimationFrame(frame);
    if(prism == null) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    prism.update();
    prism.render();
}

function Rx(_a) {
    return [
        [1, 0, 0],
        [0, Math.cos(_a), -Math.sin(_a)],
        [0, Math.sin(_a), Math.cos(_a)]
    ];
}

function Ry(_a) {
    return [
        [Math.cos(_a), 0, Math.sin(_a)],
        [0, 1, 0],
        [-Math.sin(_a), 0, Math.cos(_a)]
    ];
}

function Rz(_a) {
    return [
        [Math.cos(_a), -Math.sin(_a), 0],
        [Math.sin(_a), Math.cos(_a), 0],
        [0, 0, 1]
    ];
}

function multiplyMatrices(_m1, _m2, _m3) {
    return [
        [_m1[0][0] * _m2[0][0] * _m3[0][0], _m1[1][0] * _m2[1][0] * _m3[1][0], _m1[2][0] * _m2[2][0] * _m3[2][0]],
        [_m1[0][1] * _m2[0][1] * _m3[0][1], _m1[1][1] * _m2[1][1] * _m3[1][1], _m1[2][1] * _m2[2][1] * _m3[2][1]],
        [_m1[0][2] * _m2[0][2] * _m3[0][2], _m1[1][2] * _m2[1][2] * _m3[1][2], _m1[2][2] * _m2[2][2] * _m3[2][2]]
    ];
}

function multiplyVectorWithMatrix(_v, _m) {
    return new Vector3(
        _v.x * _m[0][0] + _v.y * _m[0][1] + _v.z * _m[0][2],
        _v.x * _m[1][0] + _v.y * _m[1][1] + _v.z * _m[1][2],
        _v.x * _m[2][0] + _v.y * _m[2][1] + _v.z * _m[2][2]
    );
}

var canvas;
var ctx;
var prism;

const SETTINGS = {
    axis: true,
    wireframe: false,
    FOV: 50,
    verticies: 4,
    spike: false,
    rotation: new Vector3(0.0, 0.01, 0.0)
};
var eye = new Vector3(0.0, 0.0, -1 / Math.tan(radians(SETTINGS.FOV / 2)));
var camera;
var light = new Vector3(0.0, 0.0, 1);

class Camera {
    constructor() {
        this.pos = new Vector3(0.0, 0.0, 0.0);
        this.rotation = new Vector3(0.0, 0.0, 0.0);
    }
    transfomedPoint(_p) {
        let v = _p.sub(this.pos);
        let cx = Math.cos(this.rotation.x);
        let cy = Math.cos(this.rotation.y);
        let cz = Math.cos(this.rotation.z);
        let sx = Math.sin(this.rotation.x);
        let sy = Math.sin(this.rotation.y);
        let sz = Math.sin(this.rotation.z);
        let dx = cy * (sz * v.z + cz * v.x) - sy * v.z;
        let dy = sx * (cy * v.z + sy * (sz * v.y + cz * v.x)) + cx * (cz * v.y + sz * v.x);
        let dz = cx * (cy * v.z + sy * (sz * v.y + cz * v.x)) - sx * (cz * v.y + sz * v.x);
        return new Vector3(dx, dy, dz);
    }

    projectPointToScreen(_p) {
        var d = this.transfomedPoint(_p);
        var vx = (eye.z * d.x) / d.z + eye.x;
        //vx = Math.max(Math.min(vx, 1), -1);
        var sx = canvas.width / 2 + vx * canvas.width / 2;
        var vy = (eye.z * d.y) / d.z + eye.y;
        //vy = Math.max(Math.min(vy, 1), -1);
        var sy = canvas.height / 2 + vy * canvas.width / 2;
        return new Vector2(sx, sy);
    }
}

class Prism {
    constructor(_v, _t) {
        this.pos = new Vector3(0, 0, 8);
        this.rotation = new Vector3(0, 0, 0);
        this.verticies = _v;
        this.triangles = _t;
    }
    render() {
        var rx = Rx(this.rotation.x);
        var ry = Ry(this.rotation.y);
        var rz = Rz(this.rotation.z);
        //var m = multiplyMatrices(rx, ry, rz);
        var verticies2 = new Array(this.verticies.length);

        for (let i = 0; i < this.verticies.length; i++) {
            var rv = multiplyVectorWithMatrix(this.verticies[i], rx);
            rv = multiplyVectorWithMatrix(rv, ry);
            rv = multiplyVectorWithMatrix(rv, rz);
            verticies2[i] = new Vector3(this.pos.x + rv.x, this.pos.y + rv.y, this.pos.z + rv.z);
        }
        var triangles_sorted = [];

        for (let i = 0; i < this.triangles.length; i++) {
            var points = new Array(3);
            for (let j = 0; j < 3; j++) points[j] = verticies2[this.triangles[i][j]];
            var t1 = new Triangle(points[0], points[1], points[2]);
            t1.calculateNormal();

            if (!SETTINGS.wireframe) {
                if (t1.points[0].sub(camera.pos).dot(t1.normal) <= 0) {
                    triangles_sorted.push(t1);
                    t1.calculateAvgZ();
                }
            } else {
                triangles_sorted.push(t1);
                t1.calculateAvgZ();
            }
        }

        triangles_sorted.sort(zSort);

        for (let i = 0; i < triangles_sorted.length; i++)
            renderTriangle(triangles_sorted[i]);
    }

    update() {
        this.rotation = this.rotation.add(SETTINGS.rotation);
    }
}

function getTrianglesFromPolygon(_v, _inv) {
    var triangles = [];
    var new_verticies = [];
    var n = 0;
    while (n + 2 <= _v.length) {
        triangles.push(
            [
                _v[_inv ? n + 1 : n],
                _v[_inv ? n : n + 1],
                _v[n + 2 >= _v.length ? 0 : n + 2]
            ]
        );
        new_verticies.push(_v[n + 2 >= _v.length ? 0 : n + 2]);
        n += 2;
    }
    if (_v.length % 2 == 1) new_verticies.push(_v[0]);
    if (new_verticies.length > 2)
        return triangles.concat(getTrianglesFromPolygon(new_verticies, _inv));
    return triangles;
}

function createPrism(_n, _spike) {
    var verticies = [];
    var triangles = [];
    var a0 = (Math.PI * 2) / _n;
    for (let i = 0; i < _n; i++) {
        let a = a0 * i;
        verticies.push(new Vector3(Math.cos(a), Math.SQRT2 / 2, Math.sin(a)));
    }
    if (_spike) {
        verticies.push(new Vector3(0, -Math.SQRT2 / 2 / 2, 0));
    } else {
        for (let i = 0; i < _n; i++) {
            let a = a0 * i;
            verticies.push(new Vector3(Math.cos(a), -Math.SQRT2 / 2, Math.sin(a)));
        }
    }

    if (SETTINGS.spike) {
        for (let i = 0; i < _n; i++) {
            //side 1
            triangles.push([
                        i,
                        i + 1 >= _n ? 0 : i + 1,
                        _n]);
        }
        var v1 = new Array(_n);
        for (let i = 0; i < _n; i++) v1[i] = i;
        triangles = triangles.concat(getTrianglesFromPolygon(v1, true));
    } else {
        for (let i = 0; i < _n; i++) {
            //side 1
            triangles.push([
                        i,
                        i + 1 >= _n ? 0 : i + 1,
                        i + _n]);
            //side 2
            triangles.push([
                    i + 1 >= _n ? _n : i + 1 + _n,
                    i + _n,
                    i + 1 >= _n ? 0 : i + 1]);
        }
        var v1 = new Array(_n);
        for (let i = 0; i < _n; i++) v1[i] = i;
        triangles = triangles.concat(getTrianglesFromPolygon(v1, true));
        for (let i = 0; i < _n; i++) v1[i] = i + _n;
        triangles = triangles.concat(getTrianglesFromPolygon(v1, false));
    }



    var p = new Prism(verticies, triangles);
    return p;
}

function createSphere() {
    var verticies = [];
    var resolution = 20;
    var bA = 2 * Math.PI / resolution;
    verticies.push(new Vector3(0, 1, 0));
    for (let j = 1; j < resolution; j++) {
        var rB, rT, yB, yT;
        rB = Math.sin(0.5 * j * bA);
        yB = Math.cos(0.5 * j * bA);

        for (let i = 0; i < resolution; i++) {
            var a1 = i * bA;
            verticies.push(new Vector3(
                Math.sin(a1) * rB,
                yB,
                Math.cos(a1) * rB
            ));
        }
    }
    verticies.push(new Vector3(0, -1, 0));
    var triangles = [];
    for (let i = 0; i < resolution; i++) {
        triangles.push([
            0,
            i + 1,
            i + 1 == resolution ? 1 : i + 2]);
        triangles.push([
            i + 1 + resolution * (resolution - 2),
            verticies.length - 1,
            i + 1 == resolution ? resolution * (resolution - 2) + 1 : i + 2 + resolution * (resolution - 2)]);
    }
    for (let j = 0; j < resolution - 2; j++) {
        for (let i = 0; i < resolution; i++) {
            triangles.push([
            i + 1 + resolution * j,
            i + 1 + resolution * (j + 1),
            i + 1 == resolution ? 1 + resolution * (j + 1) : i + 2 + resolution * (j + 1)]);
            triangles.push([
            i + 1 == resolution ? 1 + resolution * (j) : i + 2 + resolution * (j),
            i + 1 + resolution * j,
            i + 1 == resolution ? 1 + resolution * (j + 1) : i + 2 + resolution * (j + 1)]);
        }
    }
    //console.log(triangles.length, verticies.length);
    var p = new Prism(verticies, triangles);
    return p;
}

function loadModel(_name) {
    var verticies = [];
    var triangles = [];
    fetch(_name).then(response => response.text()).then(text => {
        var arr = text.split('\n');
        for (let i = 0; i < arr.length; i++) {
            var entry = arr[i].split(" ");
            if (entry[0] == 'v') {
                verticies.push(new Vector3(
                    parseFloat(entry[1]),
                    parseFloat(entry[2]),
                    parseFloat(entry[3])
                ));
            } else if (entry[0] == 'f') {
                triangles.push([
                    parseInt(entry[1]) - 1, parseInt(entry[2]) - 1, parseInt(entry[3]) - 1
                ]);
            }
        }
        prism = new Prism(verticies, triangles);
    })
}

function round(_f, _d){
    let a = Math.pow(10, _d);
    return Math.round(_f * a) / a;
}

function setup() {
    canvas = document.getElementById('myCanvas');
    canvas.width = canvas.getBoundingClientRect().width; //1563
    canvas.height = canvas.getBoundingClientRect().height; //768
    ctx = canvas.getContext("2d");

    //prism = createPrism(SETTINGS.verticies, SETTINGS.spike);
    //prism = createSphere();
    loadModel('teapot.obj');
    camera = new Camera();

    requestAnimationFrame(frame);
}

function DOM_change_fov(_v) {
    SETTINGS.FOV = parseInt(_v);
    eye.z = -1 / Math.tan(radians(SETTINGS.FOV / 2));
}

function DOM_change_verticies(_v) {
    SETTINGS.verticies = parseInt(_v);
    let r = prism.rotation;
    prism = createPrism(SETTINGS.verticies, SETTINGS.spike);
    prism.rotation = r;
}

function DOM_change_spike(_v) {
    SETTINGS.spike = _v;
    let r = prism.rotation;
    prism = createPrism(SETTINGS.verticies, SETTINGS.spike);
    prism.rotation = r;
}

function DOM_change_wireframe(_v) {
    SETTINGS.wireframe = _v;
    let r = prism.rotation;
    prism = createPrism(SETTINGS.verticies, SETTINGS.spike);
    prism.rotation = r;
}

function DOM_change_rotation(_t, _v) {
    switch (_t) {
        case 'X':
            SETTINGS.rotation.x = parseFloat(_v);
            break;
        case 'Y':
            SETTINGS.rotation.y = parseFloat(_v);
            break;
        case 'Z':
            SETTINGS.rotation.z = parseFloat(_v);
            break;
    }
}

function DOM_download() {
    var text = "";
    for(let i = 0; i < prism.verticies.length; i++)
        text += "v " + round(prism.verticies[i].x, 6) + ' ' + round(prism.verticies[i].y, 6) + ' ' + round(prism.verticies[i].z, 6) + '\n';
    for(let i = 0; i < prism.triangles.length; i++)
        text += "f " + (prism.triangles[i][0]+1) + ' ' + (prism.triangles[i][1]+1) + ' ' + (prism.triangles[i][2]+1) + '\n';
    //return;
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'model.obj');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
