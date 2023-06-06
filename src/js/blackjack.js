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
        this.interfaces = []; //Can be either user interfaces or computer players
        for (let i = 1; i <= 6; i++) {
            this.players[this.players.length] = new Player(this, this.dealer, "Player " + i, i);
            this.interfaces[this.interfaces.length] = null;
        }
        this.dealer.players = this.players;
        this.currentPlayer = 0;
        this.numBets = 0;
        this.isBetting = true;
        this.displayStates = [];
        this.displayID = 0;
        this.idle = false;
        this.targetHand = "main"; //"split" for playing the split hand
        this.turnCountdowner = null;
        this.UpdateDisplayStates();
        this.FillPlayers();
    }

    FillPlayers() {
        console.log("Filling players");
        for (let i = 0; i < 6 && this.FirstOpenSlot() != 0; i++) {
            this.queue.CheckQueue();
        }
        let anyActive = false;
        for (let player of this.players) {
            if (player.active)
                anyActive = true;
        }
        if (anyActive) {
            this.FillComputers();
            this.GetBets();
        }
        else
            this.idle = true;
    }

    FillComputers() {
        for (let player of this.players) {
            if (!player.active)
                this.interfaces[player.playerID - 1] = new ComputerPlayer(this, player.playerID);
                player.ChangeActiveness(true);
        }
    }

    FirstOpenSlot() {
        for (let player of this.players) {
            if (!player.active)
                return player.playerID;
        }
        return 0;
    }

    GetBets() {
        console.log("Getting bets");
        this.idle = false;
        this.currentPlayer = 0;
        this.isBetting = true;
        this.numBets = 0;
        this.UpdateDisplayStates();
    }

    CheckBets() {
        let numActivePlayers = 0;
        for (let player of this.players) {
            if (player.active)
                numActivePlayers++;
        }
        if (this.numBets === numActivePlayers) {
            this.isBetting = false;
            this.UpdateDisplayStates();
            setTimeout(() => {
                this.BeginRound();
            }, 1000);
        }
    }

    BeginRound() {
        console.log("Beginning round");
        this.currentPlayer = "dealing";
        for (let i = 0; i < 2; i++) {
            for (let player of this.players) {
                if (player.active) {
                    this.dealer.Deal(player.hand);
                    this.UpdateDisplayStates();
                }
            }
        }
        for (let i = 0; i < 2; i++) {
            this.dealer.Deal(this.dealer.hand);
        }
        this.UpdateDisplayStates();
        setTimeout(() => {
            this.currentPlayer = 0;
            this.ContinueRound();
        }, 1500);
    }

    ContinueRound() {
        console.log("Continuing round");
        do {
            this.currentPlayer++;
            if (this.currentPlayer > this.players.length) {
                this.DealerTurn();
                return;
            }
        } while (this.GetPlayer(this.currentPlayer).active == false);
        console.log("Current player: " + this.currentPlayer);
        this.UpdateDisplayStates();
    }

    //This is a failsafe to make sure that the game continues even if the interface is broken somehow
    //Realistically this would only matter in a server-side implementation
    //TODO: Implement removing 'dead' interfaces such that they cannot rejoin with a valid ID if they come back
    BeginTurnCountDown() {
        this.turnCountdowner = setTimeout(() => {
            console.log("Player " + this.currentPlayer + " appears missing.");
            this.RequestAction("stand", this.currentPlayer);
        }, 60000)
    }

    DealerTurn() {
        console.log("Dealer's turn");
        this.currentPlayer = "dealer";
        this.UpdateDisplayStates();
        while (!this.dealer.hand.IsBusted() && this.dealer.hand.GetHandValue() < 17 || (this.dealer.hand.GetHandValue() == 17 && this.dealer.hand.hasLiveAce)) {
            this.dealer.Deal(this.dealer.hand);
            this.UpdateDisplayStates();
        }
        setTimeout(() => {
            this.EndRound();
        }, 3000);
    }

    EndRound() {
        console.log("Ending round");
        this.currentPlayer = 0;
        this.UpdateDisplayStates();
        this.PayWinnings();
        this.dealer.ResetDealer();
        setTimeout(() => {
            this.ClearPlayers();
        }, 1500);
    }

    ClearPlayers() {
        for (let player of this.players)
            if (player.active && player.coins < 10) {
                this.interfaces[player.playerID - 1].LeaveTable();
                this.interfaces[player.playerID - 1] = null;
            }
        this.UpdateDisplayStates();
        setTimeout(() => {
            this.FillPlayers();
        }, 1000);
    }

    PayWinnings() {
        let dealerScore = this.dealer.hand.GetHandValue();
        for (const player of this.players) {
            let handValue = player.hand.GetHandValue();
            if (player.IsSplit()) {
                let splitValue = player.splitHand.GetHandValue();
                if (!player.hand.IsBusted()) {
                    if (handValue > dealerScore || this.dealer.hand.IsBusted())
                        player.coins += player.currentBet * 2;
                    else if (handValue == dealerScore)
                        player.coins += player.currentBet;
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
                    cards: this.dealer.hand.HandString(),
                    upCard: this.dealer.ShowUpCard(),
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
                    mainHandCards: player.hand.HandString(), //Update to newer display solution later
                    mainHandValue: player.hand.GetHandValue(),
                    mainHandIsSoft: player.hand.hasLiveAce,
                    mainHandHardValue: player.hand.GetHardValue(),
                    isSplit: player.IsSplit(),
                    splitHandCards: player.IsSplit() ? player.splitHand.HandString() : null, //Update to newer display solution later
                    splitHandValue: player.IsSplit() ? player.splitHand.GetHandValue() : 0,
                    splitHandIsSoft: player.IsSplit() ? player.splitHand.hasLiveAce : false,
                    splitHandHardValue: player.IsSplit() ? player.splitHand.GetHardValue() : 0,
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

    //Called by user interface, checks if the request is viable and then applies the bet to the corresponding player,
    //updating the number of bets afterwards
    //Can also be called by a computer player
    PlayerBet(betAmount, playerID) {
        console.log("Bet request received from " + playerID);
        if (this.GetPlayer(playerID).MakeBet(betAmount)) {
            this.numBets++;
            this.CheckBets();
            this.UpdateDisplayStates();
            return true;
        }
        return false;
    }

    //Called by user interface, checks if the request is viable and passes it to the corresponding player if so
    //Can also be called by a computer player
    RequestAction(action, playerID) {
        if (playerID == this.currentPlayer) {
            //console.log(action);
            clearTimeout(this.turnCountdowner);
            if (this.targetHand == "main") {
                if (this.GetPlayer(playerID).HandleChoice(action)) {
                    this.UpdateDisplayStates();
                    if (action == "stand" || action == "double" || this.GetPlayer(playerID).hand.IsBusted()) {
                        if (this.GetPlayer(playerID).IsSplit()) {
                            if (this.GetPlayer(playerID).hand.CheckCard(0).IsAce())
                                this.DelayContinue();
                            else {
                                this.targetHand = "split";
                                this.BeginTurnCountDown();
                            }
                        }
                        else
                            this.DelayContinue();
                    }
                    else
                        this.BeginTurnCountDown();
                }
            }
            else if (this.targetHand == "split") {
                if (this.GetPlayer(playerID).HandleChoice(action)) {
                    this.UpdateDisplayStates();
                    if (action == "stand" || action == "double" || this.GetPlayer(playerID).splitHand.IsBusted()) {
                        this.targetHand = "main";
                        this.DelayContinue();
                    }
                    else
                        this.BeginTurnCountDown();
                }
            }
        }
    }

    DelayContinue() {
        setTimeout(() => {
            this.ContinueRound();
        }, 500);
    }

    //Called by user interface, changes the name of the corresponding playerID
    //Can also be called by a computer player
    RequestChangeName(name, playerID) {
        this.GetPlayer(playerID).name = name;
    }

    //Called by player, instructs dealer to deal a card to that player
    //Yeah this method is kind of pointless, I know
    RequestDeal(playerID) {
        this.dealer.Deal(this.GetPlayer(playerID).hand);
    }

    RemoveInterface(playerID) {
        this.interfaces[this.playerID - 1].LeaveTable();
    }
}

//Handles excess players
export class QueueHandler {
    constructor(table) {
        this.users = [];
        this.tableRef = table;
    }

    AddUser(user) {
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
                this.tableRef.interfaces[slot - 1] = this.users[0];
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
    uInterface.CheckUpdateDisplay();
}