import * as PIXI from "pixi.js"; // node_modulesから PIXI.jsをインポート
import * as PIXI_SOUND from "pixi-sound";// node_modulesから PIXI_SOUNDをインポート
import { SceneManager } from "./scene_manager"; // シーン管理を行うクラスをインポート
import { createButton } from "./create_button"; // ボタン生成関数をインポート
import *as SGE from "./Scroll_Game_Engine";
import { ScrollGameEngine } from "./Scroll_Game_Engine"
// PIXI_SOUNDを有効にするためには必ずこの初期化命令を実行すること
PIXI_SOUND.default.init();

// PIXI.JSアプリケーションを呼び出す (この数字はゲーム内の画面サイズ)
const app = new PIXI.Application({ width: 600, height: 400 });
// ゲームcanvasのcssを定義する
// ここで定義した画面サイズ(width,height)は実際に画面に表示するサイズ
app.renderer.view.style.position = "relative";
if (document.body.offsetWidth < 760) {//スマホに対応する．
    app.renderer.view.style.width = (document.body.offsetWidth - 14) as unknown as string;
    app.renderer.view.style.height = document.body.offsetHeight as unknown as string;
}
else {
    app.renderer.view.style.width = "600px";
    app.renderer.view.style.height = "400px";
    app.renderer.view.style.left = (document.body.offsetWidth - 600) / 2 as unknown as string;
    //alert(document.body.offsetWidth)
}
app.renderer.view.style.display = "block";
// index.htmlのbodyにapp.viewを追加する (app.viewはcanvasのdom要素)
document.body.appendChild(app.view);


// canvasの周りを点線枠で囲う (canvasの位置がわかりやすいので入れている)
app.renderer.view.style.border = "2px dashed black";

// canvasの背景色
app.renderer.backgroundColor = 0x333333;

// ゲームで使用する画像をあらかじめ読み込んでおく(プリロード)
// v5.3.2　だと PIXI.Loader.shared.addでプリロードする
PIXI.Loader.shared.add("sound/hit.mp3");
PIXI.Loader.shared.add("image/ball.png");
PIXI.Loader.shared.add("image/title.png");
PIXI.Loader.shared.add("image/start.png");
PIXI.Loader.shared.add("image/back.png");
PIXI.Loader.shared.add("image/chara1.png");
PIXI.Loader.shared.add("image/chara2.png");
PIXI.Loader.shared.add("image/chara11.png");
PIXI.Loader.shared.add("image/chara12.png");
PIXI.Loader.shared.add("image/enemy1.png");
PIXI.Loader.shared.add("image/enemy2.png");
PIXI.Loader.shared.add("image/enemy11.png");
PIXI.Loader.shared.add("image/enemy12.png");
PIXI.Loader.shared.add("sound/select.mp3");
PIXI.Loader.shared.add("image/sound_on.png");
PIXI.Loader.shared.add("image/sound_off.png");
PIXI.Loader.shared.add("image/howToBack.png");
PIXI.Loader.shared.add("image/nextbutton.png");
PIXI.Loader.shared.add("image/backbutton.png");
PIXI.Loader.shared.add("image/startbutton.png");
PIXI.Loader.shared.add("image/weapon1.png");
PIXI.Loader.shared.add("image/weapon2.png");
PIXI.Loader.shared.add("image/weapon.png");
PIXI.Loader.shared.add("image/bar.png");
PIXI.Loader.shared.add("image/health.png");
PIXI.Loader.shared.add("image/gun.png")
PIXI.Loader.shared.add("image/bullet.png");

let tile_variety = 10;
for (let i = 0; i < tile_variety; ++i) {
    PIXI.Loader.shared.add("image/tile" + i + ".png");
}
//グローバル変数
let debug = 0;

//
let before = 0;
//

let is_sound = 1
let SE = 0.4;
let max_jump = 2;
let bool = [0, 0, 0];
let clock = 0;
let selected = [0];
let jump_break = 0;
let base_line = 1;//ステージのy座標を決定する．このインデックスが0になるようにシフトさせる．
//定数
const grid = 35;
let gravity = 0.3 * grid / 50;
const map_sizex = 100;
const map_sizey = 11;
const sceneManager = new SceneManager(app);
const stage_data = [
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        6,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        0,
        5,
        0,
        5,
        5,
        0,
        5,
        0,
        5,
        5,
        0,
        5,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        6,
        6,
        2,
        0,
        0,
        0,
        0,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        6,
        5,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5
    ],
    [
        0,
        0,
        0,
        0,
        5,
        0,
        0,
        5,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        5,
        5,
        6,
        6,
        0,
        0,
        0,
        0,
        5,
        0,
        0,
        2,
        0,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        5,
        6,
        6,
        6,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        2,
        0,
        0,
        0,
        0,
        0,
        0,
        3,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        3,
        0,
        5
    ],
    [
        5,
        5,
        5,
        5,
        6,
        5,
        5,
        6,
        5,
        5,
        5,
        0,
        0,
        5,
        5,
        5,
        5,
        5,
        5,
        6,
        6,
        6,
        6,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        6,
        6,
        6,
        6,
        5,
        0,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5
    ],
    [
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        5
    ]
]

// プリロード処理が終わったら呼び出されるイベント
PIXI.Loader.shared.load((loader, resources) => {
    /**
     * 状態が変化する変数一覧
     */

    let score = 0; // スコア

    /**
     * ゲームのメインシーンを生成する関数
     */
    function createGameScene() {
        window.addEventListener("keydown", function (e) {
            chara_bool(e, 1);
        });
        window.addEventListener("keyup", function (e) {
            chara_bool(e, 0);
        });
        window.addEventListener("keypress", function (e) {
            if (!isNaN(Number(e.key)) && Number(e.key) < tile_variety) {
                selected[0] = Number(e.key);
            }
            if (e.key == "d") {
                debug = (1 - debug);
                for (let i = 0; i < map_sizey; ++i) {
                    for (let j = 0; j < map_sizex; ++j) {
                        engine.tiles[i][j].interactive = !!debug;
                        engine.tiles[i][j].alpha = 1 * Number(!!(engine.tiles[i][j].state + debug))
                    }
                }
            }
            if (debug) {
                if (e.key == "f") {
                    console.log(engine.stage);
                }
                else if (e.key == "q") {
                    ++engine.chara.speed;
                }
                else if (e.key == "w") {
                    --engine.chara.speed;
                }
                else if (e.key == "e") {
                    engine.chara.speed = 2;
                }
            }
        });
        function chara_bool(e: KeyboardEvent, status: number) {
            if (e.key == "x" || e.code == "ArrowUp") {
                if (jump_break < 1) {
                    engine.chara.is_jump = jump(engine.chara.is_jump);
                    jump_break = 4;
                }
                else {
                    --jump_break;
                }
                if (!status) {
                    jump_break = 0;
                }

            }
            else if (e.code == "ArrowLeft") {
                bool[0] = status;
            }
            else if (e.key == "ArrowRight") {
                bool[1] = status;
            }
            else if (e.key == "ArrowDown") {
                bool[2] = status;
                gravity = (0.3 + status * 0.6) * grid / 50;
            }
            else if (e.key == "z") {
                engine.chara.effect.fire();
            }
        }
        function jump(is_jump) {
            if (is_jump < max_jump) {
                if (is_sound) {
                    resources["sound/hit.mp3"].sound.volume = SE;
                    resources["sound/hit.mp3"].sound.play();
                }
                engine.chara.Vy = -9 * grid / 50; // ジャンプする
                return (is_jump += 1);
            }
        }
        // 他に表示しているシーンがあれば削除
        sceneManager.removeAllScene();
        // 毎フレームイベントを削除
        sceneManager.removeAllGameLoops();

        // 変数を初期化する
        score = 0;
        clock = 0;
        //commute = 0;
        // ゲーム用のシーンを生成
        const gameScene = new PIXI.Container();
        // ゲームシーンを画面に追加
        app.stage.addChild(gameScene);
        const engine = new ScrollGameEngine(resources, app, selected, stage_data, bool, gameScene);
        //背景から生成していく
        engine.back = new PIXI.Sprite(resources["image/back.png"].texture);
        gameScene.addChild(engine.back)
        gameScene.addChild(engine.gameScreen)
        /*
        engine.gameScreen = new PIXI.Container;//常にキャラクターの位置を一定にするためのコンテナ
        gameScene.addChild(engine.gameScreen);
        class StatusBar extends PIXI.Container {
            x = 0;
            y = 340;
            constructor() {
                super();
                this.addChild(this.background);
                this.changeHealth(5);
            }
            background = new PIXI.Sprite(resources["image/bar.png"].texture);
            health_gage = [];
            changeHealth(num: number) {
                for (let i of this.health_gage) {
                    i.alpha = 0;
                }
                this.health_gage = []
                for (let i = 0; i < num; ++i) {
                    const health = new PIXI.Sprite(resources["image/health.png"].texture);
                    health.x = 50 + 10 * i;
                    this.addChild(health);
                    this.health_gage.push(health);
                }
            }
        }
        let tiles: SGE.Tile[][] = new Array();
        let enemies: SGE.Enemy[] = new Array();
        /*
        for (let i = 0; i < map_sizey; ++i) {
            tiles[i] = new Array();
        }
        let stage: number[][] = new Array();
        for (let i = 0; i < map_sizey; ++i) {
            stage[i] = new Array();
            for (let j = 0; j < map_sizex; ++j) {
                if (j == (map_sizex - 1) || i == map_sizey - 2) {
                    stage[i][j] = 5;
                }
                else if (i == map_sizey - 1) {
                    stage[i][j] = 6;
                }
                else {
                    stage[i][j] = 0;
                }
            }
        }
        let stage2 = [
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                6,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                2,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5,
                0,
                5,
                0,
                5,
                5,
                0,
                5,
                0,
                5,
                5,
                0,
                5,
                5,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5,
                5,
                0,
                0,
                0,
                0,
                0,
                0,
                5,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                5,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                2,
                6,
                6,
                2,
                0,
                0,
                0,
                0,
                5,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5,
                6,
                5,
                0,
                0,
                0,
                0,
                2,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5
            ],
            [
                0,
                0,
                0,
                0,
                5,
                0,
                0,
                5,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                2,
                0,
                0,
                0,
                5,
                5,
                6,
                6,
                0,
                0,
                0,
                0,
                5,
                0,
                0,
                2,
                0,
                0,
                0,
                0,
                0,
                2,
                0,
                0,
                0,
                0,
                0,
                2,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                5,
                6,
                6,
                6,
                0,
                0,
                0,
                0,
                2,
                0,
                0,
                0,
                0,
                0,
                0,
                2,
                0,
                0,
                0,
                2,
                0,
                0,
                0,
                0,
                0,
                0,
                3,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                3,
                0,
                5
            ],
            [
                5,
                5,
                5,
                5,
                6,
                5,
                5,
                6,
                5,
                5,
                5,
                0,
                0,
                5,
                5,
                5,
                5,
                5,
                5,
                6,
                6,
                6,
                6,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                6,
                6,
                6,
                6,
                5,
                0,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5
            ],
            [
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                5
            ]
        ]
        for (let i = 0; i < 10; ++i) {
            for (let j = 0; j < 100; ++j) {
                stage[i][j] = stage2[i][j]
            }
        }
        function buildStage() {
            for (let i = 0; i < map_sizey; ++i) {
                for (let j = 0; j < map_sizex; ++j) {
                    const tile = new SGE.Tile({ texture: resources["image/tile0.png"].texture, resources: resources, stage_data: stage, selected: selected });
                    tile.x = j * grid;
                    tile.y = (i - base_line) * grid;
                    tile.scale.x *= grid / 50;
                    tile.scale.y *= grid / 50;
                    tile.interactive = false;
                    tile.on("click", tile.onClick);
                    tile.position_this = [i, j];
                    if (stage[i][j]) {
                        tile.state = stage[i][j]
                        tile.texture = resources["image/tile" + stage[i][j] + ".png"].texture;
                        tile.alpha = 1;
                        tile.obstacle = 1
                    }
                    if (stage[i][j] == 2) {
                        //spawn(stage[j], stage[i]);
                    }
                    engine.gameScreen.addChild(tile);
                    tiles[i].push(tile);
                }
            }
        }
        /*
        class Chara extends PIXI.Sprite {
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
            front_brank = 2 * grid / 50;
            back_brank = 2 * grid / 50;
            state = "none";//壁に激突しているかどうか
            flag = 0;//先に壁に当たっているかなどのフラグ
            is_hit = 1;
            is_move = 0;
            alive = 1;
            now = 0;//撤退速度の計算に使う．時刻
            effect = new Weapon(resources["image/weapon.png"].texture, this, 0);
            aura = new Weapon(this.texture, this);
            constructor(texture) {
                super(texture);
                this.base_line = base_line;
            }
            input() {

            }
            leftside() { }
            move() {
                let beforex = this.x;
                this.Vy += gravity;
                //this.x += commute;
                let afterx = this.x;
                let aftery = this.y;
                afterx += this.Vx;
                if (afterx + this.back_brank - this.wall_stop < 0) {
                    this.Vx = 0;
                    this.leftside()
                    afterx = this.x;
                }
                aftery += this.Vy;
                if (aftery + chara.height > back.height - this.some_num1) {
                    aftery = back.height - chara.height - this.some_num1;
                    this.alive = 0;
                }
                if (aftery < 6 - grid * base_line) {
                    aftery = 6 - grid * base_line;

                }
                let aafterx = afterx;
                let aaftery = aftery;//こっちで判定しないとワープする.
                if (!this.is_hero) {
                    this.VVx = this.Vx;
                }
                if (this.alive) {
                    this.flag = 0;
                    if (this.Vy > 0) {//下向き
                        if (this.VVx > 0 || this.direct > 0) {
                            if (tiles[Math.floor((aaftery + this.height - this.some_num1) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / grid)].obstacle == 1) {
                                afterx = Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / grid) * grid - this.width + this.front_brank - this.wall_stop;
                                this.state = "left";
                                this.flag = 1;
                                if (this.is_hero) {
                                    console.log("left", this.x, this.y)
                                }
                            }
                            if (tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.back_brank) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank - 1) / grid)].obstacle == 1) {//床 -1を付けないと壁にもたれたときに摩擦みたいになる．
                                aftery = Math.max((Math.floor((aaftery + this.height) / grid)) * grid - this.height, this.y);
                                this.Vy = 0;
                                this.is_jump = 0;
                                if (!this.flag) {
                                    this.state = "none";
                                }
                            }
                        }
                        else if (this.VVx < 0) {
                            if (tiles[Math.floor((aaftery + this.height - this.some_num1) / grid) + this.base_line][Math.floor((aafterx + this.back_brank - this.wall_stop) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.back_brank - this.wall_stop) / grid)].obstacle == 1) {
                                afterx = Math.floor((aafterx + this.back_brank - this.wall_stop) / grid + 1) * grid - this.back_brank + this.wall_stop;
                                this.state = "right"
                                this.flag = 1;
                            }
                            if (tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.back_brank) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / grid)].obstacle == 1) {
                                aftery = Math.max(Math.floor((aaftery + this.height) / grid) * grid - this.height, this.y);
                                this.Vy = 0;
                                this.is_jump = 0;
                                if (!this.flag) {
                                    this.state = "none";
                                }
                            }
                        }
                        else {//自由落下
                            if (tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.back_brank) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / grid)].obstacle == 1) {
                                aftery = Math.min(Math.floor((aaftery + this.height) / grid) * grid - this.height, this.y);
                                this.Vy = 0;
                                this.is_jump = 0;
                            }
                            if (this.state == "left" && (tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / grid)].obstacle == 0) &&
                                tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank) / grid)].obstacle == 0) {
                                this.state = "none"
                            }
                            else if (this.state == "right" && (tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.back_brank) / grid)].obstacle == 0) &&
                                tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.back_brank) / grid)].obstacle == 0) {
                                this.state = "none"
                            }


                        }
                    }
                    else if (this.Vy < 0) {//上向き
                        if (this.VVx > 0 || this.Vx > 0) {//右向き
                            if (tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / grid)].obstacle == 1) {
                                afterx = Math.max(Math.floor((aafterx + this.width - this.front_brank + this.wall_stop) / grid) * grid - this.width + this.front_brank - this.wall_stop, beforex);
                                this.state = "left";
                                console.log("left2")
                                this.flag = 1;
                            }
                            if (tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.width - this.front_brank - 1) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.back_brank) / grid)].obstacle == 1) { //頭をぶつける
                                this.Vy = 0;
                                aftery = Math.floor((aaftery) / grid + 1) * grid;
                                console.log("here!")
                                if (!this.flag) {
                                    this.state = "none";
                                }
                            }
                            else {
                                this.state = "none";//右側の壁に密着した状態でその場ジャンプをすると，その後に右に入力しながらジャンプしても前に進めないバグの対策．
                            }
                        }
                        else if (this.VVx < 0 || this.Vx < 0) {//左向き
                            if (tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.back_brank - this.wall_stop) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aaftery + this.height) / grid) + this.base_line][Math.floor((aafterx + this.back_brank - this.wall_stop) / grid)].obstacle == 1) {//壁にぶつかる
                                afterx = Math.min(Math.floor((aafterx + this.back_brank - this.wall_stop) / grid + 1) * grid - this.back_brank + this.wall_stop, beforex);
                                this.state = "right";
                                this.flag = 1;
                            }
                            if (tiles[Math.floor((aaftery) / grid) + this.base_line][Math.floor((aafterx + this.back_brank) / grid)].obstacle == 1) {//頭
                                this.Vy = 0;
                                aftery = Math.floor((aaftery) / grid + 1) * grid;
                                if (!this.flag) {
                                    this.state = "none"
                                }
                            }

                            else {

                                //this.state = "none";
                            }
                        }
                        else {//真上
                            if (tiles[Math.floor((aftery) / grid) + this.base_line][Math.floor((afterx + this.back_brank) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aftery) / grid) + this.base_line][Math.floor((afterx + this.width - this.front_brank) / grid)].obstacle == 1) {
                                this.Vy = 0;
                                aftery = Math.floor((aftery) / grid + 1) * grid;
                            }
                            else if (this.state == "left" && (tiles[Math.floor((aftery) / grid) + this.base_line][Math.floor((afterx + this.width - this.front_brank) / grid)].obstacle == 0) &&
                                tiles[Math.floor((aftery + this.height) / grid) + this.base_line][Math.floor((afterx + this.width - this.front_brank) / grid)].obstacle == 0) {
                                this.state = "none"
                            }
                            else if (this.state == "right" && (tiles[Math.floor((aftery) / grid) + this.base_line][Math.floor((afterx + this.back_brank) / grid)].obstacle == 0) &&
                                tiles[Math.floor((aftery + this.height) / grid) + this.base_line][Math.floor((afterx + this.back_brank) / grid)].obstacle == 0) {
                                this.state = "none"
                            }
                        }

                    }
                    else {//落下してないとき
                        if (this.VVx > 0) {
                            if (tiles[Math.floor((aftery + this.height - this.some_num1) / grid)][Math.floor((afterx + this.width - this.front_brank + this.wall_stop) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aftery) / grid)][Math.floor((afterx + this.width - this.front_brank + this.wall_stop) / grid)].obstacle == 1) {
                                afterx = Math.floor((afterx + this.width - this.front_brank + this.wall_stop) / grid) * grid - this.width + this.front_brank - this.wall_stop;//1ピクセルずらす
                                this.state = "left";
                            }
                            else {
                                this.state = "none";
                            }
                        }

                        else if (this.VVx < 0) {
                            if (tiles[Math.floor((aftery) / grid)][Math.floor((afterx + this.back_brank) / grid)].obstacle == 1 ||
                                tiles[Math.floor((aftery + this.height - this.some_num1) / grid)][Math.floor((afterx + this.back_brank) / grid)].obstacle == 1) {
                                afterx = Math.floor((afterx) / grid + 1) * grid - this.back_brank //1ピクセルずらす
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
                        this.now = clock;
                    }
                    this.Vx = -20 / (1 + Math.exp((clock - this.now) / -100));
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
                    this.aura.attack(chara);
                }
            }
            dammage(power: number) {
                if (clock - this.guard[1] > this.guard[0]) {
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
                    this.guard[1] = clock;
                }

            }
            hit() { };
        }
        class Hero extends Chara {
            is_hero = 1;
            guard = [50, 0];
            knockback = 6;

            input() {
                if (this.freeze[1] > 0) {
                    --this.freeze[1];
                }
                else if (this.freeze[1] == 0) {
                    --this.freeze[1];
                }
                if (this.alive && this.freeze[1] < 0) {
                    if (bool[0]) {
                        this.VVx = -this.speed;
                        if (this.state != "right") {
                            this.Vx = -this.speed;
                        }
                        this.texture = resources["image/" + this.img + 1 + (Math.floor(clock / 10) % 2 + 1) + ".png"].texture;
                    }
                    else if (bool[1]) {
                        this.VVx = this.speed;
                        if (this.state != "left") {
                            this.Vx = this.speed;
                        }
                        this.texture = resources["image/" + this.img + (Math.floor(clock / 10) % 2 + 1) + ".png"].texture;
                    }
                    else if (this.freeze[1] > 0) {
                        this.Vx = this.direct * -1;
                    }
                    else {
                        this.Vx = 0;
                    }

                }

                camera(this.move())
            }
            hit() {
                status.changeHealth(this.health);
                this.freeze[1] = this.freeze[0];
                this.Vx = Math.sign(this.direct) * -1;
            }
            leftside(): void {
                if (this.alive == 0) {
                    createEndScene();
                }
            }
        }
        class Enemy extends Chara {
            v = 0;
            input() {
                this.move();
                if (this.freeze[1] > 0) {
                    --this.freeze[1];
                }
                else if (this.freeze[1] == 0) {
                    this.Vx = this.v;
                    --this.freeze[1];
                }
                if (this.state == "right" || this.state == "left") {
                    this.Vx *= -1;
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
                enemies.splice(enemies.indexOf(this), 1);
            }
        }
        */
        function spawn(x, y) {//敵を生成する
            const enemy = new SGE.Enemy(resources["image/enemy1.png"].texture, engine)
            enemy.x = x;
            enemy.y = y + grid - enemy.height;
            enemy.scale.x *= grid / 50;
            enemy.scale.y *= grid / 50;
            engine.gameScreen.addChild(enemy);
            engine.enemies.push(enemy);
        }
        /*
        class Weapon extends PIXI.Sprite {
            constructor(texture, name, is_aura = 1) {
                super(texture);
                this.master = name;
                this.scale.x = grid / 50;
                this.scale.y = grid / 50;
                this.x = this.master.x;
                this.y = this.master.y;
                this.alpha = 0;
                this.is_aura = is_aura;
                gameScreen.addChild(this);
            }
            cool_down = 0;//技のフレームを計算するのに使う.
            start_up = 8;//技の発生フレーム
            continue = 25;//技の持続フレーム
            total = 40;//技の全体フレーム
            type = 0;
            power = 1;
            master;
            is_aura;
            fire() {
                if (this.cool_down < 0) {
                    this.cool_down = this.total;
                }
            }
            act() {
                if (this.cool_down > this.total - this.start_up) {//技の発生までのフレーム
                    if (this.master.Vy > 0 && bool[2] == 1) {
                        this.type = 1;
                        this.start_up = 15;
                        this.total = 50;
                    }
                }
                else if (this.cool_down > this.total - this.start_up - this.continue) {//持続フレーム
                    this.alpha = 1;
                    enemies.forEach(obj => this.attack(obj))
                    switch (this.type) {
                        case 0:
                            this.texture = resources["image/weapon1.png"].texture
                            this.power = 10;
                            this.y = this.master.y;
                            break;
                        case 1:
                            this.texture = resources["image/weapon2.png"].texture;
                            this.y = this.master.y;
                            this.power = 1;
                            if (this.master.Vy > 0) {
                                ++this.cool_down;
                                this.master.guard[1] = clock + 10;
                            }
                            else {
                                this.cool_down = 0;
                                this.master.freeze[1] = 10;
                            }
                            break;
                    }
                    this.x = this.master.x + Number(this.master.direct < 0) * this.master.width;
                    this.scale.x = Math.sign(this.master.direct) * grid / 50;
                }

                else {
                    this.alpha = 0;
                    this.type = 0;
                }
                --this.cool_down;
            }
            attack(obj) {
                if (this.is_aura) {//左右反転があるか
                    if (this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
                        obj.dammage(this.power);
                    }
                }
                else {
                    if (this.master.direct > 0 && this.x < obj.x + obj.width && this.x + this.width > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
                        obj.dammage(this.power);
                    }
                    else if (this.master.direct < 0 && this.x - this.width < obj.x + obj.width && this.x > obj.x && this.y + this.height > obj.y && this.y < obj.y + obj.height) {
                        obj.dammage(this.power);
                    }
                }
            }
        }
        buildStage();
        */
        //const status = new StatusBar();
        //gameScene.addChild(status);
        /*
            for (let i = 0; i < map_sizey; ++i) {
                for (let j = 0; j < map_sizex; ++j) {
                    if (tiles[i][j].state == 2) {
                        spawn(tiles[i][j].x, tiles[i][j].y);
                        tiles[i][j].change(0);
                        tiles[i][j].alpha = 0;
                    }
                }
            }
            */
        /*
        const chara = new SGE.Hero(resources["image/chara1.png"].texture, engine);
        chara.x = 50; // x座標
        chara.y = 20; // y座標
        chara.is_hero = 1;
        chara.speed = 2;
        chara.scale.x *= grid / 50;
        chara.scale.y *= grid / 50;
        chara.knockback = 6;
        engine.gameScreen.addChild(chara); // キャラクターをシーンに追加
        engine.back.x -= chara.x / (grid * map_sizex) * (engine.back.width - app.screen.width)
        spawn(200, 200);
        */
        // テキストに関するパラメータ
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: 20,// フォントサイズ
            fill: 0xffffff, // 色(16進数で定義するので#ffffffと書かずに0xffffffと書く)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 2, // ドロップシャドウの影の距離
        });

        const text = new PIXI.Text("SCORE:0", textStyle); //スコア表示テキスト
        gameScene.addChild(text); // スコア表示テキストを画面に追加する
        function gameLoop() // 毎フレームごとに処理するゲームループ
        {
            ++engine.clock;
            for (let enemy of engine.enemies) {
                enemy.input();
                enemy.tackle();
            }
            engine.chara.input();
            engine.chara.effect.act();
            if (engine.chara.y > engine.back.height) {
                createEndScene();
            }

            if (engine.clock % 60 == 0) {
                let x = performance.now();
                text.text = (60 / (x - before) * 1000) as unknown as string;
                before = x;
            }


        }

        // ゲームループ関数を毎フレーム処理の関数として追加
        sceneManager.addGameLoop(gameLoop);
    }
    /**
    * ゲームのタイトル画面を生成する関数
    */
    function createTitle() {
        PIXI.TextMetrics.BASELINE_SYMBOL += "寮｜";//これがないとバグる？
        sceneManager.removeAllScene();
        sceneManager.removeAllGameLoops();
        const title = new PIXI.Container();
        app.stage.addChild(title);
        const titleImg = new PIXI.Sprite(resources["image/title.png"].texture);
        const texsty = new PIXI.TextStyle({
            fontFamily: "ピグモ00",
            fontSize: 30,
            fill: 0xffffff,
        })
        const start = new PIXI.Sprite(resources["image/start.png"].texture);
        start.x = 400;
        start.y = 260;
        start.alpha = 1;//位置を調整したら0にする
        start.interactive = true;
        start.on("pointerdown", () => {
            if (is_sound) {
                resources["sound/select.mp3"].sound.play();
            }
            setTimeout(createGameScene, 300);//ちょっとディレイを入れている
        });
        title.addChild(titleImg);
        title.addChild(start);
        const how = new PIXI.Sprite(resources["image/start.png"].texture);
        how.x = 400;
        how.y = 320;
        how.alpha = 1;//位置を調整したら0にする
        how.interactive = true;
        how.on("pointerdown", () => {
            if (is_sound) {
                resources["sound/select.mp3"].sound.play();
            }
            createHowTo();
        });
        title.addChild(how);
        const soundO = new PIXI.Sprite(resources["image/sound_on.png"].texture);
        const soundOF = new PIXI.Sprite(resources["image/sound_off.png"].texture);
        soundO.x = 538;
        soundO.interactive = true;
        soundO.on("pointerdown", () => {
            if (is_sound) {
                is_sound = 0;
                soundO.alpha = 0;
                soundOF.alpha = 1;
            }
            else {
                is_sound = 1;
                soundO.alpha = 1;
                soundOF.alpha = 0;
            }
        })
        soundOF.x = 538;
        if (is_sound) {
            soundO.alpha = 1;
            soundOF.alpha = 0;
        }
        else {
            soundO.alpha = 0;
            soundOF.alpha = 1;
        }
        title.addChild(soundOF);
        title.addChild(soundO);
    }
    /**
     * ゲームの遊び方画面を生成する関数
     */
    function createHowTo() {
        sceneManager.removeAllScene();
        sceneManager.removeAllGameLoops();
        //alert("howTo");
        const howTo = new PIXI.Container();
        app.stage.addChild(howTo);
        const backHowTo = new PIXI.Sprite(resources["image/howToBack.png"].texture);
        const backHowTo2 = new PIXI.Sprite(resources["image/howToBack.png"].texture);
        const next = new PIXI.Sprite(resources["image/nextbutton.png"].texture);
        const back = new PIXI.Sprite(resources["image/backbutton.png"].texture);
        const gamestart = new PIXI.Sprite(resources["image/startbutton.png"].texture);
        next.interactive = true;
        next.x = 140
        next.y = 300
        back.x = 50
        back.y = 305
        next.on("pointerdown", () => {
            if (is_sound) {
                resources["sound/select.mp3"].sound.play();
            }
            back.alpha = 1;
            next.alpha = 0;
            gamestart.alpha = 1;
            backHowTo.alpha = 0;
        })
        back.on("pointerdown", () => {
            if (is_sound) {
                resources["sound/select.mp3"].sound.play();
            }
            back.alpha = 0;
            next.alpha = 1;
            gamestart.alpha = 0;
            backHowTo.alpha = 1;
        })
        back.interactive = true;
        gamestart.interactive = true;
        gamestart.x = 400
        gamestart.y = 310
        gamestart.on("pointerdown", () => {
            if (is_sound) {
                resources["sound/select.mp3"].sound.play();
            }
            createGameScene();
        })
        gamestart.alpha = 0;
        howTo.addChild(backHowTo2);
        howTo.addChild(backHowTo);
        back.alpha = 0;
        howTo.addChild(back);
        howTo.addChild(next);
        howTo.addChild(gamestart);
        const soundO = new PIXI.Sprite(resources["sound_on.png"].texture);
        const soundOF = new PIXI.Sprite(resources["sound_off.png"].texture);
        soundO.x = 538;
        soundO.interactive = true;
        soundO.on("pointerdown", () => {
            if (is_sound) {
                is_sound = 0;
                soundO.alpha = 0;
                soundOF.alpha = 1;
            }
            else {
                is_sound = 1;
                soundO.alpha = 1;
                soundOF.alpha = 0;
            }
        })
        soundOF.x = 538;
        if (is_sound) {
            soundO.alpha = 1;
            soundOF.alpha = 0;
        }
        else {
            soundO.alpha = 0;
            soundOF.alpha = 1;
        }
        howTo.addChild(soundOF);
        howTo.addChild(soundO);
    }
    /**
     * ゲームの結果画面シーンを生成する関数
     */
    function createEndScene() {
        // 他に表示しているシーンがあれば削除
        sceneManager.removeAllScene();
        // 毎フレームイベントを削除
        sceneManager.removeAllGameLoops();

        // ゲーム用のシーン表示
        const endScene = new PIXI.Container();
        // シーンを画面に追加する
        app.stage.addChild(endScene);

        // テキストに関するパラメータを定義する(ここで定義した意外にもたくさんパラメータがある)
        const textStyle = new PIXI.TextStyle({
            fontFamily: "Arial", // フォント
            fontSize: 32,// フォントサイズ
            fill: 0xfcbb08, // 色(16進数で定義する これはオレンジ色)
            dropShadow: true, // ドロップシャドウを有効にする（右下に影をつける）
            dropShadowDistance: 2, // ドロップシャドウの影の距離
        });

        // テキストオブジェクトの定義
        const text = new PIXI.Text(`SCORE:${score}で力尽きた`, textStyle); // 結果画面のテキスト
        text.anchor.x = 0.5; // アンカーのxを中央に指定
        text.x = 200; // 座標指定 (xのアンカーが0.5で中央指定なので、テキストのx値を画面中央にすると真ん中にテキストが表示される)
        text.y = 200; // 座標指定 (yのアンカーはデフォルトの0なので、画面上から200の位置にテキスト表示)
        endScene.addChild(text); // 結果画面シーンにテキスト追加

        /**
         * 自作のボタン生成関数を使って、もう一度ボタンを生成
         * 引数の内容はcreateButton関数を参考に
         */
        const retryButton = createButton("もう一度", 100, 60, 0xff0000, () => {
            // クリックした時の処理
            createGameScene(); // ゲームシーンを生成する
        });
        retryButton.x = 50; // ボタンの座標指定
        retryButton.y = 200; // ボタンの座標指定
        endScene.addChild(retryButton); // ボタンを結果画面シーンに追加

        /**
         * 自作のボタン生成関数を使って、ツイートボタンを生成
         * 引数の内容はcreateButton関数を参考に
         */
        const tweetButton = createButton("ツイート", 100, 60, 0x0000ff, () => {
            //ツイートＡＰＩに送信
            //結果ツイート時にURLを貼るため、このゲームのURLをここに記入してURLがツイート画面に反映されるようにエンコードする
            const url = encodeURI("https://hothukurou.com"); // ツイートに載せるURLを指定(文字はエンコードする必要がある)
            window.open(`http://twitter.com/intent/tweet?text=SCORE:${score}点で力尽きた&hashtags=sample&url=${url}`); //ハッシュタグをsampleにする
        });
        tweetButton.x = 250; // ボタンの座標指定
        tweetButton.y = 500; // ボタンの座標指定
        endScene.addChild(tweetButton); // ボタンを結果画面シーンに追加
    }

    // 起動直後はゲームシーンを追加する
    createGameScene();
});
