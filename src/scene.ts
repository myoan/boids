import 'phaser';
import { Bird } from './bird';

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
        console.log('hello boid!');
        this.birds.push(new Bird(this, 300, 120));
    }

    update()
    {
        this.birds.forEach((bird) => {
            bird.update();
        })
    }

}
