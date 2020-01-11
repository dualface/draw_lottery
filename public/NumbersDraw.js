function NumbersDraw(id, length, maxNumber, numberSprites, spriteWidth, spriteHeight, padding) {
    this.id = id.toString();
    this.length = length;
    this.maxNumber = maxNumber;
    this.numberSprites = numberSprites;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.padding = padding;
    this.clipWidth = spriteWidth * length + padding * (length - 1);
    this.clipHeight = spriteHeight;
    this.minSpeed = 30;

    this.numbers = [];
    this.matchesCount = 0;

    this.columns = [];
    this.state = "idle";

    for (var i = 0; i < length; i++) {
        this.numbers[i] = 0;
        this.columns[i] = { y: 0, number: 0 };
    }
};

NumbersDraw.prototype.isStopped = function () {
    return this.state === "idle";
};

NumbersDraw.prototype.initNumbers = function () {
    for (var c = 0; c < this.length; c++) {
        var rows = [];
        this.columns[c] = {
            speed: 0,
            maxSpeed: 0,
            rows: rows
        };
        for (var r = 0; r < 3; r++) {
            rows[r] = {
                y: (r - 1) * this.spriteHeight,
                number: r - 1 < 0 ? 10 + r - 1 : r - 1
            };
        }
    }

    this.state = "idle";
};

NumbersDraw.prototype.genNewNumber = function () {
    var n = (Math.round(Math.random() * this.maxNumber) + 1).toString();
    for (var l = n.length; l < this.length; l++) {
        n = "0" + n;
    }
    for (i = 0; i < this.length; i++) {
        this.numbers[i] = n.charCodeAt(i) - 48;
    }
    this.matchesCount = 0;
    console.log("[NUMBERS DRAW " + this.id + "] gen number " + n, this.numbers);
    return n;
};

NumbersDraw.prototype.draw = function (gl, x, y, viewScale) {
    gl.beginPath();
    gl.rect(x * viewScale, y * viewScale, this.clipWidth * viewScale, this.clipHeight * viewScale);
    gl.clip();

    // draw all columns
    for (var c = 0; c < this.length; c++) {
        var column = this.columns[c];
        var rows = column.rows;
        for (var r = 0; r < rows.length; r++) {
            var nx = c * (this.spriteWidth + this.padding) + x;
            var ny = rows[r].y + y;
            var spr = this.numberSprites[rows[r].number];
            spr.draw(gl, nx, ny, viewScale);
        }
    }
};

NumbersDraw.prototype.startRunning = function () {
    if (this.state !== "idle") return;
    this.state = "running";

    for (i = 0; i < this.length; i++) {
        this.columns[i].maxSpeed = Math.round(Math.random() * 30) + 20;
    }

    console.log("[NUMBERS DRAW " + this.id + "] start running");
};

NumbersDraw.prototype.stopRunning = function () {
    if (this.state !== "running") return;
    this.state = "stopping";

    console.log("[NUMBERS DRAW " + this.id + "] stop running");
};

NumbersDraw.prototype.update = function () {
    var spriteHeight = this.spriteHeight;

    for (var c = 0; c < this.length; c++) {
        var column = this.columns[c];

        // update scroll speed
        var speed = column.speed;
        if (this.state === "running") {
            if (speed < column.maxSpeed) {
                speed += column.maxSpeed * 0.05;
                if (speed > column.maxSpeed) speed = column.maxSpeed;
                column.speed = speed;
            }
        } else if (this.state === "stopping") {
            if (speed > this.minSpeed) {
                speed -= speed * 0.05;
                if (speed < this.minSpeed) speed = this.minSpeed;
                column.speed = speed;
            }
        }

        // check scroll on next row
        var rows = column.rows;
        var checkMatch = false;
        var offset = false;
        var r;
        for (r = 0; r < rows.length; r++) {
            rows[r].y += speed;
            if (r === 1 && rows[r].y > spriteHeight / 2) {
                offset = true;
            }
            if (r === 2 && rows[r].y > spriteHeight) {
                checkMatch = true;
            }
        }

        if (offset) {
            for (r = 0; r < rows.length; r++) {
                rows[r].y -= spriteHeight;
                rows[r].number--;
                if (rows[r].number < 0) {
                    rows[r].number = 9;
                }
            }
        }

        // check matched number
        if (checkMatch && this.state === "stopping" && rows[1].number === this.numbers[c]) {
            column.speed = 0;
            for (r = 0; r < rows.length; r++) {
                rows[r].y = Math.round(rows[r].y / spriteHeight) * spriteHeight;
            }

            this.matchesCount++;
            if (this.matchesCount == this.length) {
                this.state = "idle";
            }
        }
    }
};
