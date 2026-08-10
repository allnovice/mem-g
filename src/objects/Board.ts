import Phaser from 'phaser'
import { Card } from './Card'
import type { CardData } from '../game/types'

export default class Board {
    private scene: Phaser.Scene
    private cards: Card[] = []

    private cardWidth = 80
    private cardHeight = 120
    private gap = 12

    private top = 100
    private bottom = 0

    constructor(scene: Phaser.Scene) {
        this.scene = scene

        this.bottom = this.scene.scale.height - 190
    }

    create(cards: CardData[]) {
        const columns = this.getColumns(cards.length)
        const rows = Math.ceil(cards.length / columns)

        const availableWidth =
            this.scene.scale.width - 40

        const availableHeight =
            this.bottom - this.top - 20

        const widthFromScreen =
            (
                availableWidth -
                (columns - 1) * this.gap
            ) / columns

        const heightFromScreen =
            (
                availableHeight -
                (rows - 1) * this.gap
            ) / rows

        this.cardWidth = Math.min(
            80,
            widthFromScreen,
            heightFromScreen / 1.5
        )

        this.cardHeight = this.cardWidth * 1.5

        cards.forEach((_, index) => {
            const position = this.getCardPosition(
                index,
                columns,
                rows
            )

            const card = new Card(
                this.scene,
                position.x,
                position.y,
                this.cardWidth,
                this.cardHeight
            )

            this.cards.push(card)
        })

        return this.cards
    }

    private getColumns(cardCount: number) {
        if (cardCount >= 16) {
            const availableHeight =
                this.bottom - this.top

            if (availableHeight < 650) {
                return 4
            }

            return 4
        }

        if (cardCount >= 9) {
            return 3
        }

        return Math.ceil(Math.sqrt(cardCount))
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

        const areaWidth = this.scene.scale.width
        const areaHeight = this.bottom - this.top

        const startX =
            (areaWidth - totalWidth) / 2 +
            this.cardWidth / 2

        const startY =
            this.top +
            (areaHeight - totalHeight) / 2 +
            this.cardHeight / 2

        const row = Math.floor(index / columns)
        const column = index % columns

        return {
            x:
                startX +
                column * (
                    this.cardWidth + this.gap
                ),

            y:
                startY +
                row * (
                    this.cardHeight + this.gap
                ),
        }
    }
}
