import Phaser from 'phaser'
import MemoryScene from './scenes/MemoryScene'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,

    width: 600,
    height: 600,

    parent: 'game',

    backgroundColor: '#222222',

    scene: MemoryScene,
}

new Phaser.Game(config)
