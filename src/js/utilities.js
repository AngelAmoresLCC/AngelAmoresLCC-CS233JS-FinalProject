//This file is for various utilities used elsewhere

class Item {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

export class Stack {
    constructor() {
        this.first = null;
        this.last = null;
        this.count = 0;
    }

    Push(itemValue) {
        let item = new Item(itemValue)
        if (!this.first) {
            this.first = item;
            this.last = item;
        }
        else {
            item.next = this.first;
            [this.first, item] = [item, this.first];
        }
        return ++this.count;
    }

    Pop() {
        if (!this.first) return null;
        let temp = this.first;
        if (this.first === this.last) {
            this.last = null;
        }
        this.first = this.first.next;
        this.size--;
        return temp.value;
    }

    ToArray() {
        let array = [];
        while (this.first) {
            array[array.length] = this.Pop();
        }
        array.reverse();
        for (let item of array) {
            this.Push(item);
        }
        return array;
    }

    Clear() {
        this.first = null;
        this.last = null;
        this.count = 0;
    }
}

export class OddsTables {
    constructor() {
        let H = "hit";
        let S = "stand";
        let D = "double";
        let P = "split";

        //TABLE KEY      Dealer upcard:  A, 2, 3, 4, 5, 6, 7, 8, 9, 10       HAND
        this.hardTable =               [[H, H, H, H, H, H, H, H, H, H],   // 5-7
                                        [H, H, H, H, H, H, H, H, H, H],   // 8
                                        [H, D, D, D, D, D, H, H, H, H],   // 9
                                        [H, D, D, D, D, D, D, D, D, H],   // 10
                                        [D, D, D, D, D, D, D, D, D, D],   // 11
                                        [H, H, H, S, S, S, H, H, H, H],   // 12
                                        [H, S, S, S, S, S, H, H, H, H],   // 13
                                        [H, S, S, S, S, S, H, H, H, H],   // 14
                                        [H, S, S, S, S, S, H, H, H, H],   // 15
                                        [H, S, S, S, S, S, H, H, H, H],   // 16
                                        [S, S, S, S, S, S, S, S, S, S]];  // 17+
        //TABLE KEY      Dealer upcard:  A, 2, 3, 4, 5, 6, 7, 8, 9, 10       HAND
        this.softTable =               [[H, H, H, H, D, D, H, H, H, H],   // A, 2
                                        [H, H, H, D, D, D, H, H, H, H],   // A, 3
                                        [H, H, H, D, D, D, H, H, H, H],   // A, 4
                                        [H, H, H, D, D, D, H, H, H, H],   // A, 5
                                        [H, H, D, D, D, D, H, H, H, H],   // A, 6
                                        [S, D, D, D, D, D, S, S, H, H],   // A, 7
                                        [S, S, S, S, S, S, S, S, S, S]];  // A, 8+
        //TABLE KEY      Dealer upcard:  A, 2, 3, 4, 5, 6, 7, 8, 9, 10       HAND
        this.splitTable =              [[P, P, P, P, P, P, P, P, P, P],   // A, A
                                        [H, H, H, P, P, P, P, H, H, H],   // 2, 2
                                        [H, H, H, P, P, P, P, H, H, H],   // 3, 3
                                        [H, H, H, H, H, H, H, H, H, H],   // 4, 4
                                        [H, D, D, D, D, D, D, D, D, H],   // 5, 5
                                        [H, P, P, P, P, P, H, H, H, H],   // 6, 6
                                        [H, P, P, P, P, P, P, H, H, H],   // 7, 7
                                        [P, P, P, P, P, P, P, P, P, P],   // 8, 8
                                        [S, P, P, P, P, P, S, P, P, S],   // 9, 9
                                        [S, S, S, S, S, S, S, S, S, S]];  // 10, 10
        //TABLE KEY      Dealer upcard:  A, 2, 3, 4, 5, 6, 7, 8, 9, 10       HAND
    }

    CheckHardTable(playerCard, dealerCard) {
        console.log("Checking hard table: " + playerCard + ", " + dealerCard);
        return this.hardTable[playerCard][dealerCard];
    }

    CheckSoftTable(playerCard, dealerCard) {
        console.log("Checking soft table: " + playerCard + ", " + dealerCard);
        return this.softTable[playerCard][dealerCard];
    }

    CheckSplitTable(playerCard, dealerCard) {
        console.log("Checking split table: " + playerCard + ", " + dealerCard);
        return this.splitTable[playerCard][dealerCard];
    }
}

//Fix displaying split hands
//Cut my losses, just put it below the main hand, vertical stack
//Fix displaying busted hands when the hand is split