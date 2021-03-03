var canvas, ctx;
var solver;
var painting;

var settings = {
  size: 30,
  algorythm: 'A*',
  diagonal: true,
  diagonal: 51,
}

var grid = {
  cell_size: 30,
  width: 20,
  height: 25,
  offset_x: 10,
  offset_y: 10
}

function drawGrid(){
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.strokeStyle = "white";
  for(var x = 1; x < grid.width; x++){
    ctx.beginPath();
    ctx.moveTo(grid.offset_x + (1+grid.cell_size) * x, 0);
    ctx.lineTo(grid.offset_x + (1+grid.cell_size) * x, canvas.height);
    ctx.stroke();
  }
  for(var y = 1; y < grid.height; y++){
    ctx.beginPath();
    ctx.moveTo(0, grid.offset_y + (1+grid.cell_size) * y);
    ctx.lineTo(canvas.width , grid.offset_y + (1+grid.cell_size) * y);
    ctx.stroke();
  }
}

function updateGridDimensions() {
  grid.cell_size = settings.size;
  grid.width = Math.floor((canvas.width - 1) / (grid.cell_size + 1));
  grid.height = Math.floor((canvas.height - 1) / (grid.cell_size + 1));
  grid.offset_x = Math.floor((canvas.width - (grid.cell_size + 1) * grid.width) / 2);
  grid.offset_y = Math.floor((canvas.height - (grid.cell_size + 1) * grid.height) / 2);
}

function changeSettings(param, val) {
  switch (param) {
    case 'SIZE':
      settings.size = parseInt(val);
      updateGridDimensions();
      drawGrid();
      break;
    case 'ALGORYTHM':
      settings.algorythm = val;
      break;
    case 'SPACING':
      settings.diagonal = val;
      break;
    case 'SPEED':
      settings.speed = parseInt(val);
      break;
  }
}

function pageLoaded() {
  canvas = document.getElementById('canvas1');

  canvas.addEventListener('mousemove', e => {
    if(!painting) return;
    let cx = Math.floor((e.offsetX-grid.offset_x) / (grid.cell_size + 1));
    cx = Math.min(cx, grid.width-1);
    cx = Math.max(cx, 0);
    let cy = Math.floor((e.offsetY-grid.offset_y) / (grid.cell_size + 1));
    cy = Math.min(cy, grid.height-1);
    cy = Math.max(cy, 0);

    let x = grid.offset_x + cx*(grid.cell_size+1);
    let y = grid.offset_y + cy*(grid.cell_size+1);
    let w = grid.cell_size;
    let h = grid.cell_size;
    if(cx == 0){
       w += grid.offset_x;
       x -= grid.offset_x;
    }else if(cx == grid.width-1){
      w += grid.offset_x;
    }
    if(cy == 0){
      h += grid.offset_y;
      y -= grid.offset_y;
   }else if(cy == grid.height-1){
     h += grid.offset_y;
   }
    ctx.fillStyle = "white";
    ctx.fillRect(x, y,w, h);
    //draw cell rect function (cx, cy)
  });

  canvas.addEventListener('mouseleave', e => {
    painting = false;
  });

  canvas.addEventListener('mousedown', e => {
    painting = true;
  });

  canvas.addEventListener('mouseup', e => {
    painting = false;
  });

  canvas.height = canvas.getBoundingClientRect().height;
  canvas.width = canvas.getBoundingClientRect().width;
  ctx = canvas.getContext('2d');
  updateGridDimensions();
  drawGrid();
  painting = false;
}

function mouseDown(){
  console.log(4);
}