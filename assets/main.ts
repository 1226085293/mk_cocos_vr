import { _decorator, Component, Node } from "cc";
import * as cc from "cc";
const { ccclass, property } = _decorator;

@ccclass("main")
export class main extends Component {
	/* ***************属性*************** */
	@property({ displayName: "摄像机", type: cc.Node })
	cameraNode: cc.Node = null;
	/* ***************private*************** */
	/** 上次触摸坐标 */
	private _last_touch_pos_v2: cc.Vec2;
	/* -------------------------------segmentation------------------------------- */
	onLoad() {
		this.node.on(
			cc.Node.EventType.TOUCH_MOVE,
			(event: cc.EventTouch) => {
				if (this._last_touch_pos_v2) {
					let move_pos_v2 = event
						.getLocation()
						.subtract(this._last_touch_pos_v2)
						.multiplyScalar(0.2);
					this.cameraNode.eulerAngles = this.cameraNode.eulerAngles
						.clone()
						.add(cc.v3(-move_pos_v2.y, move_pos_v2.x, 0));
				}
				this._last_touch_pos_v2 = event.getLocation();
			},
			this
		);
		this.node.on(
			cc.Node.EventType.TOUCH_END,
			(event: cc.EventTouch) => {
				this._last_touch_pos_v2 = null;
			},
			this
		);
	}
}
