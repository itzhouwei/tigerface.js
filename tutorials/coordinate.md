[返回目录](readme.md)

## 坐标系

tigerface.js 的坐标系是相对坐标系。每个显示对象内部都使用自己的坐标系。
paint 方法里绘制的图形，加载的子显示对象都是基于从 (0,0) 作为原点的内部坐标系。

位置坐标是指显示对象在其父容器坐标系上的位置。

显示对象的内部坐标系的原点与其在父容器坐标系上的位置点对齐。


[下一章 边界](bound.md)