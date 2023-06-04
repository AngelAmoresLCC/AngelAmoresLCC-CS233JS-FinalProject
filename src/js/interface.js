export class Interface {
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
        this.queueButton = document.getElementById("queue");
        this.queueButton.addEventListener("click", this.EnterQueue.bind(this));
        this.currentCoins = 0;
        this.table = null;
        this.queueRef = null;
        this.queuePos = -1;
        this.queueTimer = null;
        this.updateTimer = null;
        this.displayID = -1;
        window.onbeforeunload = this.Leave();
        this.ChangeName = this.ChangeName.bind(this);
    }

    SetupPlay(playerID) {
        this.playerID = playerID;
        document.getElementById(`player${playerID}`).visibility = "hidden";
        this.hitButton.addEventListener("click", this.Action.bind(this, "hit"));
        this.standButton.addEventListener("click", this.Action.bind(this, "stand"));
        this.doubleButton.addEventListener("click", this.Action.bind(this, "double"));
        this.splitButton.addEventListener("click", this.Action.bind(this, "split"));
        this.betButton.addEventListener("click", this.MakeBet.bind(this));
        document.getElementById("user-name").addEventListener("change", this.ChangeName);
        this.ChangeName();
    }

    MakeBet() {
        let issue = "none";
        if (this.betInput.value >= 10)
            if (this.betInput.value <= this.currentCoins)
                if (this.betInput.value % 10 == 0)
                    if (this.table.PlayerBet(this.betInput.value, this.playerID)) {
                        this.betInput.value = 10;
                        this.betting.style.display = "none";
                        this.betInput.classList.remove("invalid");
                    }
                    else
                        issue = "!SOMETHING WENT WRONG BETTING!";
                else
                    issue = "!BET MUST BE A MULTIPLE OF 10!";
            else
                issue = "!BET IS TOO LARGE!";
        else
            issue = "!BET MUST BE AT LEAST 10 COINS!";
        if (issue != "none") {
            document.getElementById("bet-error").innerHTML = issue;
            document.getElementById("bet-error").style.display = "block";
        }
        else
            document.getElementById("bet-error").style.display = "none";
        this.CheckUpdateDisplay();
    }

    Action(action) {
        this.table.RequestAction(action, this.playerID);
        this.CheckUpdateDisplay();
    }

    ChangeName() {
        let nameText = document.getElementById("user-name").value;
        this.table.RequestChangeName(nameText, this.playerID);
        this.CheckUpdateDisplay();
    }

    //Checks if the current displayID matches the table's displayID, and updates the display if not
    CheckUpdateDisplay() {
        if (this.displayID !== this.table.displayID) {
            this.UpdateDisplay(this.table.displayStates);
        }
    }

    //Updates all displayed information on the page, then updates the current displayID
    //TODO: Comment each part of this monstrosity
    UpdateDisplay(displayInfoArray) {
        for (const info of displayInfoArray) {
            let id = info.id;
            let playerString = `player${id}`;
            if (id === "dealer") {
                playerString = "dealer";
                if (info.busted) {
                    document.getElementById(playerString + "-box").classList.add("busted-player");
                    document.getElementById(playerString + "-box").classList.remove("current-player");
                }
                else {
                    document.getElementById(playerString + "-box").classList.remove("busted-player");
                    if (id === this.table.currentPlayer)
                        document.getElementById(playerString + "-box").classList.add("current-player");
                    else
                        document.getElementById(playerString + "-box").classList.remove("current-player");
                }
                document.getElementById(playerString + "-hand").innerHTML = info.cards;
            }
            else {
                if (id === this.playerID) {
                    id = "user";
                    this.betInput.max = info.coins;
                    this.currentCoins = info.coins;
                    this.doubleButton.style.display = info.canDD ? "inline" : "none";
                    info.canDD == "true" ? this.doubleButton.setAttribute('disabled', true) : this.doubleButton.removeAttribute('diabled');
                    this.doubleButton.style.width = info.canSplit ? "45%" : "90%";
                    this.splitButton.style.display = info.canSplit ? "inline" : "none";
                    info.canSplit == "true" ? this.splitButton.setAttribute('diabled', true) : this.splitButton.removeAttribute('disabled');
                    playerString = id;
                }
                if (!info.active)
                {
                    document.getElementById(playerString).classList.add("inactive-player");
                    continue;
                }
                else
                    document.getElementById(playerString).classList.remove("inactive-player");
                if (info.busted) {
                    document.getElementById(playerString + "-box").classList.add("busted-player");
                    document.getElementById(playerString + "-box").classList.remove("current-player");
                }
                else {
                    document.getElementById(playerString + "-box").classList.remove("busted-player");
                    if (info.id === this.table.currentPlayer)
                        document.getElementById(playerString + "-box").classList.add("current-player");
                    else
                        document.getElementById(playerString + "-box").classList.remove("current-player");
                }
                document.getElementById(playerString + "-name").innerHTML = info.name;
                document.getElementById(playerString + "-currentBet").innerHTML = info.currentBet;
                document.getElementById(playerString + "-coins").innerHTML = info.coins;

                //Since displaying the hands (including the split hand) isn't currently fleshed out
                //This is all commented out

                document.getElementById(playerString + "-hand").innerHTML = info.mainHandCards;
                //Oh god fix the split hand display it's so messed up
                if (info.isSplit) {
                    document.getElementById(playerString + "-split").style.display = "inline";
                    document.getElementById(playerString + "-splitHand").innerHTML = info.splitHandCards;
                }
                else {
                    document.getElementById(playerString + "-split").style.display = "none";
                    document.getElementById(playerString + "-splitHand").innerHTML = "";
                }

                document.getElementById(playerString).style.visibility = info.active ? "visible" : "collapse";
            }
        }
        let handBoxes = document.getElementsByName("hand-box");
        for (let box of handBoxes) {
            if (this.table.currentPlayer == 0)
                box.classList.add("d-none");
            else
                box.classList.remove("d-none");
        }
        this.table.currentPlayer == this.playerID ? this.hitButton.removeAttribute('disabled') : this.hitButton.setAttribute('disabled', true);
        this.table.currentPlayer == this.playerID ? this.standButton.removeAttribute('disabled') : this.standButton.setAttribute('disabled', true);
        this.actions.style.display = this.table.currentPlayer == this.playerID ? "block" : "none";
        this.betting.style.display = this.table.isBetting ? "block" : "none";
        if (this.playerID == 0) {
            document.getElementById("user-row").classList.add("d-none");
            document.getElementById("spacer").classList.remove("d-none");
            document.getElementById("waiting").style.visibility = "visible";
        }
        else {
            document.getElementById("user-row").classList.remove("d-none");
            document.getElementById("spacer").classList.add("d-none");
            document.getElementById("waiting").style.visibility = "hidden";
        }
        let players123 = document.getElementsByName("player123");
        let count = 0;
        for (let player of players123) {
            if (player.classList.contains("inactive-player"))
                count++;
        }
        if (count == 3)
            document.getElementById("player123-row").classList.add("d-none");
        else
            document.getElementById("player123-row").classList.remove("d-none");
        let players456 = document.getElementsByName("player456");
        count = 0;
        for (let player of players456) {
            if (player.classList.contains("inactive-player"))
                count++;
        }
        if (count == 3)
            document.getElementById("player456-row").classList.add("d-none");
        else
            document.getElementById("player456-row").classList.remove("d-none");
        this.displayID = this.table.displayID;
    }

    EnterQueue() {
        this.queueRef.AddUser(this);
        this.queueTimer = setInterval(() => {
            this.UpdateQueue();
        }, 200);
        document.getElementById("queue").classList.add("d-none");
        document.getElementById("queue-pos-text").style.display = "inline";
    }

    UpdateQueue() {
        this.queuePos = this.queueRef.FindUser(this);
        document.getElementById("queue-pos").innerHTML = this.queuePos;
    }

    Leave() {
        this.updateTimer = null;
        if (this.table !== null) {
            this.table.GetPlayer(this.playerID).ChangeActiveness(false);
        }
        this.table = null;
    }
}