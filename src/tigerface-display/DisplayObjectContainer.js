/**
 * User: zyh
 * Date: 2018/2/27.
 * Time: 14:13.
 */

import {EventDispatcher, Event} from 'tigerface-event';
import {Logger} from 'tigerface-common';
import DisplayObject from './DisplayObject';

export default class DisplayObjectContainer extends DisplayObject {
    static logger = Logger.getLogger(DisplayObjectContainer.name);

    constructor(...args) {
        super(...args);

        // 上级容器
        this._parent_ = null;

        // 下级显示对象
        this._children_ = [];
    }

    set parent(value) {
        this._parent_ = value;
    }

    get parent() {
        return this._parent_;
    }

    set children(v) {
        DisplayObjectContainer.logger.error('不允许设置或覆盖 children 属性');
    }

    get children() {
        return this._children_;
    }

    /***************************************************************************
     *
     * 容器方法
     *
     **************************************************************************/

    /**
     * 添加子显示对象
     * @param child {DisplayObject} 子显示对象
     * @returns {DisplayObjectContainer} 返回本容器, 支持链式调用，例如：a.addChild(b).addChild(c);
     */
    addChild(child) {
        // 子节点添加前调用方法，可用于检查合法性
        if (this._onBeforeAddChild_(child) === false) {
            DisplayObjectContainer.logger.debug('子显示对象添加失败', child);
            return this;
        }
        // 将子节点添加至容器最后
        this.children.push(child);

        // 设置本容器为子节点的 parent
        child.parent = this;

        // 子节点添加完成事件方法
        this._onAddChild_(child);

        // 子节点整体发生变化事件方法
        this._onChildrenChanged_();

        return this;
    }

    /**
     * 移除指定子显示对象
     * @param child {DisplayObject} 要移除的子显示对象
     * @returns {DisplayObjectContainer} 返回本容器, 支持链式调用，例如：a.addChild(b).addChild(c);
     */
    removeChild(child) {
        // 移除前调用方法，可用于检查合法性
        if (this._onBeforeRemoveChild_(child) === false) {
            DisplayObjectContainer.logger.debug('removeChild 子显示对象移除失败', child);
            return this;
        }

        // 执行移除
        this._removeChild_(child);

        // 调用事件方法
        this._onRemoveChild_(child);
        this._onChildrenChanged_();

        // 状态已改变
        this.postChange("removeChild");

        return this;
    }

    /**
     * 执行移除。内部调用方法，不调用事件方法
     * @param child {DisplayObject}
     * @private
     */
    _removeChild_(child) {
        var index = this.getChildIndex(child);
        this._removeChildAt_(index);
    }

    /**
     * 移除指定位置的子对象
     * @param index {Integer}
     * @returns {Container}
     */
    removeChildAt(index) {
        // 移除前调用方法，可用于检查合法性

        if (index < 0 || index >= this.children.length || this._onBeforeRemoveChild_(this.children[index]) === false) {
            DisplayObjectContainer.logger.debug('removeChildAt() 子显示对象移除失败', index);
            return this;
        }

        let child = this.children[index];

        // 执行移除
        this._removeChildAt_(index);

        // 调用事件方法
        this._onRemoveChild_(child);
        this._onChildrenChanged_();

        // 状态已改变
        this.postChange("removeChildAt");

        return this;
    }

    _removeChildAt_(index) {
        if (index > -1)
            this.children.splice(index, 1);
    }

    /**
     * 移除指定开始截止位置的多个子对象
     * @param startIndex
     * @param endIndex
     * @returns {Container}
     */
    removeChildren(startIndex, endIndex) {
        if (startIndex == undefined)
            startIndex = 0;
        if (endIndex == undefined)
            endIndex = this.children.length - 1;
        this.children.splice(startIndex, endIndex - startIndex + 1);

        this._onChildrenChanged_();
        this.postChange("removeChildren");
        return this;
    }

    /**
     * 是否包含指定子对象
     * @param child
     * @returns {boolean}
     */
    contains(child) {
        return this.children.includes(child);
    }

    /**
     * 获得指定位置的子对象
     * @param child
     * @returns {*}
     */
    getChildIndex(child) {
        return this.children.indexOf(child);
    }

    /***************************************************************************
     *
     * 子节点顺序方法
     *
     **************************************************************************/

    /**
     * 交换两个指定位置的子对象
     * @param index1
     * @param index2
     * @returns {Container}
     */
    swapChildrenAt(index1, index2) {
        var tmp = this.children[index1];
        this.children[index1] = this.children[index2];
        this.children[index2] = tmp;
        this._onChildrenChanged_();
        this.postChange("swapChildrenAt");
        return this;
    }

    /**
     * 交换两个子对象的位置
     * @param child1
     * @param child2
     * @returns {Container}
     */
    swapChildren(child1, child2) {
        var index1 = this.getChildIndex(child1);
        var index2 = this.getChildIndex(child2);
        this.swapChildrenAt(index1, index2);
        this._onChildrenChanged_();
        this.postChange("swapChildren");
        return this;
    }

    /**
     * 指定子对象的位置
     * @param child
     * @param index
     * @returns {Container}
     */
    setChildIndex(child, index) {
        this._removeChild_(child);

        if (index >= this.children.length)
            this.children.push(child);
        else if (index <= 0)
            this.children.unshift(child);
        else
            this.children.splice(index, 0, child);

        this._onChildrenChanged_();
        this.postChange("setChildIndex");
        return this;
    }

    /**
     * 设置子对象的位置为最顶层
     * @param child
     * @param neighbor 指定放在 neighbor 上面
     * @returns {Container}
     */
    setTop(child, neighbor) {
        if (child === neighbor) return;
        if (neighbor) {
            let n1 = this.getChildIndex(neighbor);
            let n0 = this.getChildIndex(child);
            this.setChildIndex(child, n0 < n1 ? n1 : n1 + 1);
        } else
            this.setChildIndex(child, this.children.length - 1);
        //
        this._onChildrenChanged_();
        this.postChange("setTop");
        return this;
    }

    /**
     * 设置子对象的位置为最底层
     * @param child
     * @param neighbor 指定放在 neighbor 下面
     * @returns {Container}
     */
    setBottom(child, neighbor) {
        if (child === neighbor) return;
        if (neighbor) {
            var n0 = this.getChildIndex(child);
            var n1 = this.getChildIndex(neighbor);
            this.setChildIndex(child, n0 > n1 ? n1 : n1 - 1);
        } else
            this.setChildIndex(child, 0);
        this._onChildrenChanged_();
        this.postChange("setBottom");

        return this;
    }

    /***************************************************************************
     *
     * 事件方法
     *
     **************************************************************************/

    /**
     * 子节点添加前调用的方法
     * 子类可通过重写此方法, 对将要添加的子节点进行检查, 如果返回 false, 可导致良性添加失败
     * @param child {DisplayObject} 子节点
     * @returns {boolean} 如果精确返回 false, 会导致添加失败
     */
    _onBeforeAddChild_(child) {
        return true;
    }

    /**
     * 绘制后调用的方法，子类需要根据情况覆盖此方法的实现
     *
     * @param ctx
     * @private
     */
    _onAfterPaint_(ctx) {
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            child._paint_(ctx);
        }
    }


    _onBeforeRemoveChild_(child) {
        return true;
    }

    _onRemoveChild_(child) {
        this.emit(Event.NodeEvent.CHILD_REMOVED, child);
    }

    _onChildrenChanged_() {
        this.emit(Event.NodeEvent.CHILDREN_CHANGED);
    }

    /**
     * 系统进入帧事件侦听器，将事件转发至自身的侦听器
     *
     */
    _onEnterFrame_() {
        super._onEnterFrame_();

        for (let child of this.children) {
            child._onEnterFrame_();
        }

    }

    /***************************************************************************
     *
     *
     *
     **************************************************************************/

    /**
     * 通过向祖先的递归遍历，获得 stage 对象
     */
    get stage() {
        if (!this._stage_) {
            var ancestors = [];
            var parent = this.parent;
            while (parent) {
                // 直到找到个知道stage的上级
                if (parent.stage) {
                    this.stage = parent.stage;
                    // 顺便把stage赋给全部没定义stage的上级
                    for (var i = 0; i < ancestors.length; i++) {
                        ancestors[i].stage = this._stage_;
                    }
                    break;
                } else {
                    ancestors.push(parent);
                }
                parent = parent.parent;
            }
        }
        return this._stage_;
    }

    set stage(v) {
        this._stage_ = v;
    }

    /**
     * 当子节点添加完成后被调用
     * @param child {DisplayObject}
     */
    _onAddChild_(child) {
        this.emit(Event.NodeEvent.CHILD_ADDED, child);
        child._onAppendToStage_();
    }

    /**
     * 判断是否已添加至 stage 链，如果能获得 stage 对象，那么发送 APPEND_TO_STAGE 事件
     * @private
     */
    _onAppendToStage_() {
        let stage = this.stage;
        if (stage && stage != this) {
            this.dispatchEvent(Event.APPEND_TO_STAGE);
            this.postChange("AppendToStage");
        }

        for (var i = this.children.length - 1; i >= 0; i--) {
            var child = this.children[i];
            child._onAppendToStage_();
        }
    }

}