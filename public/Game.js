function Game(canvasId, options) {
    // setup canvas
    this.canvas = document.getElementById(canvasId);
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    this.gl = canvas.getContext("2d");
    this.gl.imageSmoothingEnabled = true;
    this.gl.imageSmoothingQuality = "high";

    this.viewWidth = options.VIEW_WIDTH;
    this.viewScale = 1;
    this.numberSpriteWidth = options.NUMBER_SPRITE_WIDTH;
    this.numberSpriteHeight = options.NUMBER_SPRITE_HEIGHT;
    this.numbersLength = options.NUMBERS_LENGTH;
    this.numbersDrawCount = options.NUMBERS_DRAW_COUNT;
    this.numbersDrawPosition = options.NUMBERS_DRAW_POSITION;
    this.maxNumber = options.MAX_NUMBER;

    this.numberSprites = [];
    this.backgroundSprites = [];

    this.numbersDrawInstances = [];
    for (var i = 0; i < this.numbersDrawCount; i++) {
        this.numbersDrawInstances[i] = new NumbersDraw(i, this.numbersLength, this.maxNumber,
            this.numberSprites,
            this.numberSpriteWidth, this.numberSpriteHeight, options.NUMBER_SPRITE_PADDING);
    }

    this.storage = window.localStorage;
    this.existsNumbers = [];
    this.currentBackground = 0;
    this.state = "idle";

    // setup window events
    var self = this;
    window.onresize = function () {
        self.onResize();
    };
    window.onkeyup = function (evt) {
        self.onKeyPress(evt);
    };
};

Game.prototype.start = function () {
    // load images
    var loader = new ImagesLoader();
    loader.addFile("numbers.png");
    for (var i = 0; i < 4; i++) {
        loader.addFile("bg" + i.toString() + ".jpg");
    }

    var self = this;
    loader.load(function (loader) {
        self.onLoadComplete(loader);
    });
};

Game.prototype.onLoadComplete = function (loader) {
    // create sprites
    for (var i = 0; i < 10; i++) {
        var sx = i * this.numberSpriteWidth;
        this.numberSprites[i] = new Sprite(loader.images["numbers.png"],
            sx, 0,
            this.numberSpriteWidth, this.numberSpriteHeight);
    }

    for (var i = 0; i < 4; i++) {
        var filename = "bg" + i.toString() + ".jpg";
        var image = loader.images[filename];
        this.backgroundSprites[i] = new Sprite(image, 0, 0, image.width, image.height);
    }

    // load exists numbers
    var numbers = this.storage.getItem("numbers");
    try {
        numbers = JSON.parse(numbers);
    } catch (e) {
    }
    if (!Array.isArray(numbers)) {
        this.storage.setItem("numbers", this.existsNumbers);
    } else {
        this.existsNumbers = numbers;
    }

    this.onResize();
    this.initNumbers();
    this.mainLoop();
};

Game.prototype.initNumbers = function () {
    for (var i = 0; i < this.numbersDrawCount; i++) {
        this.numbersDrawInstances[i].initNumbers();
    }
};

Game.prototype.startRunning = function () {
    this.state = "running";
    for (var i = 0; i < this.numbersDrawCount; i++) {
        var instance = this.numbersDrawInstances[i];
        var newNumber;
        var found = false;
        do {
            newNumber = instance.genNewNumber();
            for (var j = 0; j < this.existsNumbers.length; j++) {
                if (this.existsNumbers[j] === newNumber) {
                    found = true;
                    break;
                }
            }
        } while (found);

        // save new number
        this.addNumber(newNumber);

        instance.startRunning();
    }
};

Game.prototype.stopRunning = function () {
    this.state = "stopping";
    for (var i = 0; i < this.numbersDrawCount; i++) {
        this.numbersDrawInstances[i].stopRunning();
    }
};

Game.prototype.onResize = function () {
    // change size of canvas on window resized
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.viewScale = this.canvasWidth / this.viewWidth;
};

Game.prototype.addNumber = function (number) {
    this.existsNumbers.push(number);
    this.storage.setItem("numbers", JSON.stringify(this.existsNumbers));
};

Game.prototype.onKeyPress = function (evt) {
    if (evt.code === "Space") {
        if (this.state === "idle" && this.currentBackground > 0) {
            this.startRunning();
        } else if (this.state === "running") {
            this.stopRunning();
        }
    } else if (evt.code === "KeyC") {
        if (window.confirm("清空本地数据?")) {
            this.storage.clear();
            this.existsNumbers.length = 0;
        }
    } else if (evt.code === "KeyR") {
        this.initNumbers();
        this.addNumber("----- RESET -----");
    } else if (evt.code === "Digit0") {
        this.currentBackground = 0;
        this.initNumbers();
        this.addNumber("----- WELCOME -----");
    } else if (evt.code === "Digit1") {
        this.currentBackground = 1;
        this.initNumbers();
        this.addNumber("----- LEVEL 1 -----");
    } else if (evt.code === "Digit2") {
        this.currentBackground = 2;
        this.initNumbers();
        this.addNumber("----- LEVEL 2 -----");
    } else if (evt.code === "Digit3") {
        this.currentBackground = 3;
        this.initNumbers();
        this.addNumber("----- LEVEL 3 -----");
    } else if (evt.code === "KeyP") {
        console.log(this.existsNumbers);
        var s = wordWrap(JSON.stringify(this.existsNumbers), 80);
        window.alert(s);
    }
};

Game.prototype.update = function () {
    if (this.state === "running" || this.state === "stopping") {
        var stopped = true;
        for (var i = 0; i < this.numbersDrawCount; i++) {
            var instance = this.numbersDrawInstances[i];
            instance.update();
            stopped = stopped & instance.isStopped();
        }

        if (stopped) {
            this.state = "idle";
        }
    }
};

Game.prototype.draw = function () {
    var gl = this.gl;
    var viewScale = this.viewScale;

    gl.save();
    gl.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    var backgroundSprite = this.backgroundSprites[this.currentBackground];
    backgroundSprite.draw(gl, 0, 0, viewScale);

    if (this.currentBackground > 0) {
        for (var i = 0; i < this.numbersDrawCount; i++) {
            gl.save();
            var pos = this.numbersDrawPosition[i];
            this.numbersDrawInstances[i].draw(gl, pos.x, pos.y, viewScale);
            gl.restore();
        }
    }

    gl.restore();
};

Game.prototype.mainLoop = function () {
    var self = this;
    requestAnimationFrame(function () {
        self.mainLoop();
    });

    this.update();
    this.draw();
};
