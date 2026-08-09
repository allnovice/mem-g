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
                state: game,
            }))
        }
    })
}
const gameManager = new GameManager(
    game,
    broadcastState,
    playerManager,
)
wss.on('connection', (socket) => {

    let playerId = ''

    console.log('Client connected')

    socket.send(JSON.stringify({
        type: 'gameState',
        state: game,
    }))

    socket.on('message', (message) => {

        const data = JSON.parse(message.toString())

        if (data.type === 'identify') {
            playerId = data.playerId

            playerManager.getOrCreate(playerId)

            console.log(`${playerId} identified`)

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
