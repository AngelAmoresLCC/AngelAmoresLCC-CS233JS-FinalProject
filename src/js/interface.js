import Table from "./blackjack";

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
    }

    SetupPlay(playerID) {
        this.playerID = playerID;
        document.getElementById(`player${playerID}`).visibility = "hidden";
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
                    this.doubleButton.display = info.canDD ? "inline" : "none";
                    this.splitButton = info.canSplit ? "inline" : "none";
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
                //document.getElementById(playerString + "-hand").innerHTML = info.mainHandCards;
                document.getElementById(playerString + "-currentBet").innerHTML = info.currentBet;
                document.getElementById(playerString + "-coins").innterHTML = info.coins;
                /*
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
            this.actions.style.display = this.table.currentPlayer == this.playerID ? "block" : "none";
            this.betting.style.display = this.table.isBetting ? "block" : "none";
        }
    }
}