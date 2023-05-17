import { Vec3 } from "wgpu-matrix";
import { FPCamera } from "./camera";

export class Controller {
	camera: FPCamera;

	constructor(position: Vec3, theta: number, phi: number) {
		this.camera = new FPCamera(position, theta, phi);
		this.camera.setup();
	}

	tick(delta_time: number) {
		this.camera.tick(delta_time);
	}
}
