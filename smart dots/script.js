function frame() {
	requestAnimationFrame(frame);
	for(let i = 0; i < 10; i++){
		agents[i].render();
	}
}

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
	agents = new Array(10);
	for(let i = 0; i < 10; i++){
		agents[i] = new Agent();
	}
	requestAnimationFrame(frame);
}

class Agent{
	constructor(){
		this.pos = {x: 50, y: 50};
		this.restPos = {x: 300, y: 500};
	}
	update(){

	}
	render(){
		ctx.fillStyle = "white";
		ctx.arc(this.pos.x, this.pos.y, 10, 0, Math.PI*2);
		ctx.fill();
	}
}