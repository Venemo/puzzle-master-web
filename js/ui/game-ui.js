
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

    var wireupWonDialog = function (wonDialog, gameUi, onChooseOther) {
        // Wireup choose other button
        var chooseOther = document.getElementById("pm-choose-other");
        chooseOther.addEventListener("click", function (e) {
            wonDialog.style.display = "none";
            gameUi.hide();
            onChooseOther && onChooseOther();
        });

        // Wireup play again button
        var playAgain = document.getElementById("pm-play-again");
        playAgain.addEventListener("click", function (e) {
            wonDialog.style.display = "none";
            gameUi.restartGame();
        });

        return wonDialog;
    };

    // Initializes the game UI
    function GameUi (onChooseOther) {
        var gameUiElement = document.getElementById("pm-game-ui");
        var mainCanvas = document.getElementById("pm-maincanvas");
        var wonDialog = wireupWonDialog(document.getElementById("pm-gamewon"), this, onChooseOther);
        var aboutBox = document.getElementById("pm-aboutbox");
        var ctx = mainCanvas.getContext("2d");
        var game;
        var chosenImage, chosenCols, chosenRows;
        var renderLoop = new PM.RenderLoop(function () {
            if (game) {
                game.draw(ctx);
            }
        });

        var that = this;

        var onWon = function () {
            wonDialog.style.display = "block";
        };

        // Wireup "are you sure to surrender" dialog
        var surrenderCallback = null;
        var surrenderDialog = document.getElementById("pm-game-surrender");
        var surrenderDialogCancel = surrenderDialog.querySelector(".pm-cancel");
        surrenderDialogCancel.addEventListener("click", function (e) {
            surrenderDialog.style.display = "none";
        });
        var surrenderDialogConfirm = surrenderDialog.querySelector(".pm-confirm");
        surrenderDialogConfirm.addEventListener("click", function (e) {
            surrenderDialog.style.display = "none";
            surrenderCallback && surrenderCallback();
        });

        // Wireup game menu
        var gameMenuButton = document.getElementById("pm-game-menubutton");
        var gameMenu = document.getElementById("pm-game-menu");
        gameMenuButton.addEventListener("click", function (e) {
            gameMenu.style.display = "block";
        });
        var gameMenuBack = document.getElementById("pm-game-menu-back");
        gameMenuBack.addEventListener("click", function (e) {
            gameMenu.style.display = "none";
        });
        var gameMenuAbout = document.getElementById("pm-game-menu-about");
        gameMenuAbout.addEventListener("click", function (e) {
            gameMenu.style.display = "none";
            aboutBox.style.display = "block";
        });
        var gameMenuRestart = document.getElementById("pm-game-menu-restart");
        gameMenuRestart.addEventListener("click", function (e) {
            gameMenu.style.display = "none";
            surrenderCallback = function () {
                that.restartGame();
            };
            surrenderDialog.style.display = "block";
        });
        var gameMenuSurrender = document.getElementById("pm-game-menu-surrender");
        gameMenuSurrender.addEventListener("click", function (e) {
            surrenderCallback = function () {
                onChooseOther && onChooseOther();
                that.hide();
            };
            gameMenu.style.display = "none";
            surrenderDialog.style.display = "block";
        });

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
            // Set setting values
            chosenImage = image;
            chosenCols = cols;
            chosenRows = rows;

            // "restart" the game
            that.restartGame();
        };

        // Restarts the game
        that.restartGame = function () {
            console.log("starting game");

            mainCanvas.width = document.documentElement.clientWidth;
            mainCanvas.height = document.documentElement.clientHeight;

            game = new PM.Game(chosenImage, chosenCols, chosenRows, renderLoop, onWon);
            renderLoop.start();
        };

        // Shows the game UI
        that.show = function () {
            gameUiElement.style.display = "block";
        };

        // Hides the game UI
        that.hide = function () {
            gameUiElement.style.display = "none";
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
