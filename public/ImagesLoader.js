function ImagesLoader() {
    this.files = [];
    this.images = {};
};

ImagesLoader.prototype.addFile = function (src) {
    this.files.push(src);
}

ImagesLoader.prototype.load = function (callback) {
    var count = this.files.length;
    var self = this;

    for (var i = 0; i < this.files.length; i++) {
        var filename = this.files[i];
        var img = new Image();
        this.images[filename] = img;
        img.onload = function () {
            count--;
            if (count == 0) {
                callback(self);
            }
        }
        img.src = filename;
    }
};
