import './general';
import { Dealer, ComputerPlayer } from './computers';
import { Player } from './players';

//This file is the 'main' file in charge of everything

export class Table {
    constructor() {
        this.dealer = new Dealer();
        this.players = [];
        for(let i = 1; i <= 6; i++)
        {
            this.players[this.players.length] = new Player(this, this.dealer, "Player " + i, i);
        }
        this.dealer.players = this.players;
        this.currentPlayer = 0;
    }

    Play() {
        this.currentPlayer++;

    }

    UpdateDisplay() {

    }

    RequestAction(playerID) {
        return "stand";
    }

    RequestDeal(playerID) {
        return;
    }
}