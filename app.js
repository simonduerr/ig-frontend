/// <reference path="phaser.d.ts"/>
var BasicGame = /** @class */ (function () {
    function BasicGame() {
        var _this = this;
        this.tiles = [[], [], [], [], [], []];
        this.preload = function () {
            _this.game.load.image('tile', 'tile.png');
            _this.game.time.advancedTiming = true;
            _this.game.plugins.add(new Phaser.Plugin.Isometric(_this.game));
            // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
            // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
            _this.game.iso.anchor.setTo(0.5, 0.2);
        };
        this.create = function () {
            // Create a group for our tiles.
            _this.isoGroup = _this.game.add.group();
            // Let's make a load of tiles on a grid.
            _this.spawnTiles();
            // Provide a 3D position for the cursor
            _this.cursorPos = new Phaser.Plugin.Isometric.Point3();
        };
        this.update = function () {
            if (_this.game.input.activePointer.leftButton.isDown) {
                // Update the cursor position.
                // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
                // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
                _this.game.iso.unproject(_this.game.input.activePointer.position, _this.cursorPos);
                // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
                _this.isoGroup.forEach(function (tile) {
                    var inBounds = tile.isoBounds.containsXY(_this.cursorPos.x, _this.cursorPos.y);
                    // If it does, do a little animation and tint change.
                    if (!tile.selected && inBounds) {
                        tile.selected = true;
                        _this.onDown(tile);
                        _this.game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
                    }
                    else if (tile.selected && !inBounds) {
                        tile.selected = false;
                        _this.game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
                    }
                });
            }
        };
        this.render = function () {
            _this.game.debug.text("Move your mouse around!", 2, 36, "#ffffff");
            _this.game.debug.text(_this.game.time.fps || '--', 2, 14, "#a7aebe");
        };
        this.spawnTiles = function () {
            $.ajax({
                dataType: "json",
                url: 'http://localhost:8000/tiles/all',
                success: function (data) {
                    var terrain = [
                        0x55ff55,
                        0xffff55,
                        0x555555,
                        0x5555ff //water
                    ];
                    $.each(data, function (i, element) {
                        _this.tiles[element.y][element.x] = element;
                    });
                    var tiles_x = 5;
                    var tiles_y = 5;
                    var tiles_w = 36.57;
                    _this.tiles.forEach(function (row, yy) {
                        row.forEach(function (element, xx) {
                            var tile = _this.game.add.isoSprite(xx * 38, yy * 38, 0, 'tile', 0, _this.isoGroup);
                            tile.tint = terrain[element.terrain];
                            tile.anchor.set(0.5, 0);
                            tile.inputEnabled = true;
                            tile.customId = element.id;
                        });
                    });
                }
            });
        };
        this.game = new Phaser.Game(800, 400, Phaser.CANVAS, 'content', {
            create: this.create,
            preload: this.preload,
            render: this.render,
            update: this.update
        }, true, false, null);
    }
    BasicGame.prototype.onDown = function (sprite) {
        sprite.alpha = 0.5;
        console.log('onDown');
        console.log(sprite.customId);
    };
    return BasicGame;
}());
window.onload = function () {
    var game = new BasicGame();
};
//# sourceMappingURL=app.js.map