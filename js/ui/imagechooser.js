
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

    // Wires up a picker dialog
    var wireupPicker = function (picker, span) {
        // Wireup cancel button
        var cancel = picker.querySelector(".pm-cancel");
        cancel.addEventListener("click", function (e) {
            picker.style.display = "none";
        });
        
        // Wireup picker buttons
        var buttons = picker.querySelectorAll(".pm-picker-button");
        var onClicked = function (e) {
            var button = e.originalTarget;
            span.innerHTML = button.innerHTML;
            // TODO: persist value of span
            picker.style.display = "none";
        };
        for (var i = buttons.length; i--; ) {
            buttons[i].addEventListener("click", onClicked);
        };
        
        return picker;
    };

    // Wires up the difficulty dialog and its features
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
        
        // Find rows and cols elements
        var colsSpan = difficultyDialog.querySelector("#pm-cols-val");
        var rowsSpan = difficultyDialog.querySelector("#pm-rows-val");
        var colsPicker = wireupPicker(document.querySelector("#pm-cols-picker"), colsSpan);
        var rowsPicker = wireupPicker(document.querySelector("#pm-rows-picker"), rowsSpan);
        
        
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
            
            // Call callback
            callback(Number(colsSpan.innerHTML), Number(rowsSpan.innerHTML));
        });
        
        // Wireup number picker buttons
        var colsPickerButton = difficultyDialog.querySelector("#pm-cols-button");
        colsPickerButton.addEventListener("click", function (e) {
            colsPicker.style.display = "block";
        });
        var rowsPickerButton = difficultyDialog.querySelector("#pm-rows-button");
        rowsPickerButton.addEventListener("click", function (e) {
            rowsPicker.style.display = "block";
        });
        
        return;
    };
    
    // Initializes the image chooser
    function ImageChooser (chosenCallback) {
        var chooserUi = document.getElementById("pm-imagechooser");
        var difficultyDialog = document.getElementById("pm-difficulty");
        var image = null;
        
        // TODO: load persisted values of colsSpan and rowsSpan
        
        // Wire up the difficulty dialog
        wireupDifficultyDialog(difficultyDialog, function (cols, rows) {
            // Hide image chooser
            chooserUi.style.display = "none";
            // Call callback
            chosenCallback(image, cols, rows);
        });
        
        // Wire up clicking on an image
        chooserUi.addEventListener("click", function (e) {
            if (e.originalTarget instanceof HTMLImageElement) {
                // Set chosen image
                image = e.originalTarget;
                // Show difficulty dialog
                difficultyDialog.style.display = "block";
            }
        });
        
        var that = this;
        
        // Shows the image chooser UI
        that.show = function () {
            chooserUi.style.display = "block";
            chooserUi.scrollTop = 0;
        };
        
        // Hides the image chooser UI
        that.hide = function () {
            chooserUi.scrollTop = 0;
            chooserUi.style.display = "none";
        };
    };
    
    return ImageChooser;
})();

