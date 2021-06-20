var nodes = [];
var nodes_data = [];
var mines_pos = [];
var wrong_flags = [];
var flags_count;
var mines_count = 40; //99//40//10
var grid_width = 16; //30//16//9
var grid_height = 16; //16//16//9
const metrics = [[9, 9, 10], [16, 16, 40], [30, 16, 99]];
var time = 0;
var timer = null;
var playing = true;
const Struct = (...keys) => ((...v) => keys.reduce((o, k, i) => {
    o[k] = v[i];
    return o
}, {}));
const node = Struct('value', 'discovered', 'flag');
var digits = [];

function change_settings(v) {
    v = parseInt(v);
    grid_width = metrics[v][0];
    grid_height = metrics[v][1];
    mines_count = metrics[v][2];
}

function main() {
    var div = document.getElementById("holder");

    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    digits = [
    document.getElementById("digit_0"),
    document.getElementById("digit_1"),
    document.getElementById("digit_2"),
    document.getElementById("digit_3"),
    document.getElementById("digit_4"),
    document.getElementById("digit_5"),
  ];

    let canvas_width = document.body.clientWidth * 0.9;
    let canvas_height = (window.innerHeight - 60) * 0.9 - 60;

    let w_node = (canvas_width - canvas_width % grid_width) / grid_width;
    let h_node = (canvas_height - canvas_height % grid_height) / grid_height;

    node_size = Math.min(w_node, h_node);
    div.style.width = node_size * grid_width + "px";
    div.style.setProperty("--node_size", node_size + "px");
    for (let i = 1; i <= 13; i++) {
        div.style.setProperty("--node_size" + "_" + i, -i * node_size + "px");
    }
    nodes = [];

    for (let i = 0; i < grid_width * grid_height; i++) {
        let btn = document.createElement("div");
        btn.classList.add("node");
        btn.setAttribute("index", i);

        if (i % grid_width == 0 && i > 0)
            div.appendChild(document.createElement("br"));

        let cb = div.appendChild(btn);
        nodes[i] = cb;
    }
    $(".node").on('mouseup', function (e) {
        let b = e.which == 1 ? 'l' : 'r';
        node_press(this.getAttribute("index"), b);
    });

    $(".border_horizontal").css("height", Math.round(node_size * 0.625) + "px");
    $(".border_horizontal").css("width", node_size * grid_width + "px");
    $(".border_vertical").css("height", node_size * grid_height + "px");
    $(".border_vertical").css("width", Math.round(node_size * 0.625) + "px");
    $(".corner").css("width", Math.round(node_size * 0.625) + "px");
    $(".corner").css("height", Math.round(node_size * 0.625) + "px");
    for (let i = 1; i < 6; i++) {
        document.body.style.setProperty("--border_x_" + i, -i * Math.round(node_size * 0.625) + "px");
    }
    new_game();
}

function set_mines(id) {
    id = parseInt(id);
    var empty_nodes = [];

    for (let i = 0; i < nodes.length; i++) {
        if (i == id)
            continue;
        empty_nodes.push(i);
    }

    get_neighbours(id).forEach(n => {
        empty_nodes.splice(empty_nodes.indexOf(n), 1);
    });

    for (let i = 0; i < mines_count; i++) {
        let r = Math.floor(Math.random() * empty_nodes.length);
        let p = empty_nodes[r];
        nodes_data[p].value = -10;
        update_numbers(p);
        mines_pos.push(p);
        empty_nodes.splice(r, 1);
    }
}

function node_press(id, btn) {
    if (!playing)
        return;

    var data = nodes_data[parseInt(id)];
    if (btn == 'r') {
        if (data.discovered == true)
            return;

        if (data.flag) {
            nodes[parseInt(id)].setAttribute("value", "blank");
            data.flag = false;
            flags_count--;
            if (data.value >= 0)
                wrong_flags.splice(wrong_flags.indexOf(parseInt(id)), 1);
        } else {
            nodes[parseInt(id)].setAttribute("value", "flag");
            data.flag = true;
            flags_count++;
            if (flags_count == mines_count)
                check_win();
            if (data.value >= 0)
                wrong_flags.push(parseInt(id));
        }
        mines_text();
    } else {
        if (timer == null) {
            set_mines(id);
            timer = setInterval(()=>{
                time++;
    let time_1 = Math.floor(time / 100);
    let time_2 = Math.floor((time - time_1 * 100) / 10);
    let time_3 = time - time_1 * 100 - time_2 * 10;
    digits[3].setAttribute("number", time_1);
    digits[4].setAttribute("number", time_2);
    digits[5].setAttribute("number", time_3);
            }, 1000);
        }
        show_area(discovered_area(parseInt(id)));
    }

}

function new_game() {
    wrong_flags = [];
    flags_count = 0;
    mines_pos = [];
    nodes_data = [];

    for (let i = 0; i < nodes.length; i++) {
        nodes_data[i] = node(0, false, false);
    }
    //set_mines();
    nodes.forEach(node => {
        node.setAttribute("value", "blank");
    });
    playing = true;
    document.getElementById("smile").setAttribute("state", "default");
    time = 0;
    digits[3].setAttribute("number", 0);
    digits[4].setAttribute("number", 0);
    digits[5].setAttribute("number", 0);
    clearInterval(timer);
    timer = null;
    mines_text();
}

function update_numbers(n) {

    if (n % grid_width > 0) //left
        nodes_data[n - 1].value++;
    if (n % grid_width < grid_width - 1) //right
        nodes_data[n + 1].value++;
    if (n > grid_width - 1) //top
        nodes_data[n - grid_width].value++;
    if (n < grid_width * grid_height - grid_width) //bottom
        nodes_data[n + grid_width].value++;

    if (n % grid_width < grid_width - 1 && n > grid_width - 1) //top right
        nodes_data[n - grid_width + 1].value++;
    if (n % grid_width > 0 && n > grid_width - 1) //top left
        nodes_data[n - grid_width - 1].value++;
    if (n < grid_width * grid_height - grid_width && n % grid_width < grid_width - 1) //bottom right
        nodes_data[n + grid_width + 1].value++;
    if (n < grid_width * grid_height - grid_width && n % grid_width > 0) //bottom left
        nodes_data[n + grid_width - 1].value++;

}

function discovered_area(id) {
    var current = id;
    var que = [current];
    var nodes_to_paint = [];

    if (nodes_data[current].flag)
        return;

    if (nodes_data[current].value > 0) {
        var n_flags = 0;
        get_neighbours(current).forEach(id => {
            if (nodes_data[id].flag)
                n_flags++;
        });
        if (n_flags == nodes_data[current].value) {
            get_neighbours(current).forEach(id => {
                if (!nodes_data[id].flag)
                    que.push(id);
            });
        } else
            return que;
    }

    while (que.length > 0) {

        if (nodes_data[current].value == 0) {
            get_neighbours(current).forEach(id => {
                if (nodes_data[id].value == 0) {
                    if (!que.includes(id) && !nodes_to_paint.includes(id))
                        que.push(id)
                } else
                    nodes_to_paint.push(id);
            });

        }
        nodes_to_paint.push(current);
        que.shift();
        current = que[0];
    }
    return nodes_to_paint;
}

function show_area(nodes_to_paint) {
    if (nodes_to_paint == null)
        return;

    nodes_to_paint.forEach(id => {
        nodes_data[id].discovered = true;

        if (nodes_data[id].value < 0) {
            nodes[id].setAttribute("value", "mine_1");
            defeat(id);
        } else if (nodes_data[id].value >= 0) {
            let s = "node_" + nodes_data[id].value
            nodes[id].setAttribute("value", nodes_data[id].value);
        }

    });
}

function get_neighbours(n) {
    var r = [];
    if (n % grid_width > 0 /*&& nodes[n-1] == 0*/ ) //left
        r.push(n - 1);
    if (n % grid_width < grid_width - 1 /*&& nodes[n+1] == 0*/ ) //right
        r.push(n + 1);
    if (n > grid_width - 1 /*&& nodes[n-grid_width] == 0*/ ) //top
        r.push(n - grid_width);
    if (n < grid_width * grid_height - grid_width /*&& nodes[n+grid_width] == 0*/ ) //bottom
        r.push(n + grid_width);

    if (n % grid_width < grid_width - 1 && n > grid_width - 1 /*&& nodes[n-grid_width+1] > 0*/ ) //top right
        r.push(n - grid_width + 1);
    if (n % grid_width > 0 && n > grid_width - 1 /*&& nodes[n-grid_width-1] > 0*/ ) //top left
        r.push(n - grid_width - 1);
    if (n < grid_width * grid_height - grid_width && n % grid_width < grid_width - 1 /*&& nodes[n+grid_width+1] > 0*/ ) //bottom right
        r.push(n + grid_width + 1);
    if (n < grid_width * grid_height - grid_width && n % grid_width > 0 /*&& nodes[n+grid_width-1] > 0*/ ) //bottom left
        r.push(n + grid_width - 1);

    return r;
}

function defeat(id) {
    mines_pos.splice(mines_pos.indexOf(id), 1);

    mines_pos.forEach(pos => {
        if (!nodes_data[pos].flag)
            nodes[pos].setAttribute("value", "mine_0");
    });

    wrong_flags.forEach(pos => {
        nodes[pos].setAttribute("value", "mine_2");
    });


    document.getElementById("smile").setAttribute("state", "lost");
    playing = false;
    clearInterval(timer);
    timer = null;
}

function check_win() {
    mines_pos.forEach(pos => {
        if (!nodes_data[pos].flag)
            return false;
    });
    /*if(wrong_flags.length > 0)
      return;*/
    document.getElementById("smile").setAttribute("state", "won");
    playing = false;
    clearInterval(timer);
    timer = null;
}

function mines_text() {
    let n = mines_count - flags_count;

    let n_1 = Math.floor(n / 100);
    let n_2 = Math.floor((n - n_1 * 100) / 10);
    let n_3 = n - n_1 * 100 - n_2 * 10;
    digits[0].setAttribute("number", n_1);
    digits[1].setAttribute("number", n_2);
    digits[2].setAttribute("number", n_3);
}

function mouseUp() {
    if (playing)
        document.getElementById("smile").setAttribute("state", "default");
}

function mouseDown() {
    if (playing)
        document.getElementById("smile").setAttribute("state", "playing");
}
