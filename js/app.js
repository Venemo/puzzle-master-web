
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
    var gameUi = new PM.GameUi(function () {
        gameUi.hide();
        imageChooser.show();
    });

    // Initialize image chooser UI
    var imageChooser = new PM.ImageChooser(function (image, cols, rows) {
        gameUi.show();
        gameUi.startGame(image, cols, rows);
    });

    // Wireup about box
    var aboutBox = document.getElementById("pm-aboutbox");
    var aboutBoxCancel = aboutBox.querySelector(".pm-cancel");
    aboutBoxCancel.addEventListener("click", function (e) {
        aboutBox.style.display = "none";
    });
    if (PM.isFirefoxOS) {
        document.getElementById("pm-authorlink").addEventListener("click", function (e) {
            var activity = new MozActivity({
                name: "view",
                data: { type: "url", url: e.originalTarget.getAttribute("href") }
            });
            e.preventDefault();
        });
    }


    // Expose the objects (for debugging purposes)
    return {
        gameUi: gameUi,
        imageChooser: imageChooser
    };

})();
