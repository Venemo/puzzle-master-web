
PM = typeof(PM) === "undefined" ? {} : PM;

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

if (typeof(window.requestAnimationFrame) !== "function") {
    throw new Error("requestAnimationFrame is not supported!");
}

PM.RenderLoop = (function () {

    function RenderLoop (callback) {
        if (typeof(callback) !== "function") {
            throw new Error("Invalid parameter: callback");
        }
    
        this._callback = callback;
    };
    
    RenderLoop.prototype._isDirty = true;
    RenderLoop.prototype._requests = 0;
    RenderLoop.prototype._isRunning = null;
    RenderLoop.prototype._callback = null;
    
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

    // The loop function that is controlled by the RenderLoop object
    var loopFunc = function loopFunc (renderLoop) {
        window.requestAnimationFrame(function() {
            if (renderLoop._isDirty) {
                renderLoop._callback && renderLoop._callback();
                renderLoop._isDirty = false;
            }
            if (renderLoop._isRunning && renderLoop._requests > 0) {
                loopFunc(renderLoop);
            }
            else {
                renderLoop._isRunning = false;
            }
        });
    };
    
    return RenderLoop;

})();



