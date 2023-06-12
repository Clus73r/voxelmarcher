import { Mat4, Vec3, mat4, vec3 } from "wgpu-matrix";
import { Deg2Rad } from "./math_util";
import { Ray } from "./scene";

export class FPCamera {
  forward: Vec3;
  right: Vec3;
  up: Vec3;
  position: Vec3;
  eulers: Vec3;
  view: Mat4;

  speed: number;
  inputs: boolean[];
  camera_active: boolean = false;
  control_active: boolean = false;

  constructor(position: Vec3, theta: number, phi: number) {
    this.forward = vec3.create();
    this.right = vec3.create();
    this.up = vec3.create();
    this.position = position;
    this.eulers = [0, phi, theta];
    this.view = mat4.create();
    this.update();
    this.inputs = [false, false, false, false, false, false];
    this.speed = 4;
  }

  setup() {
    addEventListener("mousedown", (e) => {
      if (e.button == 2) this.camera_active = true;
    });

    addEventListener("mouseup", (e) => {
      if (e.button == 2) this.camera_active = false;
    });

    addEventListener("mousemove", (e) => {
      this.mouse_move(this, e);
    });
    addEventListener("keydown", (e) => {
      this.keyboard_down(this, e);
    });

    addEventListener("keyup", (e) => {
      this.keyboard_up(this, e);
    });
  }

  tick(deltaTime: number) {
    let movement_vec = vec3.create();
    if (this.inputs[0]) vec3.add(movement_vec, this.forward, movement_vec);
    if (this.inputs[1]) vec3.add(movement_vec, this.right, movement_vec);
    if (this.inputs[2])
      vec3.add(movement_vec, vec3.scale(this.forward, -1), movement_vec);
    if (this.inputs[3])
      vec3.add(movement_vec, vec3.scale(this.right, -1), movement_vec);
    if (this.inputs[4]) vec3.add(movement_vec, this.up, movement_vec);
    if (this.inputs[5])
      vec3.add(movement_vec, vec3.scale(this.up, -1), movement_vec);

    vec3.normalize(movement_vec, movement_vec);
    vec3.add(
      this.position,
      vec3.scale(movement_vec, this.speed * deltaTime),
      this.position
    );
  }

  update() {
    this.forward = [
      Math.cos(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
      Math.sin(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
      Math.sin(Deg2Rad(this.eulers[1])),
    ];
    vec3.normalize(vec3.cross(this.forward, [0, 0, 1], this.right), this.right);
    vec3.normalize(vec3.cross(this.right, this.forward, this.up), this.up);
    // var target: Vec3 = vec3.create();
    // vec3.add(target, this.position, this.forward);
  }

  mouse_move(inst: FPCamera, e: MouseEvent) {
    if (this.camera_active) {
      inst.eulers[1] = Math.min(
        90,
        Math.max(-90, inst.eulers[1] - e.movementY)
      );
      inst.eulers[2] = (inst.eulers[2] - e.movementX) % 360;
      inst.update();
    }
  }

  keyboard_down(inst: FPCamera, e: KeyboardEvent) {
    if (e.key == "e") inst.inputs[0] = true;
    if (e.key == "d") inst.inputs[2] = true;
    if (e.key == "f") inst.inputs[1] = true;
    if (e.key == "s") inst.inputs[3] = true;
    if (e.key == "r") inst.inputs[4] = true;
    if (e.key == "w") inst.inputs[5] = true;
  }

  keyboard_up(inst: FPCamera, e: KeyboardEvent) {
    if (e.key == "e") inst.inputs[0] = false;
    if (e.key == "d") inst.inputs[2] = false;
    if (e.key == "f") inst.inputs[1] = false;
    if (e.key == "s") inst.inputs[3] = false;
    if (e.key == "r") inst.inputs[4] = false;
    if (e.key == "w") inst.inputs[5] = false;
  }

  screen_to_ray(x: number, y: number, sx: number, sy: number): Ray {
    const horizontal_coefficient = (x - sx / 2) / sx;
    const vertical_coefficient = (y - sy / 2) / -sy;

    let ray_direction = vec3.create();
    vec3.add(ray_direction, this.forward, ray_direction);
    vec3.add(
      ray_direction,
      vec3.scale(this.right, horizontal_coefficient),
      ray_direction
    );
    vec3.add(
      ray_direction,
      vec3.scale(this.up, vertical_coefficient),
      ray_direction
    );

    return new Ray(this.position, ray_direction);
  }
}
