import { Hand, Deck } from "./cards";

//This file includes the Dealer, and computer controlled players

export class Dealer {
    constructor() {
        this.deck = new Deck();
        this.players = [];
        this.hand = new Hand();
    }

    ResetDealer() {
        this.deck = new Deck();
        this.hand = new Hand();
    }

    Deal(hand) {
        setTimeout(() => {
            hand.AddCard(this.deck.Draw());
        }, 500);
    }
}

export class ComputerPlayer {
    constructor(table) {
        this.tableRef = table;
    }
}