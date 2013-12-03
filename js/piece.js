
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

    var Piece = function Piece (image, px, py, supposedPosition) {
        this.image = image;
        this.px = px;
        this.py = py;
        
        this.supposedPosition = supposedPosition;
        this.x = this.supposedPosition.x;
        this.y = this.supposedPosition.y;
        this.transformOrigin = { x: image.width / 2, y: image.height / 2 };
        this.grabbedTouches = [];
    };
    
    Piece.prototype.x = 0;
    Piece.prototype.y = 0;
    Piece.prototype.angle = 0;// = Math.PI / 6;
    Piece.prototype.dragStart = null;
    Piece.prototype.transformOrigin = null;
    Piece.prototype.grabbedTouches = null;
        
    Piece.prototype.draw = function (ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, 0, 0);
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
        // TODO
    };
    
    Piece.prototype.containsPoint = function (sx, sy) {
        // Transform coordinates to the coordinate system of the piece
        var p = this.mapFromScene({ x: sx, y: sy });
        
        // Rule out cases when the user clicked outsite the image
        if (p.x < 0 || p.x > this.image.width || p.y < 0 || p.y > this.image.height) {
            return false;
        }
        
        // Check canvas image data
        var ctx = this.image.getContext('2d');
        var imageData = ctx.getImageData(p.x, p.y, 1, 1);
        return imageData.data[3] > 0;
        
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

