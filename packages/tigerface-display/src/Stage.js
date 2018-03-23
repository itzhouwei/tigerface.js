import { Utilities as T, Logger } from 'tigerface-common';
import { Event, FrameEventGenerator } from 'tigerface-event';
import DomSprite from './DomSprite';
import Sprite from './Sprite';

/**
 * 舞台
 *
 * @extends DomSprite
 * @author 张翼虎 <zhangyihu@gmail.com>
 * @memberof module:tigerface-display
 */
class Stage extends DomSprite {
    static logger = Logger.getLogger(Stage.name);

    /**
     * 构建舞台
     * @constructor
     * @param options 可选项
     * @param dom 舞台节点, 缺省是 document
     */
    constructor(options = undefined, dom = undefined) {
        const props = {
            clazzName: Stage.name,
            fps: 60, // 每秒60帧
            preventDefault: true,
            style: { position: DomSprite.Position.RELATIVE },
        };

        super(props, dom);

        this.domAdapter.handler = this;

        // 缺省的相对定位
        // this.setStyle({"position", DomSprite.Position.RELATIVE);

        // 舞台标识
        this._stage_ = this;

        // 如果舞台绑定的是局部 Dom 对象，那么在这个 Dom 对象里绘制签名
        // this._signing_();

        // 增加屏幕方向翻转检测

        window.onOrientationChange = () => {
            const orientation = window.orientation || 0;
            this.dispatchEvent(Event.ORIENTATION_CHANGE, {
                orientation,
                width: window.screen.width,
                height: window.screen.height,
            });
        };
        // this.on(Event.ENTER_FRAME, ()=>console.log(this.name+" ENTER_FRAME "+new Date().getSeconds()));

        this.assign(options);

        this.frameAdapter = new FrameEventGenerator({ fps: this.fps });
        this.frameAdapter.on(Event.REDRAW, () => this._paint_());
        this.frameAdapter.on(Event.ENTER_FRAME, () => this._onEnterFrame_());

        this.on(Event.MouseEvent.MOUSE_MOVE, e => this._onMouseMove_(e));
    }

    _onMouseMove_(e) {
        this._mouseX_ = e.pos.x;
        this._mouseY_ = e.pos.y;

        for (let i = this.children.length - 1; i >= 0; i -= 1) {
            const child = this.children[i];
            if (child instanceof Sprite) {
                child._onStageMouseMove_(e.pos, 2);
            }
        }
    }

    _checkFPS_(v) {
        // 帧数控制在至少 12 帧
        if (v < 12) {
            this.logger.warn(`帧数 [${this.fps}] 限制为最少 12 帧`);
            return 12;
        } else if (v > 60) {
            this.logger.warn(`帧数 [${this.fps}] 限制为最多 60 帧`);
            return 60;
        }
        return v;
    }

    set fps(v) {
        this.props.fps = this._checkFPS_(v);
        this.logger.info(`舞台帧速率设置为 ${this.fps}`);

        if (this.frameAdapter) this.frameAdapter.fps = this.fps;

        // if (this.frameAdapter) this.frameAdapter.destroy();
        // this.frameAdapter = new FrameEventGenerator({fps: this.fps});
        // this.frameAdapter.on(Event.REDRAW, () => this._paint_());
        // this.frameAdapter.on(Event.ENTER_FRAME, () => this._onEnterFrame_());
    }

    get fps() {
        return this.props.fps;
    }

    _signing_() {
        const sign = 'Paint by TigerFace.js 0.10 - tigerface.org';
        const devicePixelRatio = window.devicePixelRatio || 1;
        const font = `${10 * devicePixelRatio}px Microsoft YaHei`;
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.font = font;
        const width = ctx.measureText(sign).width + 20;
        const height = 20;
        ctx.canvas.width = width;
        ctx.canvas.height = height * devicePixelRatio;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';

        // 改变 canvas 尺寸后，原来的设置的 font 失效，再次设置
        ctx.font = font;

        ctx.strokeText(sign, 10, ctx.canvas.height / 2);
        ctx.fillText(sign, 10, ctx.canvas.height / 2);

        const data = ctx.canvas.toDataURL();
        this.setStyle({
            'background-image': `url(${data})`,
            'background-position': 'right bottom',
            'background-repeat': 'no-repeat',
            'background-size': `${T.round(width / devicePixelRatio)}px ${height}px`,
        });
    }
}

export default Stage;
