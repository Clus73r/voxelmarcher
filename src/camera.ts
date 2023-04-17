import { vec3, mat4 } from "gl-matrix";
import { Deg2Rad } from "./math_util";

export class FPCamera {
	forward: vec3;
	right: vec3;
	up: vec3;
	position: vec3;
	eulers: vec3;
	view: mat4;

	constructor(position: vec3, theta: number, phi: number) {
		this.forward = vec3.create();
		this.right = vec3.create();
		this.up = vec3.create();
		this.position = position;
		this.eulers = [0, phi, theta];
		this.view = mat4.create();
		this.update();
	}

	update() {
		this.forward = [
			Math.cos(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
			Math.sin(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
			Math.sin(Deg2Rad(this.eulers[1]))
		]
		vec3.cross(this.right, this.forward, [0, 0, 1]);
		vec3.cross(this.up, this.right, this.forward);
		var target: vec3 = vec3.create();
		vec3.add(target, this.position, this.forward);
	}

	mouse_move(inst: FPCamera, e: MouseEvent) {
		console.log(`${e.movementX}, ${e.movementY}`);
		inst.eulers[1] = (inst.eulers[1] + e.movementY) % 360;
		inst.eulers[2] = (inst.eulers[2] + e.movementX) % 360;
		inst.update();
	}
}

export class TPCamera {

}
