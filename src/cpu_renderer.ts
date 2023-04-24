import { vec3 } from "gl-matrix";
import { Ray, RayHit, Scene } from "./scene";

const g: number[] = [
	1, 1, 1, 1,
	0, 0, 0, 0,
	1, 1, 1, 1,
	0, 0, 0, 0,
	1, 1, 1, 1,
	0, 0, 0, 0,
	1, 1, 1, 1,
	0, 0, 0, 0,
	1, 1, 1, 1,
	0, 0, 0, 0,
	1, 1, 1, 1,
	0, 0, 0, 0,
	1, 1, 1, 1,
	0, 0, 0, 0,
	1, 1, 1, 1,
	0, 0, 0, 0,
];

export class CPURenderer {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	scene: Scene;
	s_x: number;
	s_y: number;
	hs_x: number;
	hs_y: number;

	constructor(canvas: HTMLCanvasElement, scene: Scene) {
		this.canvas = canvas;
		this.scene = scene;
		this.context = <CanvasRenderingContext2D>canvas.getContext("2d");
		this.s_x = this.canvas.width;
		this.s_y = this.canvas.height;
		this.hs_x = this.s_x / 2;
		this.hs_y = this.s_y / 2;
	}

	initialize() {

	}

	render() {
		const imageData = this.context.createImageData(this.s_x, this.s_y);

		for (let x = 0; x < this.s_x; x++) {
			for (let y = 0; y < this.s_y; y++) {
				const id = y * this.s_x + x;
				// const col = this.compute(x, y);

				// imageData.data[id * 4 + 0] = col[0];
				// imageData.data[id * 4 + 1] = col[1];
				// imageData.data[id * 4 + 2] = col[2];
				// imageData.data[id * 4 + 3] = col[3];
			}
		}
		this.context.putImageData(imageData, 0, 0);
	}

	shoot_ray(x: number, y: number) {
		const cam = this.scene.camera;
		const hor_coeff = vec3.scale(vec3.create(), cam.right, (x - this.hs_x) / this.s_x);
		const ver_coeff = vec3.scale(vec3.create(), cam.up, (y - this.hs_y) / this.s_y);
		let raw_direction: vec3 = vec3.add(vec3.create(), cam.forward, hor_coeff);
		vec3.add(raw_direction, raw_direction, ver_coeff);
		const ray_direction = vec3.normalize(vec3.create(), raw_direction);

		const ray = new Ray(cam.position, ray_direction);
		// let ray_hit = new RayHit()

		// const did_hit = voxel_ray_any(ray, this.scene, ray_hit, true);
	}

	// compute(x: number, y: number): number[] {
	// 	const cam = this.scene.camera;
	// 	const hor_coeff = vec3.scale(vec3.create(), cam.right, (x - this.hs_x) / this.s_x);
	// 	const ver_coeff = vec3.scale(vec3.create(), cam.up, (y - this.hs_y) / this.s_y);
	// 	let raw_direction: vec3 = vec3.add(vec3.create(), cam.forward, hor_coeff);
	// 	vec3.add(raw_direction, raw_direction, ver_coeff);
	// 	const ray_direction = vec3.normalize(vec3.create(), raw_direction);
	//
	// 	const ray = new Ray(cam.position, ray_direction);
	// 	let ray_hit = new RayHit()
	// 	// if (ray_box_intersection(ray, this.scene.boundary_min, this.scene.boundary_max)) {
	// 	if (voxel_ray_any(ray, this.scene, ray_hit, false)) {
	// 		return [
	// 			ray_hit.voxel_index[0] / this.scene.voxel_count * 255,
	// 			ray_hit.voxel_index[1] / this.scene.voxel_count * 255,
	// 			ray_hit.voxel_index[2] / this.scene.voxel_count * 255,
	// 			255
	// 		];
	// 		// return [ray_hit.position[0] * 255, ray_hit.position[1] * 255, ray_hit.position[2] * 255, 255];
	// 	}
	//
	// 	return [ray_direction[0] * 255, ray_direction[1] * 255, ray_direction[2] * 255, 255];
	// }
}

function voxel_ray_any(ray: Ray, scene: Scene, ray_hit: RayHit, dbg: boolean): boolean {
	let tmin: number = 0.0;
	let tmax: number = Infinity;

	for (let d = 0; d < 3; d++) {
		let t1 = (scene.boundary_min[d] - ray.origin[d]) * ray.inv_direction[d];
		let t2 = (scene.boundary_max[d] - ray.origin[d]) * ray.inv_direction[d];

		tmin = Math.min(Math.max(t1, tmin), Math.max(t2, tmin));
		tmax = Math.max(Math.min(t1, tmax), Math.min(t2, tmax));
	}
	if (tmin > tmax) {
		return false;
	}

	const ray_entry = vec3.add(vec3.create(), ray.origin, vec3.scale(vec3.create(), ray.direction, tmin));
	const voxel = [
		Math.min(scene.voxel_count - 1, Math.floor((ray_entry[0] - scene.boundary_min[0]) / scene.voxel_size)),
		Math.min(scene.voxel_count - 1, Math.floor((ray_entry[1] - scene.boundary_min[1]) / scene.voxel_size)),
		Math.min(scene.voxel_count - 1, Math.floor((ray_entry[2] - scene.boundary_min[2]) / scene.voxel_size))
	];
	// ray_hit.position = ray_entry;
	// ray_hit.voxel = get_voxel(voxel, scene);

	let tmax_comp = vec3.create();
	let tdelta = vec3.create();
	let step = [0, 0, 0];
	let next_voxel = [0, 0, 0];

	for (let d = 0; d < 3; d++) {
		if (ray.direction[d] > 0.0) {
			step[d] = 1;
			tdelta[d] = scene.voxel_size / ray.direction[d];
			tmax_comp[d] = tmin + (scene.boundary_min[d] + next_voxel[d] * scene.voxel_size - ray_entry[d]) / ray.direction[d];
		} else {
			return false;
		}
	}

	// ray_hit.position = ray_entry;
	// ray_hit.voxel = get_voxel(voxel, scene);
	// ray_hit.voxel_index = voxel;
	// return true;

	while (
		voxel[0] >= 0 && voxel[0] < scene.voxel_count &&
		voxel[1] >= 0 && voxel[1] < scene.voxel_count &&
		voxel[2] >= 0 && voxel[2] < scene.voxel_count
	) {
		if (get_voxel(voxel, scene) != 0) {
			ray_hit.position = vec3.add(vec3.create(), ray.origin, vec3.mul(vec3.create(), ray.direction, tmax_comp));
			// ray_hit.voxel = get_voxel(voxel, scene);
			// ray_hit.voxel_index = voxel;
			if (dbg) {
				console.log(ray_entry)
				console.log(ray_hit);
			}
			return true;
		}
		if (tmax_comp[0] < tmax_comp[1] && tmax_comp[0] < tmax_comp[2]) {
			voxel[0] += step[0];
			tmax_comp[0] += tdelta[0];
		} else if (tmax_comp[1] < tmax_comp[2]) {
			voxel[1] += step[1];
			tmax_comp[1] += tdelta[1];
		} else {
			voxel[2] += step[2];
			tmax_comp[2] += tdelta[2];
		}
	}
	return false;
}

function get_voxel(v: number[], scene: Scene): number {
	return g[v[2] * scene.voxel_count * scene.voxel_count + v[1] * scene.voxel_count + v[0]];
}
