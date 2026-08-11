import Phaser from 'phaser'
import MemoryScene from './scenes/MemoryScene'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,

    width: 600,
    height: 900,

    parent: 'game',

    backgroundColor: '#222222',

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: MemoryScene,
}

new Phaser.Game(config)
