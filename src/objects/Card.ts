import Phaser from 'phaser'

export class Card {
    public readonly card: Phaser.GameObjects.Rectangle
    public readonly text: Phaser.GameObjects.Text

    private revealed = false

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number
    ) {

        this.card = scene.add.rectangle(
            x,
            y,
            width,
            height,
            0x3498db
        )

        this.text = scene.add.text(x, y, '?', {
            fontSize: '40px',
            color: '#ffffff',
        })

        this.text.setOrigin(0.5)

        this.card.setInteractive()
    }

    reveal(symbol: string) {
        this.revealed = true
        this.card.setFillStyle(0xe74c3c)
        this.text.setText(symbol)
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
