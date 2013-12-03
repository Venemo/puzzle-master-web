
PM = typeof(PM) === "undefined" ? {} : PM;

PM.Game = (function () {

    var createPieces = function (image, game, rows, cols) {
        if (rows < 1 || cols < 1) {
            throw new Error("Invalid parameters");
        }
        
        var pieces = [];
        var ww = Math.floor(document.documentElement.clientWidth);
        var hh = Math.floor(document.documentElement.clientWidth / image.width * image.height);
        var w = Math.floor(ww / cols);
        var h = Math.floor(hh / rows);
        
        console.log(image.width, image.height, ww, hh, w, h);
        
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                pieces.push(drawPiece(image, game, i, j, w, h, rows, cols));
                //break;
            } //break;
        }
        
        return pieces;
    };
    
    var drawPiece = function (image, game, px, py, w, h, rows, cols) {
        var tabStatus = game.tabs[px][py];
        var canvas = document.createElement("canvas");
        
        canvas.width = w;
        canvas.height = h;
        
        var sx = Math.floor(image.width / cols * px);
        var sy = Math.floor(image.height / rows * py);
        var sw = Math.floor(image.width / cols);
        var sh = Math.floor(image.height / rows);
        
        var m = Math.min(Math.round(w / 5), Math.round(h / 5));
        var sm = Math.min(Math.round(image.width / cols / 5), Math.round(image.height / rows / 5));
        
        var xPosCorr = 0;
        var yPosCorr = 0;
        
        if (tabStatus & PM.TAB_TOP_TAB) {
            sy -= sm;
            sh += sm;
            canvas.height += m;
            yPosCorr -= m;
        }
        if (tabStatus & PM.TAB_BOTTOM_TAB) {
            sh += sm;
            canvas.height += m;
        }
        if (tabStatus & PM.TAB_LEFT_TAB) {
            sx -= sm;
            sw += sm;
            canvas.width += m;
            xPosCorr -= m;
        }
        if (tabStatus & PM.TAB_RIGHT_TAB) {
            sw += sm;
            canvas.width += m;
        }
        
        var ctx = canvas.getContext("2d");
        
        console.log(px, py,
                    (tabStatus & PM.TAB_TOP_TAB ?    "top tab" : (tabStatus & PM.TAB_TOP_BLANK ?       "top blank" :    "top straight")),
                    (tabStatus & PM.TAB_RIGHT_TAB ?  "right tab" : (tabStatus & PM.TAB_RIGHT_BLANK ?   "right blank" :  "right straight")),
                    (tabStatus & PM.TAB_BOTTOM_TAB ? "bottom tab" : (tabStatus & PM.TAB_BOTTOM_BLANK ? "bottom blank" : "bottom straight")),
                    (tabStatus & PM.TAB_LEFT_TAB ?   "left tab" : (tabStatus & PM.TAB_LEFT_BLANK ?     "left blank" :   "left straight")));
        
        
        var l = (tabStatus & PM.TAB_LEFT_TAB) ? m : 0;
        var t = (tabStatus & PM.TAB_TOP_TAB) ? m : 0;
        var r = m * 3 / 5;
        var b = r * Math.sin(Math.acos((m - r) / r));
        var magic = ((m - r) / Math.sqrt(m * (2 * r - m))) * (m) + b; // Spent a whole evening on this one
        
        ctx.beginPath();
        ctx.moveTo(l, t);
            
        // top-left to top-right
        if (tabStatus & PM.TAB_TOP_TAB) {
            var y1 = t - m;
            var x1 = l + w / 2 + magic;
            var y2 = y1;
            var x2 = t + h / 2;
            
            ctx.lineTo(l + w / 2 - b, t);
            ctx.arcTo(2 * l + w - x1, y1, x2, y2, r);
            ctx.arcTo(x1, y1, l + w / 2 + b, t, r);
        }
        else if (tabStatus & PM.TAB_TOP_BLANK) {
            var y1 = t + m;
            var x1 = l + w / 2 + magic;
            var y2 = y1;
            var x2 = t + h / 2;
            
            ctx.lineTo(l + w / 2 - b, t);
            ctx.arcTo(2 * l + w - x1, y1, x2, y2, r);
            ctx.arcTo(x1, y1, l + w / 2 + b, t, r);
        }
        ctx.lineTo(l + w, t);
        
        // top-right to bottom-right
        if (tabStatus & PM.TAB_RIGHT_TAB) {
            var x1 = l + w + m;
            var y1 = t + h / 2 + magic;
            var x2 = x1;
            var y2 = t + h / 2;
            //console.log("m=" + String(m), "w=" + String(w), "h=" + String(h), "t=" + String(t), "l=" + String(l), "x1=" + String(x1), "y1=" + String(y1), "x2=" + String(x2), "y2=" + String(y2), "r=" + String(r));
            
            ctx.lineTo(l + w, t + h / 2 - b);
            ctx.arcTo(x1, 2 * t + h - y1, x2, y2, r);
            //ctx.lineTo(x2, y2); // uncomment when debugging the arcs
            ctx.arcTo(x1, y1, l + w, t + h / 2 + b, r);
            //ctx.lineTo(l + w, t + h / 2 + b); // uncomment when debugging the arcs
            
        }
        else if (tabStatus & PM.TAB_RIGHT_BLANK) {
            var x1 = l + w - m;
            var y1 = t + h / 2 + magic;
            var x2 = x1;
            var y2 = t + h / 2;
            
            ctx.lineTo(l + w, t + h / 2 - b);
            ctx.arcTo(x1, 2 * t + h - y1, x2, y2, r);
            ctx.arcTo(x1, y1, l + w, t + h / 2 + b, r);
        }
        ctx.lineTo(l + w, t + h);
        
        // bottom-right to bottom-left
        if (tabStatus & PM.TAB_BOTTOM_TAB) {
            var y1 = t + h + m;
            var x1 = l + w / 2 + magic;
            var y2 = y1;
            var x2 = t + h / 2;
            
            ctx.lineTo(l + w / 2 + b, t + h);
            ctx.arcTo(x1, y1, x2, y2, r);
            ctx.arcTo(2 * l + w - x1, y1, l + w / 2 - b, t + h, r);
        }
        else if (tabStatus & PM.TAB_BOTTOM_BLANK) {
            var y1 = t + h - m;
            var x1 = l + w / 2 + magic;
            var y2 = y1;
            var x2 = t + h / 2;
            
            ctx.lineTo(l + w / 2 + b, t + h);
            ctx.arcTo(x1, y1, x2, y2, r);
            ctx.arcTo(2 * l + w - x1, y1, l + w / 2 - b, t + h, r);
        }
        ctx.lineTo(l, t + h);
        
        // bottom-left to top-left
        if (tabStatus & PM.TAB_LEFT_TAB) {
            var x1 = l - m;
            var y1 = t + h / 2 + magic;
            var x2 = x1;
            var y2 = t + h / 2;
            
            ctx.lineTo(l, t + h / 2 + b);
            ctx.arcTo(x1, y1, x2, y2, r);
            ctx.arcTo(x1, 2 * t + h - y1, l, t + h / 2 - b, r);
        }
        else if (tabStatus & PM.TAB_LEFT_BLANK) {
            var x1 = l + m;
            var y1 = t + h / 2 + magic;
            var x2 = x1;
            var y2 = t + h / 2;
            
            ctx.lineTo(l, t + h / 2 + b);
            ctx.arcTo(x1, y1, x2, y2, r);
            ctx.arcTo(x1, 2 * t + h - y1, l, t + h / 2 - b, r);
        }
        ctx.lineTo(l, t);
        
        ctx.clip();
        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        
        return new PM.Piece(canvas, px, py, { x: w * px + xPosCorr, y: h * py + yPosCorr });
    };
    
    var Game = function Game (image, rows, cols, redraw, onAnimStarting, onAnimEnded) {
        var that = this;
        this.bigImage = image;
        this.rows = rows;
        this.cols = cols;
        this.redraw = redraw;
        this.onAnimStarting = onAnimStarting;
        this.onAnimEnded = onAnimEnded;
        
        this.tabs = PM.randomizeTabs(rows, cols);
        this.pieces = createPieces(image, this, rows, cols);

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
        
//        setTimeout(function() {
//            that.onAnimStarting();
//            var t = 0;
//            var step = 20;
//            function anim () {
//                console.log(t);
//                if (t < maxt) {
//                    setTimeout(function() {
//                        for (var i = 0; i < that.pieces.length; i++) {
//                            that.pieces[i].x += v[i].vx * step;
//                            that.pieces[i].y += v[i].vy * step;
//                            //that.pieces[i].angle += v[i].om * step;
//                        }
//                        that.redraw();
//                        anim();
//                        
//                        t += step;
//                    }, step);
//                }
//                else {
//                    that.onAnimEnded();
//                }
//            };
//            anim();
//        }, 800);
    };
    
    Game.prototype.findPiece = function (x, y) {
        //console.log(JSON.stringify(this.pieces));
        for (var i = this.pieces.length; i --; ) {
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
        this.redraw();
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
        this.redraw();
    };
    
    Game.prototype.reactToTouchMove = function (touches) {
        var shouldRedraw = false;
        for (var i = 0; i < touches.length; i++) {
            var grabbers = this.pieces.filter(function(p) {
                return p.grabbedTouches.some(function(id) { return id === touches[i].identifier; });
            });
            if (grabbers.length) {
                grabbers[0].doDrag(touches[i].clientX, touches[i].clientY);
                shouldRedraw = true;
            }
        }
        if (shouldRedraw) {
            this.redraw();
        }
    };
    
    return Game;
    
})();
