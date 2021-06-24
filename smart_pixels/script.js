'use strict';
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}
function rgb(r, g, b){return "rgb("+r+","+g+","+b+")";}

function frame() {
	requestAnimationFrame(frame);
    ctx.clearRect(0,0,canvas.width, canvas.height);
	if(MOUSE.down) pushAgents();
	for(let i = 0; i < agents.length; i++){
        	agents[i].update();
			agents[i].render(ctx);
	}
}

//notes display image on ctx and get image data, display text on ctx and get image data

var canvas;
var ctx;
var agents;
const PIXEL_SIZE = 20;
const MOUSE = {
	down: false,
	x : null,
	y : null
}

async function setup(){
	dragElement(document.getElementById("menuDiv"));
	canvas = document.getElementById('myCanvas');
	canvas.width = canvas.getBoundingClientRect().width;//1563
	canvas.height = canvas.getBoundingClientRect().height;//768
	ctx = canvas.getContext("2d");
	canvas.addEventListener('mousedown', (e) => {MOUSE.down = true; MOUSE.x = e.offsetX; MOUSE.y = e.offsetY} );
	canvas.addEventListener('mousemove', (e) => {MOUSE.x = e.offsetX; MOUSE.y = e.offsetY} );
	canvas.addEventListener('mouseup', (e) => {MOUSE.down = false;} );
	canvas.addEventListener('mouseleave', (e) => {MOUSE.down = false;} );

	var image = new Image();
    image.src = "image4.gif";
	await sleep(100);
    ctx.drawImage(image, 0, 0, image.width, image.height);
	await sleep(100);
	var pixels = ctx.getImageData(0, 0, image.width, image.height).data;

	agents = [];

	for(let y = 0; y < image.height; y++){
		for(let x = 0; x < image.width; x++){
			let id = x + y*image.width;
			/*for(let i = 0; i < 4; i++){
				c += pixels[id*4 + i];
			}*/
			let r = pixels[id*4];
			let g = pixels[id*4+1];
			let b = pixels[id*4+2];
			let a = pixels[id*4+3];
			if(a != 0){
				let ax = x*PIXEL_SIZE+200;
				let ay = y*PIXEL_SIZE+200;
				agents.push(new Agent(ax,ay, rgb(r,g,b) ));
			}
		}
	}
	

	requestAnimationFrame(frame);
}

class Agent{
	constructor(_rx, _ry, _c){
		this.pos = new Vector2D(_rx, _ry);
		this.restPos = new Vector2D(_rx, _ry);
        this.color = _c;
        this.hasReachedRest = true;
        this.speed = 10;
        
		this.vel = new Vector2D(0,0);
		this.drag = 0.9;
        /*var v1 = {x : this.restPos.x - this.pos.x, y : this.restPos.y - this.pos.y};
        var mag = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
        this.speed = mag/60;*/
	}
	teleport(_x, _y){
		this.pos = new Vector2D(_x, _y);
		this.hasReachedRest = false;
		/*var v1 = {x : this.restPos.x - this.pos.x, y : this.restPos.y - this.pos.y};
        var mag = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
        this.speed = mag/60;*/
	}
	update(){
        if(this.hasReachedRest) return;
		var dir = this.restPos.sub(this.pos);
		this.vel = this.vel.add(dir.unit());
		this.vel = this.vel.mult(this.drag);
		this.pos = this.pos.add(this.vel);

		if(dir.mag() < this.vel.mag()){
			this.pos = this.restPos.copy();
            this.hasReachedRest = true;
			this.vel = new Vector2D(0,0);
		}

		return;
        
        var move = {x : 0, y : 0};
        
        /*if(this.restPos.y > this.pos.y)
            move.y = Math.min(this.restPos.y - this.pos.y, this.speed);
        else if(this.restPos.y < this.pos.y)
            move.y = Math.max(this.restPos.y - this.pos.y, -this.speed);

		if(this.restPos.x > this.pos.x)
            move.x = Math.min(this.restPos.x - this.pos.x, this.speed);
        else if(this.restPos.x < this.pos.x)
            move.x = Math.max(this.restPos.x - this.pos.x, -this.speed);

		this.pos.x += move.x;
		this.pos.y += move.y;

		if(this.restPos.x == this.pos.x && this.restPos.y == this.pos.y){
			this.hasReachedRest = true;
		}*/
        
        var v1 = {x : this.restPos.x - this.pos.x, y : this.restPos.y - this.pos.y};
        var mag = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
        
        var m = Math.min(mag, this.speed);
        
        move.x = m*v1.x/mag;
        move.y = m*v1.y/mag;
        
        this.pos.x += move.x;
        this.pos.y += move.y;
        
        if(mag < 1){
            this.pos.x = this.restPos.x;
            this.pos.y = this.restPos.y;
            this.hasReachedRest = true;
        }
	}
	render(_ctx){
		_ctx.fillStyle = this.color;
        _ctx.beginPath();
		//ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI*2);
		_ctx.rect(this.pos.x+1, this.pos.y+1,PIXEL_SIZE-2,PIXEL_SIZE-2);
		_ctx.fill();
	}
}

class Vector2D{
	constructor(_x, _y){
		this.x = _x;
		this.y = _y;
	}
	mag(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	unit(){
		let m = this.mag();
		if(m == 0) return new Vector2D(0,0);
		return new Vector2D(this.x/m, this.y/m);
	}
	mult(m){
		return new Vector2D(this.x * m, this.y * m); 
	}
	add(v){
		return new Vector2D(this.x + v.x, this.y + v.y);
	}
	sub(v){
		return new Vector2D(this.x - v.x, this.y - v.y);
	}
	copy(){
		return new Vector2D(this.x, this.y);
	}
}

function pushAgents(){
	for(let i = 0; i < agents.length; i++){
		var dir = agents[i].pos.sub(new Vector2D(MOUSE.x, MOUSE.y));
		var mag = dir.mag();
		//agents[i].vel = agents[i].vel.add(dir.unit().mult(2000/(mag*mag)));
		agents[i].vel = agents[i].vel.sub(dir.unit().mult(2));
		//agents[i].vel = agents[i].vel.sub(dir.mult(0.005));
		agents[i].pos = agents[i].pos.add(agents[i].vel);
		agents[i].hasReachedRest = false;
	}
}
function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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