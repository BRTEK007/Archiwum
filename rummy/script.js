"use strict";

//&#127136; > back
//&#127137; > spades
//&#127153; > hearts
//&#127169; > diamonds
//&#127185; > clubs

const CARDS_NUMBERS = [1,2,3,4,5,6,7,8,9,10,12,13,0];
var cards = [];

function pageLoaded() {
  var spadesDiv = document.getElementById("spadesDiv");
  for(let i = 0; i < 13; i++){
    cards.push({
      type: "spade",
      color: "black",
      number: i+2,
      html: '&#' + (127137 + CARDS_NUMBERS[i]) +';'
    });
    cards.push({
      type: "heart",
      color: "red",
      number: i+2,
      html: '&#' + (127153 + CARDS_NUMBERS[i]) +';'
    });
    cards.push({
      type: "diamond",
      color: "red",
      number: i+2,
      html: '&#' + (127169 + CARDS_NUMBERS[i]) +';'
    });
    cards.push({
      type: "clubs",
      color: "black",
      number: i+2,
      html: '&#' + (127185 + CARDS_NUMBERS[i]) +';'
    });
  }

  for(let i = 0; i < 13; i++){
    let r = Math.floor(Math.random() * cards.length);
    var cardDiv = document.createElement("div");
    //cardDiv.setAttribute('title', "spade" + (i+2));
    cardDiv.setAttribute('color', cards[r].color);
    cardDiv.classList.add('cardDiv');
    cardDiv.innerHTML = cards[r].html;
    spadesDiv.appendChild(cardDiv);
    cards.splice(r, 1);
  }
}