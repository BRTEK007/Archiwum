'use strict';

function radians(_a) {
    return Math.PI * 2 * _a / 360;
}

function frame() {
    requestAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cube.update();
    cube.render();
}

function projectToScreen(_p){
    var vx = _p.x * -eye_z / (_p.z - eye_z);
    var sx = canvas.width / 2 + vx * canvas.width / 2;
    var vy = _p.y * -eye_z / (_p.z - eye_z);
    var sy = canvas.height / 2 + vy * canvas.width / 2;
    return {
        x: sx,
        y: sy
    };
}

function Rx(_a){
    return [
        [1,0,0],
        [0, Math.cos(_a), -Math.sin(_a)],
        [0, Math.sin(_a), Math.cos(_a)]
    ];
}

function Ry(_a){
    return [
        [Math.cos(_a),0,Math.sin(_a)],
        [0, 1, 0],
        [-Math.sin(_a), 0, Math.cos(_a)]
    ];
}

function Rz(_a){
    return [
        [Math.cos(_a), -Math.sin(_a), 0],
        [Math.sin(_a), Math.cos(_a), 0],
        [0, 0, 1]
    ];
}

function multiplyVectorWithMatrix(_v, _m){
    return{
        x: _v.x * _m[0][0] + _v.y * _m[0][1] + _v.z * _m[0][2],
        y: _v.x * _m[1][0] + _v.y * _m[1][1] + _v.z * _m[1][2],
        z: _v.x * _m[2][0] + _v.y * _m[2][1] + _v.z * _m[2][2]
    };
}

var canvas;
var ctx;
var cube;
const FOV = 70;
var eye_z = -1 / Math.tan(radians(FOV / 2));;

class Cube {
    constructor() {
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
        this.verticies = [
            {
                x: 1,
                y: 1,
                z: -1
            },
            {
                x: -1,
                y: 1,
                z: -1
            },
            {
                x: -1,
                y: -1,
                z: -1
            },
            {
                x: 1,
                y: -1,
                z: -1
            },
            {
                x: 1,
                y: 1,
                z: 1
            },
            {
                x: -1,
                y: 1,
                z: 1
            },
            {
                x: -1,
                y: -1,
                z: 1
            },
            {
                x: 1,
                y: -1,
                z: 1
            }
        ];
        this.lines = [
            [0,1],
            [1,2],
            [2,3],
            [3,0],
            [4,5],
            [5,6],
            [6,7],
            [7,4],
            [0,4],
            [1,5],
            [2,6],
            [3,7],
        ];
    }
    render() {
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
        /*for(let i = 0 ; i < verticies2.length; i++){
            var p1 = projectToScreen(verticies2[i]);
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(p1.x, p1.y, 5, 0, Math.PI*2);
            ctx.fill();
        }*/
        for(let i = 0 ; i < this.lines.length; i++){
            var p1 = projectToScreen(verticies2[this.lines[i][0]]);
            var p2 = projectToScreen(verticies2[this.lines[i][1]]);
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    update() {
        this.rotation.x += 0.01;
        this.rotation.y += 0.01;    
        this.rotation.z += 0.01;
    }
}

function setup() {
    dragElement(document.getElementById("menuDiv"));
    canvas = document.getElementById('myCanvas');
    canvas.width = canvas.getBoundingClientRect().width; //1563
    canvas.height = canvas.getBoundingClientRect().height; //768
    ctx = canvas.getContext("2d");

    cube = new Cube();

    requestAnimationFrame(frame);
}

function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    elmnt.onmousedown = dragMouseDown;


    function dragMouseDown(e) {
        e = e || window.event;
        //e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        //e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
