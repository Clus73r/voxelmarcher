import { FPCamera } from "./camera";
import { Renderer } from "./renderer";
import { Scene, Voxel } from "./scene";
import { HDRTexture } from "./hdrtex";
import { Controller } from "./controller";

const canvas = <HTMLCanvasElement>document.getElementById("canv");
const fps = <HTMLParagraphElement>document.getElementById("fps");
const img = <HTMLParagraphElement>document.getElementById("kloppenheim_02");
//let camera = new FPCamera([-8.0, 0.0, 0.0], 0.0, 50.0);
const scene = new Scene();
let controller = new Controller(scene, canvas, 12, 0.0, 0.0);
// let renderer = new Renderer(canvas, scene, controller.camera);

scene.initialize_default_grid();
// renderer.initialize(false);

let last_time = performance.now();

let camera_active = false;

// const btn_renderer = <HTMLInputElement>document.getElementById("renderer");
// btn_renderer.addEventListener("change", (e) => {
//   renderer.shutdown();
//   renderer.initialize((<HTMLInputElement>e.target).checked);
// });
//

requestAnimationFrame(function tick() {
  //  renderer.render();
  const elapsed = performance.now() - last_time;
  controller.tick(elapsed / 1000);
  last_time = performance.now();
  fps.innerText = Math.round((1 / elapsed) * 1000).toString() + " fps";

  requestAnimationFrame(tick);
});

addEventListener("mousedown", (e) => {
  if (e.button == 2) camera_active = true;
});

// addEventListener("mouseup", (e) => {
// 	if (e.button == 2) camera_active = false;
// 	if (e.button == 0) {
// 		const rect = canvas.getBoundingClientRect();
// 		const x = e.clientX - rect.left;
// 		const y = e.clientY - rect.top;
// 		const hit = scene.ray_any(camera.screen_to_ray(x, y, canvas.width, canvas.height));
// 		if (hit) {
// 			let voxel = new Voxel();
// 			voxel.opacity = 0;
// 			scene.set_voxel(voxel, hit.voxel_position);
// 		}
// 	}
// });

addEventListener("contextmenu", (e) => {
  e.preventDefault();
  // const rect = canvas.getBoundingClientRect();
  // const x = e.clientX - rect.left;
  // const y = e.clientY - rect.top;
  // renderer.shoot_ray(x, y);
  return false;
});
