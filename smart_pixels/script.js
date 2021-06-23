'use strict';
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}
function rgb(r, g, b){return "rgb("+r+","+g+","+b+")";}

function frame() {
	requestAnimationFrame(frame);
    ctx.clearRect(0,0,canvas.width, canvas.height);
	var updatedPixels = 0;
	for(let i = 0; i < agents.length; i++){
		if(!agents[i].hasReachedRest){ 
			updatedPixels++;
        	agents[i].update();
			agents[i].render(ctx);
			if(updatedPixels > 1024) break;
		}
	}
}

//notes display image on ctx and get image data, display text on ctx and get image data

var canvas, canvas2;
var ctx, ctx2;
var agents;
const PIXEL_SIZE = 20;

async function setup(){
	canvas = document.getElementById('myCanvas');
	canvas.width = canvas.getBoundingClientRect().width;//1563
	canvas.height = canvas.getBoundingClientRect().height;//768
	ctx = canvas.getContext("2d");
	canvas.addEventListener('mousedown', (e) => {
		//console.log(e.offsetX, e.offsetY);
		ctx2.clearRect(0,0,canvas.width, canvas.height);
		for(let i = 0; i < agents.length; i++){
			agents[i].teleport(e.offsetX, e.offsetY);
		}
	});
	canvas2 = document.getElementById('myCanvas2');
	canvas2.width = canvas.width;//1563
	canvas2.height = canvas.height;//768
	ctx2 = canvas2.getContext("2d");

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
				let ax = x*PIXEL_SIZE;
				let ay = y*PIXEL_SIZE;
				agents.push(new Agent(ax,ay, rgb(r,g,b) ));
			}
		}
	}
	

	requestAnimationFrame(frame);
}

class Agent{
	constructor(_rx, _ry, _c){
		this.pos = {
            x: Math.floor(Math.random() * canvas.width), 
            y: Math.floor(Math.random() * canvas.height)
        };
		this.restPos = {x: _rx, y: _ry};
        this.color = _c;
        this.hasReachedRest = false;
        this.speed = 10;
        
        /*var v1 = {x : this.restPos.x - this.pos.x, y : this.restPos.y - this.pos.y};
        var mag = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
        this.speed = mag/60;*/
	}
	teleport(_x, _y){
		this.pos.x = _x;
		this.pos.y = _y;
		this.hasReachedRest = false;
		/*var v1 = {x : this.restPos.x - this.pos.x, y : this.restPos.y - this.pos.y};
        var mag = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
        this.speed = mag/60;*/
	}
	update(){
        if(this.hasReachedRest) return;
        
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
			this.render(ctx2);
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
			this.render(ctx2);
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