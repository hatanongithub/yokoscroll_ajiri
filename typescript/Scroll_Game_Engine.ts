import * as PIXI from "pixi.js";
import { SceneManager } from "./scene_manager"; // シーン管理を行うクラスをインポート
import { createButton } from "./create_button"; // ボタン生成関数をインポート
import * as Weapons from "./Weapons"
export class ScrollGameEngine {
    constructor(resources, app, input, stage = [], bool = [], gameScene = null, game_data = null) {
        if (resources) {
            this.resources = resources;
            this.sheet = resources["sheet.json"];
            if (this.sheet !== undefined) {
                this.app = app;
                this.bool = bool;
                this.game_data = game_data;
                this.KP = game_data.KP;
                this.selected = input;
                this.stage = stage;
                this.gameScene = gameScene;
                this.gameScene.sortableChildren = true;
                this.buildStage();
                this.gameScene.addChild(this.gameScreen)
                this.chara_gen();
                this.build_statusbar();
                this.statusbar.zIndex = 1;
                this.is_true = 1;
            }
        }
    }
    grid = 35;//グリッド幅
    gravity = 0.3 * this.grid / 50;
    map_sizex = 120;
    map_sizey = 11;
    base_line = 1;
    is_true = 0;
    gameScene = null;
    bgm;



    back;//背景画像
    stage = [];
    tiles = [];//ステージタイルを格納
    clock = 0;//時間を管理．フレーム秒
    chara;
    resources;
    sheet;
    enemies = [];
    dead = [];
    bool = [0, 0, 0];//コントローラーの入力
    enemy_area = [];//敵出現候補地点を記録
    gameScreen = new PIXI.Container;//キャラの移動に応じてスクロールするコンテナ
    statusbar;
    selected = [1]
    app;
    game_data;
    loop_function_list = [];

    KP;
    stage_clear = false;
    camera(position) {
        let x = Math.floor(position[0]);//floorをとらないとなぜかテクスチャがずれる
        let y = Math.floor(position[1]);
        this.back.x -= x / (this.grid * this.map_sizex) * (this.back.width - this.app.screen.width);
        this.gameScreen.x -= x;
        this.gameScreen.y = -y;
    }
    buildStage() {
        for (let i = 0; i < this.map_sizey; ++i) {
            this.tiles[i] = new Array();
            for (let j = 0; j < this.map_sizex; ++j) {
                const tile = new Tile({ texture: this.sheet.textures["tile/0.png"], engine: this, selected: this.selected });
                tile.x = j * this.grid;
                tile.y = (i - this.base_line) * this.grid;
                tile.scale.x *= this.grid / 50;
                tile.scale.y *= this.grid / 50;
                tile.interactive = false;
                tile.on("click", tile.onClick);
                tile.position_this = [i, j];
                if (this.stage[i][j] && this.stage[i][j] != "0") {
                    if (this.stage[i][j].toString()[0] != "2") {
                        tile.change(this.stage[i][j]);
                    }
                    else {
                        tile.state = this.stage[i][j];
                        tile.texture = this.sheet.textures["tile/2.png"];
                    }
                }
                if (String(this.stage[i][j])[0] == "2") {
                    this.enemy_area.push([j * this.grid, (i - this.base_line) * this.grid, this.stage[i][j]]);
                    tile.alpha = 0;
                    tile.obstacle = 0;
                }
                this.gameScreen.addChild(tile);
                this.tiles[i].push(tile);
            };
        }
        if (!!this.enemy_area.length) {
            this.enemy_area.sort(function (first, second) {
                if (first[0] > second[0]) return 1;
                else return -1;

            });
        }
    }
    chara_gen() {
        const chara = new Hero(this.sheet.textures["chara1.png"], this);
        chara.x = 50; // x座標
        chara.y = 20; // y座標
        chara.is_hero = 1;
        chara.speed = 2;
        chara.knockback = 6;
        chara.main = Weapons.melee_return(this.game_data.main_weapon, chara);
        chara.sub = Weapons.gun_return(this.game_data.sub_weapon, chara);
        chara.effect = chara.main;
        this.gameScreen.addChild(chara);
        this.chara = chara;
    }

    enemy_spawn(x, y, type = "2") {
        let enemy;
        let jsn;
        if (type == "2") {
            enemy = new Enemy(this.sheet.textures["chara1.png"], this)
        }
        else {
            jsn = JSON.parse(type.substring(1));//2文字目以降をjson形式に変換
            let params = Object.keys(jsn);
            if (params.indexOf("boss") != -1) {
                enemy = new Boss(this.sheet.textures["enemy1.png"], this);
            }
            else if (params.indexOf("type") != -1) {
                console.log(jsn)
                enemy = enemy_return(jsn["type"], this)
                console.log("shooter", enemy);
            }
            else {
                enemy = new Enemy(this.sheet.textures["enemy1.png"], this);
            }
            for (let param of params) {
                if (param == "texture") {
                    enemy.skin(jsn[param]);
                }
                else if (param == "comment") {
                    //do_nothing;
                }
                else {
                    enemy[param] = jsn[param];
                }
            }
            if (params.indexOf("boss") != -1) {
                enemy.spawn();
            }
        }
        enemy.x = x;
        enemy.y = y + this.grid - enemy.height;
        enemy.scale.x *= this.grid / 50;
        enemy.scale.y *= this.grid / 50;
        enemy.target = this.chara;
        enemy.Vx = enemy.speed;
        this.gameScreen.addChild(enemy);
        this.enemies.push(enemy);
    }
    build_statusbar() {
        const statusbar = new StatusBar(this)
        this.gameScene.addChild(statusbar);
        this.statusbar = statusbar;
    }
    change_KP(num) {
        this.KP = num;
        this.statusbar.KP.text = num.toString();
    }
    save() {
        this.game_data.KP = this.KP;
    }

}

export class Tile extends PIXI.Sprite {
    alpha = 0;
    obstacle = 0;
    state = "0";
    action = 0;
    gravity = 0;
    variety = 7;
    tag = "null";
    position_this = [0, 0];
    stage = [];
    selected = [];
    engine;
    /**
     * 
     * @param texture デフォルトのテクスチャ
     * @param resources PIXI.loader.shared.loadより出力されるリスト
     * @param stage_data ステージ情報の配列
     * @param selected 現在押されているキー
     */
    constructor({ texture, engine, selected = [] }) {
        super(texture);
        this.engine = engine;
        this.selected = selected;
    }
    onClick() {
        this.change(this.selected[0] + this.selected[1]);
        console.log(this.selected[0], this.selected[1])
    }
    change(str) {
        let type = str.toString();
        if (type[0] == "0" || type[0] == 0) {
            this.state = type;
            this.skin("tile/0.png");
            console.log("here", this.alpha)
            this.obstacle = 0;
        }
        else if (type[0] == "2") {
            let input;
            if (this.state.length == 1) {
                input = window.prompt("詳細を入力", "")
            }
            else {
                input = window.prompt("詳細を入力", this.state.substring(1))
            }
            this.state = type[0] + input;
            this.skin("tile/2.png");
            this.obstacle = 0;
        }
        else if (type[0] == "4") {
            let input;
            if (this.engine.is_true == 1) {
                if (type.length == 1) {
                    input = "0" + window.prompt("tagを入力", "");
                }
                else {
                    input = window.prompt("tagを入力", "");
                }
                this.tag = input;
                this.state = type + input;
            }
            else {
                this.state = type;
                this.tag = this.state.substring(2);
            }
            this.skin("tile/" + this.state[1] + ".png");
            this.alpha = 0;
            this.obstacle = 0;
        }
        else {
            this.state = type;
            let info = type.substring(1);
            if (!info) {
                info = "0"
            }
            this.skin("tile/" + info + ".png");
            this.obstacle = 1;
            this.alpha = 1;
        }
        if (type[0] == "3") {
            this.obstacle = 0;
            this.alpha = 1;
        }
        this.engine.stage[this.position_this[0]][this.position_this[1]] = this.state;
        console.log(this.alpha)
    }
    skin(texture) {
        this.texture = this.engine.sheet.textures[texture];
    }
}
export class Chara extends PIXI.Sprite {
    Engine = new ScrollGameEngine(0, 0, 0);//親となるゲームエンジンを初期化.
    freeze = [20, -1];//硬直時間，カウント用変数
    is_hero = 0;
    is_jump = 0;
    vulnerable = 1;
    guard = [20, 0];//被ダメ後無敵フレーム，計算用変数
    knockback = 2;
    knockback_effect = 0;
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
    armor = 0;
    weakness = 0;
    power = 1;
    now = 0;//撤退速度の計算に使う．時刻
    constructor(texture, Engine) {
        super(texture);
        this.Engine = Engine;
        this.base_line = Engine.base_line;
        this.gravity = Engine.gravity;
    }
    front_brank = 3 * this.Engine.grid / 50;
    back_brank = 3 * this.Engine.grid / 50;
    effect;
    aura = new Weapons.Aura(this.texture, this);
    input() {

    }
    leftside() { }
    size(x) {
        let propotion = 0;
        if (x != 0) {
            propotion = x / this.width;
        }
        this.width = x;
        this.height = this.height * propotion;

    }
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
        delta[0] = Math.ceil(delta[0])
        this.x = beforex + delta[0]//ceilをとらないとなぜかテクスチャがずれる
        this.y = Math.floor(aftery);//floorをとるとゆかにめりこまなくなる？
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
        else {
            this.vulnerable = 0;
        }
        if (this.vulnerable == 1) {
            this.health -= Math.max(0, power * (1.0 - this.armor) * (1.0 + this.weakness));
            console.log(Math.max(0, power * (1.0 - this.armor) * (1.0 + this.weakness)), this.health)
            this.Vy = -(this.knockback + this.knockback_effect);
            this.hit();
            if (this.health <= 0) {
                this.down();
            }
            this.vulnerable = 0;
            this.guard[1] = this.Engine.clock;
        }

    }
    down() {
        this.alive = 0;
        this.Vy = -10;
    };
    hit() { };
}

export class Hero extends Chara {
    is_hero = 1;
    guard = [50, 0];
    knockback = 6;
    sub = new Weapons.ShotGun(this);
    main = new Weapons.Melee(this);
    effect = this.main;
    img = "ajiri"
    constructor(a, b) {
        super(a, b);
        this.size(this.Engine.grid - 2);
    }
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
                this.texture = this.Engine.sheet.textures["" + this.img + "-" + (Math.floor(this.Engine.clock / 10) % 3 + 1) + ".png"];
            }
            else if (this.Engine.bool[1]) {
                this.VVx = this.speed;
                if (this.state != "left") {
                    this.Vx = this.speed;
                }
                this.texture = this.Engine.sheet.textures["" + this.img + (Math.floor(this.Engine.clock / 10) % 3 + 1) + ".png"];
            }
            else if (this.freeze[1] > 0) {
                this.texture = this.Engine.sheet.textures["" + this.img + (Math.sign(this.direct) - 1).toString()[0] + ".png"];
                this.Vx = this.direct * -1;
            }
            else {
                this.texture = this.Engine.sheet.textures["" + this.img + (Math.sign(this.direct) - 1).toString()[0] + ".png"];
                this.Vx = 0;
                console.log(this.direct)
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

        }
    }
    enemy_spawn() {
        while (!!this.Engine.enemy_area.length && this.x > this.Engine.enemy_area[0][0] - 580) {//配列が空ではなく敵に近いなら
            this.Engine.enemy_spawn(this.Engine.enemy_area[0][0], this.Engine.enemy_area[0][1], this.Engine.enemy_area[0][2]);
            this.Engine.enemy_area.splice(0, 1);
        }
    }
}
export class Enemy extends Chara {
    v = 0;
    speed = 1;
    reword = 90;
    weapon = null;
    input() {
        this.move();
        this.action();
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
        if (this.Vx != 0) {
            this.v = this.Vx;
        }
        this.Vx = 0;
    }
    leftside(): void {
        this.alpha = 0;
        this.alive = 0;
        this.Engine.dead.splice(this.Engine.dead.indexOf(this), 1);
    }
    skin(texture: string) {
        this.texture = this.Engine.sheet.textures[texture];
    }
    down() {
        this.alive = 0;
        this.Vy = -10;
        this.Engine.enemies.splice(this.Engine.enemies.indexOf(this), 1);
        if (this.weapon) {
            this.weapon.delete();
        }
        this.Engine.dead.push(this);
        this.Engine.change_KP(this.Engine.KP + this.reword);
        this.death();
    }
    death() { };
    action() { };
}
export class Boss extends Enemy {
    constructor(a, b) {
        super(a, b);
        this.texture = this.Engine.sheet.textures["weapon1.png"];
    }
    health = 5;
    health_bar = [];
    gravity = this.Engine.gravity *= 0.8;
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
        if (this.is_jump == 0) {
            this.Vy -= 6;
            this.is_jump = 1;
        }

    }
    death() {
        this.Engine.resources["sound/explosion.mp3"].sound.play();
        this.Engine.stage_clear = true;
    }
    hit() {
        if (this.health > 0) {
            this.change_bar();
        }
    }
    spawn() {
        this.build_bar();
        this.build_wall();
        this.Engine.bgm = this.Engine.resources["sound/boss1.mp3"].sound.play({
            loop: true
        })
        this.aura = new Weapons.Aura(this.texture, this)
    }
    build_bar() {
        for (let i = 0; i < Math.round(this.health); ++i) {
            const bar = new PIXI.Sprite(this.Engine.sheet.textures["health_bar.png"]);
            bar.width = this.Engine.app.renderer.view.width / this.health;
            bar.x = i * bar.width;
            bar.y = 10 - this.Engine.statusbar.y;
            this.health_bar.push(bar);
            this.Engine.statusbar.addChild(bar);
        }
    }
    build_wall() {
        let ls = [].concat.apply([], this.Engine.tiles)
        for (let tile of ls) {
            if (tile.tag == "wall") {
                tile.alpha = 1;
                tile.obstacle = 1;
            }
        }
    }
    change_bar() {
        let width = 0;
        if (this.health_bar) {
            width = this.health_bar[0].width;
        }
        for (let i of this.health_bar) {
            i.alpha = 0;
        }
        this.health_bar = [];
        for (let i = 0; i < Math.round(this.health); ++i) {
            const bar = new PIXI.Sprite(this.Engine.sheet.textures["health_bar.png"]);
            bar.width = width;
            bar.x = i * width;
            bar.y = 10 - this.Engine.statusbar.y;
            this.health_bar.push(bar);
            this.Engine.statusbar.addChild(bar);
        }
    }
}
export class Boss1 extends Enemy {

}

export class Robot extends Enemy {
    life = 30;
    attenuation = 0;
    cost = 100;
    penetrate = 0;
    knock_back = 0;
    master;
    power = 10;
    constructor(master) {
        let texture = master.Engine.sheet.textures["enemy12.png"];
        super(texture, master.Engine);
        this.master = master;
        this.x = master.x;
        this.y = master.y - (this.height - master.height);
    }
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
            this.delete();
        }
        let delta = [afterx - this.x, Math.min(aftery, 0)];
        this.x = beforex + delta[0];
        this.y = aftery;
        if (this.VVx != 0) this.direct = this.VVx;
        this.VVx = 0;
        return (delta);
    }
    act() {
        this.input();
        this.Engine.enemies.forEach(obj => this.attack(obj))
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

export class walker extends Enemy { }

export class Shooter extends Enemy {
    constructor(texture, Engine) {
        super(texture, Engine)
        this.weapon = new Weapons.Gun(this)
        this.weapon.target = "hero"
        this.weapon.blt = "BreakBullet"
        this.aura = new Weapons.Dummy(this)
    }
    weapon = new Weapons.Gun(this);
    action(): void {
        if (this.alive) {
            if (this.Engine.clock % 60 == 0) {
                this.weapon.fire();
            }
            this.weapon.act();
            console.log(this.weapon.cool_down, this.weapon.total)
        }
    }
    death(): void {
        this.weapon.delete();
    }
}
export class Battery extends Shooter {
    speed = 0
    constructor(texture, Engine) {
        super(texture, Engine)
        this.weapon = new Weapons.Rifle(this)
        this.weapon.target = "hero"
        this.weapon.blt = "BreakBullet"
        this.aura = new Weapons.Dummy(this)
    }
    action(): void {
        if (this.alive) {
            this.direct = Math.sign(this.Engine.chara.x - this.x)
            if (this.Engine.clock % 60 == 0) {
                this.weapon.fire();
            }
            this.weapon.act();
            console.log(this.weapon.cool_down, this.weapon.total)
        }
    }
}








export class StatusBar extends PIXI.Container {
    x = 0;
    y = 340;
    z = 0;
    constructor(Engine) {
        super();
        this.Engine = Engine;
        this.background = new PIXI.Sprite(this.Engine.sheet.textures["bar.png"]);
        this.addChild(this.background)
        this.changeHealth(5);
        this.KP = new PIXI.Text(this.Engine.KP.toString(), this.textStyle);
        this.addChild(this.KP);

    }
    Engine = new ScrollGameEngine(0, 0, 0);
    background;
    health_gage = [];
    KP;
    textStyle = new PIXI.TextStyle({
        fontFamily: "Arial", // フォント
        fontSize: 20,// フォントサイズ
        fill: 0xffffff, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
        dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
        dropShadowDistance: 2, // ドロップシャドウの影の距離
    });
    changeHealth(num: number) {
        for (let i of this.health_gage) {
            i.alpha = 0;
        }

        this.health_gage = []
        for (let i = 0; i < num; ++i) {
            const health = new PIXI.Sprite(this.Engine.sheet.textures["health.png"]);
            health.x = 50 + 10 * i;
            this.addChild(health);
            this.health_gage.push(health);
        }
    }
}

export class game_data {
    KP = 0;
    max_jump = 1;
    max_health;
    main_weapon = "Melee"
    sub_weapon = "Gun";
    bullet = "Bullet";
}

export function enemy_return(name, Engine) {
    console.log(name)
    if (name == "Shooter") {
        return new Shooter(Engine.sheet.textures["enemy1.png"], Engine)
    }
    else if (name = "Battery") {
        return new Battery(Engine.sheet.textures["enemy1.png"], Engine)
    }
    else {
        return (name)
    }
}