export type Card = {
    id: number
    symbol: string
}

export default class Game {
    cards: Card[] = []

    revealed: number[] = []

    matched: number[] = []

    locked = false

    constructor(symbols: string[]) {
        this.reset(symbols)
    }

    flip(id: number) {
        if (this.locked) {
            return false
        }

        if (this.revealed.includes(id)) {
            return false
        }

        if (this.matched.includes(id)) {
            return false
        }

        this.revealed.push(id)

        return true
    }

    checkMatch() {
        if (this.revealed.length !== 2) {
            return null
        }

        const first = this.revealed[0]
        const second = this.revealed[1]

        const match =
            this.cards[first].symbol ===
            this.cards[second].symbol

        if (match) {
            this.matched.push(first, second)
            this.revealed = []

            return true
        }

        return false
    }

    hideRevealed() {
        this.revealed = []
    }

    isComplete() {
        return this.matched.length === this.cards.length
    }

    reset(symbols: string[]) {
        const pairs = [...symbols, ...symbols]

        this.cards = pairs.map((symbol, id) => ({
            id,
            symbol,
        }))

        this.shuffle()

        this.revealed = []
        this.matched = []
        this.locked = false
    }

    private shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))

            const temp = this.cards[i]
            this.cards[i] = this.cards[j]
            this.cards[j] = temp
        }
    }
}
