var canvas, ctx;
var solver;


var painting, brush = 0;
const BRUSH = {
  WALL: 0,
  EMPTY: 1,
  START: 2,
  END: 3
}

const COLORS = {
  GRID_LINE: "#7d7d7d",
  WALL: "white",
  EMPTY: "black",
  START_NODE: "green",
  END_NODE: "red"
}

const WALL = true, EMPTY = false;

const SETTINGS = {
  size: 30,
  algorythm: 'A*',
  diagonal: true,
  diagonal: 51,
}

const GRID = {
  cells: [],//false = empty, true = wall
  cell_size: 30,
  width: 20,
  height: 25,
  offset_x: 10,
  offset_y: 10,
  startNode: { x: 1, y: 1 },
  endNode: { x: 10, y: 10 }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = COLORS.GRID_LINE;
  for (var x = 1; x < GRID.width; x++) {
    ctx.beginPath();
    ctx.moveTo(GRID.offset_x + (1 + GRID.cell_size) * x, 0);
    ctx.lineTo(GRID.offset_x + (1 + GRID.cell_size) * x, canvas.height);
    ctx.stroke();
  }
  for (var y = 1; y < GRID.height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, GRID.offset_y + (1 + GRID.cell_size) * y);
    ctx.lineTo(canvas.width, GRID.offset_y + (1 + GRID.cell_size) * y);
    ctx.stroke();
  }
  ctx.fillStyle = COLORS.START_NODE;
  drawCell(GRID.startNode.x, GRID.startNode.y);
  ctx.fillStyle = COLORS.END_NODE;
  drawCell(GRID.endNode.x, GRID.endNode.y);
}

function updateGridDimensions() {
  GRID.cell_size = SETTINGS.size;
  GRID.width = Math.floor((canvas.width - 1) / (GRID.cell_size + 1));
  GRID.height = Math.floor((canvas.height - 1) / (GRID.cell_size + 1));
  GRID.offset_x = Math.floor((canvas.width - (GRID.cell_size + 1) * GRID.width) / 2);
  GRID.offset_y = Math.floor((canvas.height - (GRID.cell_size + 1) * GRID.height) / 2);
  GRID.cells = new Array(GRID.width * GRID.height).fill(EMPTY);
}

function changeSettings(param, val) {
  switch (param) {
    case 'SIZE':
      SETTINGS.size = parseInt(val);
      updateGridDimensions();
      drawGrid();
      break;
    case 'ALGORYTHM':
      SETTINGS.algorythm = val;
      break;
    case 'SPACING':
      SETTINGS.diagonal = val;
      break;
    case 'SPEED':
      SETTINGS.speed = parseInt(val);
      break;
  }
}

function mouseCordsToCellCords(mx, my) {
  let cx = Math.floor((mx - GRID.offset_x) / (GRID.cell_size + 1));
  cx = Math.min(cx, GRID.width - 1);
  cx = Math.max(cx, 0);
  let cy = Math.floor((my - GRID.offset_y) / (GRID.cell_size + 1));
  cy = Math.min(cy, GRID.height - 1);
  cy = Math.max(cy, 0);
  return { x: cx, y: cy }
}

function drawCell(cx, cy) {
  let x = GRID.offset_x + cx * (GRID.cell_size + 1);
  let y = GRID.offset_y + cy * (GRID.cell_size + 1);
  let w = GRID.cell_size;
  let h = GRID.cell_size;
  if (cx == 0) {
    w += GRID.offset_x;
    x -= GRID.offset_x;
  } else if (cx == GRID.width - 1) {
    w += GRID.offset_x + 2;
  }
  if (cy == 0) {
    h += GRID.offset_y;
    y -= GRID.offset_y;
  } else if (cy == GRID.height - 1) {
    h += GRID.offset_y + 2;
  }
  //ctx.fillStyle = "white";
  ctx.fillRect(x + 1, y + 1, w - 1, h - 1);
}

function pageLoaded() {
  canvas = document.getElementById('canvas1');

  canvas.addEventListener('mousedown', e => {
    painting = true;

    let cords = mouseCordsToCellCords(e.offsetX, e.offsetY);

    if (cords.x == GRID.startNode.x && cords.y == GRID.startNode.y) {
      brush = BRUSH.START;
    } else if (cords.x == GRID.endNode.x && cords.y == GRID.endNode.y) {
      brush = BRUSH.END;
    } else {
      if (e.button == 0) {
        ctx.fillStyle = COLORS.WALL;
        brush = BRUSH.WALL;
      }
      else if (e.button == 2) {
        ctx.fillStyle = COLORS.EMPTY;
        brush = BRUSH.EMPTY;
      }
      let id = cords.x + cords.y * GRID.width;
      GRID.cells[id] = brush == BRUSH.WALL ? WALL : EMPTY;
      drawCell(cords.x, cords.y);
    }
  });

  canvas.addEventListener('mousemove', e => {
    if (!painting) return;
    let cords = mouseCordsToCellCords(e.offsetX, e.offsetY);

    if (brush == BRUSH.START) {
      if (cords.x == GRID.endNode.x && cords.y == GRID.endNode.y) return;
      let oldId = GRID.startNode.x + GRID.startNode.y * GRID.width;
      ctx.fillStyle = GRID.cells[oldId] == WALL ? COLORS.WALL : COLORS.EMPTY;
      drawCell(GRID.startNode.x, GRID.startNode.y);
      ctx.fillStyle = COLORS.START_NODE;
      drawCell(cords.x, cords.y);
      GRID.startNode.x = cords.x;
      GRID.startNode.y = cords.y;
    } else if (brush == BRUSH.END) {
      if (cords.x == GRID.startNode.x && cords.y == GRID.startNode.y) return;
      let oldId = GRID.endNode.x + GRID.endNode.y * GRID.width;
      ctx.fillStyle = GRID.cells[oldId] == WALL ? COLORS.WALL : COLORS.EMPTY;
      drawCell(GRID.endNode.x, GRID.endNode.y);
      ctx.fillStyle = COLORS.END_NODE;
      drawCell(cords.x, cords.y);
      GRID.endNode.x = cords.x;
      GRID.endNode.y = cords.y;
    }

    if (cords.x == GRID.startNode.x && cords.y == GRID.startNode.y) return;
    else if (cords.x == GRID.endNode.x && cords.y == GRID.endNode.y) return;
    let id = cords.x + cords.y * GRID.width;
    GRID.cells[id] = brush == BRUSH.WALL ? WALL : EMPTY;
    drawCell(cords.x, cords.y);
  });

  canvas.addEventListener('mouseup', e => {
    painting = false;
  });
  canvas.addEventListener('mouseleave', e => {
    painting = false;
  });


  canvas.height = canvas.getBoundingClientRect().height;
  canvas.width = canvas.getBoundingClientRect().width;
  ctx = canvas.getContext('2d');
  updateGridDimensions();
  drawGrid();
  painting = false;
}