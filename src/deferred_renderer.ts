import { Scene } from "./scene";

export class deferred_renderer {
	canvas: HTMLCanvasElement;

	constructor(canvas: HTMLCanvasElement, scene: Scene) {
		this.canvas = canvas;
	}
}
