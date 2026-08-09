import Phaser from 'phaser'
import { Card } from '../objects/Card'
import Board from '../objects/Board'
import type { CardData } from '../game/types'

const socket = new WebSocket('ws://192.168.100.40:8080')

export default class GameScene extends Phaser.Scene {

    private board!: Board
    private cards: Card[] = []

    constructor() {
        super('GameScene')
    }

    private createBoard(cards: CardData[]) {
        this.cards = this.board.create(cards)

        this.cards.forEach((card, index) => {
            card.onClick(() => {
                socket.send(JSON.stringify({
                    type: 'flipCard',
                    index,
                }))
            })
        })
    }

    create() {
        this.board = new Board(this)

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if (message.type !== 'gameState') {
                return
            }

            console.log('Server state:', message.state)

            if (this.cards.length === 0) {
                this.createBoard(message.state.cards)
            }

            this.cards.forEach((card, index) => {
                const revealed =
                    message.state.revealed.includes(index)

                const matched =
                    message.state.matched.includes(index)

                if (revealed || matched) {
                    if (!card.isRevealed()) {
                        card.reveal()
                    }
                } else {
                    if (card.isRevealed()) {
                        card.hide()
                    }
                }
            })
        }
    }
}
