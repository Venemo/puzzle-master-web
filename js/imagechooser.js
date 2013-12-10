
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
    return function ImageChooser (chooserUiId, chosenCallback) {
        var chooserUi = document.getElementById(chooserUiId);
        chooserUi.addEventListener("click", function (e) {
            if (e.originalTarget instanceof HTMLImageElement) {
                chooserUi.style.display = "none";
                chosenCallback(e.originalTarget);
            }
        });
    };
})();

