import './general';
import { Dealer, ComputerPlayer } from './computers';
import { Player } from './players';

//This file is the 'main' file in charge of everything

export class Table {
    constructor() {
        this.dealer = new Dealer();
        this.queue = new QueueHandler(this);
        this.players = [];
        for (let i = 1; i <= 6; i++) {
            this.players[this.players.length] = new Player(this, this.dealer, "Player " + i, i);
        }
        this.dealer.players = this.players;
        this.currentPlayer = 0;
        this.numBets = 0;
        this.isBetting = true;
        this.displayStates = [];
        this.displayID = 0;
        this.UpdateDisplayStates();
    }

    GetBets() {
        this.isBetting = true;
        this.numBets = 0;
        let numActivePlayers = 0;
        for (let player of this.players) {
            if (player.active)
                numActivePlayers++;
        }
        this.UpdateDisplayStates();
        while (numBets <= numActivePlayers) { }
        this.isBetting = false;
        this.UpdateDisplayStates();
    }

    PlayerBet(betAmount, playerID) {
        if (this.players[playerID - 1].MakeBet(betAmount)) {
            this.numBets++;
            this.UpdateDisplayStates();
            return true;
        }
        return false;
    }

    PlayerAction(action, playerID) {
        if (playerID === this.currentPlayer) {
            switch (action) {
                case "hit":
                    break;
                case "stand":
                    break;
                case "double":
                    break;
                case "split":
                    break;
                default:
                    break;
            }
        }
        else {
            return false;
        }
    }

    FirstOpenSlot() {
        for (let player of players) {
            if (!player.active)
                return player.playerID;
        }
        return 0;
    }

    ContinueRound() {
        do {
            this.currentPlayer++;
            if (this.currentPlayer >= this.players.length) {
                this.EndRound();
            }
            this.UpdateDisplayStates();
        } while (!this.players[this.currentPlayer - 1].active)
    }

    EndRound() {
        this.dealer.DealerTurn();
        this.currentPlayer = "dealer";
        this.PayWinnings();
        while (this.FirstOpenSlot != 0) {
            this.queue.CheckQueue();
        }
        this.currentPlayer = 0;
    }

    PayWinnings() {
        let dealerScore = this.dealer.hand.GetHandValue();
        for (const player of players) {
            let handValue = player.hand.GetHandValue();
            if (player.IsSplit()) {
                let splitValue = player.splitHand.GetHandValue();
                if (!player.hand.IsBusted()) {
                    if (handValue > dealerScore || this.dealer.hand.IsBusted()) {
                        player.coins += player.currentBet * 2;
                    }
                    else if (handValue == dealerScore) {
                        player.coins += player.currentBet;
                    }
                }
                if (!player.splitHand.IsBusted()) {
                    if (splitValue > dealerScore || this.dealer.hand.IsBusted()) {
                        player.coins += player.currentBet * 2;
                    }
                    else if (splitValue == dealerScore) {
                        player.coins += player.currentBet;
                    }
                }
            }
            else {
                if (!player.hand.IsBusted()) {
                    if (handValue > dealerScore || this.dealer.hand.IsBusted()) {
                        if (player.hand.IsBlackjack()) {
                            player.coins += Math.floor(player.currentBet * 2.5);
                        }
                        else {
                            player.coins += player.currentBet * 2;
                        }
                    }
                    else if (handValue == dealerScore) {
                        player.coins += player.currentBet;
                    }
                }
            }
            player.SetCurrentBet(0);
            player.EmptyHand();
        }
        this.UpdateDisplayStates();
    }

    //When this is called, every user interface attempts to update the displayed information
    //I don't actually know how to do this, but I know it should be possible
    UpdateDisplay(updateID = "all") {
        return updateID;
    }

    UpdateDisplayStates() {
        for (let i = 0; i < 7; i++) {
            if (i == 0) {
                this.displayStates[0] = {
                    id: "dealer",
                    busted: this.dealer.hand.IsBusted(),
                    cards: this.dealer.hand.HandImageArray(),
                }
            }
            else {
                let player = this.players[i];
                this.displayStates[i] = {
                    id: player.playerID,
                    active: player.active,
                    name: player.name,
                    busted: player.hand.IsBusted(),
                    canDD: player.CanDD(),
                    canSplit: player.CanSplit(),
                    coins: player.coins,
                    currentBet: player.currentBet,
                    mainHandCards: player.hand.HandImageArray(),
                    isSplit: player.IsSplit(),
                    splitHandCards: player.IsSplit() ? player.splitHand.HandImageArray() : null,
                }
            }
        }
        this.displayID = Math.random()
    }

    GetDisplayState(index, simple = true) {
        if (simple && index != 0) {
            state = this.displayStates[index];
            return {
                id: state.id,
                active: state.active,
                name: state.name,
                busted: state.busted,
                coins: state.coins,
                currentBet: state.currentBet,
                mainHandCards: state.mainHandCards,
                isSplit: state.isSplit,
                splitHandCards: state.splitHandCards,
            }
        }
        else {
            return this.displayStates[index];
        }
    }

    //Called by user interface, checks if the request is viable and passes it to the corresponding player if so
    RequestAction(playerID, action) {
        if (playerID == this.currentPlayer) {
            if (this.players[playerID + 1].HandleChoice(action)) {
                this.UpdateDisplay("player" + playerID);
                if (action == "stand" || action == "doubleDown") {
                    this.ContinueRound();
                }
            }
        }
    }

    //Called by player, instructs dealer to deal a card to that player
    RequestDeal(playerID) {
        this.dealer.Deal(this.players[playerID + 1].hand);
        return;
    }
}

//Handles excess players
export class QueueHandler {
    constructor(table) {
        this.users = [];
        this.tableRef = table;
    }

    AddUser(user) {
        user.table = this.tableRef;
        this.users[this.users.length] = user;
    }

    CheckQueue() {
        if (this.users.length > 0) {
            let slot = tableRef.FirstOpenSlot();
            if (slot > 0) {
                this.users[0].playerID = slot;
                this.users[0].SetupPlay();
                this.users.splice(0, 1);
                this.CheckQueue();
            }
        }
    }
}