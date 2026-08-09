import Phaser from 'phaser'

export class Card {
    public readonly symbol: string
    public readonly card: Phaser.GameObjects.Rectangle
    public readonly text: Phaser.GameObjects.Text

    private revealed = false

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        symbol: string
    ) {
        this.symbol = symbol

        this.card = scene.add.rectangle(
            x,
            y,
            80,
            120,
            0x3498db
        )

        this.text = scene.add.text(x, y, '?', {
            fontSize: '40px',
            color: '#ffffff',
        })

        this.text.setOrigin(0.5)

        this.card.setInteractive()
    }

    reveal() {
        this.revealed = true
        this.card.setFillStyle(0xe74c3c)
        this.text.setText(this.symbol)
    }

    hide() {
        this.revealed = false
        this.card.setFillStyle(0x3498db)
        this.text.setText('?')
    }

    isRevealed() {
        return this.revealed
    }

    onClick(callback: () => void) {
        this.card.on('pointerdown', callback)
    }
}
