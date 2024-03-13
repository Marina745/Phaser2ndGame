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

var player; //гравець
var stars;  //зірки
var platforms;  //платформи
var cursors;
var score = 0;  //кількість очків
var scoreText;  //текстова зміна очків
var bombs;  //бомби
var game;
var worldWidth = 9600;  //ширина світу
var life = 5;    //кількість життів
var lifesText;  //текстова зміна життів
var game = new Phaser.Game(config);
var resetButton;    //кнопка перезапуску
var hearts; //життя

function preload() {
    //загружаємо обєкти
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('stone', 'assets/stone.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.image('grass', 'assets/grass.png');
    this.load.image('platformStart', 'assets/platformStar.png');
    this.load.image('platformOne', 'assets/platformOne.png');
    this.load.image('platformFinish', 'assets/platformFinish.png');
    this.load.image('hearts', 'assets/hearts.png');
}

function create() {

    //фон плитки
    //this.add.image(400, 300, 'sky');
    this.add.tileSprite(0, 0, worldWidth, 1080, "sky")
        .setOrigin(0, 0)
        .setScale(1)
        .setDepth(0);


    // додаємо платформи на весь екран
    platforms = this.physics.add.staticGroup();

    for (var x = 0; x < worldWidth; x = x + 100) {
        //console.log(x)
        platforms
            .create(x, 1000, 'ground')
            .setOrigin(0, 0)
            .refreshBody();
    }
    //додаємо верхні платформи рандомно
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(600, 700)) {
        var y = Phaser.Math.FloatBetween(700, 93 * 10)
        platforms.create(x, y, 'platformStart');
        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 100 * i, y, 'platformOne');
        }
        platforms.create(x + 100 * i, y, 'platformFinish');
    }

    //додаємо камінці
    stone = this.physics.add.staticGroup();
    //Додаємо камінці на всю ширину екрану
    for (var x = 500; x < worldWidth; x = x + Phaser.Math.FloatBetween(300, 1600)) {
        //console.log(' x-' + x)
        stone.create(x, 1080 - 80, 'stone').setOrigin(0, 1).setScale(Phaser.Math.FloatBetween(0.5, 1)).refreshBody().setDepth(Phaser.Math.FloatBetween(1, 10));
    }
    //додаємо траву
    grass = this.physics.add.staticGroup();
    //Додаємо траву на всю ширину екрану
    for (var x = 500; x < worldWidth; x = x + Phaser.Math.FloatBetween(300, 1600)) {
        // console.log(' x-' + x)
        grass.create(x, 1080 - 80, 'grass').setOrigin(0, 1).setScale(Phaser.Math.FloatBetween(0.2, 0.9)).refreshBody().setDepth(Phaser.Math.FloatBetween(1, 10));
    }

    //додаємо дерево
    tree = this.physics.add.staticGroup();
    //Додаємо дерево на всю ширину екрану
    for (var x = 500; x < worldWidth; x = x + Phaser.Math.FloatBetween(300, 1600)) {
        //console.log(' x-' + x)
        tree
            .create(x, 1080 - 80, 'tree')
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(0.5, 1))
            .refreshBody()
            .setDepth(Phaser.Math.FloatBetween(1, 10))
    }

    //гравець
    player = this.physics.add.sprite(100, 450, 'dude');
    player
        .setBounce(0.2)
        .setCollideWorldBounds(false)
        .setDepth(5)

    player.setCollideWorldBounds(true);

//
    this.cameras.main.setBounds(0, 0, worldWidth, window.innerHeight);
    this.physics.world.setBounds(0, 0, worldWidth, window.innerHeight);
    this.cameras.main.startFollow(player);

    // анімація в ліво
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    // анімація коли гравець стоїть
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });
    // анімація в право
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();

    //зірки
    stars = this.physics.add.group({
        key: 'star',
        repeat: 30,
        setXY: { x: 12, y: 0, stepX: 110 }
    });

    //життя
    hearts = this.physics.add.group({
        key: 'hearts',
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: 550 }


    });

    //фізика для життів
    this.physics.add.collider(hearts, platforms);

    // this.physics.add.overlap(player, hearts, collectHearts, null, this);

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    // фізика для зірок
    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, this);


    // фізика для гравця
    this.physics.add.collider(player, platforms);

    // текст рахунку
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '42px', fill: '#000' });
    //текст життів
    lifeText = this.add.text(1500, 100, showLife(), { fontSize: '40px', fill: '#000' })
        .setOrigin(0, 0)
        .setScrollFactor(0)
        //Кнопка перезапуск гри
        var resetButton = this.add.text(400, 450, 'reset', { fontSize: '40px', fill: '#ccc' })
        .setInteractive()
        .setScrollFactor(0);

        resetButton.on('pointerdown', function (){
            console.log('restart')
            refreshBody()
        }
        )


    //фізика бомб
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);


    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 1000);
    this.cameras.main.startFollow(player);
}



function update() {
    // якщо натиснута стрілка вліво 
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    // якщо натиснута стрілка вправо 
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

//формування смуги життя
function showLife() {
    var lifeLine = ''

    for (var i = 0; i < life; i++) {
        lifeLine += '💕'
        //console.log(life)
    }
    return lifeLine
}

//функція торкання бомб з  гравцем
function hitBomb(player, bomb) {
    //this.physics.pause();
    bomb.disableBody(true, true);

    player.setTint(0xff0000); // замалювати гравця червоним кольором 
    life -= 1;
    lifeText.setText(showLife());

    console.log('boom')
    player.anims.play('turn');

    if (life == 0) gameOver = true;
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
    function collectHearts(player, hearts) {
        heart.disableBody(true, true);
        lives += 1
        livesText.setText('Lives: ' + lives);
    }

    function refreshBody(){
        console.log('game over')
        this.scene.restart();
    }
}