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
        if (localCenter.y > 0) {
            this.cood.rotate(5);
        } else {
            this.cood.rotate(-5);
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
            this.cood.rotate(5);
        } else {
            this.cood.rotate(-5);
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

/*
export class Bird {
    v: number;
    pos: Vector;
    vel: Vector;
    sightRange: number;
    range: number;
    width: number;
    height: number;
    graphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        this.pos = new Vector(x, y);
        this.v = 4;
        this.vel = new Vector((Math.random() - 0.5) * this.v, (Math.random() - 0.5) * this.v); 
        this.range = 6;
        this.sightRange = 30;
        this.width = scene.scale.width;
        this.height = scene.scale.height;
        this.graphics = scene.add.graphics();
    }

    update()
    {
        this.graphics.clear();
        this.updatePos();
        // this.showDirection();
        this.getWall2();
        this.yaw();
    }

    updatePos()
    {
        this.pos = this.pos.add(this.vel);

        if (this.pos.x > this.width) {
            this.pos.x = 0;
        }
        if (this.pos.x < 0) {
            this.pos.x = this.width;
        }
        if (this.pos.y > this.height) {
            this.pos.y = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = this.height;
        }

        this.graphics.fillStyle(0x9966ff, 1);
        this.graphics.fillCircle(this.pos.x, this.pos.y, this.range);
    }

    yaw()
    {
        const wall = this.getWall2();
        const r = wall.sub(this.pos);
        if (r.magnitude() > this.sightRange) { return }
        if (this.vel.cosign(r) < 0) { return }

        const r2 = this.vel.sub(r.normalize().mul(this.vel.magnitude())).normalize().mul(3);
        const yaw = this.vel.add(r2).normalize().mul(this.vel.magnitude() * Math.random() / 3);
        this.vel = this.vel.add(yaw).normalize().mul(this.vel.magnitude());
    }

    showDirection() {
        const v = this.vel.normalize().mul(15);

        this.graphics.lineStyle(2, 0x03ffff, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(this.pos.x, this.pos.y);
        this.graphics.lineTo(this.pos.x + v.x, this.pos.y + v.y);
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    getWall2(): Vector {
        const directions: Vector[] = [
            new Vector(this.pos.x, 0),           // TOP
            new Vector(this.width, this.pos.y),  // RIGHT
            new Vector(this.pos.x, this.height), // BOTTOM
            new Vector(0, this.pos.y)            // LEFT
        ]

        const nearLine = directions.sort((d1, d2) => {
            const m1 = d1.sub(this.pos).magnitude()
            const m2 = d2.sub(this.pos).magnitude()
            if (m1 > m2) {
                return 1;
            } else {
                return -1;
            }
        })[0]

        if (this.vel.cosign(nearLine) > 0) {
            this.graphics.lineStyle(2, 0x1bab1b, 1);
        } else {
            this.graphics.lineStyle(2, 0xab1b0a, 1);
        }
        this.graphics.beginPath();

        this.graphics.moveTo(this.pos.x, this.pos.y);
        this.graphics.lineTo(nearLine.x, nearLine.y);
        this.graphics.closePath();
        this.graphics.strokePath();

        return nearLine;
    }
}
*/