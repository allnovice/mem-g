import { WebSocketServer } from 'ws'
import Game from '../game/Game.ts'

const symbols = [
    'bell.svg',
    'camera.svg',
    'cloud.svg',
    'cube.svg',
    'heart.svg',
    'key.svg',
    'rocket.svg',
    'star.svg',
]

const server = new WebSocketServer({
    host: '0.0.0.0',
    port: 3000,
})
const game = new Game(symbols)

const clients = new Set<WebSocket>()
server.on('connection', socket => {

    console.log('Client connected')
    clients.add(socket)  
    socket.send(JSON.stringify({
        type: 'game',
        cards: game.cards,
        revealed: game.revealed,
        matched: game.matched,
    }))
socket.on('close', () => {
    clients.delete(socket)
})
    socket.on('message', data => {
        const message = JSON.parse(data.toString())
if (message.type === 'sync') {
    socket.send(JSON.stringify({
        type: 'game',
        cards: game.cards,
        revealed: game.revealed,
        matched: game.matched,
    }))

    return
}
        if (message.type !== 'flip') {
            return
        }

        if (!game.flip(message.id)) {
            return
        }

const flipMessage = JSON.stringify({
    type: 'flip',
    id: message.id,
})

for (const client of clients) {
    client.send(flipMessage)
}

        if (game.revealed.length !== 2) {
            return
        }

        const first = game.revealed[0]
        const second = game.revealed[1]

        const match = game.checkMatch()
        game.locked = true

const matchMessage = JSON.stringify({
    type: 'match',
    first,
    second,
    match,
})

for (const client of clients) {
    client.send(matchMessage)
}

        if (match === false) {
            setTimeout(() => {
                game.hideRevealed()
                game.locked = false
            }, 800)
        }

       
if (match === true) {
    game.locked = false

    if (game.isComplete()) {
        setTimeout(() => {
            game.reset(symbols)

            socket.send(JSON.stringify({
                type: 'reset',
                cards: game.cards,
            }))
        }, 500)
    }
}
    })
})

console.log(
    'WebSocket server listening on 192.168.100.40:3000',
)
