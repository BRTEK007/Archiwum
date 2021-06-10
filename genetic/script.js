'use strict';

var canvas, ctx;
var painter;

var blocks = [];
var population;

const GRID = {
  cell_size: 120,
  width: 20,
  height: 25,
  offset_x: 10,
  offset_y: 10,
  startCell: { x: 0, y: 0 },
  endCell: { x: 2, y: 0 },
  id: (x, y) => x + y * GRID.width
}

class Block{
  constructor(_x, _y){
    this.gridPos = {x : _x, y : _y};
    this.next = null;
    this.prev = null;
    this.index = null;
  }
  render(){
    let x = GRID.offset_x + this.gridPos.x * (GRID.cell_size + 1) + 1;
    let y = GRID.offset_y + this.gridPos.y * (GRID.cell_size + 1)+ 1;
    let w = GRID.cell_size -1;
    let h = GRID.cell_size -1;
    if(this.prev == null)
      ctx.fillStyle = "green";
    else if(this.next == null)
      ctx.fillStyle = "red";
    else
      ctx.fillStyle = "white";
    ctx.fillRect(x, y, w, h);
  }
  isOnBlock(_ax, _ay){
    let lx = this.gridPos.x * (GRID.cell_size+1) + GRID.offset_x;
    if(_ax <= lx) return false;
    let rx = (this.gridPos.x+1) * (GRID.cell_size+1) + GRID.offset_x;
    if(_ax >= rx) return false;

    let ty = this.gridPos.y * (GRID.cell_size+1) + GRID.offset_y;
    if(_ay <= ty) return false;
    let by = (this.gridPos.y+1) * (GRID.cell_size+1) + GRID.offset_y;
    if(_ay >= by) return false;

    return true;
  }
  getCoverRate(_ax, _ay){
    if(this.next == null) return 0;
    //check for next block orientaion
    let lx = this.gridPos.x * (GRID.cell_size+1) + GRID.offset_x;
    let rx = (this.gridPos.x+1) * (GRID.cell_size+1) + GRID.offset_x;
    return (_ax - lx) / (rx-lx);
  }
  setIndexNext(_i){
    this.index = _i;
    if(this.next != null)
      this.next.setIndexNext(_i+1);
  }
}

class Population{
  constructor(_startBlock){
    this.startBlock = _startBlock;
    this.startPos = {x: (_startBlock.gridPos.x+0.5) * (GRID.cell_size+1) + GRID.offset_x, y: (_startBlock.gridPos.y+0.5) * (GRID.cell_size+1) +  + GRID.offset_y};
    this.populationSize = 20;
    this.iteration = 0;
    this.mutationRate = 0.05;
    this.agents = new Array(this.populationSize);
    for(let i = 0; i < this.populationSize; i++){
      this.agents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y);
      this.agents[i].generateRandomGenes();
    }
  }
  update(){
    this.finishedAgents = 0;
    for(let i = 0; i < this.populationSize; i++){
      if(!this.agents[i].finished)
        this.agents[i].update(this.iteration);
      else
        this.finishedAgents++; 
    }
    this.iteration++;
    if(this.finishedAgents == this.populationSize){
      this.evolvePopulation();
      this.iteration = 0;
    }
  }

  evolvePopulation(){
    var sortedAgents = [...this.agents];
    sortedAgents.sort(function(a,b){
      if(a.furthestBlockReachedIndex > b.furthestBlockReachedIndex) return -1;
      else if(a.furthestBlockReachedIndex == b.furthestBlockReachedIndex){
        if(a.furthestBlockCoverRate > b.furthestBlockCoverRate) return -1;
        else return 1;
      }
      else return 1;
    });
    //var indexPoll = new Array(this.populationSize*(this.populationSize+1)/2);
    var indexPoll = [];
    for(let i = 0; i < this.populationSize; i++){
      for(let j = i*i; j < this.populationSize*this.populationSize; j++){
        indexPoll.push(i);
      }
    }
    this.agents[0] = new Agent(this.startBlock, this.startPos.x, this.startPos.y);
    this.agents[0].genes = sortedAgents[0].genes;
    for(let i = 1; i < this.populationSize; i++){
      var p1 = sortedAgents[ indexPoll[ Math.floor(Math.random() * indexPoll.length)] ];
      var p2 = sortedAgents[ indexPoll[ Math.floor(Math.random() * indexPoll.length)] ];
      while(p2 == p1){
        p2 = sortedAgents[ indexPoll[ Math.floor(Math.random() * indexPoll.length)] ];
      }
      var a = this.getChildAgent(p1, p2);
      this.agents[i] = a;
    }

  }

  resetPopulation(){
    for(let i = 0; i < this.populationSize; i++){
      this.agents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y);
      this.agents[i].generateRandomGenes();
    }
  }

  render(){
    ctx.fillStyle = "blue";
    for(let i = 0; i < this.agents.length; i++){
      ctx.beginPath();
      ctx.arc(this.agents[i].pos.x, this.agents[i].pos.y, 10, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  getChildAgent(_a1, _a2){
    var child = new Agent(this.startBlock, this.startPos.x, this.startPos.y);
    for(let i = 0; i < child.genes.length; i++){
      let r = Math.random();
      if(r < this.mutationRate)
        child.genes[i] = {x : Math.random()*2 -1, y : Math.random()*2 -1};
      else if(r < this.mutationRate + (1-this.mutationRate)*2)
        child.genes[i] = _a1.genes[i];
      else
        child.genes[i] = _a2.genes[i];
    }
    return child;
  }

}

class Agent{
  constructor(_startBlock, _x, _y){
    this.vel = {x : 0, y : 0};
    this.pos = {x: _x, y : _y};
    this.currentBlock = _startBlock;
    this.furthestBlockReachedIndex = _startBlock.index;
    this.furthestBlockCoverRate = 0;
    this.finished = false;
    this.genes = new Array(100);
  }
  update(_iteration){
    if(_iteration >= 100){ 
      this.finished = true; 
      return
    }
    //calculate cover rate
    if(this.currentBlock.isOnBlock(this.pos.x, this.pos.y)){
      this.furthestBlockCoverRate = Math.max(this.furthestBlockCoverRate, this.currentBlock.getCoverRate(this.pos.x, this.pos.y));
    }  
    else{
      if(this.currentBlock.next != null && this.currentBlock.next.isOnBlock(this.pos.x, this.pos.y)){
        this.currentBlock = this.currentBlock.next;
        if(this.currentBlock.index > this.furthestBlockReachedIndex){
          this.furthestBlockReachedIndex = this.currentBlock.index;
          this.furthestBlockCoverRate = 0;
        }
      }else if(this.currentBlock.prev != null && this.currentBlock.prev.isOnBlock(this.pos.x, this.pos.y)){
        this.currentBlock = this.currentBlock.prev;
      }else{
        this.finished = true;
        return;
      }
    }
    this.vel.x += this.genes[_iteration].x;
    this.vel.y += this.genes[_iteration].y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    //console.log(this.genes);
  }
  generateRandomGenes(){
    for(let i = 0; i < 100; i++){
      this.genes[i] = {
        x : Math.random()*2 -1,
        y : Math.random()*2 -1
      };
    }
  }
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

  updateGridDimensions();
  drawGrid();

  for(let x = GRID.startCell.x; x <= GRID.endCell.x; x++){
    var b = new Block(x, GRID.startCell.y);
    if(x > GRID.startCell.x){
      b.prev = blocks[blocks.length -1];
      blocks[blocks.length-1].next = b;
    }
    blocks.push(b);
  }
  blocks[0].setIndexNext(0);
  population = new Population(blocks[0]);

  //drawCell(GRID.startCell.x, GRID.startCell.y, "green");
  //drawCell(GRID.endCell.x, GRID.endCell.y, "red");

  /*for(let x = GRID.startCell.x+1; x < GRID.endCell.x; x++){
    drawCell(x, GRID.endCell.y, "white");
  }*/

  window.requestAnimationFrame(frame);
}

function updateGridDimensions() {
  GRID.width = Math.floor((canvas.width - GRID.cell_size*0.5) / (GRID.cell_size + 1));
  GRID.height = Math.floor((canvas.height - GRID.cell_size*0.5) / (GRID.cell_size + 1));
  GRID.offset_x = Math.floor((canvas.width - (GRID.cell_size + 1) * GRID.width) / 2);
  GRID.offset_y = Math.floor((canvas.height - (GRID.cell_size + 1) * GRID.height) / 2);
  GRID.startCell = { x: Math.round(GRID.width * 0.3333), y: Math.round(GRID.height / 2) };
  GRID.endCell = { x: Math.round(GRID.width * 0.6666), y: Math.round(GRID.height / 2) };
  GRID.cells = new Array(GRID.width * GRID.height).fill(0);
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'white';
  for (var x = 0; x <= GRID.width; x++) {
    ctx.beginPath();
    ctx.moveTo(GRID.offset_x + (1 + GRID.cell_size) * x, GRID.offset_y);
    ctx.lineTo(GRID.offset_x + (1 + GRID.cell_size) * x, GRID.offset_y + (1 + GRID.cell_size) * GRID.height);
    ctx.stroke();
  }
  for (var y = 0; y <= GRID.height; y++) {
    ctx.beginPath();
    ctx.moveTo(GRID.offset_x, GRID.offset_y + (1 + GRID.cell_size) * y);
    ctx.lineTo(GRID.offset_x + (1 + GRID.cell_size) * GRID.width, GRID.offset_y + (1 + GRID.cell_size) * y);
    ctx.stroke();
  }
}

function frame() {
  window.requestAnimationFrame(frame);
  ctx.clearRect(0,0, canvas.width, canvas.height);
  for(let i = 0; i < blocks.length; i++){
    blocks[i].render();
  }

 population.update();
 population.render(); 
}
