
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

PM = typeof(PM) === "undefined" ? {} : PM;

PM.GameUi = (function () {
    
    // Initializes the game UI
    function GameUi () {
        var mainCanvas = document.getElementById("pm-maincanvas");
        var ctx = mainCanvas.getContext("2d");
        var game;
        var renderLoop = new PM.RenderLoop(function () {
            if (game) {
                game.draw(ctx);
            }
        });
        
        var that = this;
        
        
        // Wireup main canvas: touch events
        mainCanvas.addEventListener("touchstart", function (e) {
            if (!game)
                return;
            
            renderLoop.addLoopRequest();
            game.reactToTouchStart(e.touches);
        });
        mainCanvas.addEventListener("touchend", function (e) {
            if (!game)
                return;
                
            game.reactToTouchEnd(e.touches);
            renderLoop.removeLoopRequest();
        });
        mainCanvas.addEventListener("touchmove", function (e) {
            if (!game)
                return;
                
            game.reactToTouchMove(e.touches);
        });

        // Wireup main canvas: mouse events
        mainCanvas.addEventListener("mousedown", function (e) {
            if (!game)
                return;
                
            renderLoop.addLoopRequest();
            game.reactToTouchStart([{ clientX: e.clientX, clientY: e.clientY }]);
        });
        mainCanvas.addEventListener("mouseup", function (e) {
            if (!game)
                return;
                
            game.reactToTouchEnd([{ clientX: e.clientX, clientY: e.clientY }]);
            renderLoop.removeLoopRequest();
        });
        mainCanvas.addEventListener("mousemove", function (e) {
            if (!game)
                return;
                
            game.reactToTouchMove([{ clientX: e.clientX, clientY: e.clientY }]);
        });
        mainCanvas.addEventListener("contextmenu", function (e) {
            if (!game)
                return;
                
            // Disallow context menu (right click means rotate)
            e.preventDefault();
        });
        
        // Starts the game
        that.startGame = function (image, cols, rows) {
            console.log("starting game");
            
            mainCanvas.width = document.documentElement.clientWidth;
            mainCanvas.height = document.documentElement.clientHeight;
            
            game = new PM.Game(image, rows, cols, renderLoop);
            renderLoop.start();
        };
        
        // Expose the render loop (for debugging purposes)
        that.getRenderLoop = function () {
            return renderLoop;
        };
        
        // Expose the game object (for debugging purposes)
        that.getGameObj = function () {
            return game;
        };
        
    };
    
    return GameUi;
    
})();

