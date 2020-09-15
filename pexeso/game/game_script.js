var emojis = [129408, 127789, 128512];
var bot_memory_sizes = [3, 5, 10];
var game;

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function onload(){
	
	var url_string = window.location.href; 
	var url = new URL(url_string);
	var b = parseInt(url.searchParams.get("b"));//size 6x4 6x6 8x6
	
	var sizes = [[6,4], [6,6], [10,6]];
	
	var cards = Array();
	
	var grid = document.getElementById("grid");
	for(var y = 0; y < sizes[b][1]; y++){
		var row = document.createElement("div");
		for(var x = 0; x < sizes[b][0]; x++){
			var card = document.createElement("div");
			card.classList.add("card");
			card.classList.add("hidden");
			card.setAttribute("index", x + y*sizes[b][0]);
			card.addEventListener("click", function(){clickedCard(this.getAttribute("index"));} );
			cards.push(card);
			row.appendChild(card);
		}
		grid.appendChild(row);
	}
	
	var size = Math.floor(Math.min( window.innerWidth / sizes[b][0], window.innerHeight / sizes[b][1]) * 0.85);
	grid.style.setProperty("--card_size", size + "px");
	grid.style.setProperty("--card_font", Math.floor(size*0.5) + "px");
	grid.style.setProperty("--card_margin", Math.floor(size/16) + "px");

	var a = parseInt(url.searchParams.get("a"));//play mode
	var c = parseInt(url.searchParams.get("c"));//style 0-animals 1-food 2-emojis

	switch(a){
		case 0: game = new SoloGame(cards, emojis[c]); break;
		case 1: game = new MultiplayerGame(cards, emojis[c], grid, [url.searchParams.get("d"), url.searchParams.get("e")]); break;
		case 2: game = new BotGame(cards, emojis[c], grid, bot_memory_sizes[parseInt(url.searchParams.get("f"))]); break;
	}

}

function clickedCard(id){
	game.clickedCard(parseInt(id));
}

class SoloGame{
	constructor(cards, style){
		this.cards = cards;
		this.pairs = Array();
		this.confirmed = true;
		this.remainingPairs = cards.length/2;
		this.moves = 0;
	
		for(let i = 0; i < cards.length/2; i++){
			this.pairs.push(i);
			this.pairs.push(i);
		}
	
		var copy = [...this.pairs]
	
		for(let i = 0; i < cards.length; i++){
			let r = Math.floor(Math.random() * copy.length);
			this.pairs[i] = copy[r];
			cards[i].innerHTML = "&#" + (style + this.pairs[i]) + ";";
			copy.splice(r, 1);
		}
		
		this.revealedCard1 = null;
		this.revealedCard2 = null;
	}
    reveal(id){
		if(this.confirmed == false){
			this.cards[this.revealedCard1].classList.remove("revealed");
			this.cards[this.revealedCard2].classList.remove("revealed");
			
			if(this.pairs[this.revealedCard1] ==  this.pairs[this.revealedCard2]){
					this.correct_move();
			}else{
					this.wrong_move();
			}
			
			this.revealedCard1 = null;
			this.revealedCard2 = null;
			this.confirmed = true;
			return;
		}
		
		if(this.revealedCard1 == null){
			this.revealedCard1 = id;
		}else{
			if(id == this.revealedCard1)
				return;
			this.revealedCard2 = id;
			this.confirmed = false;
			this.moves++;
		}

		this.cards[id].classList.remove("hidden");
		this.cards[id].classList.add("revealed");
	}
	gameEnd(){
		document.getElementById("grid").classList.add("inactive");
		document.getElementById("soloEnd").classList.remove("inactive");
		document.getElementById("soloEnd0").innerHTML = this.moves;
	}
	correct_move(){
		this.cards[this.revealedCard1].classList.add("gone");
		this.cards[this.revealedCard2].classList.add("gone");
		this.remainingPairs--;

		if(this.remainingPairs <= 0){
			this.gameEnd();
			return;
		}
	}
	wrong_move(){
		this.cards[this.revealedCard1].classList.add("hidden");
		this.cards[this.revealedCard2].classList.add("hidden");
	}
	clickedCard(id){
		this.reveal(id);
	}
}

class MultiplayerGame extends SoloGame{
	constructor(cards, style, grid, player_names){
		super(cards, style);
		this.grid = grid;
		this.player_1_points = 0;
		this.player_2_points = 0;
		this.player_1_playing = true;
		this.player_names = player_names;
		this.grid.style.setProperty("--card_color", "red");
	}
	correct_move(){
		this.cards[this.revealedCard1].classList.add("gone");
		this.cards[this.revealedCard2].classList.add("gone");
		this.remainingPairs--;
		
		if(this.player_1_playing){
			this.player_1_points++;
		}else{
			this.player_2_points++;
		}

		if(this.remainingPairs <= 0){
			this.gameEnd();
			return;
		}
	}
	wrong_move(){
		this.cards[this.revealedCard1].classList.add("hidden");
		this.cards[this.revealedCard2].classList.add("hidden");
		
		this.player_1_playing = !this.player_1_playing;
		this.grid.style.setProperty("--card_color", this.player_1_playing ? "red" : "blue");
	}
	gameEnd(){
		this.grid.classList.add("inactive");
		document.getElementById("multEnd").classList.remove("inactive");
		if(this.player_1_points > this.player_2_points){
			document.getElementById("multEnd0").innerHTML = this.player_names[0];
			document.getElementById("multEnd1").innerHTML = this.player_names[1];
		}else{
			document.getElementById("multEnd0").innerHTML = this.player_names[1];
			document.getElementById("multEnd1").innerHTML = this.player_names[0];
		}
	}
}

class Bot{
	constructor(grid_size, memory_size){
		this.unknown = [...Array(grid_size).keys()];//[a,b,c,d] indexes of unknown cards
		this.known = [];//[[a, b], [a,b]] indexes and values of known cards
		this.complete_pair = [];//[[a, b]
		this.memory_size = memory_size;
	}

	get_to_know_card(id, val){
		if(!this.unknown.includes(id))
			return;
		this.unknown.splice(this.unknown.indexOf(id), 1);
		this.known.push([id, val]);
		if(this.known.length > this.memory_size){
			let r = Math.floor(Math.random() * (this.known.length -1));
			this.unknown.push(this.known[r][0]);
			this.known.splice(r, 1);
			//this.unknown.push(this.known.splice()[0]);
		}
	}

	forget_card(id){
		if(this.unknown.includes(id))
			this.unknown.splice(this.unknown.indexOf(id), 1);

		if(this.complete_pair.includes(id))
			this.complete_pair = [];

		for(var i = 0; i <	this.known.length; i++){
			if(this.known[i][0] == id){
				this.known.splice(i, 1);
				return;
			}
		}
	}

	request_move(){
		if(this.complete_pair.length == 0)
			this.search_for_complete_pair();

		if(this.complete_pair.length > 0)
			return this.complete_pair.shift();
		else
			return this.unknown[Math.floor(Math.random() * (this.unknown.length-1))];
		
	}


	search_for_complete_pair(){
		for(var i = 0; i < this.known.length; i++){
			for(var j = i+1; j < this.known.length; j++){

				if(this.known[i][1] == this.known[j][1]){
					this.complete_pair = [this.known[i][0], this.known[j][0]];

					for(var i = 0; i <	this.known.length; i++){
						if(this.known[i][0] == this.complete_pair[0]){
							this.known.splice(i, 1);
							break;
						}
					}

					for(var i = 0; i <	this.known.length; i++){
						if(this.known[i][0] == this.complete_pair[1]){
							this.known.splice(i, 1);
							break;
						}
					}

					return;
				}

			}
		}
	}

}

class BotGame extends SoloGame{
	constructor(cards, style, grid, memory_size){
		super(cards, style);
		this.grid = grid;
		this.is_player_playing = true;
		this.bot = new Bot(cards.length, memory_size);
		this.bot_speed = 500;
		this.bot_points = 0;
		this.player_points = 0;
	}

	clickedCard(id){
		if(this.is_player_playing)
			this.reveal(id);
	}

	correct_move(){
		this.player_points++;
		this.remainingPairs--;

		if(this.remainingPairs == 0){
			this.gameEnd();
			return;
		}

		this.cards[this.revealedCard1].classList.add("gone");
		this.cards[this.revealedCard2].classList.add("gone");

		this.bot.forget_card(this.revealedCard1);
		this.bot.forget_card(this.revealedCard2);

		if(this.remainingPairs <= 0){
			this.gameEnd();
			return;
		}
	}
	wrong_move(){
		this.cards[this.revealedCard1].classList.add("hidden");
		this.cards[this.revealedCard2].classList.add("hidden");
					
		this.bot.get_to_know_card(this.revealedCard1, this.pairs[this.revealedCard1]);
		this.bot.get_to_know_card(this.revealedCard2, this.pairs[this.revealedCard2]);

		this.is_player_playing = false;
		this.grid.style.setProperty("--card_color", "green");
		this.botMove();
	}

	async botMove(){
		await sleep(this.bot_speed);

		var bot_move_1 = this.bot.request_move();
		this.bot.get_to_know_card(bot_move_1, this.pairs[bot_move_1]);
		this.cards[bot_move_1].classList.remove("hidden");
		this.cards[bot_move_1].classList.add("revealed");

		await sleep(this.bot_speed);

		var bot_move_2 = this.bot.request_move();
		this.bot.get_to_know_card(bot_move_2, this.pairs[bot_move_2]);
		this.cards[bot_move_2].classList.remove("hidden");
		this.cards[bot_move_2].classList.add("revealed");

		await sleep(this.bot_speed);
		
		if(this.pairs[bot_move_1] == this.pairs[bot_move_2]){
			this.bot_points++;
			this.remainingPairs--;

			if(this.remainingPairs == 0){
				this.gameEnd();
				return;
			}


			this.bot.forget_card(bot_move_1);
			this.bot.forget_card(bot_move_2);

			this.cards[bot_move_1].classList.remove("revealed");
			this.cards[bot_move_1].classList.add("gone");
			this.cards[bot_move_2].classList.remove("revealed");
			this.cards[bot_move_2].classList.add("gone");

			this.botMove();
			return;
		}else{
			this.is_player_playing = true;
			this.grid.style.setProperty("--card_color", "gold");
			this.cards[bot_move_1].classList.remove("revealed");
			this.cards[bot_move_1].classList.add("hidden");
			this.cards[bot_move_2].classList.remove("revealed");
			this.cards[bot_move_2].classList.add("hidden");
		}
	}

	gameEnd(){
		this.grid.classList.add("inactive");
		document.getElementById("multEnd").classList.remove("inactive");

		if(this.player_points > this.bot_points){
			document.getElementById("multEnd0").innerHTML = "You";
			document.getElementById("multEnd1").innerHTML = "Bot";
		}else{
			document.getElementById("multEnd0").innerHTML = "Bot";
			document.getElementById("multEnd1").innerHTML = "You";
		}
	}

}