import Phaser from 'phaser'
import GameUI from '../ui/GameUI'

type Card = {
    id: number
    symbol: string
}

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

const back = 'lock-closed.svg'

const gap = 16

export default class MemoryScene extends Phaser.Scene {
    socket!: WebSocket

    ui!: GameUI

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
        this.game.events.on('resume', () => {
            console.log('GAME RESUMED')

            this.game.loop.resetDelta()

            this.socket.send(JSON.stringify({
                type: 'sync',
            }))
        })

        this.ui = new GameUI(this)

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

        this.socket = new WebSocket(
            'ws://192.168.100.40:3000',
        )

this.socket = new WebSocket(
    'ws://192.168.100.40:3000',
)

this.ui.setNameChangeHandler(
    (name) => {
        this.socket.send(
            JSON.stringify({
                type: 'name',
                name,
            }),
        )
    },
)

        this.socket.onopen = () => {
            this.socket.send(JSON.stringify({
                type: 'identify',
                playerId: localStorage.getItem('playerId'),
            }))
        }

        this.socket.onmessage = event => {
            const message = JSON.parse(event.data)

if (message.type === 'player') {
    localStorage.setItem(
        'playerId',
        message.playerId,
    )

    this.ui.setStats(
        message.playerId,
        message.flips,
        message.matches,
    )
}

if (message.type === 'leader') {
    this.ui.setRanking(
        message.playerId,
        message.matches,
    )
}
if (message.type === 'global') {
    this.ui.setGlobalStats(
        message.flips,
        message.matches,
    )
}
if (message.type === 'name') {
    if (
        message.playerId ===
        localStorage.getItem('playerId')
    ) {
        localStorage.setItem(
            'displayName',
            message.name,
        )

        this.ui.setDisplayName(
            message.name,
        )
    }
}
if (message.type === 'stats') {
    this.ui.setStats(
        message.playerId,
        message.flips,
        message.matches,
    )
}

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

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({
                        type: 'sync',
                    }))
                }
            }
        })
    }

    createBoard() {
        const availableWidth =
            this.scale.width - 32

        const responsiveCardSize =
            Math.floor(
                (availableWidth - 6 * gap) / 6
            )

        const boardSize =
            6 * responsiveCardSize + 5 * gap

        const startX =
            (this.scale.width - boardSize) / 2 +
            responsiveCardSize / 2

        const startY =
            (this.scale.height - boardSize) / 2 +
            responsiveCardSize / 2

        this.cards.forEach((_, index) => {
            const columns = 6

            const col = index % columns
            const row = Math.floor(index / columns)

            const x =
                startX +
                col * (responsiveCardSize + gap)

            const y =
                startY +
                row * (responsiveCardSize + gap)

            const background =
                this.add.rectangle(
                    0,
                    0,
                    responsiveCardSize,
                    responsiveCardSize,
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

            image.setDisplaySize(85, 85)

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
                responsiveCardSize,
                responsiveCardSize,
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
        const card =
            this.cardObjects[id]

        if (!card) {
            return
        }

        const image =
            card.getData(
                'image',
            ) as Phaser.GameObjects.Image

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
