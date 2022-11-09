import * as PIXI from "pixi.js"; // node_modulesから PIXI.jsをインポート
import * as PIXI_SOUND from "pixi-sound";// node_modulesから PIXI_SOUNDをインポート
import { SceneManager } from "./scene_manager"; // シーン管理を行うクラスをインポート
import { createButton } from "./create_button"; // ボタン生成関数をインポート
import *as SGE from "./Scroll_Game_Engine";
import { ScrollGameEngine } from "./Scroll_Game_Engine"
import * as Weapons from "./Weapons";
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
PIXI.Loader.shared.add("sound/shoot.mp3");
PIXI.Loader.shared.add("sound/equip.mp3");
PIXI.Loader.shared.add("sound/missile.mp3");
PIXI.Loader.shared.add("sound/swing.mp3");
PIXI.Loader.shared.add("sound/explosion.mp3");
PIXI.Loader.shared.add("sound/select.mp3");
PIXI.Loader.shared.add("sound/boss1.mp3");


PIXI.Loader.shared.add("sheet.json")


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
let selected = [0, ""];
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
        "45wall",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15"
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
        "45wall",
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15"
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
        "45wall",
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15"
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
        "45wall",
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15"
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
        "45wall",
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15"
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15",
        0,
        "15",
        0,
        "15",
        "15",
        0,
        "15",
        0,
        "15",
        "15",
        0,
        "15",
        "15",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "45wall",
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15"
    ],
    [
        0,
        0,
        0,
        0,
        0,
        "0",
        "0",
        "15",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "0",
        "0",
        "0",
        0,
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        0,
        0,
        0,
        "15",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15",
        0,
        0,
        0,
        0,
        "0",
        0,
        0,
        0,
        "15",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "0",
        0,
        "45wall",
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15"
    ],
    [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "16",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15",
        0,
        "15",
        0,
        "15",
        "15",
        "0",
        "15",
        "0",
        "15",
        "15",
        0,
        0,
        "15",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15",
        "16",
        "15",
        0,
        0,
        0,
        0,
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "45wall",
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15"
    ],
    [
        0,
        0,
        0,
        "15",
        0,
        0,
        0,
        "16",
        0,
        0,
        0,
        0,
        "2{\"texture\":\"kakashi.png\", \"speed\":0, \"reword\":10}",
        0,
        "0",
        "16",
        "2{\"texture\":\"kakashi.png\", \"speed\":0, \"reword\":90}",
        "16",
        0,
        "16",
        "16",
        "2{\"texture\":\"kakashi.png\", \"speed\":0, \"reword\":100}",
        "16",
        "2{\"texture\":\"kakashi.png\", \"speed\":0, \"reword\":100}",
        "16",
        "16",
        0,
        "15",
        0,
        0,
        "2{ \"texture\": \"chara1.png\", \"speed\": 3}",
        0,
        0,
        0,
        0,
        0,
        "2",
        0,
        0,
        0,
        0,
        0,
        "2",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "15",
        "16",
        "16",
        "16",
        0,
        0,
        0,
        0,
        "2",
        0,
        0,
        0,
        0,
        0,
        0,
        "2",
        0,
        0,
        0,
        "2",
        0,
        0,
        0,
        0,
        0,
        "15",
        "0",
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "2{\"texture\":\"boss.png\", \"health\":30, \"speed\":1, \"boss\": 1, \"reword\": 1000}",
        0,
        0,
        "0",
        0,
        "15"
    ],
    [
        "15",
        "15",
        "15",
        "16",
        "15",
        "15",
        "15",
        "16",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "16",
        "15",
        "16",
        "15",
        "16",
        "16",
        "15",
        "16",
        "15",
        "16",
        "16",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "16",
        "16",
        "16",
        "16",
        "15",
        0,
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "16",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15",
        "15"
    ],
    [
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "0",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16",
        "16"
    ]
]

// プリロード処理が終わったら呼び出されるイベント
PIXI.Loader.shared.load((loader, resources) => {
    /**
     * 状態が変化する変数一覧
     */

    let score = 0; // スコア
    const game_data = new SGE.game_data();
    //game_data.KP = 0;
    game_data.max_health = 5;

    const sheet = resources["sheet.json"];

    /**
     * ゲームのメインシーンを生成する関数
     */
    function createGameScene() {
        let bossStop = [60, 0];
        window.addEventListener("keydown", keydown);
        window.addEventListener("keyup", keyup);
        function keydown(e) {
            chara_bool(e, 1);
        }
        function keyup(e) {
            chara_bool(e, 0);
        }
        window.addEventListener("keypress", keypress);
        function chara_bool(e: KeyboardEvent, status: number) {
            if (e.key == "x") {
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
            if (e.code == "ArrowLeft") {
                bool[0] = status;
            }
            if (e.key == "ArrowRight") {
                bool[1] = status;
            }
            if (e.key == "ArrowDown") {
                bool[2] = status;
                gravity = (0.3 + status * 0.6) * grid / 50;
            }
            if (e.key == "z") {
                engine.chara.effect.fire();
            }
        }
        function jump(is_jump) {
            if (is_jump < engine.game_data.max_jump) {
                if (is_sound) {
                    resources["sound/hit.mp3"].sound.play();
                }
                engine.chara.Vy = -8 * grid / 50; // ジャンプする
                return (is_jump += 1);
            }
        }
        function removeListener() {
            window.removeEventListener("keydown", keydown);
            window.removeEventListener("keyup", keyup);
            window.removeEventListener("keypress", keypress);
        }
        function keypress(e) {
            if (!isNaN(Number(e.key)) && Number(e.key) < 7) {
                selected[0] = Number(e.key);
                if (selected[0] != 0 && selected[0] != 2) {
                    selected[1] = this.window.prompt("", "");
                }
            }
            if (e.key == "d") {
                debug = (1 - debug);
                for (let i = 0; i < map_sizey; ++i) {
                    for (let j = 0; j < map_sizex; ++j) {
                        engine.tiles[i][j].interactive = !!debug;
                        let bool = !(engine.tiles[i][j].state.toString()[0] == "0" || engine.tiles[i][j].state[0] == "2" || engine.tiles[i][j].state[0] == "4");
                        engine.tiles[i][j].alpha = 1 * Number(debug || bool);
                    }
                }
                console.log(debug)
            }
            if (e.key == "c") {
                engine.chara.effect.alpha = 0;
                engine.chara.effect.cool_down = 0;
                engine.chara.effect.delete();
                if (engine.chara.effect == engine.chara.main) {
                    engine.chara.effect = engine.chara.sub;
                }
                else {
                    engine.chara.effect = engine.chara.main;
                }
                resources["sound/equip.mp3"].sound.play();
            }
            if (debug) {
                if (e.key == "f") {
                    console.log(engine.stage)
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
                else if (e.key == "h") {
                    engine.statusbar.changeHealth(engine.chara.health + 1);
                    engine.chara.health += 1;
                }
                else if (e.key == "l") {
                    engine.chara.sub = new Weapons.Launcher(engine.chara);
                }
                else if (e.key == "g") {
                    engine.chara.sub = new Weapons.Gun(engine.chara);
                }
                else if (e.key == "k") {
                    engine.change_KP(engine.KP + 600);
                }
                else if (e.key == "r") {
                    engine.chara.alive = 0;
                }
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
        const engine = new ScrollGameEngine(resources, app, selected, stage_data, bool, gameScene, game_data);
        //背景から生成していく
        engine.back = new PIXI.Sprite(sheet.textures["back.png"]);
        gameScene.addChild(engine.back)
        gameScene.addChild(engine.gameScreen)

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
            if (!engine.stage_clear) {
                for (let enemy of engine.enemies) {
                    enemy.input();
                    enemy.tackle();
                }
                for (let enemy of engine.dead) {
                    enemy.input();
                }
                engine.chara.input();
                engine.chara.effect.act();
                if (engine.chara.y > engine.back.height) {
                    createEndScene();
                    removeListener();
                }

                if (engine.chara.alive == 0) {
                    createEndScene();
                    removeListener();
                }
            }
            else {
                if (bossStop[1] == 0) {
                    bossStop[1] = engine.clock;
                }
                else if (engine.clock - bossStop[1] > bossStop[0]) {
                    createTitle();
                    engine.save();
                    if (engine.bgm) {
                        engine.bgm.stop();
                    }
                    removeListener();
                }
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
        const titleImg = new PIXI.Sprite(sheet.textures["title.png"]);
        const texsty = new PIXI.TextStyle({
            fontFamily: "ピグモ00",
            fontSize: 30,
            fill: 0xffffff,
        })
        const start = new PIXI.Sprite(sheet.textures["start.png"]);
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
        const how = new PIXI.Sprite(sheet.textures["start.png"]);
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
        const soundO = new PIXI.Sprite(sheet.textures["sound_on.png"]);
        const soundOF = new PIXI.Sprite(sheet.textures["sound_off.png"]);
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

    function createStageSelect() {
        const back = PIXI.Sprite.from(sheet.textures["back.png"]);
    }

    function createShop() {
        const gameScene = new PIXI.Container;
        app.stage.addChild(gameScene)
        const back = PIXI.Sprite.from(sheet.textures["back.png"])
        gameScene.addChild(back)
        class Goods extends PIXI.Container {
            constructor(name, price, width = 600, height = 50) {
                super()
                this.btn_A = new PIXI.Graphics()
                    .beginFill(0xffffff)
                    .drawRect(0, 0, width, height)
                    .endFill()

                this.name_label = new PIXI.Text(name)
                this.name_label.x = 5;
                this.name_label.y = 10;
                this.price_label = new PIXI.Text(price)
                this.price_label.x = 5 + width / 2;
                this.price_label.y = 10;
                this.addChild(this.btn_A)
                this.addChild(this.name_label)
                this.addChild(this.price_label)

            }
            btn_A
            name_label: PIXI.Text
            price_label: PIXI.Text
        }
        class Selector extends PIXI.Container {
            constructor(objects, width = 600, height = 400, count = 8) {
                super();
                let counter = 0;
                this.table = new PIXI.Container
                this.count_this = count;
                for (let i of objects) {
                    let goods = new Goods(i[0], i[1], width, height / count);
                    this.contents.push(goods);
                    goods.x = 0;
                    goods.y = counter * goods.height;
                    if (counter >= count) {
                        goods.alpha = 0;
                    }
                    this.table.addChild(goods);
                    ++counter;
                }
                this.addChild(this.table)
                this.marker = new PIXI.Graphics()
                    .lineStyle(2, 0xff0000, 1)
                    .drawRect(2, 3, this.contents[0].width - 5, this.contents[0].height - 4)
                this.addChild(this.marker)
                this.flame = new PIXI.Graphics()
                    .lineStyle(2, 0x000000, 1)
                    .drawRect(0, 1, width - 1, height - 1)
                this.addChild(this.flame)
                this.height_this = height;
            }
            flame = null;
            marker = null;
            table = null;
            height_this = null;
            count_this = null;
            up() {
                if (this.index > 0) {
                    if (this.marker.y + 4 > this.height_this / this.count_this) {
                        this.marker.y -= this.contents[0].height;
                    }
                    else {
                        this.table.y += this.contents[0].height;
                        this.contents[this.index - 1].alpha = 1;
                        this.contents[this.index + this.count_this - 1].alpha = 0;
                    }
                    --this.index;
                }
            }
            down() {
                console.log(this.index)
                if (this.contents.length - 1 > this.index) {
                    if (this.marker.y + this.marker.height < this.height_this - this.contents[0].height)
                        this.marker.y += this.contents[0].height;
                    else {
                        this.table.y -= this.contents[0].height;
                        this.contents[this.index + 1].alpha = 1;
                        this.contents[this.index - this.count_this + 1].alpha = 0;
                        //this.marker.y += 50;
                    }
                    ++this.index;
                }
                console.log(this.parent.height - this.contents[0].height, this.marker.y + this.contents[0].height)
            }
            select() {
                if (this.index == 3) {
                    alert(this.contents[this.index].price_label.text)
                }
            }
            contents = [];
            index = 0;
        }
        const goods = [["hatano", 100], ["takashi", 200], ["wawawa", 9999999], ["wawawa", 9999999], ["wawawa", 9999999], ["wawawa", 9999999], ["wawawa", 9999999], ["wawawa", 9999999], ["hatano", 100]]
        const selector = new Selector(goods, 240, 240, 6);
        selector.x = 300;
        gameScene.addChild(selector)
        window.addEventListener("keydown", keydown);
        function keydown(e) {
            if (e.key == "ArrowUp") {
                console.log("arrowup")
                selector.up();
            }
            else if (e.key == "ArrowDown") {
                console.log("arrowdown")
                selector.down();
            }
        }
        window.addEventListener("keypress", keypress);
        function keypress(e) {
            if (e.key == "z") {
                selector.select();
            }
        }
        let KP = new PIXI.Text(game_data.KP.toString())
        gameScene.addChild(KP)
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
        const backHowTo = new PIXI.Sprite(sheet.textures["howToBack.png"]);
        const backHowTo2 = new PIXI.Sprite(sheet.textures["howToBack.png"]);
        const next = new PIXI.Sprite(sheet.textures["nextbutton.png"]);
        const back = new PIXI.Sprite(sheet.textures["backbutton.png"]);
        const gamestart = new PIXI.Sprite(sheet.textures["startbutton.png"]);
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
        const soundO = new PIXI.Sprite(sheet.textures["sound_on.png"]);
        const soundOF = new PIXI.Sprite(sheet.textures["sound_off.png"]);
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
