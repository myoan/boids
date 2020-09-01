export class Bird {
    x: number;
    y: number;
    v: number;
    dx: number;
    dy: number;
    eyeX: number;
    eyeY: number;
    width: number;
    height: number;
    graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        this.x = x;
        this.y = y;
        this.v = 10;
        this.dx = (Math.random() - 0.5) * this.v;
        this.dy = (Math.random() - 0.5) * this.v;
        this.width = scene.scale.width;
        this.height = scene.scale.height;
        this.eyeX = Math.random() * this.width;
        this.eyeY = Math.random() * this.height;
        this.graphics = scene.add.graphics();
    }

    update()
    {
        this.graphics.clear();
        console.log(`move: (${this.x}, ${this.y})`);

        this.updatePos();
        this.updateEyePos();
    }

    updatePos()
    {
        this.x += (this.eyeX - this.x) / 30;
        this.y += (this.eyeY - this.y) / 30;

        if (this.x > this.width) {
            this.x = 0;
        }
        if (this.x < 0) {
            this.x = this.width;
        }
        if (this.y > this.height) {
            this.y = 0;
        }
        if (this.y < 0) {
            this.y = this.height;
        }

        this.graphics.fillStyle(0x9966ff, 1);
        this.graphics.fillCircle(this.x, this.y, 10);
    }

    updateEyePos()
    {
        this.eyeX += this.dx;
        this.eyeY += this.dy;

        if (this.eyeX < 0 || this.eyeX > this.width) {
            this.dx *= -1;
            this.dy = (Math.random() - 0.5) * this.v;
        }
        if (this.eyeY < 0 || this.eyeY > this.height) {
            this.dx = (Math.random() - 0.5) * this.v;
            this.dy *= -1;
        }

        this.graphics.fillStyle(0xfb0000, 1);
        this.graphics.fillCircle(this.eyeX, this.eyeY, 2);
    }
}
