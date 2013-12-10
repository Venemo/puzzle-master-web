
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

PM = typeof(PM) === "undefined" ? {} : PM;

PM.Game = (function () {
    
    var Game = function Game (image, rows, cols, renderLoop) {
        this.bigImage = image;
        this.rows = rows;
        this.cols = cols;
        this.renderLoop = renderLoop;
        this.pieces = PM.creation.createPieces(image, this, rows, cols);
        
        var that = this;
        
        setTimeout(function() { that.shuffle(600); }, 500);
        setTimeout(function() { that.shuffle(600); }, 1200);
        setTimeout(function() { that.isInteractive = true; }, 1900);
    };
    
    Game.prototype.isInteractive = false;
    Game.prototype.isWon = false;
    
    Game.prototype.shuffle = function (duration) {
        for (var i = 0; i < this.pieces.length; i++) {
            var endx = Math.round(Math.random() * (document.documentElement.clientWidth - 100) + 50);
            var endy = Math.round(Math.random() * (document.documentElement.clientHeight - 100) + 50);
            
            var animX = this.renderLoop.createNumberAnimation(duration, this.pieces[i], "x", endx);
            var animY = this.renderLoop.createNumberAnimation(duration, this.pieces[i], "y", endy);
            animX.start();
            animY.start();
        }
        this.renderLoop.markDirty();
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
        if (!this.isInteractive) {
            return;
        }
    
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
        this.renderLoop.markDirty();
    };
    
    Game.prototype.reactToTouchEnd = function (touches) {
        if (!this.isInteractive) {
            return;
        }
        
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
        this.renderLoop.markDirty();
    };
    
    Game.prototype.reactToTouchMove = function (touches) {
        if (!this.isInteractive) {
            return;
        }
        
        var shouldRedraw = false;
        for (var i = 0; i < touches.length; i++) {
            //console.log("reaction to touch", i, "of", touches.length, touches[i].identifier);
            
            var grabbers = this.pieces.filter(function(p) {
                return p.grabbedTouches.some(function(id) { return id === touches[i].identifier; });
            });
            if (grabbers.length) {
                grabbers[0].doDrag(touches[i].clientX, touches[i].clientY);
                //console.log("calling mergeFeasibleNeighbours on", grabbers[0].px, grabbers[0].py);
                grabbers[0].mergeFeasibleNeighbours();
                shouldRedraw = true;
            }
        }
        if (shouldRedraw) {
            this.renderLoop.markDirty();
        }
    };
    
    Game.prototype.winNow = function () {
        // Set flags
        this.isWon = true;
        this.isInteractive = false;
        
        // Animate the piece to its supposed position
        var duration = 900;
        var animX = this.renderLoop.createNumberAnimation(duration, this.pieces[0], "x", this.pieces[0].supposedPosition.x);
        var animY = this.renderLoop.createNumberAnimation(duration, this.pieces[0], "y", this.pieces[0].supposedPosition.y);
        animX.start();
        animY.start();
        console.log(this.pieces[0].x, this.pieces[0].y, this.pieces[0].supposedPosition.x, this.pieces[0].supposedPosition.y);
        
        this.renderLoop.markDirty();
    };
    
    return Game;
    
})();
