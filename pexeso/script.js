var settings = Array(3);
var choices = Array(3);
var names = "";
var bot = "";

function onload(){
	choices[0] = document.getElementById("choices_0");
	choices[1] = document.getElementById("choices_1");
	choices[2] = document.getElementById("choices_2");
}

function setSettings(id, val){
	console.log(val);
	settings[id] = val;
	
	if(id == 2){
		gameWindow = window.open("game/game.html?a=" + settings[0] + "&b=" + settings[1] + "&c=" + settings[2] + names + bot, "_self");
	}
	else{
		choices[id].classList.add("inactive");
		choices[id+1].classList.remove("inactive");
	}
}

function setNames(){
	names = "&d=" + document.getElementById("name_0").value + "&e=" + document.getElementById("name_1").value;
	document.getElementById("choices_names").classList.add("inactive");
	document.getElementById("choices_1").classList.remove("inactive");
}

function setBot(val){
	bot = "&f=" + val;
	document.getElementById("choices_bot").classList.add("inactive");
	document.getElementById("choices_1").classList.remove("inactive");
}

function openNames(){
	settings[0] = 1;
	document.getElementById("choices_0").classList.add("inactive");
	document.getElementById("choices_names").classList.remove("inactive");
}

function openBot(){
	settings[0] = 2;
	document.getElementById("choices_0").classList.add("inactive");
	document.getElementById("choices_bot").classList.remove("inactive");
}