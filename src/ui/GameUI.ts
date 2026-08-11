import Phaser from 'phaser'

export default class GameUI {
    private playerName: Phaser.GameObjects.Text
    private stats: Phaser.GameObjects.Text
    private ranking: Phaser.GameObjects.Text
    private onNameChange:
    ((name: string) => void) | null = null
    private globalStats: Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene) {
        this.stats = scene.add.text(
            scene.scale.width - 10,
            10,
            '',
            {
                fontSize: '16px',
                color: '#ffffff',
            },
        )

        this.stats.setOrigin(1, 0)
        this.stats.setDepth(1000)

        this.playerName = scene.add.text(
            scene.scale.width - 10,
            10,
            '',
            {
                fontSize: '16px',
                color: '#ffffff',
            },
        )

        this.playerName.setOrigin(1, 0)
        this.playerName.setDepth(1001)

        this.playerName.setInteractive({
            useHandCursor: true,
        })

        this.ranking = scene.add.text(
            scene.scale.width - 10,
            32,
            '',
            {
                fontSize: '16px',
                color: '#ffffff',
            },
        )

        this.ranking.setOrigin(1, 0)
        this.ranking.setDepth(1000)
        
this.globalStats = scene.add.text(
    scene.scale.width - 10,
    54,
    '',
    {
        fontSize: '16px',
        color: '#ffffff',
    },
)

this.globalStats.setOrigin(1, 0)
this.globalStats.setDepth(1000)

        this.playerName.on(
            'pointerdown',
            () => {
                this.showNameModal()
            },
        )



    }

    setStats(
        playerId: string,
        flips: number,
        matches: number,
    ) {
        const displayName =
            localStorage.getItem('displayName') ||
            playerId

        this.playerName.setText(
            displayName,
        )

        this.stats.setText(
            `|F:${flips}|M:${matches}`,
        )

        this.playerName.x =
            this.stats.x -
            this.stats.width -
            4
    }

setDisplayName(name: string) {
    this.playerName.setText(name)

    this.playerName.x =
        this.stats.x -
        this.stats.width -
        4
}

    setRanking(
        playerId: string,
        matches: number,
    ) {
        const displayName =
            localStorage.getItem('displayName') ||
            playerId

        this.ranking.setText(
            `Ranking|#1 ${displayName}-M:${matches}`,
        )
    }

    private showNameModal() {
        const scene =
            this.playerName.scene

        const width = scene.scale.width
        const height = scene.scale.height

        const overlay =
            scene.add.rectangle(
                width / 2,
                height / 2,
                width,
                height,
                0x000000,
                0.6,
            )

        overlay.setDepth(2000)

        const box =
            scene.add.rectangle(
                width / 2,
                height / 2,
                300,
                180,
                0xffffff,
            )

        box.setDepth(2001)

        const title =
            scene.add.text(
                width / 2,
                height / 2 - 55,
                'Display Name',
                {
                    fontSize: '20px',
                    color: '#000000',
                },
            )

        title.setOrigin(0.5)
        title.setDepth(2002)

        const input =
            document.createElement('input')

        input.value =
            localStorage.getItem(
                'displayName',
            ) || ''

        input.maxLength = 20

        input.style.position = 'fixed'
        input.style.left = '50%'
        input.style.top = '50%'
        input.style.transform =
            'translate(-50%, -50%)'

        input.style.width = '220px'
        input.style.height = '32px'
        input.style.fontSize = '16px'
        input.style.zIndex = '3000'

        document.body.appendChild(input)

        input.focus()

        const cancel =
            scene.add.text(
                width / 2 - 60,
                height / 2 + 50,
                'Cancel',
                {
                    fontSize: '16px',
                    color: '#000000',
                },
            )

        cancel.setOrigin(0.5)
        cancel.setDepth(2002)
        cancel.setInteractive({
            useHandCursor: true,
        })

        const save =
            scene.add.text(
                width / 2 + 60,
                height / 2 + 50,
                'Save',
                {
                    fontSize: '16px',
                    color: '#000000',
                },
            )

        save.setOrigin(0.5)
        save.setDepth(2002)
        save.setInteractive({
            useHandCursor: true,
        })

        const close = () => {
            input.remove()
            overlay.destroy()
            box.destroy()
            title.destroy()
            cancel.destroy()
            save.destroy()
        }

        cancel.on(
            'pointerdown',
            close,
        )

        save.on(
            'pointerdown',
            () => {
                const name =
                    input.value.trim()

                if (name) {
                    localStorage.setItem(
                        'displayName',
                        name,
                    )

                this.onNameChange?.(name),

                    this.playerName.setText(
                        name,
                    )

                    this.playerName.x =
                        this.stats.x -
                        this.stats.width -
                        4
                }

                close()
            },
        )
    }
setNameChangeHandler(
    handler: (name: string) => void,
) {
    this.onNameChange = handler
}
setGlobalStats(
    flips: number,
    matches: number,
) {
    this.globalStats.setText(
        `Global |F:${flips}|M:${matches}`,
    )
}

 
}
