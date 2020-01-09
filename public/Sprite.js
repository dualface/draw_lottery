function Sprite(image, sx, sy, sw, sh) {
    this.image = image;
    this.sx = sx;
    this.sy = sy;
    this.sw = sw;
    this.sh = sh;

    console.log("[SPRITE] new " + image.src, sx, sy, sw, sh);
};

Sprite.prototype.draw = function (gl, x, y, viewScale) {
    gl.drawImage(this.image,
        this.sx, this.sy, this.sw, this.sh,
        // x, y
        x * viewScale, y * viewScale,
        // draw width, draw height
        this.sw * viewScale, this.sh * viewScale);
};
