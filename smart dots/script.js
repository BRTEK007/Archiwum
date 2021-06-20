'use strict';
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

function setup(){
	canvas = document.getElementById('myCanvas');
	canvas.width = 1563;
	canvas.height = 768;
	ctx = canvas.getContext("2d");
	canvas.addEventListener('mousedown', (e) => {
		console.log(e.offsetX, e.offsetY);
	});
	agents = new Array(40);
    var a = 0;
	for(let i = 0; i < 20; i++){
        a += (Math.PI*2) / 20;
        let x = 384 + Math.round(Math.cos(a) * 100);
        let y = 384 + Math.round(Math.sin(a) * 100);
		agents[i] = new Agent(x,y, "red");
	}
    a = 0;
    for(let i = 20; i < 40; i++){
        a += (Math.PI*2) / 20;
        let x = 668 + Math.round(Math.cos(a) * 100);
        let y = 384 + Math.round(Math.sin(a) * 100);
		agents[i] = new Agent(x,y, "green");
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
	}
	update(){
        var move = {x : 0, y : 0};
        
        if(this.restPos.x > this.pos.x)
            move.x = 1;
        else if(this.restPos.x < this.pos.x)
            move.x = -1;
        
        if(this.restPos.y > this.pos.y)
            move.y = 1;
        else if(this.restPos.y < this.pos.y)
            move.y = -1;
            
        this.pos.x += move.x;
        this.pos.y += move.y;
	}
	render(){
		ctx.fillStyle = this.color;
        ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI*2);
		ctx.fill();
	}
}