import { FPCamera } from "./camera";
import { Renderer } from "./renderer";
import { Scene, Voxel } from "./scene";
import { HDRTexture } from "./hdrtex";
import { Controller } from "./controller";
import { switch_latte, switch_mocha } from "./theme_switch";
import { SliceRenderer } from "./slice_renderer";

const canvas = <HTMLCanvasElement>document.getElementById("canv");
const fps = <HTMLParagraphElement>document.getElementById("fps");
const img = <HTMLParagraphElement>document.getElementById("kloppenheim_02");
const slice_canvas = <HTMLCanvasElement>document.getElementById("slice-canvas");
//let camera = new FPCamera([-8.0, 0.0, 0.0], 0.0, 50.0);
const scene = new Scene();
let controller = new Controller(scene, canvas, 12, 0.0, 0.0);
let renderer = new Renderer(canvas, scene, controller.camera);

scene.initialize_default_grid();
renderer.initialize(false);

let slice_renderer = new SliceRenderer(slice_canvas, scene);
slice_renderer.slice = 6;
slice_renderer.background = [30 / 255, 30 / 255, 46 / 255];
slice_renderer.update();

let last_time = performance.now();

let camera_active = false;

// const btn_renderer = <HTMLInputElement>document.getElementById("renderer");
// btn_renderer.addEventListener("change", (e) => {
//   renderer.shutdown();
//   renderer.initialize((<HTMLInputElement>e.target).checked);
// });
//

addEventListener("scroll", () => {
  document.documentElement.dataset.scroll = window.scrollY.toString();
});

requestAnimationFrame(function tick() {
  renderer.render();
  const elapsed = performance.now() - last_time;
  controller.tick(elapsed / 1000);
  last_time = performance.now();
  fps.innerText = Math.round((1 / elapsed) * 1000).toString() + " fps";

  requestAnimationFrame(tick);
});

addEventListener("mousedown", (e) => {
  if (e.button == 2) camera_active = true;
});

let theme = "mocha";
const btn_switch_theme = document.getElementById("menu_switch_theme");
btn_switch_theme?.addEventListener("click", (e) => {
  if (theme === "mocha") {
    theme = "latte";
    switch_latte();
    scene.background_color = [204 / 255, 208 / 255, 218 / 255];
    slice_renderer.set_background([204 / 255, 208 / 255, 218 / 255]);
  } else {
    theme = "mocha";
    switch_mocha();
    scene.background_color = [30 / 255, 30 / 255, 46 / 255];
    slice_renderer.set_background([30 / 255, 30 / 255, 46 / 255]);
  }
});

scene.background_color = [30 / 255, 30 / 255, 46 / 255];

const btn_rescale_canvas = document.getElementById("menu_rescale_canvas");
btn_rescale_canvas?.addEventListener("click", (e) => {
  const root = <HTMLElement>document.querySelector(":root");
  const scaled = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  canvas.height = scaled;
  canvas.width = scaled;
  renderer.shutdown();
  renderer.initialize(renderer.pathtracing);
});

//switch_latte();

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
