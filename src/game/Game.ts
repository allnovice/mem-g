export type CardData = {
    id: number
    pairId: number
    symbol: string
}

export default class Game {
    cards: CardData[] = []

    revealed: number[] = []

    matched: number[] = []

    constructor() {
        this.createCards()
    }

    private createCards() {
        const symbols = [
            '★', '●', '▲', '■',
            '♥', '♦', '♣', '♠',
        ]

        const cards: CardData[] = []

        symbols.forEach((symbol, pairId) => {
            cards.push({
                id: cards.length,
                pairId,
                symbol,
            })

            cards.push({
                id: cards.length,
                pairId,
                symbol,
            })
        })

        cards.sort(() => Math.random() - 0.5)

        this.cards = cards
    }
}
