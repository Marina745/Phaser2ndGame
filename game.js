var config = {
    type: Phaser.AUTO,

width: 1920,
height: 1080,
parent: "game",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var platforms;
var cursors;
var score = 0;
var scoreText;
var bombs;
var game;
var worldWidth = 9600;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('stone', 'assets/stone.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.image('grass', 'assets/grass.png');
}

function create() {
   //фон плитки
    //this.add.image(400, 300, 'sky');
    this.add.tileSprite(0, 0, worldWidth, 1080, "sky").setOrigin(0, 0);
    
    // додаємо платформи на весь екран
    platforms = this.physics.add.staticGroup();
   
   for(var x = 0; x< worldWidth; x= x + 100){ 
     console.log(x)
     platforms.create(x, 1000, 'ground').setOrigin(0,0).refreshBody();
    }


    //platforms.create(500, 700, 'ground');
    //platforms.create(300, 850, 'ground');
    //platforms.create(20, 550, 'ground');
    //platforms.create(200, 288, 'ground');
    //platforms.create(800, 470, 'ground');
   
    //додаємо камінці
    stone = this.physics.add.staticGroup();
    //Додаємо камінці на всю ширину екрану
    for(var x = 500; x<worldWidth; x=x+Phaser.Math.FloatBetween(300, 1600)){
        console.log(' x-'+ x)
        stone.create(x, 1080-80,'stone').setOrigin(0,1).setScale(Phaser.Math.FloatBetween(0.5, 1)).refreshBody();
    }
    //додаємо траву
    grass = this.physics.add.staticGroup();
    //Додаємо траву на всю ширину екрану
    for(var x = 500; x<worldWidth; x=x+Phaser.Math.FloatBetween(300, 1600)){
    console.log(' x-'+ x)
    grass.create(x, 1080-80,'grass').setOrigin(0,1).setScale(Phaser.Math.FloatBetween(0.2, 0.9)).refreshBody();
}

    //додаємо дерево
    tree = this.physics.add.staticGroup();
    //Додаємо дерево на всю ширину екрану
    for(var x = 500; x<worldWidth; x=x+Phaser.Math.FloatBetween(300, 1600)){
    console.log(' x-'+ x)
    tree.create(x, 1080-80,'tree').setOrigin(0,1).setScale(Phaser.Math.FloatBetween(0.5, 1)).refreshBody();
}
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    //player.setCollideWorldBounds(true);

//
    this.cameras.main.setBounds(0,0, worldWidth, window.innerHeight);
    this.physics.world.setBounds(0,0, worldWidth, window.innerHeight);

    this.cameras.main.startFollow(player);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 1000);
this.cameras.main.startFollow(player);
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}
function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;

}
function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);
    var x = (player.x < 400) ?
        Phaser.Math.Between(400, 800) :
        Phaser.Math.Between(0, 400);
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    if (stars.countActive(true) === 0) {

        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);
        });
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}