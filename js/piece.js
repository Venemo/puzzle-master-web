
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

PM = typeof(PM) === "undefined" ? {} : PM;

PM.Piece = (function () {

    var PiecePrimitive = function PiecePrimitive (stroke, image, x, y) {
        this.stroke = stroke;
        this.image = image;
        
        if (x) {
            this.x = x;
        }
        if (y) {
            this.y = y;
        }
    };
    
    PiecePrimitive.prototype.strokeSize = 2;
    PiecePrimitive.prototype.x = 0;
    PiecePrimitive.prototype.y = 0;

    var Piece = function Piece (primitive, px, py, supposedPosition) {
        this.px = px;
        this.py = py;
        this.supposedPosition = supposedPosition;
        this.x = this.supposedPosition.x;
        this.y = this.supposedPosition.y;
        this.transformOrigin = { x: primitive.stroke.width / 2, y: primitive.stroke.height / 2 };
        this.grabbedTouches = [];
        this.primitives = [primitive];
        this.neighbours = [];
    };
    
    Piece.PiecePrimitive = PiecePrimitive;
    
    Piece.prototype.x = 0;
    Piece.prototype.y = 0;
    Piece.prototype.angle = 0;// = Math.PI / 6;
    Piece.prototype.dragStart = null;
    Piece.prototype.transformOrigin = null;
    Piece.prototype.grabbedTouches = null;
    Piece.prototype.game = null;
    Piece.prototype.neighbours = null;
        
    Piece.prototype.draw = function (ctx) {
        ctx.save();
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw strokes
        for (var i = this.primitives.length; i--; ) {
            ctx.drawImage(this.primitives[i].stroke, this.primitives[i].x, this.primitives[i].y);
        }
        // Draw images
        for (var i = this.primitives.length; i--; ) {
            ctx.drawImage(this.primitives[i].image, this.primitives[i].x, this.primitives[i].y);
        }
        
        ctx.restore();
    };
        
    Piece.prototype.startDrag = function (sx, sy) {
        this.dragStart = { x: sx - this.x, y: sy - this.y };
    };
    
    Piece.prototype.doDrag = function (sx, sy) {
        this.x = sx - this.dragStart.x;
        this.y = sy - this.dragStart.y;
    };
    
    Piece.prototype.checkMergeability = function (other) {
        // Check difference between angles
        var angleDiff = Math.abs(other.angle - this.angle);
        if (angleDiff > Math.PI / 10) {
            return false;
        }
    
        // Check difference between positions
        var supposedDiff = { x: this.supposedPosition.x - other.supposedPosition.x, y: this.supposedPosition.y - other.supposedPosition.y };
        var actualDiff = this.mapToOther(other, { x: 0, y: 0 });
        var xd = supposedDiff.x - actualDiff.x, yd = supposedDiff.y - actualDiff.y;
        var distance = Math.sqrt(xd * xd + yd * yd);
        return distance < 20;
    };
    
    Piece.prototype.mergeFeasibleNeighbours = function () {
        for (var i = this.neighbours.length; i--; ) {
            var neighbour = this.neighbours[i];
            if (this.checkMergeability(neighbour)) {
                this.merge(neighbour);
            }
        }
    };
    
    Piece.prototype.addNeighbour = function (other) {
        if (other === this) {
            return;
        }
        
        if (this.neighbours.indexOf(other) < 0) {
            this.neighbours.push(other);
        }
        if (other.neighbours.indexOf(this) < 0) {
            other.neighbours.push(this);
        }
    };
    
    Piece.prototype.removeNeighbour = function (other) {
        var i;
        if ((i = this.neighbours.indexOf(other)) >= 0) {
            this.neighbours.splice(i, 1);
        }
        if ((i = other.neighbours.indexOf(this)) >= 0) {
            other.neighbours.splice(i, 1);
        }
    };
    
    Piece.prototype.merge = function (other) {
        // Supposed difference between pieces (used to correct positioning of primitives)
        var supposedDiff = { x: this.supposedPosition.x - other.supposedPosition.x, y: this.supposedPosition.y - other.supposedPosition.y };
        
        // Add primitives of the other piece to this piece
        for (var i = other.primitives.length; i--; ) {
            var primitive = other.primitives[i];
            primitive.x -= supposedDiff.x;
            primitive.y -= supposedDiff.y;
            this.primitives.push(primitive);
        }
        
        // Remove neighbours from the other piece and add them to this piece
        for (var i = other.neighbours.length; i--; ) {
            var neighbour = other.neighbours[i];
            other.removeNeighbour(neighbour);
            this.addNeighbour(neighbour);
        }
        
        // Reset primitives and grabbed touch points of the other piece
        other.primitives.length = 0;
        other.grabbedTouches.length = 0;
    };
    
    Piece.prototype.containsPoint = function (sx, sy) {
        // Transform coordinates to the coordinate system of the piece
        var pt = this.mapFromScene({ x: sx, y: sy });
        
        for (var i = this.primitives.length; i--; ) {
            var primitive = this.primitives[i];
            var p = { x: pt.x - primitive.x, y: pt.y - primitive.y };
            
            // Rule out cases when the user clicked outsite the image
            if (p.x < 0 || p.x > primitive.stroke.width || p.y < 0 || p.y > primitive.stroke.height) {
                continue;
            }
            
            // Check canvas image data
            var ctx = primitive.stroke.getContext('2d');
            var imageData = ctx.getImageData(p.x, p.y, 1, 1);
            return imageData.data[3] > 0;
        }
        
        // TODO: skip checking image data for obvious places (like, the rectangle which surely doesn't belong to neither tabs nor blanks
    };
        
    Piece.prototype.mapToScene = function(p0) {
        var p = {
            x: p0.x - this.transformOrigin.x,
            y: p0.y - this.transformOrigin.y
        };
        var r = {
            x: p.x * Math.cos(-this.angle) + p.y * Math.sin(-this.angle),
            y: (-p.x) * Math.sin(-this.angle) + p.y * Math.cos(-this.angle)
        };
        
        return {
            x: this.x + r.x + this.transformOrigin.x,
            y: this.y + r.y + this.transformOrigin.y
        };
    };
    
    Piece.prototype.mapToOther = function (other, p) {
        return other.mapFromScene(this.mapToScene(p));
    };
    
    Piece.prototype.mapFromScene = function(p0) {
        var to_s = this.mapToScene(this.transformOrigin);
        var p = {
            x: p0.x - to_s.x,
            y: p0.y - to_s.y
        };
        var r = {
            x: p.x * Math.cos(this.angle) + p.y * Math.sin(this.angle),
            y: (-p.x) * Math.sin(this.angle) + p.y * Math.cos(this.angle)
        };
        
        return {
            x: r.x + this.transformOrigin.x,
            y: r.y + this.transformOrigin.y
        };
    };
    
    return Piece;
    
})();

