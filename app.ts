/// <reference path="phaser.d.ts"/>
class BasicGame {
    game: Phaser.Game;
    tiles = [[], [], [], [], [], []];
    isoGroup;
    cursorPos;
    cursor;

    constructor() {
        this.game = new Phaser.Game(800, 400, Phaser.CANVAS, 'content', {
            create: this.create,
            preload: this.preload,
            render: this.render,
            update: this.update
        }, true, false, null);
    }

    preload = () => {
        this.game.load.image('tile', 'tile.png');

        this.game.time.advancedTiming = true;
        this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        this.game.iso.anchor.setTo(0.5, 0.2);

    };
    create = () => {
        // Create a group for our tiles.
        this.isoGroup = this.game.add.group();

        // Let's make a load of tiles on a grid.
        this.spawnTiles();

        // Provide a 3D position for the cursor
        this.cursorPos = new Phaser.Plugin.Isometric.Point3();
    };
    update = () => {
        if(this.game.input.activePointer.leftButton.isDown)
        {
            // Update the cursor position.
            // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
            // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
            this.game.iso.unproject(this.game.input.activePointer.position, this.cursorPos);

            // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
            this.isoGroup.forEach((tile) => {
                let inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
                // If it does, do a little animation and tint change.
                if (!tile.selected && inBounds) {
                    tile.selected = true;
                    this.onDown(tile);
                    this.game.add.tween(tile).to({isoZ: 4}, 200, Phaser.Easing.Quadratic.InOut, true);
                }
                // If not, revert back to how it was.
                else if (tile.selected && !inBounds) {
                    tile.selected = false;
                    this.game.add.tween(tile).to({isoZ: 0}, 200, Phaser.Easing.Quadratic.InOut, true);
                }
            });
        }
    };
    render = () => {
        this.game.debug.text("Move your mouse around!", 2, 36, "#ffffff");
        this.game.debug.text(this.game.time.fps || '--', 2, 14, "#a7aebe");
    };
    spawnTiles = () => {
        $.ajax({
            dataType: "json",
            url: 'http://localhost:8000/tiles/all',
            success: (data) => {
                let terrain = [
                    0x55ff55, //grass
                    0xffff55, //sand
                    0x555555, //rock
                    0x5555ff  //water
                ];

                $.each(data, (i, element) => {
                    this.tiles[element.y][element.x] = element;
                });
                let tiles_x = 5;
                let tiles_y = 5;
                let tiles_w = 36.57;
                this.tiles.forEach((row, yy) => {
                    row.forEach((element, xx) => {
                        let tile = this.game.add.isoSprite(xx * 38, yy * 38, 0, 'tile', 0, this.isoGroup);
                        tile.tint = terrain[element.terrain];
                        tile.anchor.set(0.5, 0);
                        tile.inputEnabled = true;
                        tile.customId = element.id;
                    });
                });
            }
        });
    };

    onDown(sprite) {
        sprite.alpha = 0.5;
        console.log('onDown');
        console.log(sprite.customId);
    }
}


window.onload = () => {
    let game = new BasicGame();
};
