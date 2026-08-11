import WebSocket from 'ws'

const socket = new WebSocket('ws://localhost:3000')

socket.on('open', () => {
    console.log('Connected')

    socket.send(
        JSON.stringify({
            type: 'flip',
            id: 0,
        }),
    )
})
socket.on('message', data => {
    console.log('Received:')
    console.log(JSON.parse(data.toString()))

    socket.close()
})

socket.on('close', () => {
    console.log('Disconnected')
})
