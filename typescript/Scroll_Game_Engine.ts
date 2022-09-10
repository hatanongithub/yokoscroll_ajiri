import * as PIXI from "pixi.js";
import { SceneManager } from "./scene_manager"; // シーン管理を行うクラスをインポート
import { createButton } from "./create_button"; // ボタン生成関数をインポート
import * as Weapons from "./Weapons"
export class ScrollGameEngine {
    constructor(resources, app, input, stage = [], bool = [], gameScene = null) {
        if (resources) {
            this.resources = resources;
            this.app = app;
            this.bool = bool;
            this.is_true = 1;
            this.selected = input;
            this.stage = stage;
            this.gameScene = gameScene;
            this.gameScene.sortableChildren = true;
            this.buildStage();
            this.gameScene.addChild(this.gameScreen)
            this.chara_gen();
            this.enemy_spawn(200, 200);
            this.build_statusbar();
            this.statusbar.zIndex = 1;
        }
    }
    resources = [];
    grid = 35;//グリッド幅
    gravity = 0.3 * this.grid / 50;
    map_sizex = 120;
    map_sizey = 11;
    base_line = 1;
    is_true = 0;
    gameScene = null;



    back;//背景画像
    stage = [];
    tiles = [];//ステージタイルを格納
    clock = 0;//時間を管理．フレーム秒
    chara;
    enemies = [];
    bool = [0, 0, 0];//コントローラーの入力
    enemy_area = [];//敵出現候補地点を記録
    gameScreen = new PIXI.Container;//キャラの移動に応じてスクロールするコンテナ
    statusbar;
    selected = [1]
    app;
    function_list;
    loop_function_list = [];
    camera(position) {
        let x = position[0];
        let y = position[1];
        this.back.x -= x / (this.grid * this.map_sizex) * (this.back.width - this.app.screen.width);
        this.gameScreen.x -= x;
        this.gameScreen.y = -y;
    }
    buildStage() {
        for (let i = 0; i < this.map_sizey; ++i) {
            this.tiles[i] = new Array();
            for (let j = 0; j < this.map_sizex; ++j) {
                const tile = new Tile({ texture: this.resources["image/tile0.png"].texture, resources: this.resources, selected: this.selected });
                tile.x = j * this.grid;
                tile.y = (i - this.base_line) * this.grid;
                tile.scale.x *= this.grid / 50;
                tile.scale.y *= this.grid / 50;
                tile.interactive = false;
                tile.on("click", tile.onClick);
                tile.position_this = [i, j];
                if (this.stage[i][j]) {
                    tile.state = this.stage[i][j]
                    tile.texture = this.resources["image/tile" + this.stage[i][j] % 10 + ".png"].texture;
                    tile.alpha = 1;
                    tile.obstacle = 1
                }
                if (this.stage[i][j] == 2) {
                    this.enemy_area.push([j * this.grid, (i - this.base_line) * this.grid]);
                    tile.alpha = 0;
                    tile.obstacle = 0;
                }
                this.gameScreen.addChild(tile);
                this.tiles[i].push(tile);
                if (!!this.enemy_area.length) {
                    this.enemy_area.sort(function (first, second) {
                        if (first[0] > second[0]) return 1;
                        else return -1;

                    });
                }
            };
        }
    }
    controller() {

    }
    chara_gen() {
        const chara = new Hero(this.resources["image/chara1.png"].texture, this);
        chara.x = 50; // x座標
        chara.y = 20; // y座標
        chara.is_hero = 1;
        chara.speed = 2;
        chara.scale.x *= this.grid / 50;
        chara.scale.y *= this.grid / 50;
        chara.knockback = 6;
        this.gameScreen.addChild(chara);
        this.chara = chara;
    }
    block_convert() {

    }
    enemy_spawn(x, y) {
        const enemy = new Enemy(this.resources["image/enemy1.png"].texture, this)
        enemy.x = x;
        enemy.y = y + this.grid - enemy.height;
        enemy.scale.x *= this.grid / 50;
        enemy.scale.y *= this.grid / 50;
        enemy.target = this.chara;
        this.gameScreen.addChild(enemy);
        this.enemies.push(enemy);
    }
    build_statusbar() {
        const statusbar = new StatusBar(this)
        this.gameScene.addChild(statusbar);
        this.statusbar = statusbar;
    }
}

export class Tile extends PIXI.Sprite {
    alpha = 0;
    obstacle = 0;
    state = 0;
    action = 0;
    gravity = 0;
    variety = 7;
    position_this = [0, 0];
    resources = [];
    stage = [];
    selected = [];
    /**
     * 
     * @param texture デフォルトのテクスチャ
     * @param resources PIXI.loader.shared.loadより出力されるリスト
     * @param stage_data ステージ情報の配列
     * @param selected 現在押されているキー
     */
    constructor({ texture, resources, selected = [] }) {
        super(texture);
        this.resources = resources;
        this.selected = selected;
    }
    onClick() {
        this.change(this.selected[0]);
    }
    change(num: number) {
        console.log(this.selected, "selected");
        this.state = num;
        this.texture = this.resources["image/tile" + num + ".png"].texture;
        this.stage[this.position_this[0]][this.position_this[1]] = this.state;
        if (num != 0) {
            this.obstacle = 1;
            this.alpha = 1;
        }
        else {
            this.obstacle = 0;
        }
    }
}
export class Chara extends PIXI.Sprite {
    Engine = new ScrollGameEngine(0, 0, 0);//親となるゲームエンジンを初期化.
    freeze = [20, -1];//硬直時間，カウント用変数
    is_hero = 0;
    is_jump = 0;
    vulnerable = 1;
    guard = [50, 0];//被ダメ後無敵フレーム，計算用変数
    knockback = 2;
    img = "chara"
    base_line = 0;
    speed = 1;
    Vx = 1;
    Vy = 0;
    VVx = 0;//入力を記録
    direct = 1;//方向を管理
    health = 5;
    some_num1 = 10;//めり込み防止で使う．これがないとfloor関数の値が大きくなりすぎる.
    wall_stop = this.speed + 1;//めり込み防止
    state = "none";//壁に激突しているかどうか
    flag = 0;//先に壁に当たっているかなどのフラグ
    is_hit = 1;
    is_move = 0;
    alive = 1;
    gravity = this.Engine.gravity;
    target;

    now = 0;//撤退速度の計算に使う．時刻
    constructor(texture, Engine) {
        super(texture);
        this.Engine = Engine;
        this.base_line = Engine.base_line;
        this.gravity = Engine.gravity;
        this.effect = new Weapons.Melee(this.Engine.resources["image/weapon.png"].texture, this);
    }
    front_brank = 2 * this.Engine.grid / 50;
    back_brank = 2 * this.Engine.grid / 50;
    effect;
    aura = new Weapons.Aura(this.texture, this);
    input() {

    }
    leftside() { }
    move() {
        let beforex = this.x;
        this.Vy += this.gravity;
        //this.x += commute;
        let afterx = this.x;
        let aftery = this.y;
        this.flag = 0;
        afterx += this.Vx;
        if (afterx + this.back_brank - this.wall_stop < 0) {
            this.Vx = 0;
            this.leftside()
            afterx = this.x;
        }
        aftery += this.Vy;
        if (aftery + this.height > this.Engine.back.height - this.some_num1) {
            aftery = this.Engine.back.height - this.height - this.some_num1;
            this.alive = 0;
        }
        if (aftery < 6 - this.Engine.grid * this.base_line) {
            aftery = 6 - this.Engine.grid * this.base_line;

        }
        let aafterx = afterx;
        let aaftery = aftery;//こっちで判定しないとワープする.
        if (!this.is_hero) {
            this.VVx = this.Vx;
        }
        if (this.alive) {
            if (this.Vy > 0) {//下向き
                if (this.VVx > 0 || this.direct > 0) {
                    if (this.Engine.tiles[Math.floor((aaftery + this.height - this.some_num1) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid)].obstacle == 1) {
                        afterx = Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid) * this.Engine.grid - this.width + this.front_brank - this.wall_stop;
                        this.state = "left";
                        this.flag = 1;
                    }
                    if (this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank - 1) / this.Engine.grid)].obstacle == 1) {//床 -1を付けないと壁にもたれたときに摩擦みたいになる．
                        aftery = Math.max((Math.floor((aaftery + this.height) / this.Engine.grid)) * this.Engine.grid - this.height, this.y);
                        this.Vy = 0;
                        this.is_jump = 0;
                        if (!this.flag) {
                            this.state = "none";
                        }
                    }
                }
                else if (this.VVx < 0) {
                    if (this.Engine.tiles[Math.floor((aaftery + this.height - this.some_num1) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank - this.wall_stop) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank - this.wall_stop) / this.Engine.grid)].obstacle == 1) {
                        afterx = Math.floor((aafterx + this.back_brank - this.wall_stop) / this.Engine.grid + 1) * this.Engine.grid - this.back_brank + this.wall_stop;
                        this.state = "right"
                        this.flag = 1;
                    }
                    if (this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / this.Engine.grid)].obstacle == 1) {
                        aftery = Math.max(Math.floor((aaftery + this.height) / this.Engine.grid) * this.Engine.grid - this.height, this.y);
                        this.Vy = 0;
                        this.is_jump = 0;
                        if (!this.flag) {
                            this.state = "none";
                        }
                    }
                }
                else {//自由落下
                    if (this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / this.Engine.grid)].obstacle == 1) {
                        aftery = Math.min(Math.floor((aaftery + this.height) / this.Engine.grid) * this.Engine.grid - this.height, this.y);
                        this.Vy = 0;
                        this.is_jump = 0;
                    }
                    if (this.state == "left" && (this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / this.Engine.grid)].obstacle == 0) &&
                        this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / this.Engine.grid)].obstacle == 0) {
                        this.state = "none"
                    }
                    else if (this.state == "right" && (this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 0) &&
                        this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 0) {
                        this.state = "none"
                    }


                }
            }
            else if (this.Vy < 0) {//上向き
                if (this.VVx > 0 || this.Vx > 0) {//右向き
                    if (this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid)].obstacle == 1) {
                        afterx = Math.max(Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid) * this.Engine.grid - this.width + this.front_brank - this.wall_stop, beforex);
                        this.state = "left";
                        this.flag = 1;
                    }
                    if (this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank - 1) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 1) { //頭をぶつける
                        this.Vy = 0;
                        aftery = Math.floor((aaftery) / this.Engine.grid + 1) * this.Engine.grid;
                        if (!this.flag) {
                            this.state = "none";
                        }
                    }
                    else {
                        this.state = "none";//右側の壁に密着した状態でその場ジャンプをすると，その後に右に入力しながらジャンプしても前に進めないバグの対策．
                    }
                }
                else if (this.VVx < 0 || this.Vx < 0) {//左向き
                    if (this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank - this.wall_stop) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank - this.wall_stop) / this.Engine.grid)].obstacle == 1) {//壁にぶつかる
                        afterx = Math.min(Math.floor((aafterx + this.back_brank - this.wall_stop) / this.Engine.grid + 1) * this.Engine.grid - this.back_brank + this.wall_stop, beforex);
                        this.state = "right";
                        this.flag = 1;
                    }
                    if (this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 1) {//頭
                        this.Vy = 0;
                        aftery = Math.floor((aaftery) / this.Engine.grid + 1) * this.Engine.grid;
                        if (!this.flag) {
                            this.state = "none"
                        }
                    }

                    else {

                        //this.state = "none";
                    }
                }
                else {//真上
                    if (this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((afterx + this.back_brank) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid) + this.base_line][Math.floor((afterx + this.width - this.front_brank) / this.Engine.grid)].obstacle == 1) {
                        this.Vy = 0;
                        aftery = Math.floor((aaftery) / this.Engine.grid + 1) * this.Engine.grid;
                    }
                    else if (this.state == "left" && (this.Engine.tiles[Math.floor((aftery) / this.Engine.grid) + this.base_line][Math.floor((afterx + this.width - this.front_brank) / this.Engine.grid)].obstacle == 0) &&
                        this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / this.Engine.grid)].obstacle == 0) {
                        this.state = "none"
                    }
                    else if (this.state == "right" && (this.Engine.tiles[Math.floor((aftery) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 0) &&
                        this.Engine.tiles[Math.floor((aaftery + this.height) / this.Engine.grid) + this.base_line][Math.floor((aafterx + this.back_brank) / this.Engine.grid)].obstacle == 0) {
                        this.state = "none"
                    }
                }

            }
            else {//落下してないとき
                if (this.VVx > 0) {
                    if (this.Engine.tiles[Math.floor((aaftery + this.height - this.some_num1) / this.Engine.grid)][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aaftery) / this.Engine.grid)][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid)].obstacle == 1) {
                        afterx = Math.floor((afterx + this.width - this.front_brank + this.wall_stop) / this.Engine.grid) * this.Engine.grid - this.width + this.front_brank - this.wall_stop;//1ピクセルずらす
                        this.state = "left";
                    }
                    else {
                        this.state = "none";
                    }
                }

                else if (this.VVx < 0) {
                    if (this.Engine.tiles[Math.floor((aftery) / this.Engine.grid)][Math.floor((afterx + this.back_brank) / this.Engine.grid)].obstacle == 1 ||
                        this.Engine.tiles[Math.floor((aftery + this.height - this.some_num1) / this.Engine.grid)][Math.floor((afterx + this.back_brank) / this.Engine.grid)].obstacle == 1) {
                        afterx = Math.floor((afterx) / this.Engine.grid + 1) * this.Engine.grid - this.back_brank //1ピクセルずらす
                        this.state = "right";
                    }
                    else {
                        //this.state = "none";
                    }
                }
                else {

                }
            }
        }
        else {
            if (!this.now) {
                this.now = this.Engine.clock;
            }
            this.Vx = -20 / (1 + Math.exp((this.Engine.clock - this.now) / -100));
        }
        let delta = [afterx - this.x, Math.min(aftery, 0)];
        this.x = beforex + delta[0];
        this.y = aftery;
        if (this.VVx != 0) this.direct = this.VVx;
        this.VVx = 0;
        return (delta);
    }
    tackle() {
        if (this.alive) {
            this.aura.x = this.x;
            this.aura.y = this.y;
            if (!!this.target) {
                this.aura.attack(this.target);
            }
        }
    }
    dammage(power: number) {
        if (this.Engine.clock - this.guard[1] > this.guard[0]) {
            this.vulnerable = 1;
        }
        if (this.vulnerable == 1) {
            this.health -= power;
            this.Vy = -this.knockback;
            this.hit();
            if (this.health < 1) {
                this.alive = 0;
                this.Vy = -10;
            }
            this.vulnerable = 0;
            this.guard[1] = this.Engine.clock;
        }

    }
    hit() { };
}
/*
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
    type = 0;
    power = 1;
    Engine;
    master;
    fire() {
        if (this.cool_down < 0) {
            this.cool_down = this.total;
        }
    }
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
*/
export class Hero extends Chara {
    is_hero = 1;
    guard = [50, 0];
    knockback = 6;
    effect = new Weapons.Gun(this.Engine.resources["image/gun.png"].texture, this);
    input() {
        if (this.freeze[1] > 0) {
            --this.freeze[1];
        }
        else if (this.freeze[1] == 0) {
            --this.freeze[1];
        }
        if (this.alive && this.freeze[1] < 0) {
            if (this.Engine.bool[0]) {
                this.VVx = -this.speed;
                if (this.state != "right") {
                    this.Vx = -this.speed;
                }
                this.texture = this.Engine.resources["image/" + this.img + 1 + (Math.floor(this.Engine.clock / 10) % 2 + 1) + ".png"].texture;
            }
            else if (this.Engine.bool[1]) {
                this.VVx = this.speed;
                if (this.state != "left") {
                    this.Vx = this.speed;
                }
                this.texture = this.Engine.resources["image/" + this.img + (Math.floor(this.Engine.clock / 10) % 2 + 1) + ".png"].texture;
            }
            else if (this.freeze[1] > 0) {
                this.Vx = this.direct * -1;
            }
            else {
                this.Vx = 0;
            }

        }

        this.Engine.camera(this.move())
        this.enemy_spawn();
    }
    hit() {
        this.Engine.statusbar.changeHealth(this.health);
        this.freeze[1] = this.freeze[0];
        this.Vx = Math.sign(this.direct) * -1;
    }
    leftside(): void {
        if (this.alive == 0) {
            this.Engine.function_list["createEndScene"]();
        }
    }
    enemy_spawn() {
        while (!!this.Engine.enemy_area.length && this.x > this.Engine.enemy_area[0][0] - 580) {//配列が空ではなく敵に近いなら
            this.Engine.enemy_spawn(this.Engine.enemy_area[0][0], this.Engine.enemy_area[0][1]);
            this.Engine.enemy_area.splice(0, 1);
        }
    }
}
export class Enemy extends Chara {
    v = 0;
    speed = 1;
    input() {
        this.move();
        if (this.freeze[1] > 0) {
            --this.freeze[1];
        }
        else if (this.freeze[1] == 0) {
            this.Vx = this.v;
            --this.freeze[1];
        }
        if (this.state == "right") {
            this.Vx = this.speed;
        }
        if (this.state == "left") {
            this.Vx = -this.speed;
        }


    }
    hit() {
        this.freeze[1] = this.freeze[0];
        this.v = this.Vx;
        this.Vx = 0;
    }
    leftside(): void {
        this.alpha = 0;
        this.alive = 0;
        this.Engine.enemies.splice(this.Engine.enemies.indexOf(this), 1);
    }
}
export class StatusBar extends PIXI.Container {
    x = 0;
    y = 340;
    constructor(Engine) {
        super();
        this.Engine = Engine;
        this.background = new PIXI.Sprite(this.Engine.resources["image/bar.png"].texture);
        this.addChild(this.background)
        this.changeHealth(5);

    }
    Engine = new ScrollGameEngine(0, 0, 0);
    background;
    health_gage = [];

    changeHealth(num: number) {
        for (let i of this.health_gage) {
            i.alpha = 0;
        }

        this.health_gage = []
        for (let i = 0; i < num; ++i) {
            const health = new PIXI.Sprite(this.Engine.resources["image/health.png"].texture);
            health.x = 50 + 10 * i;
            this.addChild(health);
            this.health_gage.push(health);
        }
    }
}