import { WebSocketServer, WebSocket } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

function shuffle<T>(array: T[]) {
    return array.sort(() => Math.random() - 0.5)
}

const cards = ['★', '●', '★', '●']

shuffle(cards)

const gameState = {
    cards,
    revealed: [] as number[],
    matched: [] as number[],
}

console.log('WebSocket server running on port 8080')
console.log('Game:', gameState.cards.join(' '))

wss.on('connection', (socket) => {
    console.log('Client connected')

    // Send current game state to the new client
    socket.send(JSON.stringify({
        type: 'gameState',
        state: gameState,
    }))

    socket.on('message', (message) => {
        const data = JSON.parse(message.toString())

        if (data.type !== 'flipCard') {
            return
        }

        console.log('Card flipped:', data.index)

        // Maximum of two temporary cards
        if (gameState.revealed.length >= 2) {
            console.log('Rejected: 2 cards already revealed')
            return
        }

        // Already temporarily revealed
        if (gameState.revealed.includes(data.index)) {
            console.log('Rejected: card already revealed')
            return
        }

        // Already permanently matched
        if (gameState.matched.includes(data.index)) {
            console.log('Rejected: card already matched')
            return
        }

        gameState.revealed.push(data.index)

        console.log('Revealed:', gameState.revealed)

        // Check pair
        if (gameState.revealed.length === 2) {
            const [first, second] = gameState.revealed

            if (gameState.cards[first] === gameState.cards[second]) {
                console.log('MATCH!')

                gameState.matched.push(first, second)
                gameState.revealed = []

                // Check if the entire game is complete
                if (gameState.matched.length === gameState.cards.length) {
                    console.log('GAME COMPLETE!')

                    setTimeout(() => {
                        shuffle(gameState.cards)

                        gameState.revealed = []
                        gameState.matched = []

                        console.log(
                            'NEW GAME:',
                            gameState.cards.join(' ')
                        )

                        wss.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'gameState',
                                    state: gameState,
                                }))
                            }
                        })
                    }, 1000)
                }
            } else {
                console.log('NO MATCH')

                setTimeout(() => {
                    gameState.revealed = []

                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'gameState',
                                state: gameState,
                            }))
                        }
                    })
                }, 800)
            }
        }

        // Send current state after every valid flip
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'gameState',
                    state: gameState,
                }))
            }
        })
    })

    socket.on('close', () => {
        console.log('Client disconnected')
    })
})
