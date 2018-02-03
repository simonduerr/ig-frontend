var game = new Phaser.Game(800, 400, Phaser.AUTO, 'test', null, true, false);
var BasicGame = function (game) { };
BasicGame.Boot = function (game) { };
var isoGroup, cursorPos, cursor;
BasicGame.Boot.prototype =
    {
        preload: function () {
            game.load.image('tile', 'tile.png');
            game.time.advancedTiming = true;
            // Add and enable the plug-in.
            game.plugins.add(new Phaser.Plugin.Isometric(game));
            // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
            // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
            game.iso.anchor.setTo(0.5, 0.2);
        },
        create: function () {
            // Create a group for our tiles.
            isoGroup = game.add.group();
            // Let's make a load of tiles on a grid.
            this.spawnTiles();
            // Provide a 3D position for the cursor
            cursorPos = new Phaser.Plugin.Isometric.Point3();
        },
        update: function () {
            // Update the cursor position.
            // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
            // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
            game.iso.unproject(game.input.activePointer.position, cursorPos);
            // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
            isoGroup.forEach(function (tile) {
                var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);
                // If it does, do a little animation and tint change.
                if (!tile.selected && inBounds) {
                    tile.selected = true;
                    tile.tint = 0x86bfda;
                    game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
                }
                else if (tile.selected && !inBounds) {
                    tile.selected = false;
                    game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
                }
            });
        },
        render: function () {
            game.debug.text("Move your mouse around!", 2, 36, "#ffffff");
            game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
        },
        spawnTiles: function () {
            var tile;
            var map = [
                [1, 1, 0, 1, 0],
                [1, 1, 0, 1, 0],
                [1, 1, 0, 1, 0],
                [1, 0, 0, 1, 1],
                [0, 0, 0, 1, 1],
            ];
            var terrain = [
                0x55ff55,
                0xffff55
            ];
            var tiles_x = 5;
            var tiles_y = 5;
            var tiles_w = 36.57;
            for (var xx = 0; xx < tiles_x; xx++) {
                for (var yy = 0; yy < tiles_y; yy++) {
                    // Create a tile using the new game.add.isoSprite factory method at the specified position.
                    // The last parameter is the group you want to add it to (just like game.add.sprite)
                    tile = game.add.isoSprite(xx * 38, yy * 38, 0, 'tile', 0, isoGroup);
                    tile.tint = terrain[map[xx][yy]];
                    console.log(terrain[map[xx][yy]]);
                    tile.anchor.set(0.5, 0);
                }
            }
        }
    };
game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
//# sourceMappingURL=app.js.map