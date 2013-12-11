
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

PM = typeof(PM) === "undefined" ? {} : PM;

// Constants for operating with tabs and blanks
// NOTES: - every piece has a tabStatus and it's a bitwise OR of these constants
//        - if a piece has nor _TAB nor _BLANK for a side, it means that it's straight-edged on that side
//        - assigning _TAB and _BLANK to the same side results in undefined behaviour
(function (PM) {
    PM.TAB_BOTTOM_TAB =     1<<0;
    PM.TAB_BOTTOM_BLANK =   1<<1;
    PM.TAB_TOP_TAB =        1<<2;
    PM.TAB_TOP_BLANK =      1<<3;
    PM.TAB_LEFT_TAB =       1<<4;
    PM.TAB_LEFT_BLANK =     1<<5;
    PM.TAB_RIGHT_TAB =      1<<6;
    PM.TAB_RIGHT_BLANK =    1<<7;
})(PM);
    
// Uncomment this for debugging purposes
//PM.debugShapes = true;

// Module that is responsible for the creation of puzzle pieces
PM.creation = (function (PM) {
    
    // Creates randomized but consistent tab statuses for every piece in a game
    var randomizeTabs = function (rows, cols) {
        var tabs = [];
        // Iterate through all rows and columns from left to right, from top to bottom
        for (var j = 0; j < rows; j++) {
            for (var i = 0; i < cols; i++) {
                // Set default value to current tab status
                if (typeof(tabs[i]) === "undefined") {
                    tabs[i] = [];
                }
                if (typeof(tabs[i][j]) === "undefined") {
                    tabs[i][j] = 0;
                }
                
                // Left
                if (i > 0) {
                    if (tabs[i - 1][j] & PM.TAB_RIGHT_TAB) {
                        tabs[i][j] |= PM.TAB_LEFT_BLANK;
                    }
                    else if (tabs[i - 1][j] & PM.TAB_RIGHT_BLANK) {
                        tabs[i][j] |= PM.TAB_LEFT_TAB;
                    }
                }
                // Top
                if (j > 0) {
                    if (tabs[i][j - 1] & PM.TAB_BOTTOM_TAB) {
                        tabs[i][j] |= PM.TAB_TOP_BLANK;
                    }
                    else if (tabs[i][j - 1] & PM.TAB_BOTTOM_BLANK) {
                        tabs[i][j] |= PM.TAB_TOP_TAB;
                    }
                }
                // Right
                if (i < cols - 1) {
                    if (Math.random() > 0.5) {
                        tabs[i][j] |= PM.TAB_RIGHT_TAB;
                    }
                    else {
                        tabs[i][j] |= PM.TAB_RIGHT_BLANK;
                    }
                }
                // Bottom
                if (j < rows - 1) {
                    if (Math.random() > 0.5) {
                        tabs[i][j] |= PM.TAB_BOTTOM_TAB;
                    }
                    else {
                        tabs[i][j] |= PM.TAB_BOTTOM_BLANK;
                    }
                }
            }
        }
        return tabs;
    };
    
    // Creates all puzzle pieces for a game
    var createPieces = function (image, game, rows, cols) {
        if (rows < 1 || cols < 1) {
            throw new Error("Invalid parameters");
        }
        
        var pieces = [];
        var tabs = randomizeTabs(rows, cols);
        var ww = Math.ceil(document.documentElement.clientWidth);
        var hh = Math.ceil(document.documentElement.clientWidth / image.width * image.height);
        var w = Math.ceil(ww / cols);
        var h = Math.ceil(hh / rows);
        
        console.log(image.width, image.height, ww, hh, w, h);
        
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                pieces.push(drawPiece(image, game, tabs[i][j], i, j, w, h, rows, cols));
                //break;
            } //break;
        }
        
        setNeighbours(pieces);
        return pieces;
    };
    
    // Plots a path with a puzzle piece shape on the given canvas defined by the given tabStatus
    var createPiecePathOnCanvas = function (canvas, tabStatus, w, h) {
        // Set basic canvas size
        canvas.width = w;
        canvas.height = h;
        
        // Margin (are occupied by tabs)
        var m = Math.min(Math.round(w / 5), Math.round(h / 5));
        // To avoid a minor rendering glitch, tabs are a bit wider than blanks
        var tabTolerance = 2;
        // Positioning corrections
        var xPosCorr = 0;
        var yPosCorr = 0;
        
        // Adjust size and positioning for tab status
        if (tabStatus & PM.TAB_TOP_TAB) {
            canvas.height += m;
            yPosCorr -= m;
        }
        if (tabStatus & PM.TAB_BOTTOM_TAB) {
            canvas.height += m;
        }
        if (tabStatus & PM.TAB_LEFT_TAB) {
            canvas.width += m;
            xPosCorr -= m;
        }
        if (tabStatus & PM.TAB_RIGHT_TAB) {
            canvas.width += m;
        }
        
        // Additional margin (area used for stroke, shadow, etc.)
        var am = 10;
        canvas.width += 2 * am;
        canvas.height += 2 * am;
        xPosCorr -= am;
        yPosCorr -= am;
        
        // x coordinate of the top-left point of the piece (excluding tabs/blanks)
        var l = am + ((tabStatus & PM.TAB_LEFT_TAB) ? m : 0);
        // y coordinate of the top-left point of the piece (excluding tabs/blanks)
        var t = am + ((tabStatus & PM.TAB_TOP_TAB) ? m : 0);
        // radius of tabs/blanks
        var r = m * 3 / 5;
        // half the length of the intersecting line between a tab/blank and the rectangle of the piece
        var b = r * Math.sin(Math.acos((m - r) / r));
        // helper for the y coordinate of the points used by ctx.arcTo() for drawing tabs and blanks
        // NOTE: At some point I actually spent a whole evening on this one, and calculating this formula
        //       involved coordinate geometry and differential calculus. There are three pages of calculations
        //       in a notebook for this. (With drawings too, yay!)
        //       Basically, it's the y coordinate of the control point used by arcTo() for the right tab,
        //       expressed in a coordinate system whose origo is the center of a tab.
        var magic = ((m - r) / Math.sqrt(m * (2 * r - m))) * (m) + b; 
        
        // Start carving the piece shape
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(l, t);
        
        var drawPoint = function (fillStyle, x, y) {
            ctx.fillStyle = fillStyle;
            ctx.fillRect(x - 2, y - 2, 5, 5);
        };
            
        // top-left to top-right
        if (tabStatus & PM.TAB_TOP_TAB) {
            var y1 = t - m - tabTolerance;
            var x1 = l + w / 2 + magic + tabTolerance;
            var y2 = y1;
            var x2 = l + w / 2;
            
            if (PM.debugShapes) {
                drawPoint("red", 2 * l + w - x1, y1);
                drawPoint("blue", x2, y2);
                drawPoint("darkred", x1, y1);
                drawPoint("darkblue", l + w / 2 + b, t);
            }
            
            ctx.lineTo(l + w / 2 - b, t);
            ctx.arcTo(2 * l + w - x1, y1, x2, y2, r);
            ctx.arcTo(x1, y1, l + w / 2 + b, t, r);
            ctx.lineTo(l + w / 2 + b, t);
        }
        else if (tabStatus & PM.TAB_TOP_BLANK) {
            var y1 = t + m;
            var x1 = l + w / 2 + magic;
            var y2 = y1;
            var x2 = l + w / 2;
            
            if (PM.debugShapes) {
                drawPoint("red", 2 * l + w - x1, y1);
                drawPoint("blue", x2, y2);
                drawPoint("darkred", x1, y1);
                drawPoint("darkblue", l + w / 2 + b, t);
            }
            
            ctx.lineTo(l + w / 2 - b, t);
            ctx.arcTo(2 * l + w - x1, y1, x2, y2, r);
            ctx.arcTo(x1, y1, l + w / 2 + b, t, r);
        }
        ctx.lineTo(l + w, t);
        
        // top-right to bottom-right
        if (tabStatus & PM.TAB_RIGHT_TAB) {
            var x1 = l + w + m + tabTolerance;
            var y1 = t + h / 2 + magic + tabTolerance;
            var x2 = x1;
            var y2 = t + h / 2;
            //console.log("m=" + String(m), "w=" + String(w), "h=" + String(h), "t=" + String(t), "l=" + String(l), "x1=" + String(x1), "y1=" + String(y1), "x2=" + String(x2), "y2=" + String(y2), "r=" + String(r));
            
            if (PM.debugShapes) {
                drawPoint("red", x1, 2 * t + h - y1);
                drawPoint("blue", x2, y2);
                drawPoint("darkred", x1, y1);
                drawPoint("darkblue", l + w, t + h / 2 + b);
            }
            
            ctx.lineTo(l + w, t + h / 2 - b);
            ctx.arcTo(x1, 2 * t + h - y1, x2, y2, r);
            //ctx.lineTo(x2, y2); // uncomment when debugging the arcs
            ctx.arcTo(x1, y1, l + w, t + h / 2 + b, r);
            ctx.lineTo(l + w, t + h / 2 + b);
            
        }
        else if (tabStatus & PM.TAB_RIGHT_BLANK) {
            var x1 = l + w - m;
            var y1 = t + h / 2 + magic;
            var x2 = x1;
            var y2 = t + h / 2;
            
            if (PM.debugShapes) {
                drawPoint("red", x1, 2 * t + h - y1);
                drawPoint("blue", x2, y2);
                drawPoint("darkred", x1, y1);
                drawPoint("darkblue", l + w, t + h / 2 + b);
            }
            
            ctx.lineTo(l + w, t + h / 2 - b);
            ctx.arcTo(x1, 2 * t + h - y1, x2, y2, r);
            ctx.arcTo(x1, y1, l + w, t + h / 2 + b, r);
        }
        ctx.lineTo(l + w, t + h);
        
        // bottom-right to bottom-left
        if (tabStatus & PM.TAB_BOTTOM_TAB) {
            var y1 = t + h + m + tabTolerance;
            var x1 = l + w / 2 + magic + tabTolerance;
            var y2 = y1;
            var x2 = l + w / 2;
            
            if (PM.debugShapes) {
                drawPoint("red", x1, y1);
                drawPoint("blue", x2, y2);
                drawPoint("darkred", 2 * l + w - x1, y1);
                drawPoint("darkblue", l + w / 2 - b, t + h);
            }
            
            ctx.lineTo(l + w / 2 + b, t + h);
            ctx.arcTo(x1, y1, x2, y2, r);
            ctx.arcTo(2 * l + w - x1, y1, l + w / 2 - b, t + h, r);
            ctx.lineTo(l + w / 2 - b, t + h);
        }
        else if (tabStatus & PM.TAB_BOTTOM_BLANK) {
            var y1 = t + h - m;
            var x1 = l + w / 2 + magic;
            var y2 = y1;
            var x2 = l + w / 2;
            
            if (PM.debugShapes) {
                drawPoint("red", x1, y1);
                drawPoint("blue", x2, y2);
                drawPoint("darkred", 2 * l + w - x1, y1);
                drawPoint("darkblue", l + w / 2 - b, t + h);
            }
            
            ctx.lineTo(l + w / 2 + b, t + h);
            ctx.arcTo(x1, y1, x2, y2, r);
            ctx.arcTo(2 * l + w - x1, y1, l + w / 2 - b, t + h, r);
        }
        ctx.lineTo(l, t + h);
        
        // bottom-left to top-left
        if (tabStatus & PM.TAB_LEFT_TAB) {
            var x1 = l - m - tabTolerance;
            var y1 = t + h / 2 + magic + tabTolerance;
            var x2 = x1;
            var y2 = t + h / 2;
            
            if (PM.debugShapes) {
                drawPoint("red", x1, y1);
                drawPoint("blue", x2, y2);
                drawPoint("darkred", x1, 2 * t + h - y1);
                drawPoint("darkblue", l, t + h / 2 - b);
            }
            
            ctx.lineTo(l, t + h / 2 + b);
            ctx.arcTo(x1, y1, x2, y2, r);
            ctx.arcTo(x1, 2 * t + h - y1, l, t + h / 2 - b, r);
            ctx.lineTo(l, t + h / 2 - b);
        }
        else if (tabStatus & PM.TAB_LEFT_BLANK) {
            var x1 = l + m;
            var y1 = t + h / 2 + magic;
            var x2 = x1;
            var y2 = t + h / 2;
            
            if (PM.debugShapes) {
                drawPoint("red", x1, y1);
                drawPoint("blue", x2, y2);
                drawPoint("darkred", x1, 2 * t + h - y1);
                drawPoint("darkblue", l, t + h / 2 - b);
            }
            
            ctx.lineTo(l, t + h / 2 + b);
            ctx.arcTo(x1, y1, x2, y2, r);
            ctx.arcTo(x1, 2 * t + h - y1, l, t + h / 2 - b, r);
        }
        ctx.lineTo(l, t);
        
        // Return information that will help correctly position the drawImage() call when drawing to this canvas
        return {
            x: xPosCorr,
            y: yPosCorr,
            am: am,
            tabTolerance: tabTolerance
        };
    };
    
    // Creates a stroke for a puzzle piece
    var createStroke = function (tabStatus, w, h) {
        // TODO: cache strokes for a given tabStatus
    
        // Create a canvas
        var canvas = document.createElement("canvas");
        // Carve puzzle piece shape on the canvas
        var posCorr = createPiecePathOnCanvas(canvas, tabStatus, w, h);
        
        // Draw the actual stroke
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = ctx.strokeStyle = "#fdfdfd";
        ctx.lineWidth = PM.Piece.PiecePrimitive.strokeSize * 2;
        ctx.stroke();
        ctx.fill();
        
        return canvas;
    };
    
    // Creates a single puzzle piece
    var drawPiece = function (image, game, tabStatus, px, py, w, h, rows, cols) {
        var canvas = document.createElement("canvas");
        // Carve the puzzle piece shaped path onto the canvas and get information about how to render on it
        var posCorr = createPiecePathOnCanvas(canvas, tabStatus, w, h);
        
        // Default source coordinates
        var sx = Math.floor(image.width / cols * px);
        var sy = Math.floor(image.height / rows * py);
        var sw = Math.floor(image.width / cols);
        var sh = Math.floor(image.height / rows);
        
        // Source margin
        var sm = Math.min(Math.round(image.width / cols / 5), Math.round(image.height / rows / 5));
        // Tab tolerance value transformed to the source image's dimensions
        var swTabTolerance = posCorr.tabTolerance / w * image.width;
        var shTabTolerance = posCorr.tabTolerance / h * image.height;
        // How much to adjust the destination image
        var destinationAdjustment = { x: 0, y: 0, w: 0, h: 0 };
        // TODO: since most of the time property values of destinationAdjustment will remain 0, maybe use a prototype for it
        
        // Now adjust everything, taking into account the tabs
        // NOTE: these could be compacted into one-liners but then the code'd be extremely unreadable
        if (tabStatus & PM.TAB_TOP_TAB) {
            sy -= sm + shTabTolerance;
            sh += sm + shTabTolerance;
            destinationAdjustment.y -= posCorr.tabTolerance;
            destinationAdjustment.h += posCorr.tabTolerance;
        }
        if (tabStatus & PM.TAB_BOTTOM_TAB) {
            sh += sm + shTabTolerance;
            destinationAdjustment.h += posCorr.tabTolerance;
        }
        if (tabStatus & PM.TAB_LEFT_TAB) {
            sx -= sm + swTabTolerance;
            sw += sm + swTabTolerance;
            destinationAdjustment.x -= posCorr.tabTolerance;
            destinationAdjustment.w += posCorr.tabTolerance;
        }
        if (tabStatus & PM.TAB_RIGHT_TAB) {
            sw += sm + swTabTolerance;
            destinationAdjustment.w += posCorr.tabTolerance;
        }
        
        // Print tab statuses
        console.log(px, py,
                    (tabStatus & PM.TAB_TOP_TAB ?    "top tab" : (tabStatus & PM.TAB_TOP_BLANK ?       "top blank" :    "top straight")),
                    (tabStatus & PM.TAB_RIGHT_TAB ?  "right tab" : (tabStatus & PM.TAB_RIGHT_BLANK ?   "right blank" :  "right straight")),
                    (tabStatus & PM.TAB_BOTTOM_TAB ? "bottom tab" : (tabStatus & PM.TAB_BOTTOM_BLANK ? "bottom blank" : "bottom straight")),
                    (tabStatus & PM.TAB_LEFT_TAB ?   "left tab" : (tabStatus & PM.TAB_LEFT_BLANK ?     "left blank" :   "left straight")));
        
        // Draw destination image on the canvas
        var ctx = canvas.getContext("2d");
        ctx.clip();
        if (PM.debugShapes) {
            ctx.globalAlpha = 0.4;
        }
        ctx.drawImage(image, sx, sy, sw, sh, posCorr.am + destinationAdjustment.x, posCorr.am + destinationAdjustment.y, canvas.width - 2 * posCorr.am + destinationAdjustment.w, canvas.height - 2 * posCorr.am + destinationAdjustment.h);
        
        // Create stroke for the piece
        var stroke = createStroke(tabStatus, w, h);
        
        // Instantiate the starting PiecePrimitive instance for the piece
        var primitive = new PM.Piece.PiecePrimitive(stroke, canvas);
        
        // Now instantiate the piece itself
        return new PM.Piece(game, primitive, px, py, { x: w * px + posCorr.x, y: h * py + posCorr.y });
    };
    
    // Sets all neighbourhood relations in a collection of puzzle pieces
    var setNeighbours = function (pieces) {
        for (var i = pieces.length; i --; ) {
            var piece = pieces[i];
            var neighbours = pieces.filter(function(p) { return (p.px === piece.px - 1 && p.py === piece.py) || (p.px === piece.px && p.py === piece.py - 1) });
            
            for (var z = neighbours.length; z--; ) {
                piece.addNeighbour(neighbours[z]);
            }
        }
    };
    
    // NOTE: only createPieces is exposed (it doesn't make sense to call any of the other functions from outside)
    return {
        createPieces: createPieces
    };
    
})(PM);

