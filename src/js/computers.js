import { Hand, Deck } from "./cards";

//This file includes the Dealer, and computer controlled players

export class Dealer
{
    constructor()
    {
        this.deck = new Deck();
        this.players = [];
        this.hand = new Hand();
    }
}

export class ComputerPlayer
{
    
}