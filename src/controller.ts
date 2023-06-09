import { Vec2, Vec3, vec2, vec3 } from "wgpu-matrix";
import { FPCamera } from "./camera";
import { OrbitCamera } from "./orbit_camera";
import { RayHit, Scene, Voxel } from "./scene";

export class Controller {
  camera: OrbitCamera;
  scene: Scene;
  canvas: HTMLCanvasElement;
  mouse_down: boolean = false;
  mouse_dragged: boolean = false;

  last_move: number = 0;
  last_movement: Vec2;
  velocity: Vec2 = [0, 0];
  
  selected_color: Vec3 = [0, 0, 0];
  selected_roughness: number = 1;
  selected_opacity: number = 1;
  selected_lightness: number = 0;
  
  selected_tool: "place" | "replace" | "remove";
  
  blub_high: HTMLAudioElement;
  blub_low: HTMLAudioElement;

  constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    distance: number,
    theta: number,
    phi: number
  ) {
    this.camera = new OrbitCamera(distance, theta, phi);
    this.setup();
    this.last_move = performance.now();
    this.last_movement = [0, 0];
    this.scene = scene;
    this.canvas = canvas;
    this.selected_tool = "place";
    this.blub_high = <HTMLAudioElement> document.getElementById("blub_high");
    this.blub_low = <HTMLAudioElement> document.getElementById("blub_low");
  }

  tick(delta_time: number) {
    this.camera.tick(delta_time);
  }

  setup() {
    addEventListener("mousedown", (e) => {
      if (e.button == 0) {
        this.mouse_down = true;
        this.mouse_dragged = false;
        this.camera.dragged = true;
        this.last_move = performance.now();
      }
    });
    addEventListener("mouseup", (e) => {
      if (e.button == 0) {
        this.mouse_down = false;
        this.camera.dragged = false;
        this.camera.velocity = [...this.velocity];
        if (!this.mouse_dragged) {
          const rect = this.canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          let voxel = this.scene.ray_any(
            this.camera.screen_to_ray(x, y, rect.width, rect.height)
          );
          if (voxel) {
            switch (this.selected_tool) {
              case "place":
                let n_voxel = new Voxel();
                n_voxel.color = this.selected_color;
                n_voxel.roughness = this.selected_roughness;
                n_voxel.lightness = this.selected_lightness;
                n_voxel.opacity = this.selected_opacity;
                  this.scene.set_voxel(n_voxel, voxel.voxel_position.map((val, i) => val + (<RayHit>voxel).normal[i]));
                  this.blub_high.play();
                break;
              case "replace":
                let r_voxel = new Voxel();
                r_voxel.color = this.selected_color;
                r_voxel.roughness = this.selected_roughness;
                r_voxel.lightness = this.selected_lightness;
                r_voxel.opacity = this.selected_opacity;
                  this.scene.set_voxel(r_voxel, voxel.voxel_position);
                  this.blub_high.play();
                break;
              case "remove":
                let d_voxel = new Voxel();
                d_voxel.opacity = 0;
                this.scene.set_voxel(d_voxel, voxel.voxel_position);
                  this.blub_low.play();
                break;
            }
          }
        }
      }
    });
    addEventListener("mousemove", (e) => {
      this.last_movement = vec2.scale([e.movementX, e.movementY], 0.2);
      if (this.mouse_down) this.mouse_drag(e);
      this.calculate_velocity();
      this.last_move = performance.now();
    });

    document.getElementById("color_value")?.addEventListener("input", (e) => {
      const col = (<HTMLInputElement>e.target).value;
      this.selected_color = vec3.scale(<number[]>col.match(/\w\w/g)?.map(x => parseInt(x, 16)), 1 / 255);
    })

    document.getElementById("roughness_value")?.addEventListener("input", (e) => {
      this.selected_roughness = 1 - parseInt((<HTMLInputElement>e.target).value) / 100;
    })

    document.getElementById("lightness_value")?.addEventListener("input", (e) => {
      this.selected_lightness = parseInt((<HTMLInputElement>e.target).value) / 100;
    })

    document.getElementById("opacity_value")?.addEventListener("input", (e) => {
      this.selected_opacity = parseInt((<HTMLInputElement>e.target).value) / 100;
    })

    document.getElementById("tool-place-button")?.addEventListener("change", (e) => {
      this.selected_tool = "place";
    })

    document.getElementById("tool-replace-button")?.addEventListener("change", (e) => {
      this.selected_tool = "replace";
    })

    document.getElementById("tool-remove-button")?.addEventListener("change", (e) => {
      this.selected_tool = "remove";
    })
  }

  calculate_velocity() {
    const t = performance.now() - this.last_move;
    vec2.scale(this.last_movement, 1 / t, this.velocity);
  }

  mouse_drag(e: MouseEvent) {
    this.camera.eulers[1] = this.camera.eulers[1] - this.last_movement[1];
    this.camera.eulers[2] = this.camera.eulers[2] - this.last_movement[0];
    // this.camera.velocity = [e.movementY, e.movementX];
    this.mouse_dragged = true;
  }
}
