import { FPCamera } from "./camera";

const grid_size = 32;
const voxel_size = 1.0;

export class Scene {
	camera: FPCamera;
	grid: number[];
	boundary_length: number;

	constructor(camera: FPCamera) {
		this.camera = camera;
		this.grid = new Array<number>(grid_size * grid_size * grid_size);
		this.boundary_length = grid_size * voxel_size;
	}

	initialize_grid() {
		for (let x = 0; x < grid_size; x++){
			for (let y = 0; y < grid_size; y++){
				for (let z = 0; z < grid_size; z++){
					if (x > 30 || z < 1) {
						this.set_voxel(1, x, y, z);
					}
					else {
						this.set_voxel(0, x, y, z);
					}
				}
			}
		}
	}

	get_voxel (x: number, y: number, z: number): number {
		return this.grid[z * grid_size * grid_size + y * grid_size + x];
	}

	set_voxel (value: number, x: number, y: number, z: number) {
		this.grid[z * grid_size * grid_size + y * grid_size + x] = value;
	}
}
