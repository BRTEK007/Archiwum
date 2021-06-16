'use strict';

var canvas, ctx, GEN_SPAN, SR_SPAN;

var course;
var population;

const GRID = {
  cell_size: null,
  width: 8,
  height: 5,
  offset_x: 0,
  offset_y: 10,
  id: (x, y) => x + y * GRID.width
};

const SETTINGS = {
  keepBest: true,
  edditingMode: false
};

const EDIT = {
  grid: null,
  course : null
}



class Course{
  constructor(_fill){
    this.blocks = [];

    if(!_fill) return;

    for(let y = 0; y < GRID.height; y++){
      let b = new Block(0,y);
      this.blocks.push(b);
    }

    this.blocks[0].index = 0;
    this.blocks[0].next = this.blocks[1];
    this.blocks[0].setWalls();

    for(let i = 1; i < this.blocks.length-1; i++){
      this.blocks[i].prev = this.blocks[i-1];
      this.blocks[i].next = this.blocks[i+1];
      this.blocks[i].index = i;
      this.blocks[i].setWalls();
    }

    this.blocks[this.blocks.length-1].index = this.blocks.length-1;
    this.blocks[this.blocks.length-1].prev = this.blocks[this.blocks.length-2];
    this.blocks[this.blocks.length-1].setWalls();

  }
  addBlock(_x, _y){
    let b = new Block(_x,_y);
    b.index = this.blocks.length;
    if(this.blocks.length > 0){
       b.prev = this.blocks[this.blocks.length-1];
       this.blocks[this.blocks.length-1].next = b;
       this.blocks[this.blocks.length-1].setWalls();
    }
    b.setWalls();
    this.blocks.push(b);
  }
  getLastBlockId(){
    return this.blocks[this.blocks.length-1].gridPos.x + this.blocks[this.blocks.length-1].gridPos.y * GRID.width;
  }
  render(){
    ctx.fillStyle = "gray";
    for(let i = 0; i < this.blocks.length; i++){
      let x = GRID.offset_x + this.blocks[i].gridPos.x * (GRID.cell_size + 1) +1;
      let y = GRID.offset_y + this.blocks[i].gridPos.y * (GRID.cell_size + 1) +1; 
      //filling
      ctx.beginPath();
      ctx.rect(x, y, GRID.cell_size -1, GRID.cell_size -1);
      ctx.fill();
      //walls
      ctx.lineWidth = (GRID.cell_size -1)*0.05;
      ctx.strokeStyle = 'yellow';
      ctx.beginPath();
      for(let j = 0; j < this.blocks[i].walls.length; j++){
        ctx.moveTo(GRID.offset_x + this.blocks[i].walls[j].x1 * (GRID.cell_size + 1) + 1, GRID.offset_y + this.blocks[i].walls[j].y1 * (GRID.cell_size + 1)+ 1);
        ctx.lineTo(GRID.offset_x + this.blocks[i].walls[j].x2 * (GRID.cell_size + 1) + 1, GRID.offset_y + this.blocks[i].walls[j].y2 * (GRID.cell_size + 1)+ 1);
      }
      ctx.stroke();
    }
    //draw spawn point
    if(this.blocks.length < 1) return;
    let x = GRID.offset_x + (this.blocks[0].gridPos.x+0.5) * (GRID.cell_size + 1) +1;
    let y = GRID.offset_y + (this.blocks[0].gridPos.y+0.5) * (GRID.cell_size + 1) +1; 
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.arc(x, y, GRID.cell_size*0.1, 0, 2 * Math.PI);
    ctx.stroke();
    //draw target\
    if(this.blocks.length < 2) return;
    x = GRID.offset_x + (this.blocks[this.blocks.length-1].gridPos.x+0.5) * (GRID.cell_size + 1) +1;
    y = GRID.offset_y + (this.blocks[this.blocks.length-1].gridPos.y+0.5) * (GRID.cell_size + 1) +1; 
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, GRID.cell_size*0.21, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, GRID.cell_size*0.14, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, GRID.cell_size*0.07, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class Block{
  constructor(_x, _y){
    this.gridPos = {x : _x, y : _y};
    this.next = null;
    this.nextBlockOrientation = null;
    this.prev = null;
    this.index = null;
    this.walls = [];
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

    let lx = this.gridPos.x * (GRID.cell_size+1) + GRID.offset_x;
    let rx = (this.gridPos.x+1) * (GRID.cell_size+1) + GRID.offset_x;
    let ty = this.gridPos.y * (GRID.cell_size+1) + GRID.offset_y;
    let by = (this.gridPos.y+1) * (GRID.cell_size+1) + GRID.offset_y;
    
    switch(this.nextBlockOrientation){
      case 0: return (rx - _ax) / (rx-lx);
      case 1: return (by - _ay) / (by-ty);
      case 2: return (_ax - lx) / (rx-lx);
      case 3: return (_ay - ty) / (by-ty); 
    }
  }
  setWalls(){
    var isWall = [true, true, true, true];
    if(this.next != null){

      if(this.next.gridPos.y == this.gridPos.y){
        if(this.next.gridPos.x > this.gridPos.x){
          isWall[2] = false;
          this.nextBlockOrientation = 2;
        }
        else{
          isWall[0] = false;
          this.nextBlockOrientation = 0;
        }
      }else{
        if(this.next.gridPos.y > this.gridPos.y){
          isWall[3] = false;
          this.nextBlockOrientation = 3;
        }
        else{
          isWall[1] = false;
          this.nextBlockOrientation = 1;
        }
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
    this.walls = [];  
    if(isWall[0] == true) this.walls.push({x1: this.gridPos.x, y1: this.gridPos.y, x2: this.gridPos.x, y2: this.gridPos.y+1});
    if(isWall[1] == true) this.walls.push({x1: this.gridPos.x, y1: this.gridPos.y, x2: this.gridPos.x+1, y2: this.gridPos.y}); 
    if(isWall[2] == true) this.walls.push({x1: this.gridPos.x+1, y1: this.gridPos.y, x2: this.gridPos.x+1, y2: this.gridPos.y+1}); 
    if(isWall[3] == true) this.walls.push({x1: this.gridPos.x, y1: this.gridPos.y+1, x2: this.gridPos.x+1, y2: this.gridPos.y+1});  
  }
  checkForGoal(_ax, _ay){
    if(this.next != null) return false;

    let cx = GRID.offset_x + (this.gridPos.x+0.5) * (GRID.cell_size + 1) +1;
    let cy = GRID.offset_y + (this.gridPos.y+0.5) * (GRID.cell_size + 1) +1;
    
    return (Math.sqrt(Math.pow(cx - _ax, 2) + Math.pow(cy - _ay, 2)) <= GRID.cell_size*0.21);
  }
}

class Population{
  constructor(_course){
    this.startBlock = _course.blocks[0];
    this.startPos = {x: (this.startBlock.gridPos.x+0.5) * (GRID.cell_size+1) + GRID.offset_x, y: (this.startBlock.gridPos.y+0.5) * (GRID.cell_size+1) +  + GRID.offset_y};
    this.populationSize = 50;
    this.desiredPopulationSize = null;
    this.iteration = 0;
    this.mutationRate = 0.05;
    this.cutOffRate = 0.0;
    this.genesSize = _course.blocks.length*30;
    this.agents = new Array(this.populationSize);
    this.generation = 1;
    for(let i = 0; i < this.populationSize; i++){
      this.agents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y, this.genesSize);
      this.agents[i].generateRandomGenes();
    }
  }
  update(){
    var finishedAgents = 0;
    var succesfulAgents = 0;
    for(let i = 0; i < this.populationSize; i++){
      if(!this.agents[i].finished)
        this.agents[i].update(this.iteration);
      else{
        finishedAgents++;
        if(this.agents[i].hasReachedGoal) succesfulAgents++;
      } 
    }
    this.iteration++;
    if(this.iteration == this.genesSize || finishedAgents == this.populationSize){
      this.evolvePopulation();
      DOM_updateGenerationStats(this.generation, 100*succesfulAgents/this.populationSize);
      this.generation++;
      this.iteration = 0;
    }
  }

  skipGenerations(_g){
    var targetGen = this.generation + _g;
    while(this.generation < targetGen){
      this.update();
    }
  }

  evolvePopulation(){
    var fitnessSum = 0.0;
    var bestAgent = this.agents[0];
    for(let i = 0; i < this.agents.length; i++){
      if(this.agents[i].hasReachedGoal)
        this.agents[i].fitness = this.genesSize/30 + 1 - this.agents[i].stepsToReachGoal/this.genesSize;
      else
        this.agents[i].fitness = (this.agents[i].furthestBlockReachedIndex + this.agents[i].furthestBlockCoverRate) * 0.8;

      fitnessSum += this.agents[i].fitness;
      if(this.agents[i].fitness > bestAgent.fitness) bestAgent = this.agents[i];
    }
    var newAgents = new Array(this.populationSize);

    for(let i = 0; i < this.populationSize; i++){
      let rSum = Math.random() * fitnessSum;
      let a = this.getAgentByFitnessSum(rSum);  
      newAgents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y);//overrites fitness
      newAgents[i].genes = [...a.genes];
      newAgents[i].mutateGenes(this.mutationRate); 
    }

    if(SETTINGS.keepBest) newAgents[0].genes = [...bestAgent.genes];

    this.agents = newAgents;

    //resize population if needed
    if(this.desiredPopulationSize!=null){
      if(this.desiredPopulationSize > this.populationSize){
        var additionalAgents = new Array(this.desiredPopulationSize-this.populationSize);
        for(let i = 0; i < this.desiredPopulationSize-this.populationSize; i++){
          additionalAgents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y, this.genesSize);
          additionalAgents[i].generateRandomGenes();
        }   
        this.agents = this.agents.concat(additionalAgents);
      }else if(this.desiredPopulationSize < this.populationSize){
        this.agents.splice(this.desiredPopulationSize-1, this.populationSize-this.desiredPopulationSize);
      }
      this.populationSize = this.desiredPopulationSize;
      this.desiredPopulationSize = null;
    }
  }

  getAgentByFitnessSum(_rs) {
      var fSum = 0.0;
      for(let i = 0; i < this.populationSize; i++){
        fSum += this.agents[i].fitness;
        if(fSum > _rs)
          return this.agents[i];
      }
  }

    /*var sortedAgents = [...this.agents];
    sortedAgents.sort(function(a,b){
      return b.fitness - a.fitness;
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
    this.agents[0].genes = [...sortedAgents[0].genes];
    for(let i = 1; i < this.populationSize; i++){
      var p1 = sortedAgents[ indexPoll[ Math.floor(Math.random() * indexPoll.length)] ];
      var p2 = sortedAgents[ indexPoll[ Math.floor(Math.random() * indexPoll.length)] ];
      /*while(p2 == p1){
        p2 = sortedAgents[ indexPoll[ Math.floor(Math.random() * indexPoll.length)] ];
      }
      var a = this.getChildAgent(p1, p2);
      this.agents[i] = a;
      this.agents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y, this.genesSize);
      this.agents[i].genes = [...this.agents[0].genes];
      this.agents[i].mutateGenes(0.2);
    }*/

  reset(){
    for(let i = 0; i < this.populationSize; i++){
      this.agents[i] = new Agent(this.startBlock, this.startPos.x, this.startPos.y, this.genesSize);
      this.agents[i].generateRandomGenes();
    }
    this.generation = 1;
    this.iteration = 0;
  }

  render(){
    ctx.fillStyle = "blue";
    for(let i = 0; i < this.agents.length; i++){
      ctx.beginPath();
      ctx.arc(this.agents[i].pos.x, this.agents[i].pos.y, GRID.cell_size*0.1, 0, 2 * Math.PI);
      ctx.fill();
    }
    if(SETTINGS.keepBest){
      ctx.fillStyle = "magenta";
      ctx.beginPath();
      ctx.arc(this.agents[0].pos.x, this.agents[0].pos.y, GRID.cell_size*0.1, 0, 2 * Math.PI);
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
    this.hasReachedGoal = false;
    this.stepsToReachGoal = 0;
    this.finished = false;
    this.fitness = 0.0;
    this.genes = new Array(_gensSize);
  }
  update(_iteration){
    //check for reached goal
    if(this.currentBlock.checkForGoal(this.pos.x, this.pos.y)){
      this.hasReachedGoal = true;
      this.finished = true;
      this.stepsToReachGoal = _iteration;
      return;
    }
    //calculate cover rate
    if(this.currentBlock.isOnBlock(this.pos.x, this.pos.y)){
      this.furthestBlockCoverRate = Math.max(this.furthestBlockCoverRate, this.currentBlock.getCoverRate(this.pos.x, this.pos.y));
      this.furthestBlockCoverRate = this.currentBlock.getCoverRate(this.pos.x, this.pos.y);
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
    //this.pos.x += this.genes[_iteration].x;
    //this.pos.y += this.genes[_iteration].y;
    //console.log(this.genes);
  }
  generateRandomGenes(){
    for(let i = 0; i < this.genes.length; i++){
      let a = Math.random() * Math.PI * 2;
      this.genes[i] = {
        x : Math.cos(a),
        y : Math.sin(a)
      };
    }
  }
  mutateGenes(_mr){
    for(let i = 0; i < this.genes.length; i++){
      let r = Math.random();
      if(r < _mr){
        let a = Math.random() * Math.PI * 2;
        this.genes[i] = {
          x : Math.cos(a),
          y : Math.sin(a)
        };
      }
    }
  }

  calculateFitness(){

  }

}

function pageLoaded() {
  GEN_SPAN = document.getElementById('GEN_SPAN');
  SR_SPAN = document.getElementById('SR_SPAN');
  dragElement(document.getElementById("menuDiv"));

  canvas = document.getElementById('canvas1');

  canvas.height = canvas.getBoundingClientRect().height;
  canvas.width = canvas.getBoundingClientRect().width;
  ctx = canvas.getContext('2d');

  updateGridDimensions();

  course = new Course(true);
  population = new Population(course);

  window.requestAnimationFrame(frame);
}

function updateGridDimensions() {
  GRID.cell_size = Math.min((canvas.width*0.9)/GRID.width, (canvas.height*0.9)/GRID.height);
  //GRID.width = Math.floor((canvas.width - GRID.cell_size*0.5) / (GRID.cell_size + 1));
  //GRID.height = Math.floor((canvas.height - GRID.cell_size*0.5) / (GRID.cell_size + 1));
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
  if(SETTINGS.edditingMode) return;
  ctx.clearRect(0,0, canvas.width, canvas.height);

  course.render();
  //for(let i = 0; i < 10; i++)
  population.update();
  population.render();
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

function DOM_MR_change(_val){
  let v = parseInt(_val);
  if(v > 100 || v < 0) return;
      population.mutationRate = v;
}

function DOM_PS_change(_val){
  let v = parseInt(_val);
  if(v > 100 || v < 1) return;
      population.desiredPopulationSize = v;
}

function DOM_KB_change(_val){
  SETTINGS.keepBest = _val;
}

function DOM_RESET_press(){
  population.reset();
}

function DOM_SKIP_press(_val){
  population.skipGenerations(parseInt(_val));
}

function DOM_EDIT_press(){
  SETTINGS.edditingMode = true;
  document.getElementById('menu1').classList.add('hidden');
  document.getElementById('menu2').classList.remove('hidden');
  
  EDIT.course = new Course(false);
  EDIT.grid = new Array(GRID.width * GRID.height).fill(0);

  ctx.clearRect(0,0, canvas.width, canvas.height);
  drawGrid();

  canvas.addEventListener("mousedown", (e) => {
    let tx = Math.floor((e.clientX - GRID.offset_x)/(GRID.cell_size+1));
    let ty = Math.floor((e.clientY - GRID.offset_y)/(GRID.cell_size+1));
    let id = tx + ty * GRID.width;
    if(EDIT.grid[id] != 0) return;//and if course last block is not neighbour
    if(EDIT.course.blocks.length > 0 && ![1, GRID.width].includes( Math.abs(EDIT.course.getLastBlockId() - id) ) ) return;
    //if(EDIT.course.blocks.length > 0)
    //console.log(Math.abs(EDIT.course.getLastBlockId() - id), [1, GRID.width].includes( Math.abs(EDIT.course.getLastBlockId() - id) ) );
    EDIT.grid[id] = 1;
    EDIT.course.addBlock(tx, ty);
    ctx.clearRect(0,0, canvas.width, canvas.height);
    drawGrid();
    EDIT.course.render();

    /*if(EDIT.course.blocks.length == 0){
      EDIT.grid[tx + ty * GRID.width] = 1;
      EDIT.course.addBlock(tx, ty);
      EDIT.course.render();
    }*/
  });
}

function DOM_CLEAR_press(){
  EDIT.grid = new Array(GRID.width * GRID.height).fill(0);
  EDIT.course = new Course(false);
  ctx.clearRect(0,0, canvas.width, canvas.height);
  drawGrid();
}

function DOM_DONE_press(){
  course = EDIT.course;
  population = new Population(course);
  EDIT.grid = null;
  EDIT.course = null;
  SETTINGS.edditingMode = false;
  document.getElementById('menu1').classList.remove('hidden');
  document.getElementById('menu2').classList.add('hidden');
}

function DOM_CANCEL_press(){
  document.getElementById('menu2').classList.add('hidden');
  document.getElementById('menu1').classList.remove('hidden');
  SETTINGS.edditingMode = false;
}

function DOM_updateGenerationStats(_gen, _sr){
  GEN_SPAN.innerHTML = _gen;
  SR_SPAN.innerHTML = _sr;
}
