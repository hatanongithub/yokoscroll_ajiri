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
    continue = 20;//技の持続フレーム
    total = 40;//技の全体フレーム
    type = 0;//技の種類を判定
    power = 1;
    base = 1;
    cost = 0;//消費ポイント
    Engine = new SGE.ScrollGameEngine(0, 0, 0);
    master;
    direct;
    now;
    target = null;
    fire() {
        if (this.cool_down < 0) {
            this.cool_down = this.total;
            this.direct = this.master.direct;
            this.now = this.Engine.clock;
        }
    }
    act() { };
    attack(obj) { };
    delete() {
        this.alpha = 0;
    }
}

export class Melee extends Weapon {
    base = 1.5;
    constructor(master) {
        let texture = master.Engine.sheet.textures["weapon.png"];
        super(texture, master);
    };
    act() {
        this.x = this.master.x + (Number(this.master.direct < 0) * this.master.width);
        this.y = this.master.y;
        this.scale.x = Math.sign(this.master.direct) * this.Engine.grid / 50;
        if (this.Engine.clock - this.now < 9) {//技の発生までのフレーム
            if (this.master.Vy > 0 && this.Engine.bool[2] == 1) {
                this.type = 1;
                this.start_up = 15;
                this.total = 50;
            }
            if (this.direct != this.master.direct) {
                this.type = 2;
                this.start_up = 15;
                this.continue = 19;
                this.total = 80;
            }
            else {
                this.start_up = 2;
                this.continue = 15;
                this.total = 40;
            }
        }
        else if (this.Engine.clock - this.now == 9) {
            this.cool_down = this.total;
        }
        else if (this.cool_down > this.total - this.start_up) { }//発生までの隙
        else if (this.cool_down == this.total - this.start_up) {
            switch (this.type) {
                case 2:
                    break;
                default:
                    this.Engine.resources["sound/swing.mp3"].sound.play();
                    break;
            }
        }
        else if (this.cool_down > this.total - (this.start_up + this.continue)) {//持続フレーム
            this.alpha = 1;
            switch (this.type) {
                case 0:
                    this.texture = this.Engine.sheet.textures["weapon.png"];
                    this.power = 1 * this.base;
                    this.angle += 0.2 * this.master.direct;
                    break;
                case 1:
                    this.texture = this.Engine.sheet.textures["weapon2.png"];
                    this.power = 2 * this.base;
                    if (this.master.Vy > 0) {
                        ++this.cool_down;
                        this.master.guard[1] = this.Engine.clock;
                    }
                    else {
                        this.cool_down = 20;
                        this.master.freeze[1] = 10;
                    }
                    break;
                case 2:
                    this.texture = this.Engine.sheet.textures["weapon1.png"];
                    this.power = 2 * this.base;
                    break;
            }
            this.Engine.enemies.forEach(obj => this.attack(obj))
        }

        else {
            this.alpha = 0;
            this.type = 0;
            this.angle = 0;
        }
        --this.cool_down;
    }
    attack(obj) {
        if (this.master.direct > 0 && this.x < obj.x + obj.width && this.x + this.width > obj.x && (this.y + this.height) > obj.y && (this.y < obj.y + obj.height)) {
            obj.dammage(this.power);
        }
        else if (this.master.direct < 0 && this.x - this.width < obj.x + obj.width && this.x > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.dammage(this.power);
        }
    }
}

export class Gun extends Weapon {
    total = 20;
    start_up = 0;
    bullet_list = [];
    attenuation = 0;
    range = 0;
    pellet = 0;
    power = 0;
    cost = 0;
    blt = null;
    constructor(master) {
        let texture = master.Engine.sheet.textures["gun.png"];
        super(texture, master);
    };
    act() {
        this.y = this.master.y;
        this.x = this.master.x + Number(this.master.direct < 0) * this.master.width;
        this.alpha = 1;
        //this.Engine.enemies.forEach(obj => this.attack(obj))
        this.scale.x = Math.sign(this.master.direct) * this.Engine.grid / 50;
        for (let i of this.bullet_list) {
            i.act();
        }
        if (this.cool_down == this.total) {
            this.shot();
        }
        --this.cool_down;
    };
    shot() {
        let bullet = null;
        if (this.blt || this.target) {
            bullet = bullet_return(this.blt, this);
            bullet.cost = -100
        }
        else {
            bullet = bullet_return(this.Engine.game_data.bullet, this);
        }
        if (this.target) {
            bullet.target = this.target;
        }
        if (this.Engine.KP >= bullet.cost + this.cost) {
            bullet.speed *= Math.sign(this.master.direct)
            bullet.x = this.x + this.width * Math.sign(this.master.direct);
            this.Engine.gameScreen.addChild(bullet);
            this.bullet_list.push(bullet)

            if (!this.target) {
                this.Engine.resources["sound/shoot.mp3"].sound.play();
                this.Engine.change_KP(this.Engine.KP - (bullet.cost + this.cost));
            }
            else {
                this.Engine.resources["sound/shoot.mp3"].sound.play({ volume: 0.1 })
            }
            bullet.attenuation = this.attenuation;
            bullet.life += this.range;
            bullet.power *= (1 + this.power);
        }
        else {
            bullet.alpha = 0;
        }
    }
    delete(): void {
        this.alpha = 0;
        for (let i of this.bullet_list) {
            i.delete();
        }
    }
}

export class Rifle extends Gun {
    total = 30;
    range = 20;
    power = 0.8;
    cost = 10;
    act() {
        this.y = this.master.y;
        this.x = this.master.x + Number(this.master.direct < 0) * this.master.width;
        this.alpha = 1;
        this.Engine.enemies.forEach(obj => this.attack(obj))
        this.scale.x = Math.sign(this.master.direct) * this.Engine.grid / 50;
        for (let i of this.bullet_list) {
            i.act();
        }
        if (this.cool_down == this.total - 4 || this.cool_down == this.total - 8 || this.cool_down == this.total - 12) {
            this.shot();
        }

        --this.cool_down;
    };
}

export class Sniper extends Gun {
    attenuation = -0.07;
    range = 60;
}

export class MachineGun extends Gun {
    total = 3;
}

export class ShotGun extends Gun {
    pellet = 10;
    range = -5;
    total = 60;
    attenuation = 0.1;
    power = 1;
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
            for (let i = 0; i < this.pellet; ++i) {
                this.shot();
            }
        }
        --this.cool_down;
    };
}


export class Launcher extends Weapon {
    constructor(master) {
        let texture = master.Engine.sheet.textures["gun.png"];
        super(texture, master);
    };
    total = 90;
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
        if (this.cool_down == this.total && !!this.Engine.enemies[0]) {
            const bullet = new Missile(this);
            bullet.speed *= Math.sign(this.Engine.enemies[0].x - this.master.x);
            this.Engine.gameScreen.addChild(bullet);
            this.bullet_list.push(bullet)
            this.Engine.resources["sound/missile.mp3"].sound.play();
        }
        --this.cool_down;
    };
}

export class Bullet extends Weapon {
    alpha = 1;
    speed = 6;
    life = 30;
    age = 0;
    cost = 20;
    power = 1;
    penetrate = 0;
    attenuation = 0;
    knock_back = -1;
    unique_name;
    constructor(name) {
        let texture = name.Engine.sheet.textures["bullet.png"];
        super(texture, name);
        this.master.Engine.loop_function_list.push(this);
        this.age = this.Engine.clock;
        this.unique_name = Math.random();
    }
    act() {
        this.x += this.speed;
        this.power -= this.attenuation;
        if (this.target) {
            this.attack(this.Engine.chara)
        }
        else {
            this.Engine.enemies.forEach(obj => this.attack(obj))
        }
        if (this.Engine.clock - this.age > this.life) {
            this.delete();
        }
    }
    attack(obj) {
        if (this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.guard[1] = this.Engine.clock - obj.guard[0] - 1;
            obj.knockback_effect = this.knock_back;
            obj.dammage(this.power);
            obj.knockback_effect = 0;
            if (!this.penetrate) {
                this.delete();
            }
            else {
                this.penetrate -= 1;
                this.alpha = 0;
            }
        }
    }
    delete() {
        if (this.master.bullet_list.indexOf(this) != -1) {//存在しないのに消去すると弾の画像が残る
            this.speed = 0;
            this.alpha = 0;
            this.master.bullet_list.splice(this.master.bullet_list.indexOf(this), 1);
        }
    }
}

export class BreakBullet extends Bullet {
    power = 0.2;
    cost = 0;
    constructor(name) {
        super(name);
    }
    attack(obj) {
        if (this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.guard[1] = this.Engine.clock - obj.guard[0] - 1;
            obj.knockback_effect = -1;
            obj.weakness += 1;
            obj.dammage(this.power);
            obj.knockback_effect = 0;
            if (!this.penetrate) {
                this.delete();
            }
            else {
                this.penetrate -= 1;
            }
        }
    }
}
export class LightBullet extends Bullet {
    power = 0.2;
    cost = 5;
    attack(obj) {
        if (this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.guard[1] = this.Engine.clock - obj.guard[0] - 1;
            obj.knockback_effect = -1;
            obj.dammage(this.power);
            obj.knockback_effect = 0;
            if (!this.penetrate) {
                this.delete();
            }
            else {
                this.penetrate -= 1;
            }
        }
    }
}
export class ToyBullet extends Bullet {
    power = 0;
}

export class Missile extends Bullet {
    enemy;

    life = 120;
    Vy = -50;
    power = 7;
    penetrate = 1;
    constructor(name) {
        super(name);
        this.master.Engine.loop_function_list.push(this);
        this.age = this.Engine.clock;
        this.enemy = this.Engine.enemies[0];
        this.texture = name.Engine.sheet.textures["missile.png"];
    }
    act() {
        if (this.Vy >= 0) {
            this.x = this.enemy.x + 7 * Math.random();
        }
        else {
            this.x += this.speed;
        }
        this.y += this.Vy;
        this.Vy += 3;
        this.Vy = Math.min(this.Vy, 6);
        this.Engine.enemies.forEach(obj => this.attack(obj))
        if (this.Engine.clock - this.age > this.life) {
            this.alpha = 0;
            this.delete();
        }
    }
}
export class Rocket extends Bullet {
    life = 2000;
    speed = 2;
    penetrate = 5000;
}
export class Aura extends Weapon {
    target = this.Engine.enemies;
    attack(obj) {
        if (this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
            obj.dammage(this.master.power);
        }
    }
}
export class Dummy extends Aura {
    constructor(master) {
        super(null, master)
    }
    attack(obj: any): void {
        //do_nothing
    }
}

export function melee_return(name, master) {
    switch (name) {
        case "Melee":
            return new Melee(master);
    }
}
export function gun_return(name, master) {
    switch (name) {
        case "Gun":
            return new Gun(master);
        case "ShotGun":
            return new ShotGun(master);
        case "Rifle":
            return new Rifle(master);
    }
}
export function bullet_return(name, master) {
    switch (name) {
        case "Bullet":
            return new Bullet(master);
        case "LightBullet":
            return new LightBullet(master);
        case "BreakBullet":
            return new BreakBullet(master);
        case "ToyBullet":
            return new ToyBullet(master);
        case "Robot":
            return new SGE.Robot(master);
    }
}