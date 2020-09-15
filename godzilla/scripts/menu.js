var pos = 0;
var captions = [];
var strings = [];
var img;
var frame;

function main(){
    alert("Use arrows and Enter to navigate");
    img = document.getElementById('icon_img');
    captions[0] = document.getElementById('caption0');
    captions[1] = document.getElementById('caption1');
    captions[2] = document.getElementById('caption2');

    strings[0] = captions[0].innerHTML;
    strings[1] = captions[1].innerHTML;
    strings[2] = captions[2].innerHTML;

    change_caption();
    setInterval(animation, 500);
}

function change_caption(){
   for(let i = 0; i < 3; i++){
       if(i == pos){
        captions[i].innerHTML = ">" + strings[i] + "<";
       }else{
           captions[i].innerHTML = strings[i];
       }
   }
}

function confirm(){
    console.log(pos);
    switch(pos){
        case 0:
            window.open("game.html");
        break;
        case 1:
            alert("nima");
        break;
        case 2:
            alert("Steruj godzillą za pomocą strzałek.\nOdbuduj zniszczone budynki zebranymi cegłami.\nSMASH HUMANS!");
        break;
    }
}

window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        if(pos < 2)
            pos++;
        break;
      case "ArrowUp":
        if(pos > 0)
            pos--;
        break;
      case "Enter":
          confirm();
          break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
    change_caption();
    event.preventDefault();
}, true);

function animation(){
    frame == 1 ? frame = 0 : frame = 1;
    if(frame == 0)
        img.src = 'img/icon2.png';
    else
        img.src = 'img/icon.png';
}