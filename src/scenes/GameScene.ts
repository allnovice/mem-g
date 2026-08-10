import Phaser from 'phaser'
import { Card } from '../objects/Card'
import Board from '../objects/Board'
import type { CardData } from '../game/types'

export default class GameScene extends Phaser.Scene {
    private board!: Board
    private cards: Card[] = []
    private socket!: WebSocket

    private playerId!: string
    private displayName!: string

    private statsText!: Phaser.GameObjects.Text

    private eventLog: string[] = []
    private eventText!: Phaser.GameObjects.Text

    private rankingText!: Phaser.GameObjects.Text

    constructor() {
        super('GameScene')
    }

    private createBoard(cards: CardData[]) {
        this.cards = this.board.create(cards)

        this.cards.forEach((card, index) => {
            card.onClick(() => {
                this.socket.send(
                    JSON.stringify({
                        type: 'flipCard',
                        index,
                    })
                )
            })
        })
    }

    create() {
        /*
         * Board
         */
        this.board = new Board(this)

        /*
         * Event console
         */
        this.eventText = this.add.text(
            20,
            this.scale.height - 160,
            '',
            {
                fontSize: '16px',
                color: '#ffffff',
                wordWrap: {
                    width: this.scale.width - 40,
                },
            }
        )

        /*
         * Persistent player ID
         */
        this.playerId =
            localStorage.getItem('playerId') ??
            `player-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`

        localStorage.setItem(
            'playerId',
            this.playerId
        )

        /*
         * Display name
         */
        this.displayName =
            localStorage.getItem('displayName') ??
            `Guest#${Math.random()
                .toString(36)
                .substring(2, 6)
                .toUpperCase()}`

        localStorage.setItem(
            'displayName',
            this.displayName
        )

        /*
         * Stats
         */
        this.statsText = this.add.text(
            20,
            20,
            `${this.displayName}\nFlips: 0\nMatches: 0`,
            {
                fontSize: '20px',
                color: '#ffffff',
            }
        )

this.rankingText = this.add.text(
    this.scale.width - 20,
    20,
    'TOP 3',
    {
        fontSize: '18px',
        color: '#ffffff',
        align: 'right',
    }
)

this.rankingText.setOrigin(1, 0)

        /*
         * WebSocket
         */
const protocol =
    window.location.protocol === 'https:'
        ? 'wss:'
        : 'ws:'

this.socket = new WebSocket(
    `${protocol}//${window.location.host}/socket`
)
        this.socket.onopen = () => {
            console.log(
                'WebSocket connected'
            )

            this.socket.send(
                JSON.stringify({
                    type: 'identify',
                    playerId: this.playerId,
                    displayName: this.displayName,
                })
            )

            this.socket.send(
                JSON.stringify({
                    type: 'getStats',
                    playerId: this.playerId,
                })
            )

this.socket.send(
    JSON.stringify({
        type: 'getRanking',
    })
)

        }

        /*
         * Server messages
         */
        this.socket.onmessage = (event) => {
            const message =
                JSON.parse(event.data)

            /*
             * Event log
             */
            if (message.type === 'gameEvent') {
                this.eventLog.push(
                    message.message
                )

                if (this.eventLog.length > 10) {
                    this.eventLog.shift()
                }

                this.eventText.setText(
                    this.eventLog.join('\n')
                )

                return
            }

            /*
             * Player stats
             */
            if (message.type === 'playerStats') {
                this.statsText.setText(
                    `${this.displayName}\n` +
                    `Flips: ${message.stats.flips}\n` +
                    `Matches: ${message.stats.matches}`
                )

                return
            }

if (message.type === 'ranking') {
    const lines = message.players.map(
        (player: {
            displayName: string
            matches: number
        }) =>
            `${player.displayName}  ${player.matches}`
    )

    this.rankingText.setText(
        ['TOP 3', ...lines].join('\n')
    )

    return
}

            /*
             * Game state
             */
            if (message.type !== 'gameState') {
                return
            }

            console.log(
                'Server state:',
                message.state
            )

            /*
             * Create board once
             */
            if (this.cards.length === 0) {
                this.createBoard(
                    message.state.cards
                )
            }

            /*
             * Update cards
             */
            this.cards.forEach(
                (card, index) => {
                    const revealed =
                        message.state.revealed
                            .includes(index)

                    const matched =
                        message.state.matched
                            .includes(index)

                    if (
                        revealed ||
                        matched
                    ) {
                        if (
                            !card.isRevealed()
                        ) {
                            card.reveal()
                        }
                    } else {
                        if (
                            card.isRevealed()
                        ) {
                            card.hide()
                        }
                    }
                }
            )
        }

        /*
         * WebSocket errors
         */
        this.socket.onerror = (
            error
        ) => {
            console.error(
                'WebSocket error:',
                error
            )
        }

        /*
         * WebSocket closed
         */
        this.socket.onclose = () => {
            console.log(
                'WebSocket disconnected'
            )
        }
    }
}
