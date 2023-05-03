import { Scene } from "./scene";
import ray_trace_kernel from "./shaders/ray_trace_kernel.wgsl"
import path_trace_kernel from "./shaders/path_trace_kernel.wgsl"
import screen_shader from "./shaders/screen_shader.wgsl"
import { mat3 } from "gl-matrix";

export class Renderer {
	canvas: HTMLCanvasElement;
	adapter: GPUAdapter | undefined;
	device: GPUDevice | undefined;
	context: GPUCanvasContext | undefined;
	format: GPUTextureFormat | undefined;

	color_buffer: GPUTexture | undefined;
	color_buffer_view: GPUTextureView | undefined;
	sampler: GPUSampler | undefined;
	sceneParameters: GPUBuffer | undefined;
	sceneData: GPUBuffer | undefined;

	ray_tracing_bind_group: GPUBindGroup | undefined;
	ray_tracing_pipeline: GPUComputePipeline | undefined;

	screen_bind_group: GPUBindGroup | undefined;
	screen_pipeline: GPURenderPipeline | undefined;
	scene: Scene;

	constructor(canvas: HTMLCanvasElement, scene: Scene) {
		this.canvas = canvas;
		this.scene = scene;
	}

	async initialize() {
		await this.setupDevice();
		await this.createAssets();
		await this.setupPipeline();
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

	async createAssets() {
		this.color_buffer = this.device?.createTexture({
			size: { width: this.canvas.width, height: this.canvas.height },
			format: "rgba8unorm",
			usage:
				GPUTextureUsage.COPY_DST |
				GPUTextureUsage.STORAGE_BINDING |
				GPUTextureUsage.TEXTURE_BINDING,
		});
		this.color_buffer_view = this.color_buffer?.createView();
		this.sampler = this.device?.createSampler({
			addressModeU: "repeat",
			addressModeV: "repeat",
			magFilter: "linear",
			minFilter: "nearest",
			mipmapFilter: "nearest",
			maxAnisotropy: 1,
		});
		this.sceneParameters = this.device?.createBuffer({
			size: 80,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
		})
		const scene_size = this.scene.voxel_count * this.scene.voxel_count * this.scene.voxel_count;
		this.sceneData = this.device?.createBuffer({
			size: scene_size * 8 * 4,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
		})
	}

	async setupPipeline() {
		const ray_tracing_bind_group = <GPUBindGroupLayout>(
			this.device?.createBindGroupLayout({
				entries: [
					{
						binding: 0,
						visibility: GPUShaderStage.COMPUTE,
						storageTexture: {
							access: "write-only",
							format: "rgba8unorm",
							viewDimension: "2d",
						},
					},
					{
						binding: 1,
						visibility: GPUShaderStage.COMPUTE,
						buffer: {
							type: "uniform"
						}
					},
					{
						binding: 2,
						visibility: GPUShaderStage.COMPUTE,
						buffer: {
							type: "read-only-storage",
						}
					}
				],
			})
		);

		this.ray_tracing_bind_group = this.device?.createBindGroup({
			layout: ray_tracing_bind_group,
			label: "Ray tracing bind group",
			entries: [
				{ binding: 0, resource: <GPUTextureView>this.color_buffer_view },
				{ binding: 1, resource: <GPUBufferBinding>{ buffer: this.sceneParameters } },
				{ binding: 2, resource: <GPUBufferBinding>{ buffer: this.sceneData } },
			],
		});

		const ray_tracing_pipline_layout = <GPUPipelineLayout>(
			this.device?.createPipelineLayout({
				bindGroupLayouts: [ray_tracing_bind_group],
			})
		);

		this.ray_tracing_pipeline = <GPUComputePipeline>(
			this.device?.createComputePipeline({
				label: "Ray tracing pipeline",
				layout: ray_tracing_pipline_layout,
				compute: {
					entryPoint: "main",
					module: this.device.createShaderModule({ code: ray_trace_kernel }),
					constants: {
						grid_size: this.scene.grid_size,
						voxel_count: this.scene.voxel_count,
					},
				},
			})
		);

		const screen_bind_group_layout = <GPUBindGroupLayout>(
			this.device?.createBindGroupLayout({
				entries: [
					{ binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
					{ binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
				],
			})
		);

		this.screen_bind_group = this.device?.createBindGroup({
			layout: screen_bind_group_layout,
			entries: [
				{ binding: 0, resource: <GPUBindingResource>this.sampler },
				{ binding: 1, resource: <GPUBindingResource>this.color_buffer_view },
			],
		});

		const screen_pipeline_layout = <GPUPipelineLayout>(
			this.device?.createPipelineLayout({
				bindGroupLayouts: [screen_bind_group_layout],
			})
		);

		this.screen_pipeline = this.device?.createRenderPipeline({
			layout: screen_pipeline_layout,
			vertex: {
				module: this.device.createShaderModule({ code: screen_shader }),
				entryPoint: "vert_main",
			},
			fragment: {
				module: this.device.createShaderModule({ code: screen_shader }),
				entryPoint: "frag_main",
				targets: [{ format: "bgra8unorm" }],
			},
			primitive: { topology: "triangle-list", cullMode: "back", frontFace: "cw" },
		});
	}

	render = () => {

		this.device?.queue.writeBuffer(
			<GPUBuffer>this.sceneParameters, 0,
			new Float32Array(
				[
					this.scene.camera.position[0],
					this.scene.camera.position[1],
					this.scene.camera.position[2],
					new Date().getMilliseconds(),
					this.scene.camera.forward[0],
					this.scene.camera.forward[1],
					this.scene.camera.forward[2],
					0.0,
					this.scene.camera.right[0],
					this.scene.camera.right[1],
					this.scene.camera.right[2],
					0.0,
					this.scene.camera.up[0],
					this.scene.camera.up[1],
					this.scene.camera.up[2],
					0.0,
					this.scene.direct_light[0],
					this.scene.direct_light[1],
					this.scene.direct_light[2],
					this.scene.direct_light_brightness,
				]), 0, 20);

		const scene_data = new Float32Array(8 * this.scene.grid.length);
		for (let i = 0; i < this.scene.grid.length; ++i) {
			scene_data[8 * i] = this.scene.grid[i].color[0];
			scene_data[8 * i + 1] = this.scene.grid[i].color[1];
			scene_data[8 * i + 2] = this.scene.grid[i].color[2];
			scene_data[8 * i + 3] = this.scene.grid[i].opacity;
			scene_data[8 * i + 4] = this.scene.grid[i].roughness;
			scene_data[8 * i + 5] = this.scene.grid[i].lightness;
			scene_data[8 * i + 6] = 0;
			scene_data[8 * i + 7] = 0;
		}

		this.device?.queue.writeBuffer(
			<GPUBuffer>this.sceneData, 0, scene_data, 0, this.scene.grid.length * 8
		);

		const commandEncoder = this.device?.createCommandEncoder();

		const ray_trace_pass = commandEncoder?.beginComputePass();
		ray_trace_pass?.setPipeline(<GPUComputePipeline>this.ray_tracing_pipeline);
		ray_trace_pass?.setBindGroup(0, <GPUBindGroup>this.ray_tracing_bind_group);
		ray_trace_pass?.dispatchWorkgroups(
			this.canvas.width / 16,
			this.canvas.height / 16,
			1
		); // hier noch die workgroups anpassen
		ray_trace_pass?.end();

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
		renderPass?.setPipeline(<GPURenderPipeline>this.screen_pipeline)
		renderPass?.setBindGroup(0, <GPUBindGroup>this.screen_bind_group)
		renderPass?.draw(6, 1, 0, 0);
		renderPass?.end();

		this.device?.queue.submit([<GPUCommandBuffer>commandEncoder?.finish()]);
	};
}
