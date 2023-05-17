import { Vec2, Vec3, vec2 } from "wgpu-matrix";
import { FPCamera } from "./camera";
import { OrbitCamera } from "./orbit_camera";
import { Scene, Voxel } from "./scene";

export class Controller {
  camera: OrbitCamera;
  scene: Scene;
  canvas: HTMLCanvasElement;
  mouse_down: boolean = false;
  mouse_dragged: boolean = false;

  last_move: number = 0;
  last_movement: Vec2;

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
        this.calculate_camera_velocity();
        if (!this.mouse_dragged) {
          const rect = this.canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          console.log(x, y);
          console.log(this.camera.screen_to_ray(x, y, rect.width, rect.height));
          let voxel = this.scene.ray_any(
            this.camera.screen_to_ray(x, y, rect.width, rect.height)
          );
          if (voxel) {
            let n_voxel = new Voxel();
            n_voxel.color = [0, 0.8, 0.7];
            n_voxel.lightness = 0.5;
            n_voxel.opacity = 1;
            this.scene.set_voxel(n_voxel, voxel.voxel_position);
          }
        }
      }
    });
    addEventListener("mousemove", (e) => {
      if (this.mouse_down) this.mouse_drag(e);
      this.last_move = performance.now();
      this.last_movement = [e.movementX, e.movementY];
    });
  }

  calculate_camera_velocity() {
    const t = performance.now() - this.last_move;
    vec2.scale(this.last_movement, 1 / t, this.camera.velocity);
  }

  mouse_drag(e: MouseEvent) {
    this.camera.eulers[1] = this.camera.eulers[1] - e.movementY;
    this.camera.eulers[2] = this.camera.eulers[2] - e.movementX;
    // this.camera.velocity = [e.movementY, e.movementX];
    this.mouse_dragged = true;
  }
}
