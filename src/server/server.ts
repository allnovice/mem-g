import { WebSocketServer, WebSocket } from 'ws'
import Game from '../game/Game.ts'
import { db } from './db.ts'

const symbols = [
    'academic-cap.svg',
    'banknotes.svg',
    'beaker.svg',
    'bell.svg',
    'bookmark.svg',
    'briefcase.svg',
    'bug-ant.svg',
    'building-office.svg',
    'cake.svg',
    'calculator.svg',
    'calendar.svg',
    'camera.svg',
    'chart-bar.svg',
    'chat-bubble-left.svg',
    'check-circle.svg',
    'cloud.svg',
    'computer-desktop.svg',
    'cpu-chip.svg',
]
let nextGuestNumber = 1

function createGuestId() {
    return `guest#${nextGuestNumber++}`
}
const server = new WebSocketServer({
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
})
const game = new Game(symbols)
const players = new Map<string, {
    name: string
    flips: number
    matches: number
}>()
let globalFlips = 0
let globalMatches = 0

async function updateGlobalStats() {
    const result = await db.query(`
        SELECT
            COALESCE(SUM(flips), 0) AS flips,
            COALESCE(SUM(matches), 0) AS matches
        FROM players
    `)

    globalFlips = Number(result.rows[0].flips)
    globalMatches = Number(result.rows[0].matches)
}
const result = await db.query(
    'SELECT player_id, name, flips, matches FROM players'
)

for (const player of result.rows) {
    players.set(player.player_id, {
        name: player.name,
        flips: player.flips,
        matches: player.matches,
    })
}

console.log(`Loaded ${result.rows.length} players from database`)
await updateGlobalStats()
const clients = new Set<WebSocket>()

function getLeader() {
    let leaderId = ''
    let highestMatches = -1

    for (const [id, stats] of players) {
        if (stats.matches > highestMatches) {
            leaderId = id
            highestMatches = stats.matches
        }
    }

    const leader = players.get(leaderId)

    return {
        playerId: leaderId,
        name: leader?.name ?? leaderId,
        matches: highestMatches,
    }
}

server.on('connection', socket => {
    console.log('Client connected')

    
    

    clients.add(socket)  

let playerId = ''

    socket.send(JSON.stringify({
        type: 'game',
        cards: game.cards,
        revealed: game.revealed,
        matched: game.matched,
    }))

const leader = getLeader()

for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
            type: 'leader',
            playerId: leader.playerId,
            name: leader.name,
            matches: leader.matches,
        }))

        client.send(JSON.stringify({
            type: 'global',
            flips: globalFlips,
            matches: globalMatches,
        }))
    }
}
socket.on('close', () => {
    clients.delete(socket)
})
    socket.on('message', async data => {
        const message = JSON.parse(data.toString())
if (message.type === 'identify') {
    playerId =
    message.playerId || createGuestId()
if (!players.has(playerId)) {
    const player = {
        name: playerId,
        flips: 0,
        matches: 0,
    }

    players.set(playerId, player)

    await db.query(
        `INSERT INTO players
            (player_id, name, flips, matches)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (player_id) DO NOTHING`,
        [
            playerId,
            player.name,
            player.flips,
            player.matches,
        ],
    )
}

    console.log('Identified:', playerId)

const player = players.get(playerId)!

socket.send(JSON.stringify({
    type: 'player',
    playerId,
    flips: player.flips,
    matches: player.matches,
}))

    return
}
if (message.type === 'sync') {
    socket.send(JSON.stringify({
        type: 'game',
        cards: game.cards,
        revealed: game.revealed,
        matched: game.matched,
    }))

    return
}

if (message.type === 'name') {
    const player = players.get(playerId)

    if (!player) {
        return
    }

    player.name = message.name

await db.query(
    `UPDATE players
     SET name = $1, updated_at = now()
     WHERE player_id = $2`,
    [
        player.name,
        playerId,
    ],
)

    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'name',
                playerId,
                name: player.name,
            }))
        }
    }

    return
}
        if (message.type !== 'flip') {
            return
        }

        if (!game.flip(message.id)) {
            return
        }

players.get(playerId!)!.flips++

await db.query(
    `UPDATE players
     SET flips = $1, updated_at = now()
     WHERE player_id = $2`,
    [
        players.get(playerId!)!.flips,
        playerId,
    ],
)

await updateGlobalStats()

await db.query(
    `UPDATE players
     SET flips = $1, updated_at = now()
     WHERE player_id = $2`,
    [
        players.get(playerId!)!.flips,
        playerId,
    ],
)
socket.send(JSON.stringify({
    type: 'stats',
    playerId,
    flips: players.get(playerId!)!.flips,
    matches: players.get(playerId!)!.matches,
}))
console.log(
    playerId,
    'flips:',
    players.get(playerId!)!.flips,
    'matches:',
    players.get(playerId!)!.matches,
)

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

if (match === true) {
    players.get(playerId!)!.matches++

    await db.query(
        `UPDATE players
         SET matches = $1, updated_at = now()
         WHERE player_id = $2`,
        [
            players.get(playerId!)!.matches,
            playerId,
        ],
    )

    await updateGlobalStats()
}

socket.send(JSON.stringify({
    type: 'stats',
    playerId,
    flips: players.get(playerId!)!.flips,
    matches: players.get(playerId!)!.matches,
}))
        game.locked = true
console.log(
    playerId,
    'flips:',
    players.get(playerId!)!.flips,
    'matches:',
    players.get(playerId!)!.matches,
)
const matchMessage = JSON.stringify({
    type: 'match',
    first,
    second,
    match,
})
const leader = getLeader()

for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
            type: 'leader',
            playerId: leader.playerId,
            name: leader.name,
            matches: leader.matches,
        }))

        client.send(JSON.stringify({
            type: 'global',
            flips: globalFlips,
            matches: globalMatches,
        }))
    }
}
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
