
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

PM = typeof(PM) === "undefined" ? {} : PM;

(function (PM) {
    PM.TAB_BOTTOM_TAB =       1;
    PM.TAB_BOTTOM_BLANK =     2;
    PM.TAB_TOP_TAB =          4;
    PM.TAB_TOP_BLANK =        8;
    PM.TAB_LEFT_TAB =        16;
    PM.TAB_LEFT_BLANK =      32;
    PM.TAB_RIGHT_TAB =       64;
    PM.TAB_RIGHT_BLANK =    128;
})(PM);

PM.creation = (function (PM) {
    
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
    
    var createPieces = function (image, game, rows, cols) {
        if (rows < 1 || cols < 1) {
            throw new Error("Invalid parameters");
        }
        
        var pieces = [];
        var tabs = randomizeTabs(rows, cols);
        var ww = Math.floor(document.documentElement.clientWidth);
        var hh = Math.floor(document.documentElement.clientWidth / image.width * image.height);
        var w = Math.floor(ww / cols);
        var h = Math.floor(hh / rows);
        
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
    
    var createPiecePathOnCanvas = function (canvas, tabStatus, w, h) {
        // Set basic canvas size
        canvas.width = w;
        canvas.height = h;
        
        // Margin (are occupied by tabs)
        var m = Math.min(Math.round(w / 5), Math.round(h / 5));
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
        //       Basically, it's the y coordinate of the control point used by arcTo() expressed in a
        //       coordinate system whose origo is the center of a tab.
        var magic = ((m - r) / Math.sqrt(m * (2 * r - m))) * (m) + b; 
        
        var ctx = canvas.getContext('2d');
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
        
        return {
            x: xPosCorr,
            y: yPosCorr
        };
    };
    
    var createStroke = function (tabStatus, w, h) {
        var canvas = document.createElement("canvas");
        var posCorr = createPiecePathOnCanvas(canvas, tabStatus, w, h);
        var ctx = canvas.getContext('2d');
        
        ctx.fillStyle = ctx.strokeStyle = "#fdfdfd";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fill();
        
        return canvas;
    };
    
    var drawPiece = function (image, game, tabStatus, px, py, w, h, rows, cols) {
        var canvas = document.createElement("canvas");
        
        var sx = Math.floor(image.width / cols * px);
        var sy = Math.floor(image.height / rows * py);
        var sw = Math.floor(image.width / cols);
        var sh = Math.floor(image.height / rows);
        
        var sm = Math.min(Math.round(image.width / cols / 5), Math.round(image.height / rows / 5));
        
        if (tabStatus & PM.TAB_TOP_TAB) {
            sy -= sm;
            sh += sm;
        }
        if (tabStatus & PM.TAB_BOTTOM_TAB) {
            sh += sm;
        }
        if (tabStatus & PM.TAB_LEFT_TAB) {
            sx -= sm;
            sw += sm;
        }
        if (tabStatus & PM.TAB_RIGHT_TAB) {
            sw += sm;
        }
        
        console.log(px, py,
                    (tabStatus & PM.TAB_TOP_TAB ?    "top tab" : (tabStatus & PM.TAB_TOP_BLANK ?       "top blank" :    "top straight")),
                    (tabStatus & PM.TAB_RIGHT_TAB ?  "right tab" : (tabStatus & PM.TAB_RIGHT_BLANK ?   "right blank" :  "right straight")),
                    (tabStatus & PM.TAB_BOTTOM_TAB ? "bottom tab" : (tabStatus & PM.TAB_BOTTOM_BLANK ? "bottom blank" : "bottom straight")),
                    (tabStatus & PM.TAB_LEFT_TAB ?   "left tab" : (tabStatus & PM.TAB_LEFT_BLANK ?     "left blank" :   "left straight")));
        
        var posCorr = createPiecePathOnCanvas(canvas, tabStatus, w, h);
        var ctx = canvas.getContext("2d");
        
        ctx.clip();
        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        
        var stroke = createStroke(tabStatus, w, h);
        var primitive = new PM.Piece.PiecePrimitive(stroke, canvas);
        
        return new PM.Piece(primitive, px, py, { x: w * px + posCorr.x, y: h * py + posCorr.y });
    };
    
    var setNeighbours = function (pieces) {
        for (var i = pieces.length; i --; ) {
            var piece = pieces[i];
            var neighbours = pieces.filter(function(p) { return (p.px === piece.px - 1 && p.py === piece.py) || (p.px === piece.px && p.py === piece.py - 1) });
            
            for (var z = neighbours.length; z--; ) {
                piece.addNeighbour(neighbours[z]);
            }
        }
    };
    
    return {
        createPieces: createPieces
    };
    
})(PM);

