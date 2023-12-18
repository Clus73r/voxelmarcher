import { FPCamera } from "./camera";
import { Renderer } from "./renderer";
import { Scene, Voxel } from "./scene";
import { HDRTexture } from "./hdrtex";
import { Controller } from "./controller";
import { switch_latte, switch_mocha } from "./theme_switch";
import { SliceRenderer } from "./slice_renderer";
const defaultScene = require("../assets/scene/meadow.json");

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

scene.load_scene(defaultScene);

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
  // console.log(`${window.scrollY} / ${window.innerHeight}`);
  let t = Math.min(2, window.scrollY / window.innerHeight);
  // console.log(window.scrollY / window.innerHeight);
  document.documentElement.style.setProperty("--canv-offset", t.toString());
  // document.documentElement.dataset.scroll = window.scrollY.toString();
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
function rescale() {
  const root = <HTMLElement>document.querySelector(":root");
  const scaled = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  root.style.setProperty("--canv-x", scaled.toString() + "px");
  root.style.setProperty("--canv-y", scaled.toString() + "px");
  canvas.height = scaled;
  canvas.width = scaled;
  renderer.shutdown();
  renderer.initialize(renderer.pathtracing);
}

btn_rescale_canvas?.addEventListener("click", (e) => {
  rescale();
});

rescale();

const btn_save_scene = document.getElementById("menu_save_scene");
function save() {
  const file = new Blob([scene.serialize_scene()], { type: "text/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = "scene.json";
  a.click();
  URL.revokeObjectURL(a.href);
}
btn_save_scene?.addEventListener("click", (e) => {
  save();
});

const btn_load_scene = document.getElementById("menu_load_scene");
function load() {
  const input = document.createElement("input");
  input.type = "file";
  input.addEventListener("change", (e) => {
    const file = (<FileList>input?.files)[0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.addEventListener("load", (e) => {
      const content = e.target?.result;
      scene.deserialize_scene(<string>content);
      renderer.shutdown();
      renderer.initialize(renderer.pathtracing);
    });
  });
  input.click();
}
btn_load_scene?.addEventListener("click", (e) => {
  load();
});

const btn_reset = document.getElementById("menu_reset");
function reset() {
  scene.reset();
}
btn_reset?.addEventListener("click", (e) => {
  reset();
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
