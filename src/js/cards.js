class Card
{
    constructor(cardValue, cardSuit)
    {
        this.value = cardValue;
        this.suit = cardSuit;
        this.values = [ "", "a", "2", "3", "4", "5", "6", "7", "8", "9", "t", "j", "q", "k" ];
        this.suits = [ "", "c", "d", "h", "s" ];
        this.Value = this.Value.bind(this);
        this.Suit = this.Suit.bind(this);
        this.HasMatchingSuit = this.HasMatchingSuit.bind(this);
        this.HasMatchingValue = this.HasMatchingValue.bind(this);
        this.IsAce = this.IsAce.bind(this);
        this.IsFaceCard = this.IsFaceCard.bind(this);
        this.IsBlack = this.IsBlack.bind(this);
        this.IsRed = this.IsRed.bind(this);
        this.IsClub = this.IsClub.bind(this);
        this.IsDiamond = this.IsDiamond.bind(this);
        this.IsHeart = this.IsHeart.bind(this);
        this.IsSpade = this.IsSpade.bind(this);
        this.GetImageString = this.GetImageString.bind(this);
        this.ToString = this.ToString.bind(this);
    }

    Value()
    {
        return this.value;
    }

    Suit()
    {
        return this.suit;
    }

    HasMatchingSuit(otherCard)
    {
        return this.suit == otherCard.Suit;
    }

    HasMatchingValue(otherCard)
    {
        return this.value == otherCard.Value;
    }

    IsAce()
    {
        return this.value == 1;
    }

    IsFaceCard()
    {
        return this.value >= 11;
    }

    IsBlack()
    {
        return this.suit == 1 || this.suit == 3;
    }

    IsRed()
    {
        return !this.IsBlack();
    }

    IsClub()
    {
        return this.suit == 1;
    }

    IsDiamond()
    {
        return this.suit == 2;
    }

    IsHeart()
    {
        return this.suit == 3;
    }

    IsSpade()
    {
        return this.suit == 4;
    }

    GetImageString()
    {
        return "cards/" + this.values[this.value] + this.suits[this.suit] + ".jpg";
    }

    ToString()
    {
        return this.values[this.value] + " of " + this.suits[this.suit];
    }
}
