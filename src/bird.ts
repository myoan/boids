import { VectorFactory } from "matter";

export class Vector {
    constructor(public x: number, public y: number) {
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector {
        const x = this.x / this.magnitude();
        const y = this.y / this.magnitude();
        return new Vector(x, y);
    }

    add(v:Vector) {
        const x = this.x + v.x;
        const y = this.y + v.y;
        return new Vector(x, y);
    }
    
    sub(v:Vector): Vector {
        const x = this.x - v.x;
        const y = this.y - v.y;
        return new Vector(x, y);
    }

    mul(n: number): Vector {
        const x = this.x * n;
        const y = this.y * n;
        return new Vector(x, y);
    }

    div(n: number): Vector {
        const x = this.x / n;
        const y = this.y / n;
        return new Vector(x, y);
    }

    show(): string {
        return `(${this.x}, ${this.y})`;
    }

    cosign(v: Vector): number {
        return (this.x * v.x + this.y * v.y) / (Math.sqrt(this.x * this.x + this.y * this.y) * Math.sqrt(v.x * v.x + v.y * v.y))
    }
}

class Coordinate {
    pos: Vector;
    theta: number;
    constructor(pos: Vector, theta: number)
    {
        this.pos = pos;
        this.theta = theta;
    } 
    move(p: Vector)
    {
        const r = p.magnitude();
        const rad = this.theta * (Math.PI / 180);
        const xd = this.pos.x + r * Math.cos(rad);
        const yd = this.pos.y + r * Math.sin(rad);
        this.pos = new Vector(xd, yd);
    }

    rotate(d: number)
    {
        this.theta += d;
    }

    convertToWorld(pos: Vector): Vector
    {
        const rad = this.theta * (Math.PI / 180);
        const x = this.pos.x + Math.cos(rad) * pos.x - Math.sin(rad) * pos.y;
        const y = this.pos.y + Math.sin(rad) * pos.x + Math.cos(rad) * pos.y;
        return new Vector(x, y);
    }

    convertToLocal(pos: Vector): Vector
    {
        const s = pos.sub(this.pos);
        const rad = -1 * this.theta * (Math.PI / 180);
        const x = this.pos.x + Math.cos(rad) * pos.x - Math.sin(rad) * pos.y;
        const y = this.pos.y + Math.sin(rad) * pos.x + Math.cos(rad) * pos.y;
        return new Vector(x, y);
    }
}

export class Bird
{
    graphics: Phaser.GameObjects.Graphics;
    cood: Coordinate;
    v: number;
    rotate: number;
    width: number;
    height: number;
    sight: number;

    constructor(public id: number, scene: Phaser.Scene, x: number, y: number)
    {
        const theta = Math.floor(Math.random() * 360);
        this.cood = new Coordinate(new Vector(x, y), theta);
        this.v = 3;
        this.rotate = 0;
        this.width = scene.scale.width;
        this.height = scene.scale.height;
        this.graphics = scene.add.graphics();
        this.sight = 30;
    }

    destroy()
    {
        this.graphics.clear();
        this.graphics.destroy();
    }

    update(birds: Bird[])
    {
        const poses = birds.map( b => { return b.pos(); });
        const directions = birds.map( b => { return b.direction().sub(b.pos()); });
        this.graphics.clear();
        this.move();
        this.cohesion(poses);
        this.separation(poses);
        this.alignment(directions);
        this.updateGraphics();
    }

    cohesion(poses: Vector[])
    {
        const pos = this.pos();
        const inSightPos = poses.filter(p => {
            return p.sub(pos).magnitude() < 60;
        })
        if (inSightPos.length === 0) { return }

        let sum = new Vector(0, 0);
        inSightPos.forEach( p => { sum = sum.add(p); });
        const center = sum.div(inSightPos.length);
      
        /*
        this.graphics.fillStyle(0x92c312, 0.2);
        this.graphics.fillCircle(pos.x, pos.y, 60);

        this.graphics.lineStyle(2, 0x03c7ff, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(pos.x, pos.y);
        this.graphics.lineTo(center.x, center.y);
        this.graphics.closePath();
        this.graphics.strokePath();
        */

        const localCenter = this.cood.convertToLocal(center);
        this.v += 1;
        if (localCenter.y > 0) {
            this.cood.rotate(3);
        } else {
            this.cood.rotate(-3);
        }
    }

    separation(poses: Vector[])
    {
        const pos = this.pos();
        const inSightPos = poses.filter(p => {
            return p.sub(pos).magnitude() < 60;
        })
        if (inSightPos.length === 0) { return }

        let sum = new Vector(0, 0);
        inSightPos.forEach( p => { sum = sum.add(p); });
        const center = sum.div(inSightPos.length);
      
        /*
        this.graphics.fillStyle(0xb23302, 0.2);
        this.graphics.fillCircle(pos.x, pos.y, 20);
        */

        const localCenter = this.cood.convertToLocal(center);
        this.v -= 1;
        if (localCenter.y > 0) {
            this.cood.rotate(-10);
        } else {
            this.cood.rotate(10);
        }
    }

    alignment(directions: Vector[])
    {
        const pos = this.pos();
        const d = this.direction();
        /*
        this.graphics.lineStyle(2, 0x03c7ff, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(pos.x, pos.y);
        this.graphics.lineTo(d.x, d.y);
        this.graphics.closePath();
        this.graphics.strokePath();
        */

        const inSightDir = directions.filter(p => {
            return p.sub(pos).magnitude() < 60;
        })
        if (inSightDir.length === 0) { return }

        let sum = new Vector(0, 0);
        inSightDir.forEach( p => { sum = sum.add(p); });
        const aveDir = sum.div(inSightDir.length);

        const localAve = this.cood.convertToLocal(aveDir);
        if (localAve.y > 0) {
            this.cood.rotate(3);
        } else {
            this.cood.rotate(-3);
        }
   }

    move()
    {
        this.cood.move(new Vector(this.v, 0));
    }

    pos(): Vector
    {
        return this.convertToWorld();
    }

    direction(): Vector
    {
        return this.cood.convertToWorld(new Vector(20, 0));
    }

    updateGraphics()
    {
        const pos = this.pos();
        this.graphics.fillStyle(0x92c312, 1);
        this.graphics.fillCircle(pos.x, pos.y, 5);
    }

    convertToWorld(): Vector
    {
        const pos = new Vector(0, 0);
        return this.cood.convertToWorld(pos);
    }
}