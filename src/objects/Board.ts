import Phaser from 'phaser'
import { Card } from './Card'
import type { CardData } from '../game/types'

export default class Board {
    private scene: Phaser.Scene
    private cards: Card[] = []

    private cardWidth = 80
    private cardHeight = 120
    private gap = 20

    constructor(scene: Phaser.Scene) {
        this.scene = scene
    }

    create(cards: CardData[]) {
        const columns = Math.ceil(Math.sqrt(cards.length))
        const rows = Math.ceil(cards.length / columns)

        cards.forEach((cardData, index) => {
            const position = this.getCardPosition(
                index,
                columns,
                rows
            )

            const card = new Card(
                this.scene,
                position.x,
                position.y,
                cardData.symbol
            )

            this.cards.push(card)
        })

        return this.cards
    }

    private getCardPosition(
        index: number,
        columns: number,
        rows: number
    ) {
        const totalWidth =
            columns * this.cardWidth +
            (columns - 1) * this.gap

        const totalHeight =
            rows * this.cardHeight +
            (rows - 1) * this.gap

        const startX =
            (this.scene.scale.width - totalWidth) / 2 +
            this.cardWidth / 2

        const startY =
            (this.scene.scale.height - totalHeight) / 2 +
            this.cardHeight / 2

        const row = Math.floor(index / columns)
        const column = index % columns

        return {
            x: startX + column * (this.cardWidth + this.gap),
            y: startY + row * (this.cardHeight + this.gap),
        }
    }
}
