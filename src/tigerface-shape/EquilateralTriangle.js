/**
 * User: zyh
 * Date: 2018/3/2.
 * Time: 22:46.
 */
import Polygon from './Polygon';
/**
 * 等边三角形
 *
 * @type {*|void}
 */
export default class EquilateralTriangle extends Polygon {
    constructor(x, y, l) {
        var radian = T.degreeToRadian(60);
        var x2 = Math.cos(radian) * l;
        var y2 = Math.sin(radian) * l;
        var points = [];
        points.push(new Point(x, y));
        points.push(new Point(x + l, y));
        points.push(new Point(x + x2, y - y2));
        super(points);
        this.className = EquilateralTriangle.name;
    }
}