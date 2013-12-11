
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

var pmApp = (function () {
    
    // Initialize game UI
    var gameUi = new PM.GameUi();
    
    // Initialize image chooser UI
    var imageChooser = new PM.ImageChooser(function (image, cols, rows) {
        gameUi.startGame(image, cols, rows);
    });
    
    // Expose the objects (for debugging purposes)
    return {
        gameUi: gameUi,
        imageChooser: imageChooser
    };
    
})();

