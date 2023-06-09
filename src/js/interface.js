export class Interface {
    constructor() {
        this.playerID = -1;
        this.actions = document.getElementById("actions");
        this.hitButton = document.getElementById("hit");
        this.standButton = document.getElementById("stand");
        this.doubleButton = document.getElementById("doubleDown");
        this.splitButton = document.getElementById("split");
        this.betting = document.getElementById("betting");
        this.betInput = document.getElementById("userBet");
        this.betButton = document.getElementById("bet");
        this.leaveButton = document.getElementById("leave");
        this.queueButton = document.getElementById("queue");
        this.queueButton.addEventListener("click", this.EnterQueue.bind(this));
        this.currentCoins = 0;
        this.canAct = true;
        this.table = null;
        this.queueRef = null;
        this.queuePos = -1;
        this.queueTimer = null;
        this.updateTimer = null;
        this.displayID = -1;
        this.turnTimer = null;
        this.turnLength = 0;
        this.abortSignal = new AbortController();
        window.onbeforeunload = this.LeaveTable();
        this.ChangeName = this.ChangeName.bind(this);
        this.LoadDog();
    }

    SetupPlay(playerID) {
        this.playerID = playerID;
        clearInterval(this.queueTimer);
        document.getElementById("player" + playerID).style.visibility = "collapse";
        this.abortSignal.abort();
        this.abortSignal = new AbortController();
        this.hitButton.addEventListener("click", this.Action.bind(this, "hit"), { signal: this.abortSignal.signal });
        this.standButton.addEventListener("click", this.Action.bind(this, "stand"), { signal: this.abortSignal.signal });
        this.doubleButton.addEventListener("click", this.Action.bind(this, "double"), { signal: this.abortSignal.signal });
        this.splitButton.addEventListener("click", this.Action.bind(this, "split"), { signal: this.abortSignal.signal });
        this.betButton.addEventListener("click", this.MakeBet.bind(this), { signal: this.abortSignal.signal });
        this.leaveButton.addEventListener("click", this.LeaveTable.bind(this), { signal: this.abortSignal.signal });
        document.getElementById("user-name").addEventListener("change", this.ChangeName, { signal: this.abortSignal.signal });
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
        this.canAct = false;
        this.hitButton.setAttribute('disabled', true);
        this.standButton.setAttribute('disabled', true);
        this.doubleButton.setAttribute('disabled', true);
        this.splitButton.setAttribute('disabled', true);
        this.table.RequestAction(action, this.playerID);
        this.RemoveTurnTimer();
        setTimeout(() => {
            this.canAct = true;
            console.log(this.canAct);
            this.UpdateDisplay(this.table.displayStates);
        }, 500);
    }

    ChangeName() {
        let nameText = document.getElementById("user-name").value;
        this.table.RequestChangeName(nameText, this.playerID);
        this.CheckUpdateDisplay();
    }

    //Checks if the current displayID matches the table's displayID, and updates the display if not
    CheckUpdateDisplay() {
        if (this.table == null)
            return;
        if (this.displayID !== this.table.displayID) {
            this.UpdateDisplay(this.table.displayStates);
        }
    }

    //Updates all displayed information on the page, then updates the current displayID
    UpdateDisplay(displayInfoArray) {
        //---ALL PLAYERS AND DEALER---//
        for (const info of displayInfoArray) {
            let id = info.id; //Gets the player ID
            let playerString = `player${id}`; //This string is the prefix of all elements attached to that player ID

            if (id === "dealer") { //Section for updating the dealer's information
                playerString = "dealer"; //Changes prefix for dealer elements

                //Checks if the dealer is busted or not
                if (info.busted) {
                    document.getElementById(playerString + "-box").classList.add("busted-player");
                    document.getElementById(playerString + "-box").classList.remove("current-player");
                }
                else {
                    document.getElementById(playerString + "-box").classList.remove("busted-player");
                    //Checks if the dealer is the current player or not
                    if (id === this.table.currentPlayer)
                        document.getElementById(playerString + "-box").classList.add("current-player");
                    else
                        document.getElementById(playerString + "-box").classList.remove("current-player");
                }

                //Displays the dealer's cards
                if (this.table.currentPlayer == id)
                    document.getElementById(playerString + "-hand").innerHTML = info.cards; //Shows all cards
                else
                    document.getElementById(playerString + "-hand").innerHTML = info.upCard; //Only shows one card
            }
            else { //Updates all other players' information
                if (id === this.playerID) { //Updates information specific to the user
                    id = "user";
                    playerString = id; //Changes prefix for user elements
                    document.getElementById(playerString + "-id").innerHTML = this.playerID; //Displays which player ID the user has
                    this.betInput.max = info.coins; //Updates user's max bet amount
                    this.currentCoins = info.coins; //Updates the interface's current coins counter

                    //---INPUTS---//

                    //Activates / deactivates the hit button
                    (this.canAct && this.table.currentPlayer == this.playerID) ? this.hitButton.removeAttribute('disabled') : this.hitButton.setAttribute('disabled', true);
                    //Activates / deactivates the stand button
                    (this.canAct && this.table.currentPlayer == this.playerID) ? this.standButton.removeAttribute('disabled') : this.standButton.setAttribute('disabled', true);
                    //Shows / hides the double down button
                    this.doubleButton.style.display = info.canDD ? "inline" : "none";
                    //Activates / deactivates the double down button
                    (this.canAct && info.canDD) ? this.doubleButton.removeAttribute('disabled') : this.doubleButton.setAttribute('disabled', true);
                    //Updates double down button width to account for split button, if it is present
                    this.doubleButton.style.width = info.canSplit ? "45%" : "90%";
                    //Shows / hides the split button
                    this.splitButton.style.display = info.canSplit ? "inline" : "none";
                    //Activates / deactivates the split button
                    (this.canAct && info.canSplit) ? this.splitButton.removeAttribute('disabled') : this.splitButton.setAttribute('disabled', true);
                }

                //If the player is inactive, hides them and moves to the next player
                if (!info.active) {
                    document.getElementById(playerString).classList.add("inactive-player");
                    continue;
                }
                else //Shows active players that were inactive
                    document.getElementById(playerString).classList.remove("inactive-player");

                //If this player is being controlled by the user, hide that player, otherwise show it
                if (info.id == this.playerID)
                    document.getElementById("player" + info.id).style.visibility = "collapse";
                else
                    document.getElementById("player" + info.id).style.visibility = "visible";

                //If both hands are busted, show that the player is busted
                if (info.mainHandBusted && info.splitHandBusted) {
                    document.getElementById(playerString + "-box").classList.add("busted-player");
                    document.getElementById(playerString + "-box").classList.remove("current-player");
                }
                else {
                    document.getElementById(playerString + "-box").classList.remove("busted-player");
                    //If the player isn't busted, show if this player is taking their turn or not
                    if (info.id === this.table.currentPlayer)
                        document.getElementById(playerString + "-box").classList.add("current-player");
                    else
                        document.getElementById(playerString + "-box").classList.remove("current-player");
                }

                //Updates this player's name
                document.getElementById(playerString + "-name").innerHTML = info.name;
                //Updates this player's current bet
                document.getElementById(playerString + "-currentBet").innerHTML = info.currentBet;
                //Updates this player's coins
                document.getElementById(playerString + "-coins").innerHTML = info.coins;

                //---HANDS---//

                //Shows if the main hand is busted or not
                if (info.mainHandBusted)
                    document.getElementById(playerString + "-main").classList.add("busted-hand");
                else
                    document.getElementById(playerString + "-main").classList.remove("busted-hand");
                //If the split hand exists, show if it's busted or not
                if (info.isSplit) {
                    if (info.splitHandBusted)
                        document.getElementById(playerString + "-split").classList.add("busted-hand");
                    else
                        document.getElementById(playerString + "-split").classList.remove("busted-hand");
                }

                //Shows the main hand's cards
                document.getElementById(playerString + "-hand").innerHTML = info.mainHandCards;
                //Shows the main hand value. If it is a soft hand (contains an ace worth 11), show the hard value as well
                document.getElementById(playerString + "-hand-value").innerHTML = info.mainHandIsSoft ? `${info.mainHandValue}(${info.mainHandHardValue})` : info.mainHandValue;

                //If the split hand exists...
                if (info.isSplit) {
                    //Show the split hand section
                    document.getElementById(playerString + "-split").style.display = "inline-block";
                    //Show the split hand cards
                    document.getElementById(playerString + "-splitHand").innerHTML = info.splitHandCards;
                    //Shows the split hand value. If it is a soft hand (contains an ace worth 11), show the hard value as well
                    document.getElementById(playerString + "-splitHand-value").innerHTML = info.splitHandIsSoft ? `${info.splitHandValue}(${info.splitHandHardValue})` : info.splitHandValue;
                    //If this player is currently taking their turn...
                    if (this.table.currentPlayer == info.id) {
                        //If they are playing on their main hand, highlight it
                        if (this.table.targetHand == "main") {
                            document.getElementById(playerString + "-main").classList.add("current-hand");
                            document.getElementById(playerString + "-split").classList.remove("current-hand");
                        }
                        else //If they are playing on their split hand, highlight it
                            if (this.table.targetHand == "split") {
                                document.getElementById(playerString + "-main").classList.remove("current-hand");
                                document.getElementById(playerString + "-split").classList.add("current-hand");
                            }
                    }
                    else { //If it is not their turn, remove highlights from both hands
                        document.getElementById(playerString + "-main").classList.remove("current-hand");
                        document.getElementById(playerString + "-split").classList.remove("current-hand");
                    }
                }
                else { //Hide the split hand section if it does not exist
                    document.getElementById(playerString + "-split").style.display = "none";
                    document.getElementById(playerString + "-splitHand").innerHTML = "";
                }
            }
        }

        //---INFO AGNOSTIC---//

        //Get all the hand boxes
        let handBoxes = document.getElementsByName("hand-box");
        for (let box of handBoxes) {
            if (this.table.currentPlayer == 0) //If no player is currently playing, hide them
                box.classList.add("d-none");
            else
                box.classList.remove("d-none");
        }

        //If the user is the current player, start the turn timer if it does not exist
        if (this.table.currentPlayer == this.playerID && this.turnTimer == null)
            this.StartTurnTimer();
        else
            this.RemoveTurnTimer();

        //If the user is the current player, show the action buttons
        this.actions.style.display = this.table.currentPlayer == this.playerID ? "block" : "none";

        //If the table is betting, show the betting inputs
        this.betting.style.display = this.table.isBetting ? "block" : "none";

        //If the user is not playing, hide the user elements, show the spacer, and show the queue button
        if (this.playerID == -1) {
            document.getElementById("user-row").classList.add("d-none");
            document.getElementById("spacer").classList.remove("d-none");
            document.getElementById("waiting").style.visibility = "visible";
        }
        else { //Otherwise do the opposite of that
            document.getElementById("user-row").classList.remove("d-none");
            document.getElementById("spacer").classList.add("d-none");
            document.getElementById("waiting").style.visibility = "hidden";
        }

        //If players 1, 2, and 3 are all inactive, hide their row
        let players123 = document.getElementsByName("player123");
        let count = 0;
        for (let player of players123)
            if (player.classList.contains("inactive-player"))
                count++;
        if (count == 3)
            document.getElementById("player123-row").classList.add("d-none");
        else
            document.getElementById("player123-row").classList.remove("d-none");
        //If players 4, 5, and 6 are all inactive, hide their row
        let players456 = document.getElementsByName("player456");
        count = 0;
        for (let player of players456)
            if (player.classList.contains("inactive-player"))
                count++;
        if (count == 3)
            document.getElementById("player456-row").classList.add("d-none");
        else
            document.getElementById("player456-row").classList.remove("d-none");

        //Update the display ID to match the table's
        this.displayID = this.table.displayID;
    }

    ResetDisplay() {
        this.queueButton
    }

    StartTurnTimer() {
        clearInterval(this.turnTimer);
        this.turnTimer = null;
        this.turnLength = 15;
        document.getElementById("timer-count").innerHTML = this.turnLength;
        document.getElementById("timer").style.visibility = "visible";
        this.turnTimer = setInterval(() => {
            this.UpdateTurnTimer();
        }, 1000);
    }

    UpdateTurnTimer() {
        document.getElementById("timer-count").innerHTML = --this.turnLength;
        if (this.turnLength <= 0)
            this.Action("stand");
    }

    RemoveTurnTimer() {
        document.getElementById("timer").style.visibility = "hidden";
        clearInterval(this.turnTimer);
        this.turnTimer = null;
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

    LeaveTable() {
        if (this.table !== null) {
            this.table.GetPlayer(this.playerID).ChangeActiveness(false);
            if (this.table.isBetting)
                this.table.CheckBets();
            this.table.interfaces[this.playerID - 1] = null;
        }
        this.playerID = -1;
        document.getElementById("queue").classList.remove("d-none");
        document.getElementById("queue-pos-text").style.display = "none";
        this.CheckUpdateDisplay();
    }

    LoadDog() {
        fetch("https://random.dog/woof.json")
            .then(response => response.json())
            .then(data => {
                console.log(data);

                if (data.fileSizeBytes > 1000000) {
                    console.log("Dog too big.");
                    this.LoadDog();
                }
                else if (data.fileSizeBytes < 10000) {
                    console.log("Dog too small.");
                    this.LoadDog();
                }
                else if (data.url.match(/gif/)) {
                    console.log("Dog moves too much.");
                    this.LoadDog();
                }
                else {
                    document.getElementById("dog").innerHTML = `<img src=${data.url} alt="A dog" width="95%"></img>`
                }
            })
    }
}