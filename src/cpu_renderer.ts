import { vec3 } from "gl-matrix";
import { Scene } from "./scene";

class Ray {
	origin: vec3;
	direction: vec3;
	inv_direction: vec3;
	constructor(origin: vec3, direction: vec3) {
		this.origin = origin;
		this.direction = direction;
		this.inv_direction = [1, 1, 1];
		vec3.div(this.inv_direction, this.inv_direction, direction);
	}
}

function ray_box_intersection(ray: Ray, bmin: number[], bmax: number[]): boolean {
	let tmin: number = 0.0;
	let tmax: number = Infinity;

	for (let d = 0; d < 3; d++) {
		let t1 = (bmin[d] - ray.origin[d]) * ray.inv_direction[d];
		let t2 = (bmax[d] - ray.origin[d]) * ray.inv_direction[d];

		tmin = Math.min(Math.max(t1, tmin), Math.max(t2, tmin));
		tmax = Math.max(Math.min(t1, tmax), Math.min(t2, tmax));
	}

	return tmin <= tmax;
}

export class CPURenderer {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	scene: Scene;

	constructor(canvas: HTMLCanvasElement, scene: Scene) {
		this.canvas = canvas;
		this.scene = scene;
		this.context = <CanvasRenderingContext2D>canvas.getContext("2d");
	}

	initialize() {

	}

	render() {
		const s_x = this.canvas.width;
		const s_y = this.canvas.height;
		const hs_x = s_x / 2;
		const hs_y = s_y / 2;

		const imageData = this.context.createImageData(s_x, s_y);

		const aabbmin: vec3 = [0, 0, 0];
		const aabbmax: vec3 = [2, 2, 2];

		const cam = this.scene.camera;

		for (let x = 0; x < s_x; x++) {
			for (let y = 0; y < s_y; y++) {
				const id = y * s_x + x;
				const hor_coeff = vec3.scale(vec3.create(), cam.right, (x - hs_x) / s_x);
				const ver_coeff = vec3.scale(vec3.create(), cam.up, (y - hs_y) / s_y);
				let raw_direction: vec3 = vec3.add(vec3.create(), cam.forward, hor_coeff);
				vec3.add(raw_direction, raw_direction, ver_coeff);
				const ray_direction = vec3.normalize(vec3.create(), raw_direction);

				const ray = new Ray(cam.position, ray_direction);

				if (ray_box_intersection(ray, aabbmin, aabbmax)) {
					imageData.data[id * 4 + 0] = 0;
					imageData.data[id * 4 + 1] = 0;
					imageData.data[id * 4 + 2] = 0;
					imageData.data[id * 4 + 3] = 255;
				} else {
					imageData.data[id * 4 + 0] = x % 255;
					imageData.data[id * 4 + 1] = y % 255;
					imageData.data[id * 4 + 2] = 100;
					imageData.data[id * 4 + 3] = 255;
				}
			}
		}
		this.context.putImageData(imageData, 0, 0);
	}
}
