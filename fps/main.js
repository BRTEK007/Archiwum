'use strict';
var canvas;
var ctx;
var prism;

var eye = new Vector3(0.0, 0.0, -1 / Math.tan(radians(70 / 2)));
var camera;
var light = new Vector3(0.0, 0.0, 1);
const INPUT = {
    locked: false,
    x: 0,
    y: 0
}

window.addEventListener("keydown", function (event) {
    switch (event.key) {
        case 'w':
            INPUT.y = 1;
            break;
        case 's':
            INPUT.y = -1;
            break;
        case 'd':
            INPUT.x = 1;
            break;
        case 'a':
            INPUT.x = -1;
            break;
    }
}, true);

window.addEventListener("keyup", function (event) {
    switch (event.key) {
        case 'w':
            INPUT.y = 0;
            break;
        case 's':
            INPUT.y = 0;
            break;
        case 'd':
            INPUT.x = 0;
            break;
        case 'a':
            INPUT.x = 0;
            break;
    }
}, true);

function mouseMove(e) {
    camera.rotation.y += e.movementX * 0.001;
    camera.rotation.x += e.movementY * 0.001;
    camera.rotation.x = Math.max(Math.min(camera.rotation.x, radians(90)), radians(-90));
}

function lockChangeAlert() {
    if (document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas) {
        INPUT.locked = true;
        document.addEventListener("mousemove", mouseMove, false);
    } else {
        INPUT.locked = false;
        document.removeEventListener("mousemove", mouseMove, false);
    }
}

function frame() {
    requestAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var forward = new Vector3(Math.sin(camera.rotation.y), 0, Math.cos(camera.rotation.y));
    var right = new Vector3(Math.sin(camera.rotation.y + radians(90)), 0, Math.cos(camera.rotation.y + radians(90)));
    //camera.pos.z += INPUT.y * 0.1;
    camera.pos = camera.pos.add(forward.mult(INPUT.y * 0.1));
    camera.pos = camera.pos.add(right.mult(INPUT.x * 0.1));
    //camera.pos.x += INPUT.x * 0.1;
    camera.update();
    prism.update();
    prism.render();

    ctx.fillStyle = "#888888";
    ctx.fillRect(0, 0, 200, 200);

    let cubePos = new Vector2(prism.pos.x * 2 + 100, -prism.pos.z * 2 + 100);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cubePos.x, cubePos.y, 5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    let camPos = new Vector2(camera.pos.x * 2 + 100, -camera.pos.z * 2 + 100);
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(camPos.x, camPos.y, 5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(camPos.x, camPos.y);
    ctx.lineTo(camPos.x + forward.x * 15, camPos.y + -forward.z * 15);
    ctx.closePath();
    ctx.stroke();
}

function setup() {
    canvas = document.getElementById('myCanvas');
    canvas.width = canvas.getBoundingClientRect().width; //1563
    canvas.height = canvas.getBoundingClientRect().height; //768
    ctx = canvas.getContext("2d");

    canvas.onclick = function () {
        if (INPUT.locked) return;
        canvas.requestPointerLock();
    };

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    prism = createPrism(4);
    camera = new Camera();

    requestAnimationFrame(frame);
}
