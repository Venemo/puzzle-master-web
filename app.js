
(function($) {
    $.fn.getShader = function(gl) {
        var shaderSource = this.html();
        var shader;
        
        // Create shader
        if (this.attr("type") === "x-shader/x-fragment") {
            // Fragment shader
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (this.attr("type") == "x-shader/x-vertex") {
            // Vertex shader
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            // Unknown shader type
            $.error("Unknown shader type");
        }
        
        // Pass source to shader
        gl.shaderSource(shader, shaderSource);

        // Compile the shader program
        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            $.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        }

        return shader;
    };
})(jQuery);

PM = {
    TAB_BOTTOM_TAB:       1,
    TAB_BOTTOM_BLANK:     2,
    TAB_TOP_TAB:          4,
    TAB_TOP_BLANK:        8,
    TAB_LEFT_TAB:        16,
    TAB_LEFT_BLANK:      32,
    TAB_RIGHT_TAB:       64,
    TAB_RIGHT_BLANK:    128,
    
    random: function(min, max) {
        return (Math.random() * (max - min)) + min;
    }
};

Piece = (function() {
    var Piece = function(i, j, w, h, x, y, a) {
        this.i = i;
        this.j = j;
        this.width = w;
        this.height = h;
        this.x = x || 0;
        this.y = y || 0;
        this.angle = a || 0;
        this.transformOrigin = { x: (w || 0) / 2, y: (h || 0) / 2 };
        this.dragStart = { x: 0, y: 0 };
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

Game = (function() {
    var Game = function(gl, shaderProgram) {
        var that = this;
        var pieces = [];
        var rows = 0;
        var cols = 0;
        var pieceW = 0;
        var pieceH = 0;
        
        var mouseSubject = null;
        var interval = null;
        
        var u_puzzleSize;
        var u_nPieces;
        var u_pieces;
        var u_piecesPos;
        var u_piecesRot;
        var u_piecesRotOrig;
        var u_piecesTabs;
        
        that.start = function(image, r, c) {
            rows = r;
            cols = c;
            pieceW = image.width / cols;
            pieceH = image.height / rows;
            
            pieces = [];
            
            for (var i = 0; i < cols; i++) {
                for (var j = 0; j < rows; j++) {
                    var x = PM.random(pieceW, image.width - pieceW);
                    var y = PM.random(pieceH, image.height - pieceH);
                    var a = PM.random(0, Math.PI * 2);
                    
                    var piece = new Piece(i, j, pieceW, pieceH, x, y, a);
                    
                    pieces.push(piece);
                    //break;
                }
                //break;
            }
            
            // Get uniform locations
            
            u_puzzleSize = gl.getUniformLocation(shaderProgram, "u_puzzleSize");
            u_nPieces = gl.getUniformLocation(shaderProgram, "u_nPieces");
            u_pieces = gl.getUniformLocation(shaderProgram, "u_pieces");
            u_piecesPos = gl.getUniformLocation(shaderProgram, "u_piecesPos");
            u_piecesRot = gl.getUniformLocation(shaderProgram, "u_piecesRot");
            u_piecesRotOrig = gl.getUniformLocation(shaderProgram, "u_piecesRotOrig");
            u_piecesTabs = gl.getUniformLocation(shaderProgram, "u_piecesTabs");
            
            // Upload values for uniforms
            that.uploadUniforms();
            
            // Create a buffer for the position of the rectangle corners.
            var positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            
            // Set a rectangle the same size as the image.
            PM.helper.setRectangle(0, 0, image.width, image.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };

        that.uploadUniforms = function() {        
            // Set u_puzzleSize
            gl.uniform2f(u_puzzleSize, cols, rows);
            
            // Set piece count
            gl.uniform1i(u_nPieces, pieces.length);
            
            // Set piece coordinates (puzzle coordinates)
            var upieces = [];
            for (var i = 0; i < pieces.length; i++) {
                upieces.push(pieces[i].i);
                upieces.push(pieces[i].j);
            }
            gl.uniform1iv(u_pieces, upieces);
            
            // Set piece positions (scene coordinates)
            var piecesPos = [];
            for (var i = 0; i < pieces.length; i++) {
                piecesPos.push(pieces[i].x);
                piecesPos.push(pieces[i].y);
            }
            gl.uniform1fv(u_piecesPos, piecesPos);
            
            // Set piece rotations
            var piecesRot = [];
            for (var i = 0; i < pieces.length; i++) {
                piecesRot.push(pieces[i].angle);
            }
            gl.uniform1fv(u_piecesRot, piecesRot);
            
            // Set piece transform origins
            var piecesRotOrig = [];
            for (var i = 0; i < pieces.length; i++) {
                piecesRotOrig.push(pieces[i].transformOrigin.x);
                piecesRotOrig.push(pieces[i].transformOrigin.y);
            }
            gl.uniform1fv(u_piecesRotOrig, piecesRotOrig);
            
            // Set piece tab statuses
            var piecesTabs = [];
            for (var i = 0; i < pieces.length; i++) {
                piecesTabs.push(PM.TAB_TOP_TAB);
                piecesTabs.push(PM.TAB_BOTTOM_BLANK);
                piecesTabs.push(PM.TAB_LEFT_TAB);
                piecesTabs.push(PM.TAB_RIGHT_BLANK);
            }
            gl.uniform1iv(u_piecesTabs, piecesTabs);
        };
        
        that.reactToMouseDown = function(pos) {
            mouseSubject = null;
            
            for (var i = pieces.length; i--; ) {
                var piece = pieces[i];
                var sp = piece.mapFromScene(pos);
                console.log("(", piece.i, ",", piece.j, ") (", pos.x, ",", pos.y, ") (", sp.x, ",", sp.y, ")");
                
                if (sp.x >= 0 && sp.x <= pieceW && sp.y >= 0 && sp.y <= pieceH) {
                    mouseSubject = piece;
                    mouseSubject.dragStart = {
                        x: pos.x - mouseSubject.x,
                        y: pos.y - mouseSubject.y
                    };
                    console.log("mousedown", mouseSubject.i, mouseSubject.j, mouseSubject.dragStart);
                    
                    pieces.splice(i, 1);
                    pieces.push(mouseSubject);
                    
                    that.startPaint();
                    break;
                }
            }
            
            if (!mouseSubject) {
                console.log("mousedown", "subject not found");
            }
        };
        
        that.reactToMouseUp = function() {
            mouseSubject = null;
            console.log("mouseup");
            that.endPaint();
        };
        
        that.reactToMouseMove = function(pos) {
            if (mouseSubject) {
                mouseSubject.x = pos.x - mouseSubject.dragStart.x;
                mouseSubject.y = pos.y - mouseSubject.dragStart.y;
                
                //console.log("mousemove", mouseSubject.x, mouseSubject.y);
            }
        };
        
        that.startPaint = function() {
            if (interval) {
                clearInterval(interval);
            }
            interval = setInterval(function() {
                that.repaint();
            }, 33);
        };
        
        that.endPaint = function() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };
        
        that.repaint = function() {
            that.uploadUniforms();
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
    };
    
    return Game;
})();


Helper = (function() {
    return function(gl) {
        // Function for loading images
        var loadImage = function(url) {
            var promise = new $.Deferred();
            var image = new Image();
            
            image.src = "image4.jpg";
            image.onload = function() {
                promise.resolve(image);
            };
            
            return promise;
        };
        var makeTexture = function(image) {
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            return texture;
        };
        var setRectangle = function (x, y, width, height) {
            var x1 = x;
            var x2 = x + width;
            var y1 = y;
            var y2 = y + height;
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2]), gl.STATIC_DRAW);
        };
        
        
        this.loadImage = loadImage;
        this.makeTexture = makeTexture;
        this.setRectangle = setRectangle;
    };
})();

$(function() {
    
    // Find stuff
    var $window = $(window);
    var $canvas = $("canvas#maincanvas");
    var canvas = $canvas[0];
    
    // Initialize stuff
    canvas.width = $window.width();
    canvas.height = $window.height();
    
    // Get GL context
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    PM.helper = new Helper(gl);
    PM.gl = gl;
    
    var cols = 4;
    var rows = 3;
    var pos = {
        x: 2,
        y: 1
    };
    
    // Load an image
    PM.helper.loadImage("image4.jpg").done(function(image) {
        
        // setup a GLSL program
        var vertexShader = $("#pm-vertex-shader").getShader(gl);
        var fragmentShader = $("#pm-fragment-shader").getShader(gl);
        
        
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            $.error("Unable to initialize the shader program.");
        }

        gl.useProgram(shaderProgram);

        // look up where the vertex data needs to go.
        var texCoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");
        
        // provide texture coordinates for the rectangle.
        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Create a texture.
        var texture = PM.helper.makeTexture(image);

        // Set u_resolution
        gl.uniform2f(gl.getUniformLocation(shaderProgram, "u_resolution"), canvas.width, canvas.height);
        // Set u_imageSize
        gl.uniform2f(gl.getUniformLocation(shaderProgram, "u_imageSize"), image.width, image.height);

        
        var game = new Game(gl, shaderProgram);
        game.start(image, rows, cols);
        
        $canvas.on("mousedown.pm", function (e) {
            game.reactToMouseDown({ x: e.clientX, y: e.clientY });
        });
        $canvas.on("mouseup.pm", function (e) {
            game.reactToMouseUp({ x: e.clientX, y: e.clientY });
        });
        $canvas.on("mousemove.pm", function (e) {
            game.reactToMouseMove({ x: e.clientX, y: e.clientY });
        });
    });
});
