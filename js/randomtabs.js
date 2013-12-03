
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

PM = typeof(PM) === "undefined" ? {} : PM;

PM.TAB_BOTTOM_TAB =       1;
PM.TAB_BOTTOM_BLANK =     2;
PM.TAB_TOP_TAB =          4;
PM.TAB_TOP_BLANK =        8;
PM.TAB_LEFT_TAB =        16;
PM.TAB_LEFT_BLANK =      32;
PM.TAB_RIGHT_TAB =       64;
PM.TAB_RIGHT_BLANK =    128;

(function (PM) {
    
    PM.randomizeTabs = function (rows, cols) {
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
    
})(PM);

