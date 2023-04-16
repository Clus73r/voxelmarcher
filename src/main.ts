import { FPCamera } from "./camera";
import { CPURenderer } from "./cpu_renderer";
import { Renderer } from "./renderer";
import { Scene } from "./scene";

const canvas = <HTMLCanvasElement>document.getElementById("canv");
const fps = <HTMLParagraphElement>document.getElementById("fps");
let camera = new FPCamera([-8.0, 0.0, 0.0], 0.0, 0.0);
const scene = new Scene(camera);
const renderer = new Renderer(canvas, scene);

renderer.initialize();

let last_time = performance.now();



let camera_active = false;
addEventListener("mousedown", (e) => {
	camera_active = true;
});
addEventListener("mouseup", (e) => {
	camera_active = false;
});
addEventListener("mousemove", (e) => {
	if (camera_active) camera.mouse_move(camera, e);
});

requestAnimationFrame(function tick() {
	renderer.render();
	const elapsed = performance.now() - last_time;
	last_time = performance.now();
	fps.innerText = Math.round((1 / elapsed) * 1000).toString() + " fps";

	requestAnimationFrame(tick);
});
