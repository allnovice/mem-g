import Phaser from 'phaser'

type Card = {
    id: number
    symbol: string
}

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

const back = 'lock.svg'

const cardSize = 120
const gap = 16

export default class MemoryScene extends Phaser.Scene {
    socket!: WebSocket

    cards: Card[] = []

    cardObjects: Phaser.GameObjects.Container[] = []

    constructor() {
        super('MemoryScene')
    }

    preload() {
        for (const symbol of symbols) {
            this.load.image(symbol, `/${symbol}`)
        }

        this.load.image(back, `/${back}`)
    }















create() {

    const info = this.add.text(
        10,
        10,
        '',
        {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
        },
    )

    info.setDepth(1000)

    this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
            const renderer = this.game.renderer

            const type =
                renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer
                    ? 'WebGL'
                    : 'Canvas'

            info.setText(
                `Renderer: ${type}\n` +
                `FPS: ${this.game.loop.actualFps.toFixed(1)}`
            )
        },
    })

    const debug = this.add.text(
        10,
        100,
        '',
        {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            wordWrap: {
                width: 580,
            },
        },
    )

    debug.setDepth(1000)

    this.socket = new WebSocket(
        'ws://192.168.100.40:3000',
    )

    this.socket.onmessage = event => {
        const message = JSON.parse(event.data)

debug.setText(
    `type: ${message.type}\n` +
    `revealed: ${JSON.stringify(message.revealed)}\n` +
    `matched: ${JSON.stringify(message.matched)}`
)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'sync',
            }))
        }
    }
})
        if (message.type === 'game') {
            this.cards = message.cards

            this.createBoard()

            for (const id of [
                ...message.revealed,
                ...message.matched,
            ]) {
                this.showCard(id)
            }
        }

        if (message.type === 'flip') {
            this.flipCardVisual(message.id)
        }

        if (message.type === 'match') {
            if (!message.match) {
                this.time.delayedCall(800, () => {
                    this.hideCard(message.first)
                    this.hideCard(message.second)
                })
            }
        }

        if (message.type === 'reset') {
            this.resetBoard(message.cards)
        }
    }
}


    createBoard() {
        const boardSize =
            4 * cardSize + 3 * gap

        const startX =
            (this.scale.width - boardSize) / 2 +
            cardSize / 2

        const startY =
            (this.scale.height - boardSize) / 2 +
            cardSize / 2

        this.cards.forEach((card, index) => {
            const col = index % 4
            const row = Math.floor(index / 4)

            const x =
                startX +
                col * (cardSize + gap)

            const y =
                startY +
                row * (cardSize + gap)

            const background =
                this.add.rectangle(
                    0,
                    0,
                    cardSize,
                    cardSize,
                    0xffffff,
                )

            background.setStrokeStyle(
                2,
                0x333333,
            )

            const image =
                this.add.image(
                    0,
                    0,
                    back,
                )

            image.setDisplaySize(60, 60)

            const cardObject =
                this.add.container(
                    x,
                    y,
                    [
                        background,
                        image,
                    ],
                )

            cardObject.setSize(
                cardSize,
                cardSize,
            )

            cardObject.setInteractive()

            cardObject.on(
                'pointerdown',
                () => {
                    this.socket.send(
                        JSON.stringify({
                            type: 'flip',
                            id: index,
                        }),
                    )
                },
            )

            cardObject.setData(
                'image',
                image,
            )

            this.cardObjects[index] =
                cardObject
        })
    }
showCard(id: number) {
    const card = this.cardObjects[id]

    if (!card) {
        return
    }

    const image =
        card.getData('image') as Phaser.GameObjects.Image

    image.setTexture(
        this.cards[id].symbol,
    )
}
    flipCardVisual(id: number) {
        const card =
            this.cardObjects[id]

        const image =
            card.getData(
                'image',
            ) as Phaser.GameObjects.Image

        this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 100,

            onComplete: () => {
                image.setTexture(
                    this.cards[id].symbol,
                )

                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    duration: 100,
                })
            },
        })
    }

    hideCard(id: number) {
        const card =
            this.cardObjects[id]

        const image =
            card.getData(
                'image',
            ) as Phaser.GameObjects.Image

        this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 100,

            onComplete: () => {
                image.setTexture(back)

                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    duration: 100,
                })
            },
        })
    }

    resetBoard(cards: Card[]) {
        this.children.removeAll(true)

        this.cards = cards
        this.cardObjects = []

        this.createBoard()
    }
}
