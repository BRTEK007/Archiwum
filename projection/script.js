'use strict';
//TODO
//triangles instead of verticies should have indexes of verticies in the verticies list
//vertiecies list gets rotated and later triangles get formed
//eliminate and sort triangles, project verticies list and form triangles from original indexes

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
        if (_t.points[i].z < camera.pos.z) {
            //_t.points[i].z = camera.pos.z + 0.1;
            behindPoints.push(_t.points[i]);
        }
    }
    //console.log(behindPoints.length);
    if (behindPoints.length == 3)
        return;

    _t.calculateNormal();
    let dp = Math.abs(light.dot(_t.normal.unit()));
    dp = 1;


    if (SETTINGS.culling) {
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
    culling: true,
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
        var vx = -(eye.z * d.x) / d.z + eye.x;
        //vx = Math.max(Math.min(vx, 1), -1);
        var sx = canvas.width / 2 + vx * canvas.width / 2;
        var vy = -(eye.z * d.y) / d.z + eye.y;
        //vy = Math.max(Math.min(vy, 1), -1);
        var sy = canvas.height / 2 + vy * canvas.width / 2;
        return new Vector2(sx, sy);
    }
}

class Prism {
    constructor(_v, _l, _t) {
        this.pos = new Vector3(0, 0, 8);
        this.rotation = new Vector3(0, 0, 0);
        this.verticies = _v;
        this.lines = _l;
        this.triangles = _t;
    }
    render() {
        var rx = Rx(this.rotation.x);
        var ry = Ry(this.rotation.y);
        var rz = Rz(this.rotation.z);
        //var m = multiplyMatrices(rx, ry, rz);

        if (!SETTINGS.wireframe) {
            var triangles_sorted = [];

            for (let i = 0; i < this.triangles.length; i++) {
                var points = new Array(3);
                for (let j = 0; j < 3; j++) {
                    var rv = multiplyVectorWithMatrix(this.triangles[i].points[j], rx);
                    rv = multiplyVectorWithMatrix(rv, ry);
                    rv = multiplyVectorWithMatrix(rv, rz);
                    rv = rv.add(this.pos);
                    points[j] = rv;
                }
                var t1 = new Triangle(points[0], points[1], points[2]);
                t1.calculateNormal();

                if (SETTINGS.culling) {
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

        } else {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;

            var verticies2 = [];
            for (let i = 0; i < this.verticies.length; i++) {
                var rv = multiplyVectorWithMatrix(this.verticies[i], rx);
                rv = multiplyVectorWithMatrix(rv, ry);
                rv = multiplyVectorWithMatrix(rv, rz);
                verticies2.push(new Vector3(this.pos.x + rv.x, this.pos.y + rv.y, this.pos.z + rv.z));
            }
            for (let i = 0; i < this.lines.length; i++) {
                var p1 = camera.projectPointToScreen(verticies2[this.lines[i][0]]);
                var p2 = camera.projectPointToScreen(verticies2[this.lines[i][1]]);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
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
            new Triangle(
                _v[_inv ? n + 1 : n],
                _v[_inv ? n : n + 1],
                _v[n + 2 >= _v.length ? 0 : n + 2]
            )
        );
        new_verticies.push(_v[n + 2 >= _v.length ? 0 : n + 2]);
        n += 2;
    }
    if (_v.length % 2 == 1) new_verticies.push(_v[0]);
    if (new_verticies.length > 2)
        return triangles.concat(getTrianglesFromPolygon(new_verticies, _inv));
    return triangles;
}

function createPrism(_n, _spike, _wireframe) {
    var verticies = [];
    var lines = [];
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
    if (_wireframe) {
        for (let i = 0; i < _n; i++) {
            if (_spike) {
                lines.push([i, _n]);
                let ii = i + 1 >= _n ? 0 : i + 1;
                lines.push([i, ii]);
            } else {
                lines.push([i, i + _n]);
                let ii = i + 1 >= _n ? 0 : i + 1;
                lines.push([i, ii]);
                lines.push([i + _n, ii + _n]);
            }
        }
    } else {
        if (SETTINGS.spike) {
            for (let i = 0; i < _n; i++) {
                //side 1
                triangles.push(
                    new Triangle(
                        verticies[i],
                        verticies[i + 1 >= _n ? 0 : i + 1],
                        new Vector3(0, -Math.SQRT2 / 2, 0)
                    )
                );
            }
            triangles = triangles.concat(getTrianglesFromPolygon(verticies.splice(0, _n), true));
        } else {
            for (let i = 0; i < _n; i++) {
                //side 1
                triangles.push(
                    new Triangle(
                        verticies[i],
                        verticies[i + 1 >= _n ? 0 : i + 1],
                        verticies[i + _n]
                    )
                );
                //side 2
                triangles.push(new Triangle(
                    verticies[i + 1 >= _n ? _n : i + 1 + _n],
                    verticies[i + _n],
                    verticies[i + 1 >= _n ? 0 : i + 1]
                ));
            }
            triangles = triangles.concat(getTrianglesFromPolygon(verticies.splice(0, _n), true));
            triangles = triangles.concat(getTrianglesFromPolygon(verticies, false));
        }
    }


    var p = new Prism(verticies, lines, triangles);
    return p;
}

function createSphere() {
    var verticies = [];
    var lines = [];
    var triangles = [];
    var resolution = 20;
    var bA = 2 * Math.PI / resolution;

    for (let j = 0; j < resolution; j++) {
        var rB, rT, yB, yT;
        rB = Math.sin(0.5 * j * bA);
        rT = Math.sin(0.5 * (j+1) * bA);
        yB = Math.cos(0.5 * j * bA) * 1.2;
        yT = Math.cos(0.5 * (j+1) * bA) * 1.2;

        for (let i = 0; i < resolution; i++) {
            var a1 = i * bA;
            var a2 = (i + 1 == resolution) ? 0 : (i + 1) * bA;
            var v1 = new Vector3(
                Math.sin(a1) * rB,
                yB,
                Math.cos(a1) * rB
            );
            var v2 = new Vector3(
                Math.sin(a2) * rB,
                yB,
                Math.cos(a2) * rB
            );
            var v3 = new Vector3(
                Math.sin(a1) * rT,
                yT,
                Math.cos(a1) * rT
            );
            var v4 = new Vector3(
                Math.sin(a2) * rT,
                yT,
                Math.cos(a2) * rT
            );
            triangles.push(new Triangle(v2, v1, v3));
            triangles.push(new Triangle(v3, v4, v2));
        }
    }
    var p = new Prism(verticies, lines, triangles);
    return p;
}

function setup() {
    canvas = document.getElementById('myCanvas');
    canvas.width = canvas.getBoundingClientRect().width; //1563
    canvas.height = canvas.getBoundingClientRect().height; //768
    ctx = canvas.getContext("2d");

    prism = createPrism(SETTINGS.verticies, SETTINGS.spike, SETTINGS.wireframe);
    //prism = createSphere();
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
    prism = createPrism(SETTINGS.verticies, SETTINGS.spike, SETTINGS.wireframe);
    prism.rotation = r;
}

function DOM_change_spike(_v) {
    SETTINGS.spike = _v;
    let r = prism.rotation;
    prism = createPrism(SETTINGS.verticies, SETTINGS.spike, SETTINGS.wireframe);
    prism.rotation = r;
}

function DOM_change_wireframe(_v) {
    SETTINGS.wireframe = _v;
    let r = prism.rotation;
    prism = createPrism(SETTINGS.verticies, SETTINGS.spike, SETTINGS.wireframe);
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
