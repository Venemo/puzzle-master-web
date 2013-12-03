
(function () {
    var mainCanvas = document.getElementById("maincanvas");
    mainCanvas.width = document.documentElement.clientWidth;
    mainCanvas.height = document.documentElement.clientHeight;

    var btnRestart = document.getElementById("btn-restart");
    btnRestart.onclick = function() { startGame(); };

    var ctx = mainCanvas.getContext("2d");
    var renderLoop = new PM.RenderLoop(function () { if (game) game.draw(ctx); });
    var game;

    // Touch events
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

    // Mouse events
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

    var startGame = function () {
        console.log("starting game");
        var image = new Image();
        image.onload = function() {
            game = new PM.Game(image, 2, 3, renderLoop);
            renderLoop.start();
        };
        image.src = "images/image4.jpg";
    };
})();

