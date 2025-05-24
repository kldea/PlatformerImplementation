class EndScene extends Phaser.Scene {
    constructor() {
        super("endScene");
    }

    create() {
        // Show message
        const { width, height } = this.sys.game.config;
        this.add.text(width / 2, height / 2 - 40, "You collected all the coins!", {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 20, "Press R to restart", {
            fontSize: '24px',
            fill: '#ffff00'
        }).setOrigin(0.5);

        // Capture R key
        this.rKey = this.input.keyboard.addKey('R');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start("platformerScene"); // restart the game
        }
    }
}
