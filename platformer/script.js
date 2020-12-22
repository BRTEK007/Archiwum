var selected = 0;

document.addEventListener('keydown', (e) => {
    switch(e.key){
        case "ArrowDown": switchButton(1); break;
        case "ArrowUp": switchButton(-1); break;
        case "Enter": buttonsSelected(); break;
    }
});

function switchButton(n){
    if(selected + n > 2 || selected + n < 0) return;

    let previous = document.getElementById('button' + selected);
    previous.setAttribute("selected", false);
    previous.innerHTML = previous.innerHTML.substring(1, previous.innerHTML.length -1);

    selected += n;

    let current = document.getElementById('button' + selected);
    current.setAttribute("selected", true);
    current.innerHTML = '-' + current.innerHTML + '-';
}

function buttonsSelected(){
    switch(selected){
        case 0: window.open('game/index.html'); break;
        case 1: window.open('editor/index.html'); break;
        case 2: alert("arrows to move, R to restart"); break;
    }
}

var canvas;
var ctx;
var width;
var height;
var coins = new Array(50);
var coinSprite = new Image();
coinSprite.src = "coin.png";
var horizontalRandomizer;

function windowLoaded(){
    canvas = document.getElementById("myCanvas");

    width = canvas.getBoundingClientRect().width / 5;
    height = canvas.getBoundingClientRect().height / 5;

    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext('2d');

    let centerDivBounds = document.getElementById('centerDiv').getBoundingClientRect();

    horizontalRandomizer = function(){
        let x = Math.random() * (width - centerDivBounds.width/5);
        if(x >= centerDivBounds.x/5) x+= centerDivBounds.width/5;
        return Math.round(x);
    };


    for(var i = 0; i < coins.length; i++){
        coins[i] = {x : horizontalRandomizer(), y : -Math.round(Math.random() * height)};
    }
    requestAnimationFrame(frame);
}

function frame(){
    for(var i = 0; i < coins.length; i++){
        ctx.clearRect(coins[i].x, coins[i].y, 10, 10);

        coins[i].y ++;

        if(coins[i].y > height){
            coins[i] = {x : horizontalRandomizer(), y : -10};
        }

        ctx.drawImage(coinSprite, coins[i].x, coins[i].y);
    }

    requestAnimationFrame(frame);
}
