import { WebSocketServer, WebSocket } from 'ws'
import Game from './src/game/Game'
import PlayerManager from './src/server/PlayerManager'
import GameManager from './src/server/GameManager'

const wss = new WebSocketServer({ port: 8080 })

const game = new Game()

const playerManager = new PlayerManager()

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
                state: {
                    gameId: game.gameId,
                    cards: game.cards.map(card => ({
                        id: card.id,
                    })),
revealed: game.revealed.map(index => ({
    index,
    symbol: game.cards[index].symbol,
})),
matched: game.matched.map(index => ({
    index,
    symbol: game.cards[index].symbol,
})),
                },
            }))
        }
    })
}
function broadcastEvent(message: string) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'gameEvent',
                message,
            }))
        }
    })
}
function broadcastRanking() {
    const players =
        playerManager.getTopPlayers(3)

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'ranking',
                players,
            }))
        }
    })
}
const gameManager = new GameManager(
    game,
    broadcastState,
    broadcastRanking,
    playerManager,
)
wss.on('connection', (socket) => {

    let playerId = ''

    console.log('Client connected')

socket.send(JSON.stringify({
    type: 'gameState',
    state: {
        gameId: game.gameId,

        cards: game.cards.map(card => ({
            id: card.id,
        })),

        revealed: game.revealed.map(index => ({
            index,
            symbol: game.cards[index].symbol,
        })),

matched: game.matched.map(index => ({
    index,
    symbol: game.cards[index].symbol,
})),
    },
}))

    socket.on('message', (message) => {

        const data = JSON.parse(message.toString())

        if (data.type === 'identify') {
            playerId = data.playerId

            playerManager.getOrCreate(playerId, data.displayName)

console.log(
    `${playerId} identified as ${data.displayName}`
)

            broadcastEvent(`${data.displayName} connected`)

            return
        }
     
if (data.type === 'getStats') {
    const player = playerManager.get(playerId)

    if (!player) {
        return
    }

    socket.send(JSON.stringify({
        type: 'playerStats',
        stats: player,
    }))

    return
}
if (data.type === 'getRanking') {
    socket.send(JSON.stringify({
        type: 'ranking',
        players: playerManager.getTopPlayers(3),
    }))

    return
}

        if (data.type !== 'flipCard') {
            return
        }

        console.log('Card flipped:', data.index)

const player = playerManager.addFlip(playerId)

console.log(
    `${playerId} flips: ${player.flips}`
)
socket.send(JSON.stringify({
    type: 'playerStats',
    stats: player,
}))


const updatedStats = gameManager.flipCard(
    data.index,
    playerId
)

if (updatedStats) {
    socket.send(JSON.stringify({
        type: 'playerStats',
        stats: updatedStats,
    }))
}
    })
    socket.on('close', () => {
        console.log('Client disconnected')
    })
})
