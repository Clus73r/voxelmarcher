"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Renderer {
    constructor(canvas) {
        this.render = () => {
            var _a, _b, _c;
            const commandEncoder = (_a = this.device) === null || _a === void 0 ? void 0 : _a.createCommandEncoder();
            const ray_trace_pass = commandEncoder === null || commandEncoder === void 0 ? void 0 : commandEncoder.beginComputePass();
            ray_trace_pass === null || ray_trace_pass === void 0 ? void 0 : ray_trace_pass.setPipeline(this.ray_tracing_pipeline);
            ray_trace_pass === null || ray_trace_pass === void 0 ? void 0 : ray_trace_pass.setBindGroup(0, this.ray_tracing_bind_group);
            ray_trace_pass === null || ray_trace_pass === void 0 ? void 0 : ray_trace_pass.dispatchWorkgroups(this.canvas.width, this.canvas.height, 1); // hier noch die workgroups anpassen
            ray_trace_pass === null || ray_trace_pass === void 0 ? void 0 : ray_trace_pass.end();
            const textureView = (_b = this.context) === null || _b === void 0 ? void 0 : _b.getCurrentTexture().createView();
            const renderPass = commandEncoder === null || commandEncoder === void 0 ? void 0 : commandEncoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: textureView,
                        clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
                        loadOp: "clear",
                        storeOp: "store",
                    },
                ],
            });
            renderPass === null || renderPass === void 0 ? void 0 : renderPass.setPipeline(this.screen_pipeline);
            renderPass === null || renderPass === void 0 ? void 0 : renderPass.setBindGroup(0, this.screen_bind_group);
            renderPass === null || renderPass === void 0 ? void 0 : renderPass.draw(6, 1, 0, 0);
            renderPass === null || renderPass === void 0 ? void 0 : renderPass.end();
            (_c = this.device) === null || _c === void 0 ? void 0 : _c.queue.submit([commandEncoder === null || commandEncoder === void 0 ? void 0 : commandEncoder.finish()]);
        };
        this.canvas = canvas;
    }
    Initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setupDevice();
            yield this.createAssets();
            yield this.setupPipeline();
        });
    }
    setupDevice() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.adapter = (yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter()));
            this.device = yield ((_b = this.adapter) === null || _b === void 0 ? void 0 : _b.requestDevice());
            this.context = this.canvas.getContext("webgpu");
            this.format = "bgra8unorm";
            this.context.configure({
                device: this.device,
                format: this.format,
                alphaMode: "opaque",
            });
        });
    }
    createAssets() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.color_buffer = (_a = this.device) === null || _a === void 0 ? void 0 : _a.createTexture({
                size: { width: this.canvas.width, height: this.canvas.height },
                format: "rgba8unorm",
                usage: GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.STORAGE_BINDING |
                    GPUTextureUsage.TEXTURE_BINDING,
            });
            this.color_buffer_view = (_b = this.color_buffer) === null || _b === void 0 ? void 0 : _b.createView();
            this.sampler = (_c = this.device) === null || _c === void 0 ? void 0 : _c.createSampler({
                addressModeU: "repeat",
                addressModeV: "repeat",
                magFilter: "linear",
                minFilter: "nearest",
                mipmapFilter: "nearest",
                maxAnisotropy: 1,
            });
        });
    }
    setupPipeline() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const ray_tracing_bind_group = ((_a = this.device) === null || _a === void 0 ? void 0 : _a.createBindGroupLayout({
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
                ],
            }));
            this.ray_tracing_bind_group = (_b = this.device) === null || _b === void 0 ? void 0 : _b.createBindGroup({
                layout: ray_tracing_bind_group,
                label: "Ray tracing bind group",
                entries: [
                    { binding: 0, resource: this.color_buffer_view },
                ],
            });
            const ray_tracing_pipline_layout = ((_c = this.device) === null || _c === void 0 ? void 0 : _c.createPipelineLayout({
                bindGroupLayouts: [ray_tracing_bind_group],
            }));
            this.ray_tracing_pipeline = ((_d = this.device) === null || _d === void 0 ? void 0 : _d.createComputePipeline({
                label: "Ray tracing pipeline",
                layout: ray_tracing_pipline_layout,
                compute: {
                    entryPoint: "main",
                    module: this.device.createShaderModule({ code: ray_trace_kernel }),
                },
            }));
            const screen_bind_group_layout = ((_e = this.device) === null || _e === void 0 ? void 0 : _e.createBindGroupLayout({
                entries: [
                    { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
                    { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
                ],
            }));
            this.screen_bind_group = (_f = this.device) === null || _f === void 0 ? void 0 : _f.createBindGroup({
                layout: screen_bind_group_layout,
                entries: [
                    { binding: 0, resource: this.sampler },
                    { binding: 1, resource: this.color_buffer_view },
                ],
            });
            const screen_pipeline_layout = ((_g = this.device) === null || _g === void 0 ? void 0 : _g.createPipelineLayout({
                bindGroupLayouts: [screen_bind_group_layout],
            }));
            this.screen_pipeline = (_h = this.device) === null || _h === void 0 ? void 0 : _h.createRenderPipeline({
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
        });
    }
}
