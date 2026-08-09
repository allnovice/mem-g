import Phaser from 'phaser'
import GameScene from './scenes/GameScene'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    backgroundColor: '#222222',

    scene: GameScene,
}

new Phaser.Game(config)
