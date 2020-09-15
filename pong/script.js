function timestamp() {
	return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }
  
var now,
	  deltaTime   = 0,
	  last = timestamp(),
	  step = 1/30;
  
function frame() {
	now = timestamp();
	deltaTime = deltaTime + Math.min(1, (now - last) / 1000);
	while(deltaTime > step) {
	  deltaTime = deltaTime - step;
	  update();
	}
	last = now;
	requestAnimationFrame(frame);
}

var canvas;
var ctx;
var ball;
var rightBot;
var leftBot;
const GAME_HEIGHT = 768;//768
const GAME_WIDTH = 1563;//1563

function setup(){
	canvas = document.getElementById('myCanvas');
	ctx = canvas.getContext("2d");
	ball = new Ball();
	rightBot = new Bot(1503);
	leftBot = new Bot(60);
}

requestAnimationFrame(frame);

function update(){
	ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
	ctx.strokeStyle = "white";
	ctx.fillStyle = "white";
	ctx.beginPath();
	ctx.setLineDash([15, 15]);
	ctx.moveTo(GAME_WIDTH/2, 0);
	ctx.lineTo(GAME_WIDTH/2, GAME_HEIGHT);
	ctx.stroke();

	ctx.beginPath();
	ctx.fillStyle = 'white';
	ctx.fill();

	if(ball)
		ball.update();
	if(leftBot)
		leftBot.update();
	if(rightBot)
		rightBot.update();

}

class Bot{
	constructor(x){
		this.x = x;
		this.y = 0;
		this.step = 12;
		this.sizeY = 128;
		this.sizeX = 20;
		this.desiredY = GAME_HEIGHT/2;
	}
	update(){
		if(Math.abs(this.desiredY - this.y) > this.step){
			if(this.desiredY > this.y && this.y + this.sizeY + this.step <= GAME_HEIGHT) this.y += this.step;
			else if(this.desiredY < this.y && this.y - this.step >= 0) this.y -= this.step;
		}

		ctx.fillRect(this.x,this.y,this.sizeX,this.sizeY);
	}
}

class Ball{
	constructor(){
		this.speed = 21;//21
		this.velX = 0;
		this.velY = 0;
		this.radius = 9;
		this.nextHit = [];
		this.serve();
	}
	update(){
		this.y += this.velY;
		this.x += this.velX;

		//walls
		if((this.y /*+ this.velY*/ - this.radius<= 0 && this.velY < 0) || (this.y + /*this.velY*/ + this.radius>= GAME_HEIGHT && this.velY > 0) ){
			var a = Math.tan(this.angle);
			var b = this.y - a*this.x;
			this.y = this.y > GAME_HEIGHT/2 ? GAME_HEIGHT-this.radius : this.radius;
			this.x = (this.y -b)/ a;

			this.velY = -this.velY;
			if(this.velX > 0){
				this.angle = Math.atan(this.velY/this.velX);
			}else{
				this.angle = Math.atan(this.velY/this.velX) + Math.PI;
			}
			this.nextHit.shift();
		}
		//ends
		if(this.x < leftBot.x || this.x > rightBot.x + rightBot.sizeX)
			this.serve();
		//hit right paddle
		if(this.y >=rightBot.y && this.y <=rightBot.y +rightBot.sizeY){
			if(this.x + this.velX + this.radius >=rightBot.x  && this.velX > 0){
				this.angle = Math.random() * degrees_to_radians(120) + degrees_to_radians(120);
				this.hitPaddle();
			}
		}
		//hit left paddle
		if(this.y >= leftBot.y && this.y <= leftBot.y + leftBot.sizeY){
			if(this.x + this.velX - this.radius <= leftBot.x + leftBot.sizeX && this.velX < 0){
				this.angle = Math.random() * degrees_to_radians(120) - degrees_to_radians(60);
				this.hitPaddle();
			}
		}
		this.draw();
	}
	hitPaddle(){
		this.recalculateVelocities()
		this.calculateNextCollision(this.x, this.y, this.angle, 1);
	}
	draw(){
		for(var i = 0; i < this.nextHit.length; i++){
			if(this.nextHit[i] != null){
				ctx.beginPath();
				ctx.setLineDash([]);
				ctx.strokeStyle = "blue";
				if(i == 0) ctx.moveTo(this.x, this.y); 
				else ctx.moveTo(this.nextHit[i-1][0], this.nextHit[i-1][1]);
				ctx.lineTo(this.nextHit[i][0], this.nextHit[i][1]);
				ctx.stroke();

				ctx.beginPath();
				ctx.fillStyle = 'blue';
				ctx.arc(this.nextHit[i][0], this.nextHit[i][1], this.radius, 0, 2 * Math.PI, false);
				ctx.fill();
			}
		}

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'white';
		ctx.fill();
	}
	serve(){
		this.x = GAME_WIDTH/2;
		this.y = GAME_HEIGHT/2;
		this.angle = Math.PI;
		this.recalculateVelocities()
		this.nextHit = [];
	}
	recalculateVelocities(){
		this.velX = Math.cos(this.angle) * this.speed;
		this.velY = Math.sin(this.angle) * this.speed;
	}
	calculateNextCollision(x, y, angle, iteration){
		if(iteration > 10)
			return;

		var a = Math.tan(angle);
		var b = y - a*x;

		var nextX = Math.min((this.radius  -b)/ a, ((GAME_HEIGHT - this.radius) - b)/a);
		if(this.velX > 0)
			nextX = Math.max(((GAME_HEIGHT  - this.radius) - b)/a, (this.radius  -b)/a);

		var nextY = a*nextX + b;

		this.nextHit[iteration-1] = [nextX, nextY];
		this.nextHit.splice(iteration, this.nextHit.length);

		if(nextX <= leftBot.x + leftBot.sizeX){
			leftBot.desiredY = a*leftBot.x + b - leftBot.sizeY/2;
			nextX = leftBot.x + this.radius + leftBot.sizeX;
			this.nextHit[iteration-1] = [nextX, a*nextX + b];
			this.nextHit.splice(iteration, this.nextHit.length);
		}else if(nextX >= rightBot.x){	
			rightBot.desiredY = a*rightBot.x + b - rightBot.sizeY/2;
			nextX = rightBot.x - this.radius;
			this.nextHit[iteration-1] = [nextX, a*nextX + b];
			this.nextHit.splice(iteration, this.nextHit.length);
		}else{
			let nextAngle = degrees_to_radians(-radians_to_degrees(angle));
			this.calculateNextCollision(nextX, nextY, nextAngle, iteration+1);
		}

	}
	pathDistance(){
		var dist = 0;
		for(var i = 0; i < this.nextHit.length; i++){
			if(this.nextHit[i] != null){
				if(i == 0) 
					dist += Math.sqrt(Math.pow(this.x- this.nextHit[1][0], 2) + Math.pow(this.y - this.nextHit[1][1], 2));
				else 
					dist += Math.sqrt(Math.pow(this.nextHit[i-1][0] - this.nextHit[i][0], 2) + Math.pow(this.nextHit[i-1][1] - this.nextHit[i][1], 2));
			}	
		}
		console.log(dist);
	}
}

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}
function radians_to_degrees(radians){
	return 180*radians/Math.PI;
}
