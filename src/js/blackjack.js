import './general';
import { Dealer, ComputerPlayer } from './computers';
import { Player } from './players';
import { Interface } from './interface';

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
        this.idle = false;
        this.UpdateDisplayStates();
        this.FillPlayers();
    }

    FillPlayers() {
        for (let i = 0; i < 6 && this.FirstOpenSlot() != 0; i++) {
            this.queue.CheckQueue();
        }
        let anyActive = false;
        for (let player of this.players) {
            if (player.active)
                anyActive = true;
        }
        if (anyActive)
            this.GetBets();
        else
            this.idle = true;
    }

    FirstOpenSlot() {
        for (let player of this.players) {
            if (!player.active)
                return player.playerID;
        }
        return 0;
    }

    GetBets() {
        this.idle = false;
        this.currentPlayer = 0;
        this.isBetting = true;
        this.numBets = 0;
        this.UpdateDisplayStates();
    }

    PlayerBet(betAmount, playerID) {
        if (this.GetPlayer(playerID).MakeBet(betAmount)) {
            this.numBets++;
            this.CheckBets();
            this.UpdateDisplayStates();
            return true;
        }
        return false;
    }

    CheckBets() {
        let numActivePlayers = 0;
        for (let player of this.players) {
            if (player.active)
                numActivePlayers++;
        }
        if (this.numBets === numActivePlayers)
        {
            this.isBetting = false;
            this.UpdateDisplayStates();
            setTimeout(() => {
                this.BeginRound();
            }, 1000);
        }
    }

    BeginRound() {
        for (let i = 0; i < 2; i++) {
            for (let player of this.players) {
                if (player.active) {
                    this.dealer.Deal(player.hand);
                    this.UpdateDisplayStates();
                }
            }
        }
        this.UpdateDisplayStates();
        this.ContinueRound();
    }

    ContinueRound() {
        this.currentPlayer++;
        this.UpdateDisplayStates();
        if (this.currentPlayer >= this.players.length)
            this.EndRound();
    }

    EndRound() {
        this.currentPlayer = "dealer";
        this.UpdateDisplayStates();
        while (!this.dealer.hand.IsBusted() && this.dealer.hand.GetHandValue() < 17 || (this.dealer.hand.GetHandValue() == 17 && this.dealer.hand.hasLiveAce)) {
            this.dealer.Deal(this.dealer.hand);
            this.UpdateDisplayStates();
        }
        this.currentPlayer = 0;
        this.UpdateDisplayStates();
        this.PayWinnings();
        setTimeout(() => {
            this.FillPlayers();
        }, 3000);
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

    UpdateDisplayStates() {
        for (let i = 0; i <= this.players.length; i++) {
            if (i == 0) {
                this.displayStates[0] = {
                    id: "dealer",
                    busted: this.dealer.hand.IsBusted(),
                    cards: this.dealer.hand.HandImageArray(),
                }
            }
            else {
                //if (this.players[i] === null) continue;
                let player = this.GetPlayer(i);
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
        this.displayID = Math.random();
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

    GetPlayer(playerID) {
        return this.players[playerID - 1];
    }

    //Called by user interface, checks if the request is viable and passes it to the corresponding player if so
    RequestAction(action, playerID) {
        if (playerID == this.currentPlayer) {
            if (this.GetPlayer(playerID).HandleChoice(action)) {
                this.UpdateDisplayStates();
                if (action == "stand" || action == "doubleDown" || this.GetPlayer(playerID).hand.IsBusted()) {
                    this.ContinueRound();
                }
            }
        }
    }

    //Called by user interface, changes the name of the corresponding playerID
    RequestChangeName(name, playerID) {
        this.GetPlayer(playerID).name = name;
    }

    //Called by player, instructs dealer to deal a card to that player
    RequestDeal(playerID) {
        this.dealer.Deal(this.GetPlayer(playerID).hand);
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
        user.CheckUpdateDisplay();
        user.updateTimer = setInterval(() => {
            user.CheckUpdateDisplay();
        }, 200);
        this.users[this.users.length] = user;
        if (this.tableRef.idle)
            this.tableRef.FillPlayers();
    }

    FindUser(user) {
        return this.users.indexOf(user) + 1;
    }

    CheckQueue() {
        while (this.users[0] === null) {
            this.users.splice(0, 1);
            if (this.users.length == 0)
                return;
        }
        if (this.users.length > 0) {
            let slot = this.tableRef.FirstOpenSlot();
            if (slot > 0) {
                this.users[0].SetupPlay(slot);
                this.tableRef.GetPlayer(slot).ChangeActiveness(true);
                this.users.splice(0, 1);
                this.CheckQueue();
            }
        }
    }
}



let blackjack = null;
let uInterface = null;
window.onload = () => {
    blackjack = new Table();
    uInterface = new Interface();
    uInterface.table = blackjack;
    uInterface.queueRef = blackjack.queue;
    uInterface.updateTimer = setInterval(() => {
        uInterface.CheckUpdateDisplay();
    }, 200);
}
