'use strict';

function radians(_a) {
    return Math.PI * 2 * _a / 360;
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
    return {
        x: sx,
        y: sy
    };
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
    return {
        x: _v.x * _m[0][0] + _v.y * _m[0][1] + _v.z * _m[0][2],
        y: _v.x * _m[1][0] + _v.y * _m[1][1] + _v.z * _m[1][2],
        z: _v.x * _m[2][0] + _v.y * _m[2][1] + _v.z * _m[2][2]
    };
}

var canvas;
var ctx;
var prism;
const SETTINGS = {
    axis: true,
    FOV: 50,
    verticies: 4,
    spike: false,
    rx: 0.0,
    ry: 0.01,
    rz: 0.0
};
var eye_z = -1 / Math.tan(radians(SETTINGS.FOV / 2));

class Prism {
    constructor(_v, _l) {
        this.pos = {
            x: 0,
            y: 0,
            z: 8
        };
        this.rotation = {
            x: 0,
            y: 0,
            z: 0
        };
        this.verticies = _v;
        this.lines = _l;
    }
    render() {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        var rx = Rx(this.rotation.x);
        var ry = Ry(this.rotation.y);
        var rz = Rz(this.rotation.z);

        var verticies2 = [];
        for (let i = 0; i < this.verticies.length; i++) {
            var rv = multiplyVectorWithMatrix(this.verticies[i], rx);
            rv = multiplyVectorWithMatrix(rv, ry);
            rv = multiplyVectorWithMatrix(rv, rz);
            verticies2.push({
                x: this.pos.x + rv.x,
                y: this.pos.y + rv.y,
                z: this.pos.z + rv.z
            });
        }
        for (let i = 0; i < this.lines.length; i++) {
            var p1 = projectToScreen(verticies2[this.lines[i][0]]);
            var p2 = projectToScreen(verticies2[this.lines[i][1]]);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
        /*if (SETTINGS.axis) {
            var rv = multiplyVectorWithMatrix({
                x: 0,
                y: 10,
                z: 0
            }, rx);
            rv = multiplyVectorWithMatrix(rv, ry);
            rv = multiplyVectorWithMatrix(rv, rz);
            var p1 = projectToScreen({
                x: this.pos.x + rv.x,
                y: this.pos.y + rv.y,
                z: this.pos.z + rv.z
            });
            rv = multiplyVectorWithMatrix({
                x: 0,
                y: -10,
                z: 0
            }, rx);
            rv = multiplyVectorWithMatrix(rv, ry);
            rv = multiplyVectorWithMatrix(rv, rz);
            var p2 = projectToScreen({
                x: this.pos.x + rv.x,
                y: this.pos.y + rv.y,
                z: this.pos.z + rv.z
            });
            ctx.strokeStyle = "#55ff55";
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            rv = multiplyVectorWithMatrix({
                x: 10,
                y: 0,
                z: 0
            }, rx);
            rv = multiplyVectorWithMatrix(rv, ry);
            rv = multiplyVectorWithMatrix(rv, rz);
            p1 = projectToScreen({
                x: this.pos.x + rv.x,
                y: this.pos.y + rv.y,
                z: this.pos.z + rv.z
            });
            rv = multiplyVectorWithMatrix({
                x: -10,
                y: 0,
                z: 0
            }, rx);
            rv = multiplyVectorWithMatrix(rv, ry);
            rv = multiplyVectorWithMatrix(rv, rz);
            p2 = projectToScreen({
                x: this.pos.x + rv.x,
                y: this.pos.y + rv.y,
                z: this.pos.z + rv.z
            });
            ctx.strokeStyle = "#ff5555";
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            rv = multiplyVectorWithMatrix({
                x: 0,
                y: 0,
                z: 10
            }, rx);
            rv = multiplyVectorWithMatrix(rv, ry);
            rv = multiplyVectorWithMatrix(rv, rz);
            p1 = projectToScreen({
                x: this.pos.x + rv.x,
                y: this.pos.y + rv.y,
                z: this.pos.z + rv.z
            });
            rv = multiplyVectorWithMatrix({
                x: 0,
                y: 0,
                z: -10
            }, rx);
            rv = multiplyVectorWithMatrix(rv, ry);
            rv = multiplyVectorWithMatrix(rv, rz);
            p2 = projectToScreen({
                x: this.pos.x + rv.x,
                y: this.pos.y + rv.y,
                z: this.pos.z + rv.z
            });
            ctx.strokeStyle = "#5555ff";
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }*/
    }

    update() {
        this.rotation.x += SETTINGS.rx;
        this.rotation.y += SETTINGS.ry;
        this.rotation.z += SETTINGS.rz;
    }
}

function createPrism(_n, _spike) {
    var verticies = [];
    var a0 = (Math.PI * 2) / _n;
    for (let i = 0; i < _n; i++) {
        let a = a0 * i;
        verticies.push({
            x: Math.cos(a),
            y: Math.SQRT2 / 2,
            z: Math.sin(a)
        });
    }
    if (_spike) {
        verticies.push({
            x: 0,
            y: -Math.SQRT1_2 / 2,
            z: 0
        });
    } else {
        for (let i = 0; i < _n; i++) {
            let a = a0 * i;
            verticies.push({
                x: Math.cos(a),
                y: -Math.SQRT2 / 2,
                z: Math.sin(a)
            });
        }
    }
    var lines = [];
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
    var p = new Prism(verticies, lines);
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
            SETTINGS.rx = parseFloat(_v);
            break;
        case 'Y':
            SETTINGS.ry = parseFloat(_v);
            break;
        case 'Z':
            SETTINGS.rz = parseFloat(_v);
            break;
    }
}
