import { Vec2, Vec3, vec2, vec3 } from "wgpu-matrix";
import { Deg2Rad } from "./math_util";
import { Ray } from "./scene";

export class OrbitCamera {
  forward: Vec3;
  right: Vec3;
  up: Vec3;
  position: Vec3;
  eulers: Vec3;

  dragged: boolean = false;

  velocity: Vec2 = [0, 0];
  distance: number = 8;

  constructor(distance: number, theta: number, phi: number) {
    this.forward = vec3.create();
    this.right = vec3.create();
    this.up = vec3.create();
    this.position = vec3.create();
    this.eulers = [0, phi, theta];
    this.distance = distance;
  }

  update() {
    this.eulers[1] = Math.min(80, Math.max(-80, this.eulers[1]));
    this.eulers[2] = this.eulers[2] % 360;
    this.forward = [
      Math.cos(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
      Math.sin(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
      Math.sin(Deg2Rad(this.eulers[1])),
    ];
    vec3.normalize(vec3.cross(this.forward, [0, 0, 1], this.right), this.right);
    vec3.normalize(vec3.cross(this.right, this.forward, this.up), this.up);
    vec3.scale(this.forward, -this.distance, this.position);
  }

  tick(delta_time: number) {
    if (!this.dragged) {
      this.eulers[1] -= this.velocity[1];
      this.eulers[2] -= this.velocity[0];
    }
    vec2.scale(this.velocity, 0.96 * (1 - delta_time), this.velocity);
    this.update();
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
