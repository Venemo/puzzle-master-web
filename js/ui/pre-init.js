
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

// This file contains initializations that should be done before the app UI starts loading

PM = typeof(PM) === "undefined" ? {} : PM;

PM.isFirefoxOS = /Mobile;.*Firefox\/(\d+)/.test(navigator.userAgent);

// Firefox OS specific stuff
if (PM.isFirefoxOS) {
    // Lock orientation to landscape
    
    window.screen.mozLockOrientation("landscape");
    
    window.screen.onorientationchange = function () {
        window.screen.mozUnlockOrientation();
        window.screen.mozLockOrientation("landscape");
    };
    
    document.addEventListener("visibilityChange", function (e) {
        if (!document.hidden) {
            window.screen.mozUnlockOrientation();
            window.screen.mozLockOrientation("landscape");
        }
    });
}

