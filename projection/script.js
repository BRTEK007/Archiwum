'use strict';

class Vector3 {
    constructor(_x, _y, _z) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }
    add(_v) {
        return new Vector3(this.x + _v.x, this.y + _v.y, this.z + _v.z);
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
    }
    calculateAvgZ() {
        this.avg_z = (this.points[0].z + this.points[1].z + this.points[2].z) / 3;
    }
}

function radians(_a) {
    return Math.PI * 2 * _a / 360;
}

function zSort(a, b) {
    return b.avg_z - a.avg_z;
}

function frame() {
    requestAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    prism.update();
    prism.render();
}

function projectToScreen(_p) {
    var vx = _p.x * -eye_z / (_p.z - eye_z);
    var sx = canvas.width / 2 + vx * canvas.width / 2;
    var vy = _p.y * -eye_z / (_p.z - eye_z);
    var sy = canvas.height / 2 + vy * canvas.width / 2;
    return new Vector2(sx, sy);
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
    triangles: false,
    FOV: 50,
    verticies: 4,
    spike: false,
    rotation: new Vector3(0.0, 0.01, 0.0)
};
var eye_z = -1 / Math.tan(radians(SETTINGS.FOV / 2));

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

        if (SETTINGS.triangles) {
            ctx.fillStyle = "yellow";
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;

            var triangles_sorted = new Array(this.triangles.length);

            for (let i = 0; i < this.triangles.length; i++) {
                var points = new Array(3);
                for (let j = 0; j < 3; j++) {
                    var rv = multiplyVectorWithMatrix(this.triangles[i].points[j], rx);
                    rv = multiplyVectorWithMatrix(rv, ry);
                    rv = multiplyVectorWithMatrix(rv, rz);
                    rv = rv.add(this.pos);
                    points[j] = rv;
                }
                triangles_sorted[i] = new Triangle(points[0], points[1], points[2]);
                triangles_sorted[i].calculateAvgZ();
            }

            triangles_sorted.sort(zSort);

            for (let i = 0; i < triangles_sorted.length; i++) {
                var points = new Array(3);
                for (let j = 0; j < 3; j++) {
                    points[j] = projectToScreen(triangles_sorted[i].points[j]);
                }
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[1].x, points[1].y);
                ctx.lineTo(points[2].x, points[2].y);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            }
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
                var p1 = projectToScreen(verticies2[this.lines[i][0]]);
                var p2 = projectToScreen(verticies2[this.lines[i][1]]);
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

function createPrism(_n, _spike) {
    var verticies = [];
    var lines = [];
    var triangles = [];
    var a0 = (Math.PI * 2) / _n;
    for (let i = 0; i < _n; i++) {
        let a = a0 * i;
        verticies.push(new Vector3(Math.cos(a), Math.SQRT2 / 2, Math.sin(a)));
    }
    if (_spike) {
        verticies.push(new Vector3(0, -Math.SQRT1_2 / 2, 0));
    } else {
        for (let i = 0; i < _n; i++) {
            let a = a0 * i;
            verticies.push(new Vector3(Math.cos(a), -Math.SQRT2 / 2, Math.sin(a)));
        }
    }
    if (!SETTINGS.triangles) {
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
        for (let i = 0; i < _n; i++) {
            //bottom
            triangles.push(
                new Triangle(
                    verticies[i],
                    new Vector3(0, Math.SQRT2 / 2, 0),
                    verticies[i + 1 >= _n ? 0 : i + 1]
                )
            );
            //top
            triangles.push(
                new Triangle(
                    verticies[i + _n],
                    new Vector3(0, -Math.SQRT2 / 2, 0),
                    verticies[i + 1 >= _n ? _n : i + 1 + _n]
                )
            );
            //side 1
            triangles.push(
                new Triangle(
                    verticies[i],
                    verticies[i + 1 >= _n ? 0 : i + 1],
                    verticies[i + _n]
                )
            );
            //side 2
            triangles.push(
                new Triangle(
                    verticies[i + _n],
                    verticies[i + 1 >= _n ? _n : i + 1 + _n],
                    verticies[i + 1 >= _n ? 0 : i + 1],
                )
            );
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

    prism = createPrism(SETTINGS.verticies, SETTINGS.spike);

    requestAnimationFrame(frame);
}

function DOM_change_fov(_v) {
    SETTINGS.FOV = parseInt(_v);
    eye_z = -1 / Math.tan(radians(SETTINGS.FOV / 2));
}

function DOM_change_verticies(_v) {
    SETTINGS.verticies = parseInt(_v);
    prism = createPrism(SETTINGS.verticies, SETTINGS.spike);
}

function DOM_change_spike(_v) {
    SETTINGS.spike = _v;
    prism = createPrism(SETTINGS.verticies, SETTINGS.spike);
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
