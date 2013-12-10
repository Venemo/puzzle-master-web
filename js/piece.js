
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

    // PiecePrimitive ===========================================================================================
    
    // Constructor -----------------------------------------
    
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
    
    // Static properties ----------------------------------
    
    // Size of strokes (used in puzzle creation)
    PiecePrimitive.strokeSize = 2;
    
    // Prototype ------------------------------------------
    
    // X coordinate of the primitive (in the coordinate system of its owner piece)
    PiecePrimitive.prototype.x = 0;
    // Y coordinate of the primitive (in the coordinate system of its owner piece)
    PiecePrimitive.prototype.y = 0;
    
    // Piece ===================================================================================================

    // Constructor -----------------------------------------
    
    var Piece = function Piece (primitive, px, py, supposedPosition) {
        this.px = px;
        this.py = py;
        this.supposedPosition = supposedPosition;
        this.x = supposedPosition.x;
        this.y = supposedPosition.y;
        this.transformOrigin = { x: primitive.stroke.width / 2, y: primitive.stroke.height / 2 };
        this.grabbedTouches = [];
        this.primitives = [primitive];
        this.neighbours = [];
    };
    
    // Static properties ----------------------------------
    
    // Export PiecePrimitive into the public namespace
    Piece.PiecePrimitive = PiecePrimitive;
    
    // Prototype ------------------------------------------
    
    // X coordinate of the piece (in scene coordinates)
    Piece.prototype.x = 0;
    // Y coordinate of the piece (in scene coordinates)
    Piece.prototype.y = 0;
    // Rotation angle of the piece
    Piece.prototype.angle = 0;// = Math.PI / 6;
    // Point where the user has started to drag the piece
    Piece.prototype.dragStart = null;
    // Transform origin point of the piece (in piece coordinates)
    Piece.prototype.transformOrigin = null;
    // Array of touch point IDs grabbed by this piece
    Piece.prototype.grabbedTouches = null;
    // Game instance
    Piece.prototype.game = null;
    // Array containing the neighbours of this piece 
    Piece.prototype.neighbours = null;
    
    // Draws this piece using the given canvas context
    Piece.prototype.draw = function (ctx) {
        // Save state of the context
        ctx.save();
        
        // Transform
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
        
        // Restore state of the context
        ctx.restore();
    };
    
    // Starts a drag on this piece at the given coordinates
    Piece.prototype.startDrag = function (sx, sy) {
        this.dragStart = { x: sx - this.x, y: sy - this.y };
    };
    
    // When dragging already started, use this to perform dragging on the piece
    Piece.prototype.doDrag = function (sx, sy) {
        this.x = sx - this.dragStart.x;
        this.y = sy - this.dragStart.y;
    };
    
    // Checks if this piece can be merged with the other (NOTE: only call with neighbours)
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
    
    // Goes through all neighbours of this piece, check if they can be merged and merges them if they can
    Piece.prototype.mergeFeasibleNeighbours = function () {
        for (var i = this.neighbours.length; i--; ) {
            var neighbour = this.neighbours[i];
            if (this.checkMergeability(neighbour)) {
                this.merge(neighbour);
            }
        }
    };
    
    // Adds a neighbour to this piece and also adds this piece as neighbour to the other one
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
    
    // Removes a neighbour from this piece and also removes this piece as neighbour from the other one
    Piece.prototype.removeNeighbour = function (other) {
        var i;
        if ((i = this.neighbours.indexOf(other)) >= 0) {
            this.neighbours.splice(i, 1);
        }
        if ((i = other.neighbours.indexOf(this)) >= 0) {
            other.neighbours.splice(i, 1);
        }
    };
    
    // Merges the other piece into this piece
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
    
    // Tells if this piece contains a clickable area at a given point (in scene coordinates)
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
            if (imageData.data[3] > 0) {
                return true;
            }
        }
        return false;
        
        // TODO: skip checking image data for obvious places (like, the rectangle which surely doesn't belong to neither tabs nor blanks
    };
    
    // Performs a coordinate transformation from the coordinate system of the piece to scene coordinates
    Piece.prototype.mapToScene = function(p0) {
        // NOTE: this is NOT a linear transformation because the two coordinate systems are not only rotated
        //       but their origo is also in a different place.
    
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
    
    // Performs a coordinate transformation from scene coordinates to the coordinate system of this piece
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
    
    // Performs a coordinate transformation from the coordinate system of this piece to the coordinate system of the other piece
    Piece.prototype.mapToOther = function (other, p) {
        // Map the coordinates to the scene and then from there to the other piece
        return other.mapFromScene(this.mapToScene(p));
    };
    
    // Expose the Piece contructor
    return Piece;
    
})();

