import { vec3, mat4 } from "gl-matrix";
import { Deg2Rad } from "./math_util";
import { Ray } from "./scene";

export class FPCamera {
	forward: vec3;
	right: vec3;
	up: vec3;
	position: vec3;
	eulers: vec3;
	view: mat4;

	speed: number;
	inputs: boolean[];

	constructor(position: vec3, theta: number, phi: number) {
		this.forward = vec3.create();
		this.right = vec3.create();
		this.up = vec3.create();
		this.position = position;
		this.eulers = [0, phi, theta];
		this.view = mat4.create();
		this.update();
		this.inputs = [false, false, false, false, false, false];
		this.speed = 4;
	}

	tick(deltaTime: number) {
		let movement_vec = vec3.create();
		if (this.inputs[0])
			vec3.add(movement_vec, movement_vec, this.forward);
		if (this.inputs[1])
			vec3.add(movement_vec, movement_vec, this.right);
		if (this.inputs[2])
			vec3.add(movement_vec, movement_vec, vec3.scale(vec3.create(), this.forward, -1));
		if (this.inputs[3])
			vec3.add(movement_vec, movement_vec, vec3.scale(vec3.create(), this.right, -1));
		if (this.inputs[4])
			vec3.add(movement_vec, movement_vec, this.up);
		if (this.inputs[5])
			vec3.add(movement_vec, movement_vec, vec3.scale(vec3.create(), this.up, -1));

		vec3.normalize(movement_vec, movement_vec);
		vec3.add(this.position, this.position, vec3.scale(vec3.create(), movement_vec, this.speed * deltaTime))
	}

	update() {
		this.forward = [
			Math.cos(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
			Math.sin(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
			Math.sin(Deg2Rad(this.eulers[1]))
		]
		vec3.normalize(this.right, vec3.cross(this.right, this.forward, [0, 0, 1]));
		vec3.normalize(this.up, vec3.cross(this.up, this.right, this.forward));
		var target: vec3 = vec3.create();
		vec3.add(target, this.position, this.forward);
	}

	mouse_move(inst: FPCamera, e: MouseEvent) {
		inst.eulers[1] = Math.min(90, Math.max(-90, inst.eulers[1] - e.movementY));
		inst.eulers[2] = (inst.eulers[2] - e.movementX) % 360;
		inst.update();
	}

	keyboard_down(inst: FPCamera, e: KeyboardEvent) {
		if (e.key == 'e') inst.inputs[0] = true;
		if (e.key == 'd') inst.inputs[2] = true;
		if (e.key == 'f') inst.inputs[1] = true;
		if (e.key == 's') inst.inputs[3] = true;
		if (e.key == 'r') inst.inputs[4] = true;
		if (e.key == 'w') inst.inputs[5] = true;
	}

	keyboard_up(inst: FPCamera, e: KeyboardEvent) {
		if (e.key == 'e') inst.inputs[0] = false;
		if (e.key == 'd') inst.inputs[2] = false;
		if (e.key == 'f') inst.inputs[1] = false;
		if (e.key == 's') inst.inputs[3] = false;
		if (e.key == 'r') inst.inputs[4] = false;
		if (e.key == 'w') inst.inputs[5] = false;
	}

	screen_to_ray(x: number, y: number, sx: number, sy: number): Ray {
		const horizontal_coefficient = (x - sx / 2) / sx;
		const vertical_coefficient = (y - sy / 2) / -sy;

		let ray_direction = vec3.create();
		vec3.add(ray_direction, ray_direction, this.forward);
		vec3.add(ray_direction, ray_direction, vec3.scale(vec3.create(), this.right, horizontal_coefficient));
		vec3.add(ray_direction, ray_direction, vec3.scale(vec3.create(), this.up, vertical_coefficient));

		return new Ray(this.position, ray_direction);
	}
}
