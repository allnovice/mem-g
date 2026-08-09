import Phaser from 'phaser'
import { Card } from '../objects/Card'
import Board from '../objects/Board'
import type { CardData } from '../game/types'

export default class GameScene extends Phaser.Scene {

    private board!: Board
    private cards: Card[] = []
    private socket!: WebSocket
    private playerId!: string
    private statsText!: Phaser.GameObjects.Text
    private displayName!: string

    constructor() {
        super('GameScene')
    }

    private createBoard(cards: CardData[]) {
        this.cards = this.board.create(cards)

        this.cards.forEach((card, index) => {
            card.onClick(() => {
                this.socket.send(JSON.stringify({
                    type: 'flipCard',
                    index,
                }))
            })
        })
    }

create() {
    this.board = new Board(this)

    this.playerId =
        localStorage.getItem('playerId') ??
        `player-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`

    localStorage.setItem(
        'playerId',
        this.playerId
    )

    this.displayName =
        localStorage.getItem('displayName') ??
        `Guest#${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}`

    localStorage.setItem(
        'displayName',
        this.displayName
    )

    this.statsText = this.add.text(
        20,
        20,
        `${this.displayName}\nFlips: 0\nMatches: 0`,
        {
            fontSize: '20px',
            color: '#ffffff',
        }
    )


        this.socket = new WebSocket(
            'ws://192.168.100.40:8080'
        )

this.socket.onopen = () => {
    console.log('WebSocket connected')

this.socket.send(JSON.stringify({
    type: 'identify',
    playerId: this.playerId,
}))
this.socket.send(JSON.stringify({
    type: 'getStats',
}))
}


this.socket.onmessage = (event) => {
    const message = JSON.parse(event.data)

if (message.type === 'playerStats') {
    this.statsText.setText(
        `${this.displayName}\n` +
        `Flips: ${message.stats.flips}\n` +
        `Matches: ${message.stats.matches}`
    )

    return
}

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

        this.socket.onerror = (error) => {
            console.error(
                'WebSocket error:',
                error
            )
        }

        this.socket.onclose = () => {
            console.log(
                'WebSocket disconnected'
            )
        }
    }
}
