import { Scene } from "./scene";
import ray_trace_kernel from "./shaders/ray_trace_kernel.wgsl"
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
      size: 64,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
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
	  0.0,
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
	]), 0, 16);

    const commandEncoder = this.device?.createCommandEncoder();

    const ray_trace_pass = commandEncoder?.beginComputePass();
    ray_trace_pass?.setPipeline(<GPUComputePipeline>this.ray_tracing_pipeline);
    ray_trace_pass?.setBindGroup(0, <GPUBindGroup>this.ray_tracing_bind_group);
    ray_trace_pass?.dispatchWorkgroups(
      this.canvas.width,
      this.canvas.height,
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
    renderPass?.setBindGroup(0, <GPUBindGroup> this.screen_bind_group)
    renderPass?.draw(6, 1, 0, 0);
    renderPass?.end();
    
    this.device?.queue.submit([<GPUCommandBuffer>commandEncoder?.finish()]);
  };
}
