class Renderer {
	canvas: HTMLCanvasElement;
	adapter: GPUAdapter | undefined;
	device: GPUDevice | undefined;
	context: GPUCanvasContext | undefined;
	format: GPUTextureFormat | undefined;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
	}

	async Initialize() {
		await this.setupDevice();
		await this.setupPipeline();
		this.render();
	}

	async setupDevice() {
		this.adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
		this.device = await this.adapter?.requestDevice();
		this.context = <GPUCanvasContext>this.canvas.getContext("webgpu");
		this.format = "bgra8unorm";
		this.context.configure({
			device: this.device,
			format: this.format,
			alphaMode: "opaque",
		});
	}

	async setupPipeline() { }

	render = () => {
		const commandEncoder = this.device?.createCommandEncoder();
		const textureView = this.context?.getCurrentTexture().createView();
		const renderPass = commandEncoder?.beginRenderPass({
			colorAttachments: [
				{
					view: <GPUTextureView>textureView,
					clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		renderPass?.end();

		this.device?.queue.submit([<GPUCommandBuffer>commandEncoder?.finish()]);

		requestAnimationFrame(this.render);
	};
}
