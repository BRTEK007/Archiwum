'use strict';

var canvas, ctx;
var painter;

const shapeMagenta = {
  pos : {x : 100, y : 100},
  vel : {x: 50, y : 50},
  radius : 50,
}

const shapeYellow = {
  pos : {x : 400, y : 400},
  vel : {x: -50, y : -50},
  radius : 50,
}


function pageLoaded() {
  canvas = document.getElementById('canvas1');

  canvas.addEventListener('mousedown', e => {
    
  });

  canvas.addEventListener('mousemove', e => {
    
  });

  canvas.addEventListener('mouseup', e => {

  });
  canvas.addEventListener('mouseleave', e => {

  });

  canvas.height = canvas.getBoundingClientRect().height;
  canvas.width = canvas.getBoundingClientRect().width;
  ctx = canvas.getContext('2d');

  ctx.strokeStyle = "#ffff00";
  ctx.beginPath();
  ctx.arc(shapeYellow.pos.x, shapeYellow.pos.y, shapeYellow.radius, 0, 2 * Math.PI);
  ctx.moveTo(shapeYellow.pos.x, shapeYellow.pos.y);
  ctx.lineTo(shapeYellow.pos.x + shapeYellow.vel.x, shapeYellow.pos.y + shapeYellow.vel.y);
  ctx.stroke();

  ctx.strokeStyle = "#ff00ff";
  ctx.beginPath();
  ctx.arc(shapeMagenta.pos.x, shapeMagenta.pos.y, shapeMagenta.radius, 0, 2 * Math.PI);
  ctx.moveTo(shapeMagenta.pos.x, shapeMagenta.pos.y);
  ctx.lineTo(shapeMagenta.pos.x + shapeMagenta.vel.x, shapeMagenta.pos.y + shapeMagenta.vel.y);
  ctx.stroke();

  window.requestAnimationFrame(frame);
}

function frame() {
  window.requestAnimationFrame(frame);
}
