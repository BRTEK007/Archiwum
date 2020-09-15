var grid_height = [15,30,50];
var grid_width = [30,60,100];
var node_size;

var canvas_width;
var canvas_height;

var nodes;
var ctx;
let painting = false;
var c;
var brush_node = 0;
var start_node = 0;
var end_node = grid_height[grid_size]*grid_width[grid_size]-1;
var not_updated_nodes = 0;
var skip_nodes = [2,5,8];
var path_speed = [30,20,10];
var loop = false;
var isShowing= false;
var canDiagonal = false;
var showAnimation = true;
var solving_method = 0;//0-djikstra, 1-A*

var grid_size = 1;

const Struct = (...keys) => ((...v) => keys.reduce((o, k, i) => {o[k] = v[i]; return o} , {}));
const cost_path = Struct('dist', 'path');
const neighbour = Struct('index','dist');


function main(){
  c = document.getElementById("myCanvas");
  c.addEventListener('mousedown', e => {
    painting = true;
    set_brush_node(e);
    draw_nodes(e);
  });
  c.addEventListener('mousemove', e => draw_nodes(e));
  c.addEventListener('mouseup', e => {
    painting = false;
  });
  c.addEventListener('mouseleave', e => {
    painting = false;
  });
  set_dimensions(grid_size);
  reset_grid();
  draw_grid();
}

function set_brush_node(e){
  var pos = mouse_node(e.clientX, e.clientY);
  if(pos == start_node)
    brush_node = 2;
  else if(pos == end_node)
    brush_node = 3;
  else
    brush_node = e.button == 0 ? 1: 0;
}

function reset_grid(){
  nodes = [grid_width[grid_size] * grid_height[grid_size]];
  for(let i = 0; i < grid_width[grid_size] * grid_height[grid_size]; i++){
    nodes[i] = 0;
  }
  start_node = 0;
  end_node = grid_height[grid_size]*grid_width[grid_size]-1;
  isShowing = false;
}

function draw_grid(){
  ctx = c.getContext("2d");
  for(let i = 0; i < grid_width[grid_size] * grid_height[grid_size]; i++){
    let y = (i - i%grid_width[grid_size])/grid_width[grid_size];
    let x = i%grid_width[grid_size];
    
    var node_id = nodes[i];
    if(i == start_node)
      node_id = 2;
    else if(i == end_node)
      node_id = 3;
    ctx.beginPath();
    ctx.fillStyle = node_color(node_id);
    ctx.rect(x*node_size, y*node_size,node_size,node_size);
    ctx.stroke();
    ctx.fill();
  }
}

function set_dimensions(s){
  var div = document.getElementById("canvas_div");
  grid_size = s;
  canvas_width = div.clientWidth - div.clientWidth%grid_width[grid_size];
  canvas_height = canvas_width*0.5;
  c.style.width =canvas_width;
  c.style.height = canvas_height;
  c.width = canvas_width;
  c.height = canvas_height;
  node_size = canvas_width/grid_width[grid_size];
}

function node_color(n){
  switch(n){
    case 0:
      return "white";
      break;
    case 1:
      return "black";
     break;
    case 2:
      return "green";
      break;
    case 3:
      return "red";
      break;
  }
}

function draw_nodes(e){
  var pos = mouse_node(e.clientX, e.clientY);

  if(pos == start_node || pos == end_node|| !painting || brush_node == nodes[pos])
    return;
  
  let y = (pos - pos%grid_width[grid_size])/grid_width[grid_size];
  let x = pos%grid_width[grid_size];

  if(brush_node < 2){//wall erase
    ctx.fillStyle = brush_node == 1 ? "black" : "white";
    nodes[pos] = brush_node;
    ctx.beginPath();
    ctx.rect(x*node_size, y*node_size,node_size,node_size);
    ctx.stroke();
    ctx.fill();
  }else{
    let old_pos = brush_node == 2 ? start_node : end_node;
    ctx.fillStyle = nodes[old_pos] == 0? "white" : "black" ;
    ctx.beginPath();
    let old_y = (old_pos - old_pos%grid_width[grid_size])/grid_width[grid_size];
    let old_x = old_pos%grid_width[grid_size];
    ctx.rect(old_x*node_size, old_y*node_size,node_size,node_size);
    ctx.stroke();
    ctx.fill();
    //nodes[old_pos] = 0;
    ctx.fillStyle = brush_node == 2 ? "green" : "red";
    ctx.beginPath();
    ctx.rect(x*node_size, y*node_size,node_size,node_size);
    ctx.stroke();
    ctx.fill();
    if(brush_node == 2)
     start_node = pos;
    else
     end_node = pos;
  }

  not_updated_nodes++;
  if(not_updated_nodes > grid_height[grid_size]*0.8){
   draw_grid();
   not_updated_nodes = 0;
  }
}

function mouse_node(x, y){
  var rect = c.getBoundingClientRect();
  x = x-rect.left;
  y = y-rect.top;
  var xx = (x - x%node_size)/node_size;
  var yy = (y - y%node_size)/node_size;

  return(xx + yy*grid_width[grid_size]);
}

function dijkstra(){
  var unvisited = [];
  var visited = [grid_width[grid_size] * grid_height[grid_size]];
  var visited_count = 0;
  var current_node = start_node;
  var best_paths = [grid_width[grid_size] * grid_height[grid_size]];

  for(let i = 0; i < grid_height[grid_size]*grid_width[grid_size]; i++){
    if(nodes[i] !=1)
     unvisited.push(i);
    best_paths[i] = cost_path(grid_height[grid_size]*grid_width[grid_size], []);
  }

  best_paths[start_node] = cost_path(0,[]);
    
  while(unvisited.length > 0){
      get_sasiads(current_node).forEach(n => {
        if(best_paths[current_node].dist + n.dist < best_paths[n.index].dist){
          best_paths[n.index].dist = best_paths[current_node].dist +n.dist;
          best_paths[n.index].path = [...best_paths[current_node].path];
          best_paths[n.index].path.push(current_node);
        }
      });
      unvisited.splice( unvisited.indexOf(current_node), 1 );
      visited[visited_count] = current_node;
      visited_count++;

      var s = grid_width[grid_size]*grid_height[grid_size];
      current_node = -1;

      if(solving_method == 0){
      unvisited.forEach(element => {
        if(best_paths[element].dist < s){
          s = best_paths[element].dist;
          current_node = element;
        }
      });
    }else{
      unvisited.forEach(element => {
        if(best_paths[element].dist  + dist(element, end_node)< s){
          s = best_paths[element].dist + dist(element, end_node);
          current_node = element;
        }
      });
    }

    
    if(current_node == end_node || current_node == -1){//end
     isShowing = true; 
     visited.shift();
     best_paths[end_node].path.shift();
     if(showAnimation)
        showSolveAnim(visited, 0, skip_nodes[grid_size], best_paths[end_node].path);
     else{
        showSolveInsta(best_paths[end_node].path);
     }
     document.getElementById("length_text").innerHTML = "path length: " + Math.round(best_paths[end_node].dist);
     return;
    }  
  }

}

function dist(id1, id2){
  let y1 = (id1 - id1%grid_width[grid_size])/grid_width[grid_size];
  let x1 = id1%grid_width[grid_size];
  let y2 = (id2 - id2%grid_width[grid_size])/grid_width[grid_size];
  let x2 = id2%grid_width[grid_size];
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

function random_grid(p){
  start_node = Math.floor(Math.random()*grid_height[grid_size])*grid_width[grid_size];
  end_node = Math.floor(Math.random()*grid_height[grid_size])*grid_width[grid_size] + grid_width[grid_size]-1;
  //start_node = Math.floor(Math.random()*nodes.length);
  //end_node = Math.floor(Math.random()*nodes.length);

  spots = [...nodes];

  for(let i = 0; i < grid_width[grid_size]*grid_height[grid_size]*p/100; i++){
    id = Math.floor(Math.random()*spots.length);
    spots.splice( spots.indexOf(id), 1 );
    if(id != start_node && id != end_node)
      nodes[id] = 1;
  }
}
function showSolveInsta(path){
 ctx.fillStyle = "blue";
 path.forEach(node =>{
  let y = (node - node%grid_width[grid_size])/grid_width[grid_size];
  let x = node%grid_width[grid_size];
    ctx.beginPath();
    ctx.rect(x*node_size, y*node_size,node_size,node_size);
    ctx.stroke();
    ctx.fill();
 })
}

function showSolveAnim(visited, id, speed, path){
  if(!isShowing){
    return;
  }
   
  ctx.fillStyle = "yellow";
  for(let i = id; i < id + speed; i++){
    if(i == visited.length){
      showPathAnim(path,0);
      return;
    }
    element = visited[i];
    let y = (element - element%grid_width[grid_size])/grid_width[grid_size];
    let x = element%grid_width[grid_size];
    ctx.beginPath();
    ctx.rect(x*node_size, y*node_size,node_size,node_size);
    ctx.stroke();
    ctx.fill();
  }
  setTimeout(function(){
    showSolveAnim(visited, id + speed, speed, path);
  }, 1);
}

function showPathAnim(path,id){
  if(!isShowing){
    return;
  }
      if(id == path.length){
       if(loop){
          reset_grid();
          random_grid(25);
          draw_grid();
          dijkstra();
       }
       return;
      }
      element = path[id];
      let y = (element - element%grid_width[grid_size])/grid_width[grid_size];
      let x = element%grid_width[grid_size];
      //console.log(x + ":" + y +":"+ path.length)
      ctx.fillStyle = "blue";
      ctx.rect(x*node_size, y*node_size,node_size,node_size);
      ctx.stroke();
      ctx.fill();
      setTimeout(function(){
        //path.shift()
        showPathAnim(path,id+1);
      }, path_speed[grid_size]);
}

function get_sasiads(n){
  
  var sasiady = [];
  
  if(nodes[n] == 1)
   return sasiady;
  
   if(n % grid_width[grid_size] > 0 && nodes[n-1] != 1)//left
   sasiady.push(neighbour(n-1, 1))
   if(n % grid_width[grid_size] < grid_width[grid_size]-1 && nodes[n+1] != 1)//right
   sasiady.push(neighbour(n+1, 1))
  if(n > grid_width[grid_size]-1 && nodes[n-grid_width[grid_size]] != 1)//top
   sasiady.push(neighbour(n - grid_width[grid_size], 1))
   if(n < grid_width[grid_size]*grid_height[grid_size]-grid_width[grid_size] && nodes[n+grid_width[grid_size]] != 1)//bottom
   sasiady.push(neighbour(n + grid_width[grid_size], 1))

  if(canDiagonal){
   if(n % grid_width[grid_size] < grid_width[grid_size]-1 && n > grid_width[grid_size]-1 && nodes[n-grid_width+1] != 1)//top right
    sasiady.push(neighbour(n - grid_width[grid_size]+1, 1.41))
   if(n % grid_width[grid_size] > 0 && n > grid_width[grid_size]-1 && nodes[n-grid_width[grid_size]-1] != 1)//top left
    sasiady.push(neighbour(n - grid_width[grid_size]-1, 1.41))
   if(n < grid_width[grid_size]*grid_height[grid_size]-grid_width[grid_size] && n % grid_width[grid_size] < grid_width[grid_size]-1 && nodes[n+grid_width[grid_size]+1] != 1)//bottom right
    sasiady.push(neighbour(n + grid_width[grid_size]+1, 1.41))
   if(n < grid_width[grid_size]*grid_height[grid_size]-grid_width[grid_size] && n % grid_width[grid_size] > 0 && nodes[n+grid_width[grid_size]-1] != 1)//bottom left
    sasiady.push(neighbour(n + grid_width[grid_size]-1,1.41))
  }

  return sasiady;
}

function change_loop(){
  loop = !loop;
}
function change_showAnimation(){
  showAnimation = !showAnimation;
}
function change_canDiagonal(){
  canDiagonal = !canDiagonal;
}
function change_solving_method(m){
  solving_method = Math.round(m);
 }
