import { Controller } from "./controller";
import { Vec3, vec3 } from "wgpu-matrix";
import { OrbitCamera } from "./orbit_camera";
import { Deg2Rad } from "./math_util";

// const grid_size = 2;
// const voxel_count = 4;
// const voxel_size = grid_size / voxel_count;

type OptRayHit = RayHit | undefined;

export class Ray {
  origin: Vec3;
  direction: Vec3;
  inv_direction: Vec3;
  constructor(origin: Vec3, direction: Vec3) {
    this.origin = origin;
    this.direction = vec3.normalize(direction);
    this.inv_direction = [1, 1, 1];
    vec3.div(this.inv_direction, direction, this.inv_direction);
  }
}

export class RayHit {
  position: Vec3;
  voxel_position: number[];
  voxel: Voxel;
  normal: Vec3;
  constructor(
    position: Vec3,
    voxel_position: number[],
    voxel: Voxel,
    normal: Vec3
  ) {
    this.position = position;
    this.voxel_position = voxel_position;
    this.voxel = voxel;
    this.normal = normal;
  }
}

export class Voxel {
  color: Vec3 = vec3.create();
  opacity: number = 0.0;
  roughness: number = 1.0;
  lightness: number = 0.0;
}

export class MetaVoxel {
  gi: Vec3 = vec3.create();
}

export class Scene {
  grid: Voxel[];
  meta_grid: MetaVoxel[];
  boundary_min: Vec3;
  boundary_max: Vec3;
  grid_size: number = 9;
  voxel_count: number = 24;
  voxel_size: number;
  direct_light: Vec3;
  direct_light_brightness: number;
  direct_light_phi: number = 0;
  direct_light_theta: number = 0;
  background_color: Vec3;
  ao_strength: number = 0.8;
  ambient_light: number = 0.2;

  input_direct_light: HTMLInputElement;
  input_direct_light_phi: HTMLInputElement;
  input_direct_light_theta: HTMLInputElement;
  input_ao_strength: HTMLInputElement;
  input_ambient_light: HTMLInputElement;

  constructor() {
    this.grid = new Array<Voxel>(
      this.grid_size * this.grid_size * this.grid_size
    );
    this.meta_grid = new Array<MetaVoxel>(
      this.grid_size * this.grid_size * this.grid_size
    );
    this.boundary_min = [
      -this.grid_size / 2,
      -this.grid_size / 2,
      -this.grid_size / 2,
    ];
    this.boundary_max = [
      this.grid_size / 2,
      this.grid_size / 2,
      this.grid_size / 2,
    ];
    this.voxel_size = this.grid_size / this.voxel_count;
    this.initialize_grid();
    this.direct_light = vec3.normalize([1.5, 0.6, 3]);
    this.direct_light_brightness = 1;
    this.background_color = [0, 0, 0];

    this.input_direct_light = <HTMLInputElement>(
      document.getElementById("sun_strength")
    );
    this.input_direct_light.addEventListener("input", (e) => {
      this.direct_light_brightness =
        parseInt(this.input_direct_light.value) / 50;
    });
    this.input_direct_light_phi = <HTMLInputElement>(
      document.getElementById("sun_phi")
    );
    this.input_direct_light_theta = <HTMLInputElement>(
      document.getElementById("sun_theta")
    );
    this.input_direct_light_phi.addEventListener("input", (e) => {
      this.updateDirectLight(
        parseInt(this.input_direct_light_phi.value),
        parseInt(this.input_direct_light_theta.value)
      );
    });
    this.input_direct_light_theta.addEventListener("input", (e) => {
      this.updateDirectLight(
        parseInt(this.input_direct_light_phi.value),
        parseInt(this.input_direct_light_theta.value)
      );
    });

    this.input_ao_strength = <HTMLInputElement>(
      document.getElementById("ao_strength")
    );
    this.input_ao_strength.addEventListener("input", (e) => {
      this.ao_strength = parseInt(this.input_ao_strength.value) / 100;
    });

    this.input_ambient_light = <HTMLInputElement>(
      document.getElementById("ambient_light")
    );
    this.input_ambient_light.addEventListener("input", (e) => {
      this.ambient_light = parseInt(this.input_ambient_light.value) / 100;
    });
  }

  updateDirectLight(phi: number, theta: number) {
    this.direct_light_phi = phi;
    this.direct_light_theta = theta;
    this.direct_light = [
      Math.cos(Deg2Rad(theta)) * Math.cos(Deg2Rad(phi)),
      Math.sin(Deg2Rad(theta)) * Math.cos(Deg2Rad(phi)),
      Math.sin(Deg2Rad(phi)),
    ];
  }

  serialize_scene(): string {
    // console.log(JSON.stringify(this.grid));
    return JSON.stringify(this);
  }

  deserialize_scene(s: string) {
    const des = JSON.parse(s);
    this.grid = des.grid;
    // this.background_color = des.background_color;
    this.grid_size = this.grid_size;
    this.boundary_min = des.boundary_min;
    this.boundary_max = des.boundary_max;
    this.voxel_count = des.voxel_count;
    this.direct_light = des.direct_light;
    this.direct_light_brightness = des.direct_light_brightness;
    this.input_direct_light.value = (
      des.direct_light_brightness * 100
    ).toString();
    this.ao_strength = des.ao_strength;
    this.input_ao_strength.value = (des.ao_strength * 100).toString();
    this.ambient_light = des.ambient_light;
    this.input_ambient_light.value = (des.ambient_light * 100).toString();
    this.direct_light_phi = des.direct_light_phi;
    this.input_direct_light_phi.value = des.direct_light_phi.toString();
    this.direct_light_theta = des.direct_light_theta;
    this.input_direct_light_theta.value = des.direct_light_theta.toString();
  }

  reset() {
    this.initialize_grid();
    this.initialize_default_grid();
  }

  initialize_grid() {
    this.grid = new Array(this.voxel_count ** 3);
    this.meta_grid = new Array(this.voxel_count ** 3);
    for (let x = 0; x < this.voxel_count; x++) {
      for (let y = 0; y < this.voxel_count; y++) {
        for (let z = 0; z < this.voxel_count; z++) {
          let vox = new Voxel();
          vox.color = [0, 0, 0];
          vox.opacity = 0;
          this.grid[
            z * this.voxel_count * this.voxel_count + y * this.voxel_count + x
          ] = vox;
          let mvox = new MetaVoxel();
          this.meta_grid[
            z * this.voxel_count * this.voxel_count + y * this.voxel_count + x
          ] = mvox;
        }
      }
    }
  }

  initialize_default_grid() {
    for (let x = 0; x < this.voxel_count; x++) {
      for (let y = 0; y < this.voxel_count; y++) {
        for (let z = 0; z < this.voxel_count; z++) {
          let voxel = new Voxel();
          if (z < 3) {
            voxel.color = [
              x / this.voxel_count,
              y / this.voxel_count,
              z / this.voxel_count,
            ];
            vec3.scale(voxel.color, 2, voxel.color);
            voxel.opacity = 1;
            voxel.lightness = 0;
            voxel.roughness = 1;
          }
          // if (
          //   vec3.dist(
          //     [x, y, z],
          //     [this.voxel_count / 2, this.voxel_count / 2, this.voxel_count / 2]
          //   ) < 5
          // ) {
          //   voxel.opacity = 1;
          //   voxel.color = [
          //     0.2,
          //     y / this.voxel_count + 0.3,
          //     z / this.voxel_count + 0.3,
          //   ];
          //   vec3.scale(voxel.color, 2, voxel.color);
          //   // voxel.color = [0.8, 0.8, 0.8];
          //   voxel.lightness = 0;
          //   voxel.roughness = 1;
          // }
          // if (x == this.voxel_count - 2 || y < 2) {
          //   voxel.color = [
          //     x / this.voxel_count,
          //     y / this.voxel_count,
          //     z / this.voxel_count,
          //   ];
          //   voxel.opacity = 1;
          //   voxel.roughness = 0.3;
          // }
          // if (z < 1) {
          // 	voxel.opacity = 1;
          // 	// voxel.color = [0.8, 0.2, 0.3];
          // 	voxel.color = [x / 4, y / 4, 0.9];
          // 	voxel.lightness = 0;
          // 	voxel.roughness = 1;
          // }
          // if (
          // 	vec3.dist(
          // 		[x + 1, y + 1, z],
          // 		[this.voxel_count / 2, this.voxel_count / 2, this.voxel_count / 2]
          // 	) > 7
          // ) {
          // 	voxel.opacity = 1;
          // 	voxel.color = [x / 4, y / 4, z / 4];
          // 	// voxel.color = [0.8, 0.8, 0.8];
          // 	voxel.lightness = 0;
          // 	voxel.roughness = 1;
          // }
          // if (z > 12) {
          // 	voxel.opacity = 1;
          // 	voxel.color = [0.2, y / 4, 0.7];
          // 	voxel.roughness = 0.2;
          // 	voxel.lightness = 0;
          // }
          // if (z == 2) {
          // 	voxel.color = [0.1, 0.4, 0.9];
          // 	voxel.roughness = 0.7;
          // 	voxel.opacity = 1;
          // }
          // if (
          // 	(x === 5 && y === 5 && z === 5) ||
          // 	(x === 5 && y === 10 && z === 5)
          // ) {
          // 	voxel.color = [0.8, 0.5, 0.4];
          // 	voxel.opacity = 0.5;
          // 	voxel.roughness = 1;
          // 	voxel.lightness = 0;
          // }
          //voxel.color = [0.8, 0.8, 0.8];
          voxel.color[0] = Math.min(1, voxel.color[0]);
          voxel.color[1] = Math.min(1, voxel.color[1]);
          voxel.color[2] = Math.min(1, voxel.color[2]);
          //voxel.roughness = 1;
          this.set_voxel_comp(voxel, x, y, z);
        }
      }
    }
    this.calc_gi();
  }

  calc_gi() {
    for (let x = 0; x < this.voxel_count; x++)
      for (let y = 0; y < this.voxel_count; y++)
        for (let z = 0; z < this.voxel_count; z++) {
          const ray = new Ray(
            this.get_voxel_center([x, y, z]),
            vec3.inverse(this.direct_light)
          );
          const hit = this.ray_any(ray);
          if (!hit) {
            this.meta_grid[this.get_voxel_id([x, y, z])].gi = vec3.scale(
              [1, 1, 1],
              this.direct_light_brightness
            );
          }
        }
  }

  ray_any(ray: Ray): OptRayHit {
    let tmin: number = 0.0;
    let tmax: number = Infinity;

    for (let d = 0; d < 3; d++) {
      let t1 = (this.boundary_min[d] - ray.origin[d]) * ray.inv_direction[d];
      let t2 = (this.boundary_max[d] - ray.origin[d]) * ray.inv_direction[d];

      tmin = Math.min(Math.max(t1, tmin), Math.max(t2, tmin));
      tmax = Math.max(Math.min(t1, tmax), Math.min(t2, tmax));
    }
    if (tmin > tmax) {
      return undefined;
    }

    const ray_entry = vec3.add(ray.origin, vec3.scale(ray.direction, tmin));
    const ray_exit = vec3.add(ray.origin, vec3.scale(ray.direction, tmax));
    let voxel = [
      Math.max(
        0,
        Math.min(
          this.voxel_count - 1,
          Math.floor((ray_entry[0] - this.boundary_min[0]) / this.voxel_size)
        )
      ),
      Math.max(
        0,
        Math.min(
          this.voxel_count - 1,
          Math.floor((ray_entry[1] - this.boundary_min[1]) / this.voxel_size)
        )
      ),
      Math.max(
        0,
        Math.min(
          this.voxel_count - 1,
          Math.floor((ray_entry[2] - this.boundary_min[2]) / this.voxel_size)
        )
      ),
    ];
    let voxel_upper_edge = [voxel[0] + 1, voxel[1] + 1, voxel[2] + 1];
    // console.log(``);
    // console.log(`entry: ${ray_entry}, (${voxel}, ${this.get_voxel_id(voxel)})`);
    // console.log(`hit: ${this.get_voxel(voxel)}`);
    // console.log(`tmin: ${tmin}`);
    // console.log(`tmin: ${tmax}`);

    let step = [0, 0, 0];
    let tmax_comp = [0, 0, 0];
    let tdelta = [0, 0, 0];
    let end_voxel = [0, 0, 0];
    let thit = tmin;
    let hit_normal: Vec3 = [0, 0, 0];

    for (let d = 0; d < 3; d++) {
      end_voxel[d] = Math.max(
        0,
        Math.min(
          this.voxel_count - 1,
          Math.floor((ray_exit[d] - this.boundary_min[d]) / this.voxel_size)
        )
      );
      if (ray.direction[d] > 0.0) {
        step[d] = 1;
        tdelta[d] = this.voxel_size / ray.direction[d];
        tmax_comp[d] =
          tmin +
          (this.boundary_min[d] +
            voxel_upper_edge[d] * this.voxel_size -
            ray_entry[d]) /
            ray.direction[d];
      } else if (ray.direction[d] < 0.0) {
        step[d] = -1;
        tdelta[d] = this.voxel_size / -ray.direction[d];
        tmax_comp[d] =
          tmin +
          (this.boundary_min[d] + voxel[d] * this.voxel_size - ray_entry[d]) /
            ray.direction[d];
      } else {
        step[d] = 0;
        tdelta[d] = tmax;
        tmax_comp[d] = tmax;
      }
    }

    // while (
    // 	voxel[0] != end_voxel[0] ||
    // 	voxel[1] != end_voxel[1] ||
    // 	voxel[2] != end_voxel[2]) {
    while (
      voxel[0] < this.voxel_count &&
      voxel[0] >= 0 &&
      voxel[1] < this.voxel_count &&
      voxel[1] >= 0 &&
      voxel[2] < this.voxel_count &&
      voxel[2] >= 0
    ) {
      // console.log("");
      // console.log(voxel);
      // console.log(tmax_comp);
      // console.log(tdelta);

      if (this.get_voxel(voxel).opacity > 0.01) {
        const hit_position = vec3.add(
          ray.origin,
          vec3.scale(ray.direction, thit)
        );
        return new RayHit(
          hit_position,
          voxel,
          this.get_voxel(voxel),
          hit_normal
        );
      }

      if (tmax_comp[0] < tmax_comp[1] && tmax_comp[0] < tmax_comp[2]) {
        voxel[0] += step[0];
        thit = tmax_comp[0];
        tmax_comp[0] += tdelta[0];
        hit_normal = [-step[0], 0, 0];
      } else if (tmax_comp[1] < tmax_comp[2]) {
        voxel[1] += step[1];
        thit = tmax_comp[1];
        tmax_comp[1] += tdelta[1];
        hit_normal = [0, -step[1], 0];
      } else {
        voxel[2] += step[2];
        thit = tmax_comp[2];
        tmax_comp[2] += tdelta[2];
        hit_normal = [0, 0, -step[2]];
      }
    }

    return undefined;
  }

  get_voxel_center(voxel: number[]): Vec3 {
    return [
      voxel[0] * this.voxel_size - this.boundary_min[0],
      voxel[1] * this.voxel_size - this.boundary_min[1],
      voxel[2] * this.voxel_size - this.boundary_min[2],
    ];
  }

  get_voxel_id_comp(x: number, y: number, z: number): number {
    return z * this.voxel_count * this.voxel_count + y * this.voxel_count + x;
  }

  get_voxel_id(voxel: number[]): number {
    return (
      voxel[2] * this.voxel_count * this.voxel_count +
      voxel[1] * this.voxel_count +
      voxel[0]
    );
  }

  get_voxel_comp(x: number, y: number, z: number): Voxel {
    return this.grid[
      z * this.voxel_count * this.voxel_count + y * this.voxel_count + x
    ];
  }

  get_voxel(voxel: number[]): Voxel {
    return this.grid[
      voxel[2] * this.voxel_count * this.voxel_count +
        voxel[1] * this.voxel_count +
        voxel[0]
    ];
  }

  set_voxel(value: Voxel, voxel: number[]) {
    if (
      voxel[0] > 0 &&
      voxel[0] < this.voxel_count - 1 &&
      voxel[1] > 0 &&
      voxel[1] < this.voxel_count - 1 &&
      voxel[2] > 0 &&
      voxel[2] < this.voxel_count - 1
    )
      this.grid[
        voxel[2] * this.voxel_count * this.voxel_count +
          voxel[1] * this.voxel_count +
          voxel[0]
      ] = value;
  }

  set_voxel_comp(value: Voxel, x: number, y: number, z: number) {
    if (
      x > 0 &&
      x < this.voxel_count - 1 &&
      y > 0 &&
      y < this.voxel_count - 1 &&
      z > 0 &&
      z < this.voxel_count - 1
    )
      this.grid[
        z * this.voxel_count * this.voxel_count + y * this.voxel_count + x
      ] = value;
  }
}
