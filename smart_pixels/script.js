'use strict';
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}
function rgb(r, g, b){return "rgb("+r+","+g+","+b+")";}

function frame() {
	requestAnimationFrame(frame);
    ctx.clearRect(0,0,1563, 768);
	for(let i = 0; i < agents.length; i++){
        agents[i].update();
		agents[i].render();
	}
}

//notes display image on ctx and get image data, display text on ctx and get image data

var canvas;
var ctx;
var agents;

async function setup(){
	canvas = document.getElementById('myCanvas');
	canvas.width = 1563;//1563
	canvas.height = 768;//768
	ctx = canvas.getContext("2d");
	canvas.addEventListener('mousedown', (e) => {
		//console.log(e.offsetX, e.offsetY);
		for(let i = 0; i < agents.length; i++){
			agents[i].teleport(e.offsetX, e.offsetY);
		}
	});

	var image2 = new Image();
    image2.src = "image.gif";
	await sleep(100);
    ctx.drawImage(image2, 0, 0, 32, 32);
	await sleep(100);
	var pixels = ctx.getImageData(0, 0, 32, 32).data;

	agents = [];

	for(let y = 0; y < 32; y++){
		for(let x = 0; x < 32; x++){
			let id = x + y*32;
			/*for(let i = 0; i < 4; i++){
				c += pixels[id*4 + i];
			}*/
			let r = pixels[id*4];
			let g = pixels[id*4+1];
			let b = pixels[id*4+2];
			if( (r+g+b) != 0){
				let ax = x*20;
				let ay = y*20;
				agents.push(new Agent(ax,ay, rgb(r,g,b) ));
			}
		}
	}
	

	requestAnimationFrame(frame);
}

class Agent{
	constructor(_rx, _ry, _c){
		this.pos = {
            x: Math.floor(Math.random() * 1563), 
            y: Math.floor(Math.random() * 768)
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
		var v1 = {x : this.restPos.x - this.pos.x, y : this.restPos.y - this.pos.y};
        var mag = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
        this.speed = mag/60;
	}
	update(){
        if(this.hasReachedRest) return;
        
        var move = {x : 0, y : 0};
        
        /*if(this.restPos.x > this.pos.x)
            move.x = 1;
        else if(this.restPos.x < this.pos.x)
            move.x = -1;
        
        if(this.restPos.y > this.pos.y)
            move.y = 1;
        else if(this.restPos.y < this.pos.y)
            move.y = -1;*/
        
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
            //this.color = "white";
        }
	}
	render(){
		ctx.fillStyle = this.color;
        ctx.beginPath();
		//ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI*2);
		ctx.rect(this.pos.x, this.pos.y,20,20);
		ctx.fill();
	}
}