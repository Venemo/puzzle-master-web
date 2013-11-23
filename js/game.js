
PM = typeof(PM) === "undefined" ? {} : PM;

PM.Game = (function () {

    var createPieces = function (image, rows, cols) {
        if (rows < 1 || cols < 1) {
            throw new Error("Invalid parameters");
        }
        
        var ww = Math.round(document.documentElement.clientWidth);
        var hh = Math.round(document.documentElement.clientWidth / image.width * image.height);
    
        var w = Math.round(ww / cols);
        var h = Math.round(hh / rows);
        console.log(ww, hh, w, h);
        var pieces = [];
        
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                pieces.push(drawPiece(image, i, j, w, h, rows, cols));
                //break;
            } //break;
        }
        
        return pieces;
    };
    
    var drawPiece = function (image, px, py, w, h, rows, cols) {
        var canvas = document.createElement("canvas");
        var m = Math.min(Math.round(w / 6), Math.round(h / 6));
        var ctx = canvas.getContext("2d");
        canvas.width = w;// + 2 * m;
        canvas.height = h;// + 2 * m;
        //ctx.
        
        console.log(image.width / cols * px, image.width / rows * py, image.width / cols, image.width / rows, 0, 0, w, h);
        ctx.drawImage(image, image.width / cols * px, image.height / rows * py, image.width / cols, image.height / rows, 0, 0, w, h);
        //ctx.drawImage(image, 0, 0, w, h);
        
        return new PM.Piece(canvas, px, py);
    };
    
    var Game = function Game (image, rows, cols, animateCallback) {
        var that = this;
        this.bigImage = image;
        this.rows = rows;
        this.cols = cols;
        this.pieces = createPieces(image, rows, cols);

        var v = [];
        var maxt = 400;
        for (var i = 0; i < this.pieces.length; i++) {
            var endx = Math.round(Math.random() * (document.documentElement.clientWidth - 100) + 50);
            var endy = Math.round(Math.random() * (document.documentElement.clientHeight - 100) + 50);
            var vx = (endx - this.pieces[i].x) / maxt;
            var vy = (endy - this.pieces[i].y) / maxt;
            var om = Math.round(Math.random() * Math.PI * 2) / maxt;
            v.push({ vx: vx, vy: vy, om: om });
        }
        
        setTimeout(function() {
            var t = 0;
            var step = 20;
            function anim () {
                console.log(t);
                if (t < maxt) {
                    setTimeout(function() {
                        for (var i = 0; i < that.pieces.length; i++) {
                            that.pieces[i].x += v[i].vx * step;
                            that.pieces[i].y += v[i].vy * step;
                            //that.pieces[i].angle += v[i].om * step;
                        }
                        animateCallback();
                        anim();
                        
                        t += step;
                    }, step);
                }
            };
            anim();
        }, 800);
    };
    
    Game.prototype.findPiece = function (x, y) {
        //console.log(JSON.stringify(this.pieces));
        for (var i = 0; i < this.pieces.length; i++) {
            var piece = this.pieces[i];
            //console.log(JSON.stringify(piece));
            if (piece.containsPoint(x, y)) {
                return piece;
            }
        }
        return null;
    };
    
    Game.prototype.draw = function (ctx) {
        ctx.clearRect(0, 0, screen.width, screen.height);
        
        for (var i = 0; i < this.pieces.length; i++) {
            this.pieces[i].draw(ctx);
        }
    };
    
    Game.prototype.reactToTouchStart = function (touches) {
        for (var i = 0; i < touches.length; i++) {
            var grabbers = this.pieces.filter(function(p) { return p.grabbedTouches.some(function(id) { id === touches[i].identifier }); });
            //console.log("touch start");
            if (grabbers.length === 0) {
                //console.log("touch start", "finding piece for", touches[i].identifier);
                //console.log(JSON.stringify(this.pieces));
                var piece = this.findPiece(touches[i].clientX, touches[i].clientY);
                //console.log("touch start", "piece found is", piece);
                if (piece) {
                    console.log("touch start", "piece found", piece.px, piece.py);
                    piece.grabbedTouches.push(touches[i].identifier);
                    piece.startDrag(touches[i].clientX, touches[i].clientY);
                    
                    // Raise piece to top
                    var index = this.pieces.indexOf(piece);
                    //console.log(index);
                    this.pieces.splice(index, 1);
                    this.pieces.push(piece);
                    //console.log("touch start done");
                }
            }
        }
    };
    
    Game.prototype.reactToTouchEnd = function (touches) {
        for (var i = 0; i < this.pieces.length; i++) {
            this.pieces[i].grabbedTouches = [];
        }
//        for (var i = 0; i < touches.length; i++) {
//            var grabbers = this.pieces.filter(function(p) { return p.grabbedTouches.some(function(id) { return id === touches[i].identifier }); });
//            if (grabbers.length > 0) {
//                var piece = grabbers[0];
//                piece.grabbedTouches = [];
//                //var index = piece.grabbedTouches.indexOf(touches[i].identifier);
//                //piece.grabbedTouches.splice(index, 1);
//                console.log("touch end done");
//            }
//        }
    };
    
    Game.prototype.reactToTouchMove = function (touches) {
        for (var i = 0; i < touches.length; i++) {
            var grabbers = this.pieces.filter(function(p) {
                return p.grabbedTouches.some(function(id) { return id === touches[i].identifier; });
            });
            if (grabbers.length) {
                grabbers[0].doDrag(touches[i].clientX, touches[i].clientY);
            }
        }
    };
    
    return Game;
    
})();
