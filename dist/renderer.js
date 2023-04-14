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
            renderPass === null || renderPass === void 0 ? void 0 : renderPass.end();
            (_c = this.device) === null || _c === void 0 ? void 0 : _c.queue.submit([commandEncoder === null || commandEncoder === void 0 ? void 0 : commandEncoder.finish()]);
            requestAnimationFrame(this.render);
        };
        this.canvas = canvas;
    }
    Initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setupDevice();
            yield this.setupPipeline();
            this.render();
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
    setupPipeline() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
