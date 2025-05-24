class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.wasOnGround = false;
    }

    create() {
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        // create coins
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        console.log("Coins found in tilemap:", this.coins.length); // Confirm 59 coins found

        // Physics for coins
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        // Track coin collection
        this.totalCoins = 51;
        this.coinsCollected = 0;

        // Player setup
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Coin overlap handler
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
            if (coin.active) {
                coin.destroy();
                this.coinsCollected++;

                if (this.coinsCollected >= this.totalCoins) {
                    this.scene.start("endScene");
                }
            }
        });

        // Input setup
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        });

        // Particle VFX
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            scale: { start: 0.03, end: 0.03 },
            lifespan: 350,
            alpha: { start: 1, end: 0.1 },
        });
        my.vfx.walking.stop();

        my.vfx.jump = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_01.png'],
            scale: { start: 0.02, end: 0.01 },
            speed: { min: -50, max: 50 },
            lifespan: 300,
            alpha: { start: 1, end: 0 },
            quantity: 5
        });
        my.vfx.jump.stop();
        
        // Add landing sound
        this.landingSound = this.sound.add('impact');

        // Camera setup
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }

    update() {
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, -my.sprite.player.displayWidth / 2 + 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        // Jumping
        if (my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.emitParticleAt(my.sprite.player.x, my.sprite.player.y + 10);
        }

        // Detect landing sound: if was NOT on ground last update, but now IS on ground, play sound
        if (!this.wasOnGround && my.sprite.player.body.blocked.down) {
            this.landingSound.play();
        }
        this.wasOnGround = my.sprite.player.body.blocked.down;


        // Restart scene on R key
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}
