
PM = typeof(PM) === "undefined" ? {} : PM;

PM.Piece = (function () {

    var Piece = function Piece (image, px, py) {
        this.image = image;
        this.px = px;
        this.py = py;
        
        this.supposedPosition = { x: image.width * px, y: image.height * py };
        this.x = this.supposedPosition.x;
        this.y = this.supposedPosition.y;
        this.transformOrigin = { x: image.width / 2, y: image.height / 2 };
        this.grabbedTouches = [];
        
        
        var that = this;
        
        that.containsPoint = function (sx, sy) {
            //console.log(JSON.stringify(that), sx, sy);
            //return false;
            
            return sx >= that.x && sx <= that.x + that.image.width && sy >= that.y && sy <= that.y + that.image.height;
            
            var p = that.mapFromScene({ x: sx, y: sy });
            console.log(that.px, that.py, JSON.stringify(p));
            return p.x >= 0 && p.x <= that.image.width && p.y >= 0 && p.y <= that.image.height;
        };
        
        that.draw = function (ctx) {
            ctx.rotate(that.angle);
            ctx.drawImage(that.image, that.x, that.y);
            ctx.rotate(0);
        };
        
        that.mapToScene = function(p0) {
            var p = {
                x: p0.x - that.transformOrigin.x,
                y: p0.y - that.transformOrigin.y
            };
            var r = {
                x: p.x * Math.cos(-that.angle) + p.y * Math.sin(-that.angle),
                y: (-p.x) * Math.sin(-that.angle) + p.y * Math.cos(-that.angle)
            };
            
            return {
                x: that.x + r.x + that.transformOrigin.x,
                y: that.y + r.y + that.transformOrigin.y
            };
        };
        
        that.mapFromScene = function(p0) {
            var to_s = that.mapToScene(that.transformOrigin);
            var p = {
                x: p0.x - to_s.x,
                y: p0.y - to_s.y
            };
            var r = {
                x: p.x * Math.cos(that.angle) + p.y * Math.sin(that.angle),
                y: (-p.x) * Math.sin(that.angle) + p.y * Math.cos(that.angle)
            };
            
            return {
                x: r.x + that.transformOrigin.x,
                y: r.y + that.transformOrigin.y
            };
        };
        
        that.startDrag = function (sx, sy) {
            that.dragStart = { x: sx - that.x, y: sy - that.y };
        };
        
        that.doDrag = function (sx, sy) {
            that.x = sx - that.dragStart.x;
            that.y = sy - that.dragStart.y;
        };
        
        that.checkMergeability = function (other) {
            // TODO
        };
    };
    
    Piece.prototype.x = 0;
    Piece.prototype.y = 0;
    Piece.prototype.angle = 0;
    Piece.prototype.dragStart = null;
    Piece.prototype.transformOrigin = null;
    Piece.prototype.grabbedTouches = null;
    
    return Piece;
    
})();

