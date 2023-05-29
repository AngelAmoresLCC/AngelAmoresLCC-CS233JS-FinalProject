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
            let temp = this.first;
            this.first = item;
            this.first.next = temp;
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
        while(this.first)
        {
            array[array.length] = this.Pop();
        }
        array.reverse();
        return array;
    }

    Clear() {
        this.first = null;
        this.last = null;
        this.count = 0;
    }
}