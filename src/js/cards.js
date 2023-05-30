import Stack from "./utilities";

//This file includes Hands, the Deck, and Cards themselves

export class Hand {
    constructor() {
        this.hand = [];
        this.hasLiveAce = false;
    }

    IsBlackjack() {
        return this.GetHandValue() == 21 && this.hand.length == 2;
    }

    CheckCard(index) {
        return this.hand[index];
    }

    AddCard(card) {
        this.hand[this.hand.length] = card;
        this.GetHandValue();
    }

    GetHandValue() {
        let handValue = 0;
        let numBigAces = 0;
        for (const card of hand) {
            if (card.IsAce()) {
                if (handValue <= 10) {
                    handValue += 11;
                    numBigAces++;
                }
                else
                    handValue += 1;
            }
            else if (card.Value >= 11) {
                handValue += 10;
            }
            else {
                handValue += card.value;
            }
        }
        while (numBigAces > 0 && handValue > 21) {
            handValue -= 10;
            numBigAces--;
        }
        this.hasLiveAce = numBigAces > 0;
        return handValue;
    }

    GetHardValue() {
        let handValue = 0;
        for (const card of hand) {
            if (card.IsFaceCard())
                handValue += 10;
            else
                handValue += card.value;
        }
        return handValue;
    }

    IsBusted() {
        return this.GetHandValue > 21;
    }

    HasDoubles() {
        return this.hand.length == 2 && (this.hand[0].HasMatchingValue(this.hand[1]) || (this.hand[0].IsFaceCard() || this.hand[0].value == 10) && (this.hand[1].IsFaceCard() || this.hand[1].value == 10));
    }

    HandImageArray() {
        let images = []
        for (const card of this.hand) {
            images[images.length] = card.GetImageString();
        }
        return images;
    }
}

export class Deck {
    constructor() {
        this.deck = new Stack();
        for (let i = 0; i < 52; i++) {
            deck.Push(new Card(i % 13 + 1, i % 4 + 1));
        }
        this.Shuffle();
    }

    Shuffle() {
        deckArray = deck.ToArray();
        deck.Clear();
        for (let swapIndex = deckArray.Length - 1; swapIndex > 0; swapIndex--) {
            let swapTarget = Math.floor(Math.random() * (swapIndex + 1));
            (deckArray[swapTarget], deckArray[swapIndex]) = (deckArray[swapIndex], deckArray[swapTarget]);
        }
        for (const card of deckArray) {
            deck.Push(card);
        }
    }

    Draw() {
        return this.deck.Pop();
    }
}

export class Card {
    constructor(cardValue, cardSuit) {
        this.value = cardValue;
        this.suit = cardSuit;
        this.nextCard = null;
        this.values = ["", "a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k"];
        this.suits = ["", "c", "d", "h", "s"];
    }

    HasMatchingSuit(otherCard) {
        return this.suit == otherCard.suit;
    }

    HasMatchingValue(otherCard) {
        return this.value == otherCard.value;
    }

    IsAce() {
        return this.value == 1;
    }

    IsFaceCard() {
        return this.value >= 11;
    }

    IsBlack() {
        return this.suit == 1 || this.suit == 3;
    }

    IsRed() {
        return !this.IsBlack();
    }

    IsClub() {
        return this.suit == 1;
    }

    IsDiamond() {
        return this.suit == 2;
    }

    IsHeart() {
        return this.suit == 3;
    }

    IsSpade() {
        return this.suit == 4;
    }

    GetImageString() {
        return "cards/" + this.values[this.value] + this.suits[this.suit] + ".jpg";
    }

    ToString() {
        return this.values[this.value] + " of " + this.suits[this.suit];
    }
}
