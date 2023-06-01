import { Table } from "./blackjack";

class Interface {
    constructor() {
        this.playerID = 0;
        this.actions = document.getElementById("actions");
        this.hitButton = document.getElementById("hit");
        this.standButton = document.getElementById("stand");
        this.doubleButton = document.getElementById("doubleDown");
        this.splitButton = document.getElementById("split");
        this.betting = document.getElementById("betting");
        this.betInput = document.getElementById("userBet");
        this.betButton = document.getElementById("bet");
        this.table = null;
        this.displayID = -1;
        window.onbeforeunload = this.Leave();
    }

    SetupPlay(playerID) {
        this.playerID = playerID;
        document.getElementById(`player${playerID}`).visibility = "hidden";
        this.hitButton.addEventListener("click", this.Action.bind(this, "hit"));
        this.standButton.addEventListener("click", this.Action.bind(this, "stand"));
        this.doubleButton.addEventListener("click", this.Action.bind(this, "double"));
        this.splitButton.addEventListener("click", this.Action.bind(this, "split"));
    }

    MakeBet() {
        if (this.table.PlayerBet(this.betInput.value, this.playerID)) {
            this.betInput.value = 10;
            this.betting.style.display = "none";
            this.betInput.classList.remove("is-invalid");
        }
        else {
            this.betInput.classList.add("is-invalid");
        }
    }

    Action(action) {
        this.table.RequestAction(action, this.playerID)
    }

    CheckUpdateDisplay() {
        if (this.displayID !== this.table.displayID) {
            this.UpdateDisplay(this.table.displayStates);
        }
    }

    UpdateDisplay(displayInfoArray) {
        for (const info of displayInfoArray) {
            let id = info.id;
            if (id === "dealer") {
                if (info.busted)
                    document.getElementById(playerString).classList.add("busted-player");
                else {
                    document.getElementById(playerString).classList.remove("busted-player");
                    if (id === this.table.currentPlayer)
                        document.getElementById(playerString).classList.add("current-player");
                    else
                        document.getElementById(playerString).classList.remove("current-player");
                }
            }
            else {
                if (id === this.playerID) {
                    id = "user";
                    this.betInput.max = info.coins;
                    this.doubleButton.style.display = info.canDD ? "inline" : "none";
                    this.doubleButton.prop('disabled', !info.canDD);
                    this.doubleButton.style.width = info.canSplit ? "45%" : "90%";
                    this.splitButton.style.display = info.canSplit ? "inline" : "none";
                    this.splitButton.prop('disabled', !info.canSplit);
                }
                let playerString = `player${id}`;
                if (info.busted)
                    document.getElementById(playerString).classList.add("busted-player");
                else {
                    document.getElementById(playerString).classList.remove("busted-player");
                    if (info.id === this.table.currentPlayer)
                        document.getElementById(playerString).classList.add("current-player");
                    else
                        document.getElementById(playerString).classList.remove("current-player");
                }
                document.getElementById(playerString + "-name").innerHTML = info.name;
                document.getElementById(playerString + "-currentBet").innerHTML = info.currentBet;
                document.getElementById(playerString + "-coins").innterHTML = info.coins;
                //Since displaying the hands (including the split hand) isn't currently fleshed out
                //This is all commented out
                /*
                document.getElementById(playerString + "-hand").innerHTML = info.mainHandCards;
                if (info.isSplit)
                {
                    document.getElementById(playerString + "-split").style.display = "visible";
                    document.getElementById(playerString + "-splitHand").innerHTML = info.splitHandCards;
                }
                else
                {
                    document.getElementById(playerString + "-split").style.display = "none";
                    document.getElementById(playerString + "-splitHand").innerHTML = "";
                }
                */
                document.getElementById(playerString).style.visibility = info.active ? "visible" : "hidden";
            }
            this.hitButton.prop('disabled', (this.table.currentPlayer !== this.playerID));
            this.standButton.prop('disabled', (this.table.currentPlayer !== this.playerID));
            this.actions.style.display = this.table.currentPlayer == this.playerID ? "block" : "none";
            this.betting.style.display = this.table.isBetting ? "block" : "none";
        }
        this.displayID = this.table.displayID;
    }

    Leave() {
        if (this.table !== null) {
            this.table.GetPlayer(this.playerID).ChangeActiveness(false);
        }
    }
}