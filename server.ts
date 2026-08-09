import { WebSocketServer, WebSocket } from 'ws'
import Game from './src/game/Game'

const wss = new WebSocketServer({ port: 8080 })

const game = new Game()

console.log('WebSocket server running on port 8080')
console.log(
    'Game:',
    game.cards.map(card => card.symbol).join(' ')
)

function broadcastState() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'gameState',
                state: game,
            }))
        }
    })
}

wss.on('connection', (socket) => {
    console.log('Client connected')

    socket.send(JSON.stringify({
        type: 'gameState',
        state: game,
    }))

    socket.on('message', (message) => {
        const data = JSON.parse(message.toString())

        if (data.type !== 'flipCard') {
            return
        }

        console.log('Card flipped:', data.index)

        if (game.revealed.length >= 2) {
            console.log('Rejected: 2 cards already revealed')
            return
        }

        if (game.revealed.includes(data.index)) {
            console.log('Rejected: card already revealed')
            return
        }

        if (game.matched.includes(data.index)) {
            console.log('Rejected: card already matched')
            return
        }

        game.revealed.push(data.index)

        console.log('Revealed:', game.revealed)

        if (game.revealed.length === 2) {
            const [first, second] = game.revealed

            const firstCard = game.cards[first]
            const secondCard = game.cards[second]

            if (firstCard.pairId === secondCard.pairId) {
                console.log('MATCH!')

                game.matched.push(first, second)
                game.revealed = []

                if (game.matched.length === game.cards.length) {
                    console.log('GAME COMPLETE!')

                    setTimeout(() => {
                        game.revealed = []
                        game.matched = []

                        game.cards.sort(
                            () => Math.random() - 0.5
                        )

                        console.log(
                            'NEW GAME:',
                            game.cards
                                .map(card => card.symbol)
                                .join(' ')
                        )

                        broadcastState()
                    }, 1000)
                }
            } else {
                console.log('NO MATCH')

                setTimeout(() => {
                    game.revealed = []
                    broadcastState()
                }, 800)
            }
        }

        broadcastState()
    })

    socket.on('close', () => {
        console.log('Client disconnected')
    })
})
