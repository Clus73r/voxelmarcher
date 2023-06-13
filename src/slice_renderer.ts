import { Vec3, vec3 } from "wgpu-matrix";
import { Scene } from "./scene";

export class SliceRenderer {
  canvas: HTMLCanvasElement;
  axis: "x" | "y" | "z";
  slice: number;
  scene: Scene;
  context: CanvasRenderingContext2D;
  background: Vec3 = [0, 0, 0];

  constructor(canvas: HTMLCanvasElement, scene: Scene) {
    this.canvas = canvas;
    this.axis = "z";
    this.slice = 0;
    this.scene = scene;
    this.context = <CanvasRenderingContext2D>canvas.getContext("2d");
    const slice_input = <HTMLInputElement>(
      document.getElementById("slice-input")
    );
    slice_input.addEventListener("input", (e) => {
      const slice = Math.floor(
        (parseInt(slice_input.value) / 100) * this.scene.voxel_count
      );
      this.set_slice(
        slice > this.scene.voxel_count - 1 ? this.scene.voxel_count - 1 : slice
      );
      console.log(slice);
    });
  }

  set_background(background: Vec3) {
    this.background = background;
    this.update();
  }

  set_axis(axis: "x" | "y" | "z") {
    this.axis = axis;
    this.update();
  }

  set_slice(slice: number) {
    this.slice = slice;
    this.update();
  }

  update() {
    const sx = this.canvas.width;
    const sy = this.canvas.height;
    const sxpv = sx / this.scene.voxel_count;
    const sypv = sy / this.scene.voxel_count;
    // this.context.fillStyle = this.color_to_string(this.background, 1);
    // this.context.fillStyle = "#FFFFFF00";
    this.context.clearRect(0, 0, sx, sy);
    // const img = this.context?.createImageData(sx, sy);
    for (let x = 0; x < this.scene.voxel_count; x++) {
      for (let y = 0; y < this.scene.voxel_count; y++) {
        const id = y * sx + x;
        const vox_pos =
          this.axis === "x"
            ? [this.slice, x, y]
            : this.axis === "y"
            ? [x, this.slice, y]
            : [x, y, this.slice];
        const vox = this.scene.get_voxel(vox_pos);
        const scaled_color = vec3.floor(vec3.scale(vox.color, 255));
        this.context.fillStyle = this.color_to_string(vox.color, vox.opacity);
        this.context.fillRect(x * sxpv, y * sypv, sxpv, sypv);

        // img.data[id * 4 + 0] = vox.color[0];
        // img.data[id * 4 + 1] = vox.color[1];
        // img.data[id * 4 + 2] = vox.color[2];
        // img.data[id * 4 + 3] = 255;
      }
    }
    // this.context.putImageData(img, 0, 0);
  }

  color_to_string(color: Vec3, opacity: number): string {
    const scaled_color = vec3.floor(vec3.scale(color, 255));
    return (
      "#" +
      scaled_color[0].toString(16) +
      scaled_color[1].toString(16) +
      scaled_color[2].toString(16) +
      (opacity * 255).toString(16)
    );
  }
}
