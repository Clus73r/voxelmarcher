import kloppenheim_02_puresky_512 from "./hdr/kloppenheim_02_puresky_512.png";
import pizzo from "./hdr/pizzo_pernice_1k.jpg";

export class HDRTexture {
    texture: GPUTexture | undefined;
    view: GPUTextureView | undefined;
    sampler: GPUSampler | undefined;

    async initialize(device: GPUDevice) {
        const img = <HTMLImageElement>document.createElement('img');
        img.src = pizzo;
        await img.decode();
        const bitmap = await createImageBitmap(img);
        this.texture = device.createTexture({
            size: [1024, 512, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        device.queue.copyExternalImageToTexture(
            {source: bitmap},
            {texture: this.texture},
            [bitmap.width, bitmap.height]
        );

        this.sampler = device.createSampler({
            magFilter: "linear",
            minFilter: "linear"
        });
        
        this.view = this.texture.createView({
            mipLevelCount: 1,
            dimension: "2d",
        })
    }
}