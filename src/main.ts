import { argv0 } from "process";
import { FPCamera } from "./camera";
import { CPURenderer } from "./cpu_renderer";
import { Renderer } from "./renderer";
import { Scene, Voxel } from "./scene";

const canvas = <HTMLCanvasElement>document.getElementById("canv");
const fps = <HTMLParagraphElement>document.getElementById("fps");
let camera = new FPCamera([0.0, 0.0, 0.0], 0.0, 0.0);
//let camera = new FPCamera([-8.0, 0.0, 0.0], 0.0, 50.0);
const scene = new Scene(camera);
const renderer = new Renderer(canvas, scene);

renderer.initialize();

let last_time = performance.now();

let camera_active = false;

addEventListener("mousedown", (e) => {
	if (e.button == 2) camera_active = true;
});

addEventListener("mouseup", (e) => {
	if (e.button == 2) camera_active = false;
	if (e.button == 0) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const hit = scene.ray_any(camera.screen_to_ray(x, y, canvas.width, canvas.height));
		if (hit) {
			let voxel = new Voxel();
			voxel.opacity = 0;
			scene.set_voxel(voxel, hit.voxel_position);
			return;
			//
			// console.log(`voxpos: ${hit.voxel_position}`);
			// console.log(`norm: ${hit.normal}`);
			// const vox = [
			// 	hit.voxel_position[0] + hit.normal[0],
			// 	hit.voxel_position[1] + hit.normal[1],
			// 	hit.voxel_position[2] + hit.normal[2]
			// ];
			//
			// console.log(`pos: ${hit.position}`);
			// console.log(`vox: ${vox}`);
			// console.log(`voxstart: ${vox[0] * scene.voxel_size - scene.grid_size / 2}`)
			//
			// const dist = hit.position[0] - (vox[0] * scene.voxel_size - scene.grid_size / 2);
			// console.log(`dist: ${dist}`);

		}
	}
});

addEventListener("mousemove", (e) => {
	if (camera_active) camera.mouse_move(camera, e);
});

addEventListener("contextmenu", (e) => {
	e.preventDefault();
	// const rect = canvas.getBoundingClientRect();
	// const x = e.clientX - rect.left;
	// const y = e.clientY - rect.top;
	// renderer.shoot_ray(x, y);
	return false;
});

addEventListener("keydown", (e) => {
	camera.keyboard_down(camera, e);
});

addEventListener("keyup", (e) => {
	camera.keyboard_up(camera, e);
});

requestAnimationFrame(function tick() {
	renderer.render();
	const elapsed = performance.now() - last_time;
	camera.tick(elapsed / 1000);
	last_time = performance.now();
	fps.innerText = Math.round((1 / elapsed) * 1000).toString() + " fps";

	requestAnimationFrame(tick);
});
