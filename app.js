/// <reference path="phaser.d.ts"/>
/// <reference path="phaser.plugin.isometric.d.ts"/>
var IsoSprite = Phaser.Plugin.Isometric.IsoSprite;
var BasicGame = /** @class */ (function () {
    function BasicGame() {
        var _this = this;
        this.tiles = [[], [], [], [], [], []];
        this.builtObjects = {};
        this.clickableObjects = [];
        this.preload = function () {
            _this.game.load.image('tile', 'tile.png');
            _this.game.load.image('house1', 'tile-house.png');
            _this.game.time.advancedTiming = true;
            _this.game.plugins.add(new Phaser.Plugin.Isometric(_this.game));
            // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
            // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
            _this.game.iso.anchor.setTo(0.5, 0.2);
            _this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        };
        this.create = function () {
            // Create a group for our tiles.
            _this.isoGroup = _this.game.add.group();
            _this.clickableGroup = _this.game.add.group();
            _this.spawnTiles();
            // Provide a 3D position for the cursor
            _this.cursorPos = new Phaser.Plugin.Isometric.Point3();
            // this.clickableGroup.enableBody = true;
            // this.clickableGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;
        };
        this.update = function () {
            if (_this.game.input.activePointer.leftButton.justReleased(20)) {
                //TODO: 1. check buttons
                //2. check builtObjects
                // Update the cursor position.
                // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
                // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
                _this.game.iso.unproject(_this.game.input.activePointer.position, _this.cursorPos);
                var selectedObject_1 = null;
                _this.clickableGroup.forEach(function (builtObject) {
                    var inBounds = builtObject.isoBounds.containsXY(_this.cursorPos.x, _this.cursorPos.y);
                    if (!selectedObject_1 && !builtObject.selected && inBounds) {
                        builtObject.selected = true;
                        _this.game.add.tween(builtObject).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
                        selectedObject_1 = builtObject;
                        console.log(builtObject.isoBounds);
                        console.log(_this.cursorPos);
                        console.log(selectedObject_1.customId);
                    }
                });
                if (!selectedObject_1) {
                    //3. check tiles
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
            }
        };
        this.render = function () {
            _this.game.debug.text("Move your mouse around!", 2, 36, "#ffffff");
            _this.game.debug.text(_this.game.time.fps || '--', 2, 14, "#a7aebe");
            _this.clickableGroup.forEach(function (tile) {
                _this.game.debug.body(tile, "#00dd00", false);
            });
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
                    var buildingSprites = {
                        1: 'house1',
                        2: 'house1'
                    };
                    var buildingColors = {
                        1: 0xff9999,
                        2: 0xff2222
                    };
                    console.log(data);
                    $.each(data.builtObjects, function (i, element) {
                        _this.builtObjects[element.id] = element;
                    });
                    $.each(data.tiles, function (i, element) {
                        _this.tiles[element.y][element.x] = element;
                    });
                    _this.tiles.forEach(function (row, yy) {
                        row.forEach(function (element, xx) {
                            var tile = _this.game.add.isoSprite(xx * 38, yy * 38, 0, 'tile', 0, _this.isoGroup);
                            tile.tint = terrain[element.terrain];
                            tile.anchor.set(0.5, 0);
                            tile.inputEnabled = true;
                            tile.customId = element.id;
                            tile.builtObject = element.builtObject;
                            if (element.builtObject) {
                                console.log(element.builtObject);
                                var building = _this.builtObjects[element.builtObject];
                                var builtObject = _this.game.add.isoSprite(xx * 38, yy * 38, 0, buildingSprites[building.object], 0, _this.clickableGroup);
                                builtObject.anchor.set(0.5, 0.5);
                                builtObject.tint = buildingColors[building.object];
                                builtObject.customId = element.builtObject;
                                builtObject.inputEnabled = true;
                                _this.clickableObjects.push(builtObject);
                            }
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