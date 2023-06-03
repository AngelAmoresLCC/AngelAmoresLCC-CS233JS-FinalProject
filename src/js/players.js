import { Hand, Card } from "./cards";
import { Dealer } from "./computers";

//This file includes the user controlled players

export class Player {
    constructor(table, dealer, playerName, playerID) {
        this.H = 'hit';
        this.S = 'stand';
        this.D = 'double';
        this.P = 'split';
        this.hand = null;
        this.splitHand = null;
        this.canDD = true;
        this.name = playerName;
        this.playerID = playerID;
        this.active = false;
        this.EmptyHand();
        this.dealerRef = dealer;
        this.tableRef = table;
        this.coins = 1000;
        this.currentBet = 0;
    }

    ChangeActiveness(newActive) {
        if (this.active && newActive) { }
        else {
            this.active = newActive;
            if (this.active) {
                this.coins = 1000;
                this.currentBet = 0;
                this.EmptyHand();
            }
        }
    }

    IsSplit() {
        return this.splitHand != null;
    }

    SetCurrentBet(value) {
        this.currentBet = value * 1;
        this.currentBet = this.currentBet > this.coins ? this.coins : this.currentBet;
        this.coins -= this.currentBet;
    }

    CanDD() {
        return this.canDD = this.coins >= this.currentBet && this.canDD;
    }

    CanSplit() {
        return this.CanDD() && this.hand.HasDoubles()
    }

    EmptyHand() {
        this.hand = new Hand();
        this.splitHand = null;
        this.canDD = true;
    }

    SplitHand() {
        EmptyHand();
        this.splitHand = new Hand();
        this.canDD = false;
    }

    PlayerInfo() {
        return [this.active, this.playerID, this.name, this.hand, this.currentBet, this.coins];
    }

    HandleChoice(choice) {
        switch (choice) {
            case this.H:
                console.log(this.name + " is hitting.");
                this.canDD = false;
                this.dealerRef.Deal(this.hand);
                return true;
            case this.S:
                console.log(this.name + " has decided to stand.");
                return true;
            case this.D:
                if (this.CanDD()) {
                    this.canDD = false;
                    this.coins += this.currentBet;
                    this.SetCurrentBet(this.currentBet * 2);
                    console.log(this.name + " has doubled down!");
                    this.dealerRef.Deal(this.hand);
                    return true;
                }

                return false;
            case this.P:
                if (this.CanSplit()) {
                    this.canDD = false;
                    this.coins -= this.currentBet;
                    console.log(this.name + " has split their hand!");
                    console.log("Current coins: " + this.coins);
                    SplitTurn();
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    TakeTurn(action) {
        while (!this.HandleChoice(action)) {
            action = this.tableRef.RequestAction(this.playerID);
        }
    }

    SplitTurn() {

    }

    MakeBet(betAmount) {
        if (betAmount <= this.coins) {
            this.SetCurrentBet(betAmount);
            return true;
        }
        return false;
    }
}