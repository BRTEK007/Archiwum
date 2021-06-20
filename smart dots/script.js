'use strict';
function frame() {
	requestAnimationFrame(frame);
    ctx.clearRect(0,0,1563, 768);
	for(let i = 0; i < agents.length; i++){
        agents[i].update();
		agents[i].render();
	}
    ctx.fillStyle = "white";
    ctx.fillText("BRO", 100, 100);
}

//notes display image on ctx and get image data, display text on ctx and get image data

var canvas;
var ctx;
var agents;

function setup(){
	canvas = document.getElementById('myCanvas');
	canvas.width = 1563;
	canvas.height = 768;
	ctx = canvas.getContext("2d");
	canvas.addEventListener('mousedown', (e) => {
		console.log(e.offsetX, e.offsetY);
	});
	agents = new Array(20);
    var a = 0;
	for(let i = 0; i < 20; i++){
        a += (Math.PI*2) / 20;
        let x = 384 + Math.round(Math.cos(a) * 100);
        let y = 384 + Math.round(Math.sin(a) * 100);
		agents[i] = new Agent(x,y, "red");
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
            this.color = "white";
        }
	}
	render(){
		ctx.fillStyle = this.color;
        ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI*2);
		ctx.fill();
	}
}