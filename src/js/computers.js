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

    ShowUpCard() {
        if (this.hand.hand.length <= 0)
            return "";
        else if (this.hand.hand.length == 1)
            return "<br>?????";
        return "<br>?????" + this.hand.CheckCard(1).ToString();
    }
}

export class ComputerPlayer {
    constructor(table) {
        this.tableRef = table;
    }
}