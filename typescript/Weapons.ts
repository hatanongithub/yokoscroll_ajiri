import * as PIXI from "pixi.js";
import * as SGE from "./Scroll_Game_Engine"
export class Weapon extends PIXI.Sprite {
    constructor(texture, name) {
        super(texture);
        this.master = name;
        this.scale.x = this.master.Engine.grid / 50;
        this.scale.y = this.master.Engine.grid / 50;
        this.x = this.master.x;
        this.y = this.master.y;
        this.alpha = 0;
        this.Engine = this.master.Engine;
        this.Engine.gameScreen.addChild(this);
    }
    cool_down = 0;//技のフレームを計算するのに使う.
    start_up = 8;//技の発生フレーム
    continue = 25;//技の持続フレーム
    total = 40;//技の全体フレーム
    type = 0;//技の種類を判定
    power = 1;
    Engine = new SGE.ScrollGameEngine(0, 0, 0);
    master;
    fire() {
        if (this.cool_down < 0) {
            this.cool_down = this.total;
        }
    }
    act() { };
    attack(obj) { };
}

export class Melee extends Weapon {
    constructor(texture, master) {
        super(texture, master);
    };
    ab = 0;
    act() {
        if (this.cool_down > this.total - this.start_up) {//技の発生までのフレーム
            if (this.master.Vy > 0 && this.Engine.bool[2] == 1) {
                this.type = 1;
                this.start_up = 15;
                this.total = 50;
            }
        }
        else if (this.cool_down > this.total - this.start_up - this.continue) {//持続フレーム
            this.alpha = 1;
            this.Engine.enemies.forEach(obj => this.attack(obj))
            switch (this.type) {
                case 0:
                    this.texture = this.Engine.resources["image/weapon1.png"].texture
                    this.power = 10;
                    this.y = this.master.y;
                    break;
                case 1:
                    this.texture = this.Engine.resources["image/weapon2.png"].texture;
                    this.y = this.master.y;
                    this.power = 1;
                    if (this.master.Vy > 0) {
                        ++this.cool_down;
                        this.master.guard[1] = this.Engine.clock + 10;
                    }
                    else {
                        this.cool_down = 0;
                        this.master.freeze[1] = 10;
                    }
                    break;
            }
            this.x = this.master.x + Number(this.master.direct < 0) * this.master.width;
            this.scale.x = Math.sign(this.master.direct) * this.Engine.grid / 50;
        }

        else {
            this.alpha = 0;
            this.type = 0;
        }
        --this.cool_down;
    }
    attack(obj) {
        if (this.master.direct > 0 && this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.dammage(this.power);
        }
        else if (this.master.direct < 0 && this.x - this.width < obj.x + obj.width && this.x > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.dammage(this.power);
        }
    }
}

export class Gun extends Weapon {
    total = 10;
    start_up = 0;
    bullet_list = [];
    act() {
        this.y = this.master.y;
        this.x = this.master.x + Number(this.master.direct < 0) * this.master.width;
        this.alpha = 1;
        this.Engine.enemies.forEach(obj => this.attack(obj))
        this.scale.x = Math.sign(this.master.direct) * this.Engine.grid / 50;
        for (let i of this.bullet_list) {
            i.act();
        }
        if (this.cool_down == this.total) {
            const bullet = new Bullet(this.Engine.resources["image/bullet.png"].texture, this);
            bullet.speed *= Math.sign(this.master.direct)
            this.Engine.gameScreen.addChild(bullet);
            this.bullet_list.push(bullet)
        }
        --this.cool_down;
    };
}
export class Bullet extends Weapon {
    alpha = 1;
    speed = 6 ;
    life = 30;
    age = 0;
    constructor(texture, name) {
        super(texture, name);
        this.master.Engine.loop_function_list.push(this);
        this.age = this.Engine.clock;
    }
    act() {
        this.x += this.speed;
        this.Engine.enemies.forEach(obj => this.attack(obj))
        if (this.Engine.clock - this.age > this.life) {
            this.alpha = 0;
            this.master.bullet_list.splice(this.master.bullet_list.indexOf(this), 1);
        }
    }
    abc() {
        console.log("afja", this.x);
    }
    attack(obj) {
        if (this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.dammage(this.power);
            this.alpha = 0;
            this.master.bullet_list.splice(this.master.bullet_list.indexOf(this), 1);

        }
    }
}
export class Aura extends Weapon {
    target = this.Engine.enemies;
    attack(obj) {
        if (this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.dammage(this.power);
        }
    }
}