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


    //_t.calculateNormal();
    //let dp = Math.abs(light.dot(_t.normal.unit()));


    //ctx.fillStyle = rgb(dp * 255, dp * 255, dp * 255);
    ctx.fillStyle = rgb(255, 255, 255);
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.closePath();
    ctx.fill();

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

function linePlanceIntersection(_pp, _pn, _ls, _le) {
    _pn = _pn.unit();
    let pd = -_pn.dot(_pp);
    let ad = _ls.dot(_pn);
    let bd = _le.dot(_pn);
    let t = (-pd - ad) / (bd - ad);
    let lv = _le.sub(_ls);
    let li = lv.mult(t);
    return _ls.add(li);
}

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

        var d = _p;
        var vx = -(eye.z * d.x) / d.z + eye.x;
        //vx = Math.max(Math.min(vx, 1), -1);
        var sx = canvas.width / 2 + vx * canvas.width / 2;
        var vy = (eye.z * d.y) / d.z + eye.y;
        //vy = Math.max(Math.min(vy, 1), -1);
        var sy = canvas.height / 2 + vy * canvas.width / 2;
        return new Vector2(sx, sy);
    }

    update() {
        //this.pos.z += 0.1;
        //console.log(this.transfomedPoint(prism.pos));
        //this.rotation.y += 0.01;
        //console.log(360 * this.rotation.y / (2 * Math.PI));
    }
}

class Prism {
    constructor(_t) {
        this.pos = new Vector3(0, 0, 8);
        this.rotation = new Vector3(0, 0, 0);
        this.triangles = _t;
    }
    render() {
        var rx = Rx(this.rotation.x);
        var ry = Ry(this.rotation.y);
        var rz = Rz(this.rotation.z);
        //var m = multiplyMatrices(rx, ry, rz);


        var triangles_sorted = [];

        for (let i = 0; i < this.triangles.length; i++) {
            var points = new Array(3);
            for (let j = 0; j < 3; j++) {
                var rv = multiplyVectorWithMatrix(this.triangles[i].points[j], rx);
                rv = multiplyVectorWithMatrix(rv, ry);
                rv = multiplyVectorWithMatrix(rv, rz);
                rv = rv.add(this.pos);
                points[j] = camera.transfomedPoint(rv);
            }
            var t1 = new Triangle(points[0], points[1], points[2]);
            t1.calculateNormal();

            if (t1.points[0].sub(camera.pos).dot(t1.normal) <= 0) {
                triangles_sorted.push(t1);
                t1.calculateAvgZ();
            }
            //triangles_sorted.push(t1);
            //t1.calculateAvgZ();
        }

        triangles_sorted.sort(zSort);

        for (let i = 0; i < triangles_sorted.length; i++)
            renderTriangle(triangles_sorted[i]);

    }

    update() {
        //this.rotation = this.rotation.add(new Vector3(0.0, 0.01, 0.0));
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

function createPrism(_n) {
    var verticies = [];
    var triangles = [];
    var a0 = (Math.PI * 2) / _n;
    for (let i = 0; i < _n; i++) {
        let a = a0 * i;
        verticies.push(new Vector3(Math.cos(a), Math.SQRT2 / 2, Math.sin(a)));
    }

    for (let i = 0; i < _n; i++) {
        let a = a0 * i;
        verticies.push(new Vector3(Math.cos(a), -Math.SQRT2 / 2, Math.sin(a)));
    }

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


    var p = new Prism(triangles);
    return p;
}
