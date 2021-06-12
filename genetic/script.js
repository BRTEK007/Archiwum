'use strict';

var canvas, ctx;
var painter;

var course;
var population;

const GRID = {
  cell_size: 120,
  width: 20,
  height: 25,
  offset_x: 10,
  offset_y: 10,
  id: (x, y) => x + y * GRID.width
}

function renderHorizontalBlock(_gx, _gy){
  let x = GRID.offset_x + _gx * (GRID.cell_size + 1) + 1;
  let y = GRID.offset_y + _gy * (GRID.cell_size + 1)+ 1;
  let w = GRID.cell_size -1;
  let h = GRID.cell_size -1;

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fill();

  ctx.lineWidth = h*0.05;
  ctx.strokeStyle = 'yellow';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
}

function renderLeftSideRoundedBlock(_gx, _gy){
  let x = GRID.offset_x + (_gx+0.5) * (GRID.cell_size + 1) + 1;
  let y = GRID.offset_y + _gy* (GRID.cell_size + 1)+ 1;
  let w = GRID.cell_size/2 -1;
  let h = GRID.cell_size -1;


  ctx.fillStyle = "green";
  ctx.rect(x, y, w, h);
  ctx.fill();

  ctx.lineWidth = h*0.05;
  ctx.strokeStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(x+1, y + GRID.cell_size/2, GRID.cell_size/2, 0.5* Math.PI,  1.5 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

}

function renderRightSideRoundedBlock(_gx, _gy){

}

class Course{
  constructor(){
    this.blocks = [];

    for(let x = 0; x < GRID.width; x++){
      var b = new Block(x, Math.floor(GRID.height/2));
      this.blocks.push(b);
    }

    this.blocks[0].index = 0;
    this.blocks[0].color = "green";
    this.blocks[0].next = this.blocks[1];
    this.blocks[0].setWalls();

    for(let i = 1; i < this.blocks.length-1; i++){
      this.blocks[i].prev = this.blocks[i-1];
      this.blocks[i].next = this.blocks[i+1];
      this.blocks.index = i;
      this.blocks[i].setWalls();
    }

    this.blocks[this.blocks.length-1].index = this.blocks.length-1;
    this.blocks[this.blocks.length-1].color = "red";
    this.blocks[this.blocks.length-1].prev = this.blocks[this.blocks.length-2];
    this.blocks[this.blocks.length-1].setWalls();

  }
  render(){
    for(let i = 0; i < this.blocks.length; i++){
      this.blocks[i].render();
    }
  }
}

class Block{
  constructor(_x, _y){
    this.gridPos = {x : _x, y : _y};
    this.next = null;
    this.prev = null;
    this.index = null;
    this.color = "white";
    this.walls = [];
  }
  render(){
    let x = GRID.offset_x + this.gridPos.x * (GRID.cell_size + 1) +1;
    let y = GRID.offset_y + this.gridPos.y * (GRID.cell_size + 1) +1; 
    let w = GRID.cell_size -1;
    let h = GRID.cell_size -1;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();

    ctx.lineWidth = h*0.05;
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    for(let i = 0; i < this.walls.length; i++){
      ctx.moveTo(GRID.offset_x + this.walls[i].x1 * (GRID.cell_size + 1) + 1, GRID.offset_y + this.walls[i].y1 * (GRID.cell_size + 1)+ 1);
      ctx.lineTo(GRID.offset_x + this.walls[i].x2 * (GRID.cell_size + 1) + 1, GRID.offset_y + this.walls[i].y2 * (GRID.cell_size + 1)+ 1);
    }
    ctx.stroke();
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
    //check for next block orientaion, AKA distance to the next blocks wall
    let lx = this.gridPos.x * (GRID.cell_size+1) + GRID.offset_x;
    let rx = (this.gridPos.x+1) * (GRID.cell_size+1) + GRID.offset_x;
    return (_ax - lx) / (rx-lx);
  }
  setWalls(){
    var isWall = [true, true, true, true];
    if(this.next != null){

      if(this.next.gridPos.y == this.gridPos.y){
        if(this.next.gridPos.x > this.gridPos.x)
          isWall[2] = false;
        else
          isWall[0] = false;
      }else{
        if(this.next.gridPos.y > this.gridPos.y)
          isWall[3] = false;
        else
          isWall[1] = false;
      }

    }

    if(this.prev != null){

      if(this.prev.gridPos.y == this.gridPos.y){
        if(this.prev.gridPos.x > this.gridPos.x)
          isWall[2] = false;
        else
          isWall[0] = false;
      }else{
        if(this.prev.gridPos.y > this.gridPos.y)
          isWall[3] = false;
        else
          isWall[1] = false;
      }

    }

    if(isWall[0] == true) this.walls.push({x1: this.gridPos.x, y1: this.gridPos.y, x2: this.gridPos.x, y2: this.gridPos.y+1});
    if(isWall[1] == true) this.walls.push({x1: this.gridPos.x, y1: this.gridPos.y, x2: this.gridPos.x+1, y2: this.gridPos.y}); 
    if(isWall[2] == true) this.walls.push({x1: this.gridPos.x+1, y1: this.gridPos.y, x2: this.gridPos.x+1, y2: this.gridPos.y+1}); 
    if(isWall[3] == true) this.walls.push({x1: this.gridPos.x, y1: this.gridPos.y+1, x2: this.gridPos.x+1, y2: this.gridPos.y+1});  
  }
}

class Population{
  constructor(_course){
    this.startBlock = _course.blocks[0];
    this.startPos = {x: (this.startBlock.gridPos.x+0.5) * (GRID.cell_size+1) + GRID.offset_x, y: (this.startBlock.gridPos.y+0.5) * (GRID.cell_size+1) +  + GRID.offset_y};
    this.populationSize = 20;
    this.iteration = 0;
    this.mutationRate = 0.05;
    this.cutOffRate = 0.1;
    this.genesSize = _course.blocks.length*20;
    this.agents = new Array(this.populationSize);
    for(let i = 0; i < this.populationSize; i++){
      this.agents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y, this.genesSize);
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
    var afterCutOffSize = Math.floor((1-this.cutOffRate) * this.populationSize);
    for(let i = 0; i <  afterCutOffSize; i++){
      for(let j = i*i; j < afterCutOffSize*afterCutOffSize; j++){
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
      this.agents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y, this.genesSize);
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
    var child = new Agent(this.startBlock, this.startPos.x, this.startPos.y, this.genesSize);
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
  constructor(_startBlock, _x, _y, _gensSize){
    this.vel = {x : 0, y : 0};
    this.pos = {x: _x, y : _y};
    this.currentBlock = _startBlock;
    this.furthestBlockReachedIndex = _startBlock.index;
    this.furthestBlockCoverRate = 0;
    this.finished = false;
    this.genes = new Array(_gensSize);
  }
  update(_iteration){
    if(_iteration >= this.genes.length){ 
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
    for(let i = 0; i < this.genes.length; i++){
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
  //drawGrid();

  course = new Course();
  population = new Population(course);

  window.requestAnimationFrame(frame);
}

function updateGridDimensions() {
  GRID.width = Math.floor((canvas.width - GRID.cell_size*0.5) / (GRID.cell_size + 1));
  GRID.height = Math.floor((canvas.height - GRID.cell_size*0.5) / (GRID.cell_size + 1));
  GRID.offset_x = Math.floor((canvas.width - (GRID.cell_size + 1) * GRID.width) / 2);
  GRID.offset_y = Math.floor((canvas.height - (GRID.cell_size + 1) * GRID.height) / 2);
  GRID.cells = new Array(GRID.width * GRID.height).fill(0);
}

function drawGrid() {
  ctx.lineWidth = 1;
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

  course.render();
  population.update();
  population.render();
  
  //drawGrid();
}
