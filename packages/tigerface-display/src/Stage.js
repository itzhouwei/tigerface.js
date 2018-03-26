import { Utilities as T, Logger } from 'tigerface-common';
import { Event, FrameEventGenerator } from 'tigerface-event';
import DomSprite from './DomSprite';
import Sprite from './Sprite';
import { DomEventAdapter } from "../../tigerface-event";

/**
 * 舞台
 *
 * @extends module:tigerface-display.DomSprite
 * @author 张翼虎 <zhangyihu@gmail.com>
 * @memberof module:tigerface-display
 */
class Stage extends DomSprite {
    static logger = Logger.getLogger(Stage.name);

    /**
     * @param options {object} 可选项
     *```
     *{
     *   fps: 60, // 每秒60帧
     *   preventDefault: true,
     *}
     *```
     *
     * @param dom 指定舞台 Dom 节点
     */
    constructor(options, dom) {
        const props = {
            clazzName: Stage.name,
            fps: 60, // 每秒60帧
            preventDefault: true,
        };

        super(props, dom);

        this.assign(options);

        this._covers_ = [];

        // 定义 Dom 引擎
        this.domAdapter = new DomEventAdapter(this.dom, {
            preventDefault: this.preventDefault,
        }, this);

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


        this.frameAdapter = new FrameEventGenerator({ fps: this.fps });
        this.frameAdapter.on(Event.REDRAW, () => this._paint_());
        this.frameAdapter.on(Event.ENTER_FRAME, () => this._onEnterFrame_());


        this.on(Event.MouseEvent.MOUSE_MOVE, e => this._onMouseMove_(e));
        this.on(Event.MouseEvent.CLICK, e => this._onMouseEvents_(e));
        this.on(Event.MouseEvent.DOUBLE_CLICK, e => this._onMouseEvents_(e));
        this.on(Event.MouseEvent.CONTEXT_MENU, e => this._onMouseEvents_(e));
        this.on(Event.MouseEvent.MOUSE_DOWN, e => this._onMouseEvents_(e));
        this.on(Event.MouseEvent.MOUSE_UP, e => this._onMouseEvents_(e));
        this.on(Event.MouseEvent.MOUSE_OUT, e => this._onMouseEvents_(e));

        this.domCount = 0;
    }

    /**
     * 添加子对象前调用，覆盖超类方法
     * @param child {module:tigerface-display.DisplayObject} 子对象
     * @return {boolean} 是否允许添加
     * @package
     */
    _onBeforeAddChild_(child) {
        if (!child.isLayer) {
            this.logger.warn('添加失败，Stage 上只能放置 DomLayer、Canvas Layer 或者其子类的实例');
            return false;
        }
        return true;
    }

    /**
     * Dom 鼠标移动事件侦听器
     * @param e {object} 事件数据
     * @package
     */
    _onMouseMove_(e) {
        this.mousePos = e.pos;
        for (let i = this.children.length - 1; i >= 0; i -= 1) {
            const child = this.children[i];
            if (child instanceof Sprite) {
                child._onStageMouseMove_(e.pos);
            }
        }
        // this.postChange('stage mouse move');
    }

    /**
     * Dom 鼠标事件侦听器
     * @param e {object} 事件数据
     * @package
     */
    _onMouseEvents_(e) {
        this.mousePos = e.pos;
        for (let i = this.children.length - 1; i >= 0; i -= 1) {
            const child = this.children[i];
            if (child instanceof Sprite) {
                child._onStageMouseEvents_(e.eventName, { pos: this.mousePos });
            }
        }
        // this.postChange('stage mouse event');
    }

    /**
     * Dom 检查帧速是否设置合理
     * @param v {number} 帧数
     * @return {number} 过滤后的帧数
     * @private
     */
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

    /**
     * 帧数
     * @member {number}
     */
    set fps(v) {
        this.props.fps = this._checkFPS_(v);
        this.logger.info(`舞台帧速率设置为 ${this.fps}`);

        if (this.frameAdapter) this.frameAdapter.fps = this.fps;
    }

    get fps() {
        return this.props.fps;
    }

    /**
     * 增加封面 Dom
     * @param cover
     * @package
     */
    _addCover_(cover) {
        if (cover.isCover) {
            cover.parent = this;
            this.dom.appendChild(cover.dom);
            this._covers_.push(cover);
            this._onCoversChanged_();
        }
    }

    /**
     * 封面容器改变时调用，计算封面 z 轴坐标
     * @private
     */
    _onCoversChanged_() {
        this._covers_.forEach((cover, i) => {
            cover.setStyle({ 'z-index': (i + this.domCount) * 10 });
        });
    }

    _onChildrenChanged_() {
        super._onChildrenChanged_();
        this._onCoversChanged_();
    }

    /**
     * 显示封面，同一时间仅允许显示一个封面
     * @param cover
     */
    showCover(cover) {
        this._covers_.forEach((_cover) => {
            _cover.hide();
        });
        cover.show();
    }

    hideCover(cover) {
        cover.hide();
    }

    /**
     * 签名
     * @private
     */
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
