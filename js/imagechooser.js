
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

PM = typeof(PM) === "undefined" ? {} : PM;

PM.ImageChooser = (function () {
    var wireupDifficultyDialog = function (difficultyDialog, callback) {
        // Check parameters
        if (typeof(difficultyDialog) === "undefined") {
            throw new Error("Invalid parameter: difficultyDialog");
        }
        if (typeof(callback) === "undefined") {
            throw new Error("Invalid parameter: callback");
        }
        
        // Initially hide
        difficultyDialog.style.display = "none";
        
        // Wireup cancel button
        var cancel = difficultyDialog.querySelector(".pm-cancel");
        cancel.addEventListener("click", function (e) {
            // Hide difficulty dialog
            difficultyDialog.style.display = "none";
        });
        
        // Wireup play button
        var play = difficultyDialog.querySelector(".pm-play");
        play.addEventListener("click", function (e) {
            // Hide difficulty dialog
            difficultyDialog.style.display = "none";
            
            // Find rows and cols elements
            var colsSpan = difficultyDialog.querySelector("#pm-cols-val");
            var rowsSpan = difficultyDialog.querySelector("#pm-rows-val");
            
            // Call callback
            callback(Number(colsSpan.innerHTML), Number(rowsSpan.innerHTML));
        });
    };

    function ImageChooser (chosenCallback) {
        var chooserUi = document.getElementById("pm-imagechooser");
        var difficultyDialog = document.getElementById("pm-difficulty");
        var image = null;
        
        wireupDifficultyDialog(difficultyDialog, function (cols, rows) {
            // Hide image chooser
            chooserUi.style.display = "none";
            // Call callback
            chosenCallback(image, cols, rows);
        });
        
        chooserUi.addEventListener("click", function (e) {
            if (e.originalTarget instanceof HTMLImageElement) {
                // Set chosen image
                image = e.originalTarget;
                // Show difficulty dialog
                difficultyDialog.style.display = "block";
            }
        });
        
        var that = this;
        
        that.show = function () {
            chooserUi.style.display = "block";
        };
    };
    
    return ImageChooser;
})();

