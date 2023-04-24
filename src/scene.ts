import { vec3 } from "gl-matrix";
import { FPCamera } from "./camera";

// const grid_size = 2;
// const voxel_count = 4;
// const voxel_size = grid_size / voxel_count;

type OptRayHit = RayHit | undefined;

export class Ray {
	origin: vec3;
	direction: vec3;
	inv_direction: vec3;
	constructor(origin: vec3, direction: vec3) {
		this.origin = origin;
		this.direction = vec3.normalize(vec3.create(), direction);
		this.inv_direction = [1, 1, 1];
		vec3.div(this.inv_direction, this.inv_direction, direction);
	}
}

export class RayHit {
	position: vec3;
	voxel_position: number[];
	voxel: Voxel;
	constructor(position: vec3, voxel_position: number[], voxel: Voxel) {
		this.position = position;
		this.voxel_position = voxel_position;
		this.voxel = voxel;
	}
}

export class Voxel {
	color: vec3 = vec3.create();
	opacity: number = 0.0;
}

export class Scene {
	camera: FPCamera;
	grid: Voxel[];
	boundary_min: vec3;
	boundary_max: vec3;
	grid_size: number = 64;
	voxel_count: number = 16;
	voxel_size: number;

	constructor(camera: FPCamera) {
		this.camera = camera;
		this.grid = new Array<Voxel>(this.grid_size * this.grid_size * this.grid_size);
		this.boundary_min = [
			-this.grid_size / 2,
			-this.grid_size / 2,
			-this.grid_size / 2
		];
		this.boundary_max = [
			this.grid_size / 2,
			this.grid_size / 2,
			this.grid_size / 2
		];
		this.voxel_size = this.grid_size / this.voxel_count;
		this.initialize_grid();
	}

	initialize_grid() {
		this.grid = new Array(this.voxel_count ** 3);
		for (let x = 0; x < this.voxel_count; x++) {
			for (let y = 0; y < this.voxel_count; y++) {
				for (let z = 0; z < this.voxel_count; z++) {
					let voxel = new Voxel();
					if (z < 1 || z < y) {
						voxel.opacity = 1;
						voxel.color = [x / 16, y / 16, z / 16];
					}
					this.set_voxel_comp(voxel, x, y, z);
				}
			}
		}
	}

	ray_any(ray: Ray): OptRayHit {
		let tmin: number = 0.0;
		let tmax: number = Infinity;

		for (let d = 0; d < 3; d++) {
			let t1 = (this.boundary_min[d] - ray.origin[d]) * ray.inv_direction[d];
			let t2 = (this.boundary_max[d] - ray.origin[d]) * ray.inv_direction[d];

			tmin = Math.min(Math.max(t1, tmin), Math.max(t2, tmin));
			tmax = Math.max(Math.min(t1, tmax), Math.min(t2, tmax));
		}
		if (tmin > tmax) {
			return undefined;
		}

		const ray_entry = vec3.add(vec3.create(), ray.origin, vec3.scale(vec3.create(), ray.direction, tmin));
		const ray_exit = vec3.add(vec3.create(), ray.origin, vec3.scale(vec3.create(), ray.direction, tmax));
		let voxel = [
			Math.max(0, Math.min(this.voxel_count - 1, Math.floor((ray_entry[0] - this.boundary_min[0]) / this.voxel_size))),
			Math.max(0, Math.min(this.voxel_count - 1, Math.floor((ray_entry[1] - this.boundary_min[1]) / this.voxel_size))),
			Math.max(0, Math.min(this.voxel_count - 1, Math.floor((ray_entry[2] - this.boundary_min[2]) / this.voxel_size)))
		];
		let voxel_upper_edge = [
			voxel[0] + 1,
			voxel[1] + 1,
			voxel[2] + 1,
		]
		// console.log(``);
		// console.log(`entry: ${ray_entry}, (${voxel}, ${this.get_voxel_id(voxel)})`);
		// console.log(`hit: ${this.get_voxel(voxel)}`);
		// console.log(`tmin: ${tmin}`);
		// console.log(`tmin: ${tmax}`);

		let step = [0, 0, 0];
		let tmax_comp = [0, 0, 0];
		let tdelta = [0, 0, 0];
		let end_voxel = [0, 0, 0];
		let thit = tmin;

		for (let d = 0; d < 3; d++) {
			end_voxel[d] = Math.max(0, Math.min(this.voxel_count - 1, Math.floor((ray_exit[d] - this.boundary_min[d]) / this.voxel_size)));
			if (ray.direction[d] > 0.0) {
				step[d] = 1;
				tdelta[d] = this.voxel_size / ray.direction[d];
				tmax_comp[d] = tmin + (this.boundary_min[d] + voxel_upper_edge[d] * this.voxel_size - ray_entry[d]) / ray.direction[d];
				// console.log(`pos d: ${d}, boundarymin: ${this.boundary_min[d]}, current_voxel: ${voxel_upper_edge[d]}, voxel_size: ${this.voxel_size}, ray_entry: ${ray_entry[d]}, ray_dir: ${ray.direction[d]}`);
			} else if (ray.direction[d] < 0.0) {
				step[d] = -1;
				tdelta[d] = this.voxel_size / -ray.direction[d];
				tmax_comp[d] = tmin + (this.boundary_min[d] + voxel[d] * this.voxel_size - ray_entry[d]) / ray.direction[d];
				// console.log(`neg d: ${d}, boundarymin: ${this.boundary_min[d]}, prev voxel: ${voxel[d]}, calc: ${this.boundary_min[d] + voxel[d] * this.voxel_size - ray_entry[d]}, ray_entry: ${ray_entry[d]}, ray_dir: ${ray.direction[d]}`);
			} else {
				step[d] = 0;
				tdelta[d] = tmax;
				tmax_comp[d] = tmax;
			}
		}

		// while (
		// 	voxel[0] != end_voxel[0] ||
		// 	voxel[1] != end_voxel[1] ||
		// 	voxel[2] != end_voxel[2]) {
		while (
			voxel[0] < this.voxel_count && voxel[0] >= 0 &&
			voxel[1] < this.voxel_count && voxel[1] >= 0 &&
			voxel[2] < this.voxel_count && voxel[2] >= 0) {
			// console.log("");
			// console.log(voxel);
			// console.log(tmax_comp);
			// console.log(tdelta);

			if (this.get_voxel(voxel).opacity > 0.01) {
				const hit_position = vec3.add(vec3.create(), ray.origin, vec3.scale(vec3.create(), ray.direction, thit));
				return new RayHit(hit_position, voxel, this.get_voxel(voxel));
			}

			if (tmax_comp[0] < tmax_comp[1] && tmax_comp[0] < tmax_comp[2]) {
				voxel[0] += step[0];
				tmax_comp[0] += tdelta[0];
				thit += tdelta[0];
			} else if (tmax_comp[1] < tmax_comp[2]) {
				voxel[1] += step[1];
				tmax_comp[1] += tdelta[1];
				thit += tdelta[1];
			} else {
				voxel[2] += step[2];
				tmax_comp[2] += tdelta[2];
				thit += tdelta[2];
			}
		}

		return undefined;
	}

	get_voxel_id_comp(x: number, y: number, z: number): number {
		return z * this.voxel_count * this.voxel_count + y * this.voxel_count + x;
	}

	get_voxel_id(voxel: number[]): number {
		return voxel[2] * this.voxel_count * this.voxel_count + voxel[1] * this.voxel_count + voxel[0];
	}

	get_voxel_comp(x: number, y: number, z: number): Voxel {
		return this.grid[z * this.voxel_count * this.voxel_count + y * this.voxel_count + x];
	}

	get_voxel(voxel: number[]): Voxel {
		return this.grid[voxel[2] * this.voxel_count * this.voxel_count + voxel[1] * this.voxel_count + voxel[0]];
	}

	set_voxel(value: Voxel, voxel: number[]) {
		this.grid[voxel[2] * this.voxel_count * this.voxel_count + voxel[1] * this.voxel_count + voxel[0]] = value;
	}

	set_voxel_comp(value: Voxel, x: number, y: number, z: number) {
		this.grid[z * this.voxel_count * this.voxel_count + y * this.voxel_count + x] = value;
	}
}
