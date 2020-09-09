import 'phaser';
import { Vector, Bird } from './bird';

export class BoidScene extends Phaser.Scene
{
    birds: Bird[];
    constructor()
    {
        super('boid');
        this.birds = [];
    }

    create()
    {
        for(let i = 0; i < 20; i++) {
            const point = this.spawnPoint();
            this.birds.push(new Bird(i, this, point.x, point.y));
        }
    }

    update()
    {
        this.birds.forEach((bird) => {
            if (this.outOfFrame(bird)) {
                bird.destroy();
                const id = bird.id;
                this.birds = this.birds.filter(b => b.id !== bird.id);
                const p = this.spawnPoint();
                this.birds.push(new Bird(id, this, p.x, p.y));
            } else {
                bird.update(this.birds.filter(b => b.id !== bird.id));
            }
        })
    }

    spawnPoint(): Vector {
        const r = Math.random();
        if (0 <= r && r < 0.25) {
            return new Vector(0, this.getRandom(600));
        } else if (0.25 <= r && r < 0.5) {
            return new Vector(800, this.getRandom(600));
        } else if (0.5 <= r && r < 0.75) {
            return new Vector(this.getRandom(800), 0);
        } else {
            return new Vector(this.getRandom(800), 600);
        }
    }

    getRandom(max: number): number {
        return Math.floor(Math.random() * max);
    }

    outOfFrame(bird: Bird): boolean {
        const pos = bird.pos();
        if (pos.x < 0 || pos.x > 800) { return true }
        if (pos.y < 0 || pos.y > 600) { return true }

        return false;
    }
}
