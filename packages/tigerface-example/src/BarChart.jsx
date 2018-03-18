/* eslint-disable no-unused-vars */
import React from 'react';
import {Rectangle, Square} from "tigerface-shape";
import {CanvasSprite} from "tigerface-display";
import {withSimpleSpriteComponent} from 'tigerface-react';
import {Utilities as T} from 'tigerface-common';

/**
 * User: zyh
 * Date: 2018/3/11.
 * Time: 11:03.
 */
const _default = {
    paddingLeft: 50,
    paddingTop: 0,
    unit: 20,
    scale: 3,
    xSpace: 5,
    ySpace: 5,
    font: '12px monaco',
    speed: 3,
    style: {
        margin:'30px auto'
    }
};

class BarChartSprite extends CanvasSprite {
    constructor(options) {
        super(options);
        this._data_ = [];
        this.h0 = 0;
        this._config_ = _default;
        this.clazzName = 'BarChartSprite';
        this.name = 'BarChart';
    }

    putData(data, options) {
        this.data = data;
        this.config = options;
    }

    set config(v) {
        T.merge(this._config_, v);
    }

    get config() {
        return this._config_;
    }

    set data(v) {
        this._data_ = v;
    }

    get data() {
        return this._data_;
    }

    update(options) {
        super.update(options);
        this.h0 = 0;
    }

    paint() {
        let g = this.graphics;
        // g.flipH(this.height);

        let rects = [];
        let fonts = [];
        let finish = true;

        this.data.forEach(({name, num}, idx) => {
            let length = this.config.scale * num;
            if (length > this.h0) finish = false;
            // rects.push(
            //     new Rectangle(
            //         idx * (this.config.unit + this.config.xSpace) + this.config.xSpace,
            //         this.config.ySpace,
            //         this.config.width,
            //         Math.min(this.h0, length)
            //     )
            // );
            rects.push(
                [
                    new Rectangle(
                        this.config.xSpace + this.config.paddingLeft,
                        idx * (this.config.unit + this.config.ySpace) + this.config.ySpace + this.config.paddingTop,
                        Math.min(this.h0, length),
                        this.config.unit
                    ),
                    name,
                    num
                ]
            );
        });

        g.textBaseline = 'middle';

        rects.forEach(([bar, name, num], idx) => {
            g.lineWidth = 1;
            // g.fillStyle = 'rgba(0,0,255,0.5)';
            // g.strokeStyle = 'rgba(0,0,255,0.8)';
            g.fillStyle = this.config.colors[idx < this.config.colors.length ? idx : this.config.colors.length - 1];
            g.strokeStyle = g.fillStyle;

            g.textAlign = 'right';
            g.drawText(name, {
                x: this.config.paddingLeft,
                y: bar.top + this.config.unit / 2
            }, this.config.font, g.DrawStyle.FILL);

            g.drawRectangle(bar,
                g.DrawStyle.STROKE_FILL);
            g.lineWidth = 2;
            // g.save();
            // g.flipH(this.height);
            g.textAlign = 'left';
            g.drawText(num, {
                x: bar.left + bar.width + this.config.xSpace * 2,
                y: bar.top + this.config.unit / 2
            }, this.config.font, g.DrawStyle.FILL);
            // g.restore();
        });

        // 绘制图例
        g.textBaseline = 'top';
        g.textAlign = 'start';
        rects.forEach(([bar, name, num], idx) => {
            let str = `${name} [${num}]`;
            g.lineWidth = 1;
            g.fillStyle = this.config.colors[idx < this.config.colors.length ? idx : this.config.colors.length - 1];
            g.strokeStyle = g.fillStyle;
            // g.drawPoint(p1);
            let {width: w} = g.measureText(str);
            let left = idx % 4 * 90;
            let top = 205 + Math.floor(idx / 4) * 20;

            g.drawRectangle(new Square(left, top, 10), g.DrawStyle.STROKE_FILL);
            g.textBaseline = 'top';
            g.drawText(str, {x: left + 10 + this.config.xSpace, y: top}, this.config.font, g.DrawStyle.FILL);

        });

        this.h0 += this.config.speed;
        if (!finish) this.postChange();
    }
}

const barChart = new BarChartSprite();

export const putData = (data, config) => {
    barChart.putData(data, config);
};

export default withSimpleSpriteComponent(barChart, {
    className: barChart.config.className,
    style: barChart.config.style
});

// 以下是演示数据

// const colors = ['red', 'brown', 'blue', 'green', 'orange', 'olive', 'purple', 'deepskyblue', 'teal', 'maroon'];
// const data = [
//     {name: '何敏', num: 38},
//     {name: '王菲丽', num: 76},
//     {name: '张思雨', num: 25},
//     {name: '王明清', num: 48},
//     {name: '袁立', num: 22},
//     {name: '邢惠珊', num: 71},
//     {name: '李安和', num: 45}
// ];
//
// putData(
//     data,
//     {
//         speed: 3,
//         font: '12px Kaiti',
//         colors
//     }
// );