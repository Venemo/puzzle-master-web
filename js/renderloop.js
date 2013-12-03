
// This file is part of Puzzle Master (web edition)
// https://github.com/Venemo/puzzle-master-web
//
// Licensed to you under the terms of the LGPL
// See http://www.gnu.org/licenses/lgpl-3.0.txt
//
//
// Copyright 2013, Timur Kristóf

PM = typeof(PM) === "undefined" ? {} : PM;

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

if (typeof(window.requestAnimationFrame) !== "function") {
    throw new Error("requestAnimationFrame is not supported!");
}

PM.RenderLoop = (function () {
    
    // RenderLoop ===========================================================================================

    function RenderLoop (callback) {
        if (typeof(callback) !== "function") {
            throw new Error("Invalid parameter: callback");
        }
    
        this._callbacks = [callback];
    };
    
    RenderLoop.prototype._isDirty = true;
    RenderLoop.prototype._requests = 0;
    RenderLoop.prototype._isRunning = null;
    RenderLoop.prototype._callbacks = null;
    
    RenderLoop.prototype.addCallback = function (callback) {
        if (typeof(callback) !== "function")
            throw new Error("Invalid parameter: callback is not a function");
        
        this._callbacks.push(callback);
    };
    
    RenderLoop.prototype.removeCallback = function (callback) {
        if (typeof(callback) !== "function")
            throw new Error("Invalid parameter: callback is not a function");
        
        var i = this._callbacks.indexOf(callback);
        if (i >= 0) {
            this._callbacks.splice(i, 1);
        }
    };
    
    RenderLoop.prototype.start = function (addReq) {
        if (this._isRunning) {
            return;
        }
        
        this._isRunning = true;
        loopFunc(this);
        
        if (addReq) {
            this.addLoopRequest();
        }
    };
    
    RenderLoop.prototype.stop = function () {
        this._isRunning = false;
    };
    
    RenderLoop.prototype.addLoopRequest = function () {
        this._requests += 1;
        if (this._requests === 1) {
            this.start();
        }
    };
    
    RenderLoop.prototype.removeLoopRequest = function () {
        this._requests = this._requests === 0 ? 0 : this._requests - 1;
        if (this._requests === 0) {
            this.stop();
        }
    };
    
    RenderLoop.prototype.markDirty = function () {
        this._isDirty = true;
    };
    
    RenderLoop.prototype.createNumberAnimation = function (duration, obj, prop, from, to) {
        var anim = new NumberAnimation(this, duration, obj, prop, from, to);
        return {
            start: function () { anim.start(); }
        };
    };

    // The loop function that is controlled by the RenderLoop object
    var loopFunc = function loopFunc (renderLoop) {
        //console.log("render loop called");
        window.requestAnimationFrame(function(t) {
            if (renderLoop._isDirty) {
                //console.log("render loop is dirty");
                renderLoop._isDirty = false;
                
                for (var i = renderLoop._callbacks.length; i--; ) {
                    renderLoop._callbacks[i] && renderLoop._callbacks[i](t);
                }
            }
            if (renderLoop._isRunning && renderLoop._requests > 0) {
                loopFunc(renderLoop);
            }
            else {
                renderLoop._isRunning = false;
            }
        });
    };
    
    // NumberAnimation ===========================================================================================
    
    var NumberAnimation = function NumberAnimation (renderLoop, duration, obj, prop, from, to) {
        // Check parameters
        if (typeof(obj) !== "object" || !obj)
            throw new Error("Invalid parameter: obj is not an object");
        if (typeof(prop) !== "string" || !prop)
            throw new Error("Invalid parameter: prop is not a string");
        if (typeof(from) !== "number")
            throw new Error("Invalid parameter: from");
        if (typeof(obj[prop]) !== "number")
            throw new Error("The given object doesn't have a number property with the given name.");
        
        // Three-parameter version: from is the current state, to is the 3rd parameter
        if (typeof(to) === "undefined") {
            to = from;
            from = obj[prop];
        }
    
        // Set instance properties
        this.obj = obj;
        this.prop = prop;
        this.from = from;
        this.to = to;
        this.renderLoop = renderLoop;
        this.duration = duration;
        this.renderLoopCallback = NumberAnimation.createRenderLoopCallback(this);
    };
    
    NumberAnimation.createRenderLoopCallback = function (that) {
        return function (t) {
            that.tick(t);
        };
    };
    
    NumberAnimation.prototype.start = function () {
        if (this.duration === 0)
            return;
        
        this.renderLoop.addCallback(this.renderLoopCallback);
        this.renderLoop.addLoopRequest();
    };
    
    NumberAnimation.prototype.from = 0;
    NumberAnimation.prototype.to = 0;
    NumberAnimation.prototype.obj = 0;
    NumberAnimation.prototype.prop = 0;
    NumberAnimation.prototype.renderLoop = null;
    NumberAnimation.prototype.duration = 0;
    NumberAnimation.prototype.prevTime = 0;
    NumberAnimation.prototype.elapsed = 0;
    
    NumberAnimation.prototype.tick = function (t) {
        //console.log("animation tick called");
        this.renderLoop.markDirty();
        
        if (!this.prevTime) {
            this.prevTime = t;
            this.obj[this.prop] = this.from;
            this.speed = (this.to - this.from) / this.duration;
            
            return;
        }
        
        var dt = t - this.prevTime;
        this.prevTime = t;
        this.obj[this.prop] += this.speed * dt;
        this.elapsed += dt;
        
        if (this.elapsed >= this.duration) {
            //console.log("animation tick: stopping animation");
            this.obj[this.prop] = this.to;
            this.renderLoop.removeCallback(this.renderLoopCallback);
            this.renderLoop.removeLoopRequest();
        }
    };
    
    return RenderLoop;

})();



