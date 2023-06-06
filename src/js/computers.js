import { Hand, Deck } from "./cards";
import { OddsTables } from "./utilities";

//This file includes the Dealer, and computer controlled players

export class Dealer {
    constructor() {
        this.deck = new Deck();
        this.players = [];
        this.hand = new Hand();
    }

    ResetDealer() {
        this.deck = new Deck();
        this.hand = new Hand();
    }

    Deal(hand) {
        hand.AddCard(this.deck.Draw()); //Find a way to slow down dealing, async and await?
    }

    UpCardValue() {
        return this.hand.CheckCard(1).value;
    }

    ShowUpCard() {
        if (this.hand.hand.length <= 0)
            return "";
        else if (this.hand.hand.length == 1)
            return "<br>?????";
        return "<br>?????" + this.hand.CheckCard(1).ToString();
    }
}

export class ComputerPlayer {
    constructor(table, ID) {
        this.tableRef = table;
        this.playerID = ID;
        this.playerRef = this.tableRef.GetPlayer(this.playerID);
        this.dealerRef = this.tableRef.dealer;
        this.hasBet = false;
        this.stuffCheckTimer = setInterval(() => {
            this.CheckGameState();
        }, 1000);
        this.NameSelf();
    }

    NameSelf() {
        let names = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Charlotte", "Elijah", "Amelia", "William",
            "Sophia", "John", "Jane", "Emmet", "Lisa", "Charles", "Eliana", "Emil", "Tabitha", "Oscar", "Noel"];
        let name = names[Math.floor(Math.random() * names.length)];
        this.tableRef.RequestChangeName(name, this.playerID);
    }

    CheckGameState() {
        if (this.tableRef.isBetting && !this.hasBet) { //Somehow there's an issue with betting
            this.tableRef.PlayerBet(this.GetBet(), this.playerID);
            this.hasBet = true;
        }
        else if (this.tableRef.currentPlayer == this.playerID) {
            this.tableRef.RequestAction(this.GetAction(), this.playerID);
            this.hasBet = false;
        }
    }

    GetBet() {
        return Math.min(50, this.playerRef.coins);
    }

    GetAction() {
        let tables = new OddsTables();
        let choice = "";
        let dealerCard = this.dealerRef.UpCardValue();
        let targetHand = this.tableRef.targetHand == "main" ? this.playerRef.hand : this.playerRef.splitHand;
        dealerCard -= 1; //This is to adjust the dealer's card into the correct index for the table lookup
        dealerCard = Math.min(dealerCard, 9);
        let handValue = targetHand.GetHandValue();
        if (targetHand.HasDoubles() && this.playerRef.CanSplit()) {
            handValue = targetHand.CheckCard(0).value; //Checking what the pair is
            handValue = Math.min(handValue - 1, 9); //Correcting index for table lookup
            choice = tables.CheckSplitTable(handValue, dealerCard);
        }
        else if (targetHand.hasLiveAce) {
            handValue = Math.min(handValue - 13, 6); //Correcting index for table lookup
            choice = tables.CheckSoftTable(handValue, dealerCard);
        }
        else {
            handValue = Math.min(handValue - 7, 10); //Correcting index for table lookup
            handValue = handValue < 0 ? 0 : handValue;
            choice = tables.CheckHardTable(handValue, dealerCard);
        }
        if (!this.playerRef.canDD && choice == "double")
            choice = targetHand.GetHandValue() == 18 ? "stand" : "hit"; //Correcting double down if not possible
        return choice;
    }

    LeaveTable() {

    }
}