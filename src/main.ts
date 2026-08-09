import Phaser from 'phaser'
import { Card } from './objects/Card'

const socket = new WebSocket('ws://192.168.100.40:8080')

class GameScene extends Phaser.Scene {

private cards: Card[] = []

    constructor() {
        super('GameScene')
    }

private createBoard(symbols: string[]) {
    symbols.forEach((symbol, index) => {
        const x = 250 + index * 100

        const card = new Card(
            this,
            x,
            300,
            symbol
        )

        this.cards.push(card)

        card.onClick(() => {
            socket.send(JSON.stringify({
                type: 'flipCard',
                index,
            }))
        })
    })
}
create() {
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
            const revealed = message.state.revealed.includes(index)
            const matched = message.state.matched.includes(index)

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
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#222222',
    scene: GameScene,
}

new Phaser.Game(config)
