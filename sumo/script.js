var now,
  deltaTime = 0,
  oldTimeStamp = timestamp();

function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}
function frame() {
  deltaTime = (timestamp() - oldTimeStamp) / 1000;
  oldTimeStamp = timestamp();

  //var fps = Math.round(1 / deltaTime);

  update();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return;
  }
  keyMap.set(event.key, true);
  event.preventDefault();
}, true);

window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
  }
  keyMap.set(event.key, false);
  event.preventDefault();
}, true);

function clamp(a, b, c) { return Math.max(b, Math.min(c, a)) };

var context;
var keyMap;

var player1;
var player2;
var bullets;

var roundManager;

var playing = true;

function windowLoaded() {
  let canvas = document.getElementById('myCanvas');
  canvas.width = 800;
  canvas.height = 800;
  context = canvas.getContext('2d');

  keyMap = new Map();

  player1 = new Player(100, 400, "red");
  player1.setKeys("ArrowLeft", "ArrowUp", "ArrowRight");

  player2 = new Player(700, 400, "blue");
  player2.setKeys("a", "w", "d");
  //player2.angle = Math.PI;

  bullets = Array();

  roundManager = new RoundManager();

  requestAnimationFrame(frame);
}

function playerWon(player) {
  playing = false;
  bullets = [];
  player1.resetPos();
  player2.resetPos();
  roundManager.trigger(player.color);
}

function update() {
  context.fillStyle = "#1e1e1e";
  context.fillRect(0, 0, 1600, 800);

  context.fillStyle = "black";
  context.beginPath();
  context.arc(400, 400, 400, 0, 2 * Math.PI);
  context.fill();


  var rings = 20;
  context.lineWidth = 5;
  for(var i = 0; i < rings; i++){
    context.strokeStyle = i % 2  ? "red" : "blue";
    context.beginPath();
    context.arc(400, 400, 398, ((i)/rings) * Math.PI*2,((i+1)/rings) * Math.PI*2);
    context.stroke();
  }
  context.lineWidth = 1;

  for (let i = 0; i < bullets.length; i++)
    bullets[i].draw();

  player1.draw();
  player2.draw();

  if(!playing){
    roundManager.update();
    roundManager.draw();
  }

  if (playing) {
    player1.update();
    if (IsCircleOutOfMap(player1.pos.x, player1.pos.y, player1.radius)){
      playerWon(player2);
      return;
    }
    player2.update();
    if (IsCircleOutOfMap(player2.pos.x, player2.pos.y, player2.radius)){
      playerWon(player1);
      return;
    }

    //player to player collision
    if (DoCirclesOverlap(player1.pos.x, player1.pos.y, player1.radius, player2.pos.x, player2.pos.y, player2.radius)) {

      // Distance between ball centers
      var fDistance = Math.sqrt(Math.pow(player1.pos.x - player2.pos.x, 2) + Math.pow(player1.pos.y - player2.pos.y, 2));

      // Calculate displacement required
      var fOverlap = (fDistance - player1.radius - player2.radius);

      // Displace Current Ball away from collision
      player1.pos.x -= fOverlap * (player1.pos.x - player2.pos.x) / fDistance;
      player1.pos.y -= fOverlap * (player1.pos.y - player2.pos.y) / fDistance;

      // Displace Target Ball away from collision
      player2.pos.x += fOverlap * (player1.pos.x - player2.pos.x) / fDistance;
      player2.pos.y += fOverlap * (player1.pos.y - player2.pos.y) / fDistance;

      // Set velocities

      // Normal
      var nx = (player2.pos.x - player1.pos.x) / fDistance;
      var ny = (player2.pos.y - player1.pos.y) / fDistance;

      // Tangent
      var tx = -ny;
      var ty = nx;

      // Dot Product Tangent
      var dpTan1 = player1.vel.x * tx + player1.vel.y * ty;
      var dpTan2 = player2.vel.x * tx + player2.vel.y * ty;

      // Dot Product Normal
      var dpNorm1 = player1.vel.x * nx + player1.vel.y * ny;
      var dpNorm2 = player1.vel.x * nx + player1.vel.y * ny;
      // Update ball velocities
      player1.vel.x = (tx * dpTan1 + nx);
      player1.vel.y = (ty * dpTan1 + ny);
      player2.vel.x = (tx * dpTan2 + nx);
      player2.vel.y = (ty * dpTan2 + ny);
    }
    //bullet to player collision
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].update();

      if (IsCircleOutOfMap(bullets[i].pos.x, bullets[i].pos.y, bullets[i].radius)) {
        bullets.splice(i, 1);
        continue;
      }
      if (bullets[i].color != player1.color) {
        if (DoCirclesOverlap(player1.pos.x, player1.pos.y, player1.radius, bullets[i].pos.x, bullets[i].pos.y, bullets[i].radius)) {
          var fDistance = Math.sqrt(Math.pow(bullets[i].vel.x, 2) + Math.pow(bullets[i].vel.y, 2));
          player1.vel.x += 800 * (bullets[i].vel.x) / fDistance;
          player1.vel.y += 800 * (bullets[i].vel.y) / fDistance;
          bullets.splice(i, 1);
          continue;
        }
      }

      if (bullets[i].color != player2.color) {
        if (DoCirclesOverlap(player2.pos.x, player2.pos.y, player2.radius, bullets[i].pos.x, bullets[i].pos.y, bullets[i].radius)) {
          var fDistance = Math.sqrt(Math.pow(bullets[i].vel.x, 2) + Math.pow(bullets[i].vel.y, 2));
          player2.vel.x += 800 * (bullets[i].vel.x) / fDistance;
          player2.vel.y += 800 * (bullets[i].vel.y) / fDistance;
          bullets.splice(i, 1);
          continue;
        }
      }
    }
  }

}

class RoundManager{

  constructor(){
    this.timeCounter = 0;
    this.timeFill = 0.25;
    this.timeUnfill = 0.25;
    this.timeDelay = 0.25;
    this.color = "white";
  }

  update(){
    this.timeCounter += deltaTime;
    if(this.timeCounter >= this.timeFill + this.timeUnfill + this.timeDelay)
      playing = true;
  }

  draw(){
    if(this.timeCounter <= this.timeFill){
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(400, 400, 400 * this.timeCounter/ this.timeFill, 0, 2 * Math.PI);
      context.fill();
    }
    else if(this.timeCounter < this.timeUnfill + this.timeFill){
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(400, 400, 400 -400 * (this.timeCounter - this.timeFill) / this.timeUnfill, 0, 2 * Math.PI);
      context.fill();
    }

  }

  trigger(color){
    this.timeCounter = 0;
    this.color = color;
  }

}

class Player {
  constructor(x, y, color) {
    this.pos = { x: x, y: y };
    this.spawn = { x: x, y: y };
    this.vel = { x: 0, y: 0 };
    this.angle = Math.atan2(400 - this.pos.y, 400 - this.pos.x);
    if (this.angle < 0) this.angle = 2 * Math.PI + this.angle;
    this.innerAngle = 30 * Math.PI / 180;
    this.radius = 18;
    this.color = color;
    this.bulletDelayCounter = 0;
    this.keys = { right: "ArrowRight", left: "ArrowLeft", shoot: "ArrowUp" };
  }

  setKeys(left, shoot, right) {
    this.keys = { right: right, left: left, shoot: shoot };
  }

  update() {
    this.pos.x += this.vel.x * deltaTime;
    this.pos.y += this.vel.y * deltaTime;

    if (keyMap.get(this.keys.right)) {
      this.angle += (Math.PI / 40) * deltaTime * 35;
    } else if (keyMap.get(this.keys.left)) {
      this.angle -= (Math.PI / 40) * deltaTime * 35;
    }

    this.vel.x += Math.cos(this.angle) * 12;
    this.vel.y += Math.sin(this.angle) * 12;
    this.vel.x *= 0.96;
    this.vel.y *= 0.96;

    this.bulletDelayCounter += deltaTime;

    if (keyMap.get(this.keys.shoot) && this.bulletDelayCounter > 0.5) {
      this.bulletDelayCounter = 0;
      this.fireBullet();
    }

    if (this.angle < 0)
      this.angle = 2 * Math.PI;
    else if (this.angle > 2 * Math.PI)
      this.angle = 0;
  }

  draw() {
    //drawPolygon(this.getCollider(), this.color);

    /* context.strokeStyle = "white";
     context.beginPath();
     context.moveTo(this.pos.x, this.pos.y);
     context.lineTo(this.pos.x + 100 * Math.cos(this.angle), this.pos.y + 100 * Math.sin(this.angle));
     context.stroke();*/

    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
    context.fill();

    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(this.pos.x + this.radius * Math.cos(this.angle + Math.PI / 2), this.pos.y + this.radius * Math.sin(this.angle + Math.PI / 2));
    context.lineTo(this.pos.x + this.radius * Math.cos(this.angle - Math.PI / 2), this.pos.y + this.radius * Math.sin(this.angle - Math.PI / 2));
    context.lineTo(this.pos.x + this.radius * 3 * Math.cos(this.angle), this.pos.y + this.radius * 3 * Math.sin(this.angle));
    context.closePath();
    context.stroke();
  }

  fireBullet() {
    var bullet = new Bullet(this.pos.x, this.pos.y, this.color);
    bullet.setVel(Math.cos(this.angle), Math.sin(this.angle));
    this.vel.x -= Math.cos(this.angle) * 400;
    this.vel.y -= Math.sin(this.angle) * 400;
    bullets.push(bullet);
  }

  resetPos() {
    this.pos = { x: this.spawn.x, y: this.spawn.y };
    this.vel = { x: 0, y: 0 };
    this.angle = Math.atan2(400 - this.pos.y, 400 - this.pos.x);
  }

}

class Bullet {
  constructor(x, y, color = "white") {
    this.pos = { x: x, y: y };
    this.vel = { x: 0, y: 0 };
    this.radius = 12;
    this.color = color;
    this.angle = 0;
  }

  update() {
    this.pos.x += this.vel.x * deltaTime;
    this.pos.y += this.vel.y * deltaTime;
  }

  draw() {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
    context.fill();

    /*context.fillStyle = this.color;
    context.beginPath();
    context.moveTo(this.pos.x + this.radius * Math.cos(this.angle + Math.PI/2), this.pos.y + this.radius * Math.sin(this.angle + Math.PI/2));
    context.lineTo(this.pos.x + this.radius * Math.cos(this.angle - Math.PI/2), this.pos.y + this.radius * Math.sin(this.angle - Math.PI/2));
    context.lineTo(this.pos.x + this.radius*3 * Math.cos(this.angle), this.pos.y + this.radius*3 * Math.sin(this.angle));
    context.closePath();
    context.fill();*/
  }

  setVel(x, y) {
    this.vel.x = (x * 800) / Math.sqrt(x * x + y * y);
    this.vel.y = (y * 800) / Math.sqrt(x * x + y * y);
    this.angle = Math.atan2(y, x);
  }

}

class Wall {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw() {
    context.strokeStyle = "white";
    context.beginPath();
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
    context.stroke();
  }
}

function segmentsIntersection(segA, segB) {
  var a = (segA.y1 - segA.y2) / (segA.x1 - segA.x2);
  var b = segA.y1 - segA.x1 * a;
  var c = (segB.y1 - segB.y2) / (segB.x1 - segB.x2);
  var d = segB.y1 - segB.x1 * c;
  var x = (b - d) / (c - a);
  var y = a * x + b;
  if ((segA.x1 - segA.x2) == 0) {
    x = segA.x1;
    y = c * x + d;
  }
  else if ((segB.x1 - segB.x2) == 0) {
    x = segB.x1;
    y = a * x + b;
  }

  if (x < Math.min(segA.x1, segA.x2)) return null;//left
  if (x > Math.max(segA.x1, segA.x2)) return null;//right
  if (y < Math.min(segA.y1, segA.y2)) return null;//top
  if (y > Math.max(segA.y1, segA.y2)) return null;//bottom
  //segment B
  if (x < Math.min(segB.x1, segB.x2)) return null;//left
  if (x > Math.max(segB.x1, segB.x2)) return null;//right
  if (y < Math.min(segB.y1, segB.y2)) return null;//top
  if (y > Math.max(segB.y1, segB.y2)) return null;//bottom

  return { x: x, y: y };
}

function overlapSAT(poly1, poly2) {
  for (var shape = 0; shape < 2; shape++) {
    if (shape == 1) {
      let t = poly1;
      poly1 = poly2;
      poly2 = t;
    }

    for (var a = 0; a < poly1.length; a++) {
      var b = (a + 1) % poly1.length;
      var axisProj = { x: -(poly1[b].y - poly1[a].y), y: poly1[b].x - poly1[a].x };
      var d = Math.sqrt(axisProj.x * axisProj.x + axisProj.y * axisProj.y);
      axisProj = { x: axisProj.x / d, y: axisProj.y / d };

      // Work out min and max 1D points for r1
      var min_r1 = Infinity, max_r1 = -Infinity;
      for (var p = 0; p < poly1.length; p++) {
        let q = (poly1[p].x * axisProj.x + poly1[p].y * axisProj.y);
        min_r1 = Math.min(min_r1, q);
        max_r1 = Math.max(max_r1, q);
      }

      // Work out min and max 1D points for r2
      var min_r2 = Infinity, max_r2 = -Infinity;
      for (var p = 0; p < poly2.length; p++) {
        let q = (poly2[p].x * axisProj.x + poly2[p].y * axisProj.y);
        min_r2 = Math.min(min_r2, q);
        max_r2 = Math.max(max_r2, q);
      }

      if (!(max_r2 >= min_r1 && max_r1 >= min_r2))
        return false;
    }
  }

  return true;
}

function polygonOutOfMap(poly, minX, maxX, minY, maxY) {
  for (var i = 0; i < poly.length; i++) {
    if (poly[i].x <= minX)
      return true;
    if (poly[i].x >= maxX)
      return true;
    if (poly[i].y <= minY)
      return true;
    if (poly[i].y >= maxY)
      return true;
  }
  return false;
}

function drawPolygon(points, color = "white") {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);//TL
  for (var i = 1; i < points.length; i++) {
    context.lineTo(points[i].x, points[i].y);//TL
  }
  context.closePath();
  context.fill();
}

function IsCircleOutOfMap(x, y, radius) {
  return Math.pow(400 - x, 2) + Math.pow(400 - y, 2) >= Math.pow(400 - radius, 2);
}

function DoCirclesOverlap(x1, y1, r1, x2, y2, r2) {
  return Math.abs((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) <= (r1 + r2) * (r1 + r2);
}