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
        hand.AddCard(this.deck.Draw());
    }
}

export class ComputerPlayer {
    constructor(table) {
        this.tableRef = table;
    }
}