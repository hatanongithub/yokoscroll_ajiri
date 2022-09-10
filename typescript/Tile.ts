import * as PIXI from "pixi.js";

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
    constructor({ texture, resources, stage_data = [], selected = [] }) {
        super(texture);
        this.resources = resources;
        this.stage = stage_data;
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