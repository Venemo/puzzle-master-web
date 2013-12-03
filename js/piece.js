
PM = typeof(PM) === "undefined" ? {} : PM;

PM.Piece = (function () {

    var Piece = function Piece (image, px, py, supposedPosition) {
        this.image = image;
        this.px = px;
        this.py = py;
        
        this.supposedPosition = supposedPosition;
        this.x = this.supposedPosition.x;
        this.y = this.supposedPosition.y;
        this.transformOrigin = { x: image.width / 2, y: image.height / 2 };
        this.grabbedTouches = [];
        
        var that = this;
        
        that.containsPoint = function (sx, sy) {
            // Transform coordinates to the coordinate system of the piece
            var p = that.mapFromScene({ x: sx, y: sy });
            
            // Rule out cases when the user clicked outsite the image
            if (p.x < 0 || p.x > that.image.width || p.y < 0 || p.y > that.image.height) {
                return false;
            }
            
            // Check canvas image data
            var ctx = that.image.getContext('2d');
            var imageData = ctx.getImageData(p.x, p.y, 1, 1);
            return imageData.data[3] > 0;
            
            // TODO: skip checking image data for obvious places (like, the rectangle which surely doesn't belong to neither tabs nor blanks
        };
        
        that.draw = function (ctx) {
            ctx.save();
            ctx.translate(that.x, that.y);
            ctx.rotate(that.angle);
            ctx.drawImage(that.image, 0, 0);
            ctx.restore();
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
    Piece.prototype.angle = 0;// = Math.PI / 6;
    Piece.prototype.dragStart = null;
    Piece.prototype.transformOrigin = null;
    Piece.prototype.grabbedTouches = null;
    
    return Piece;
    
})();

