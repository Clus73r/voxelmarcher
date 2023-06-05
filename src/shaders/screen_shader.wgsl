@group(0) @binding(0) var screen_sampler : sampler;
@group(0) @binding(1) var color_buffer : texture_2d<f32>;
@group(0) @binding(2) var secondary_buffer : texture_2d<f32>;

struct VertexOutput {
        @builtin(position) Position : vec4<f32>,
            @location(0) TexCoord : vec2<f32>,
}

@vertex
fn vert_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
    var positions = array<vec2<f32>, 6>(
        vec2<f32>( 1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0,  1.0)
    );

    var texCoords = array<vec2<f32>, 6>(
        vec2<f32>(1.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 0.0)
    );

    var output : VertexOutput;
    output.Position = vec4<f32>(positions[VertexIndex], 0.0, 1.0);
    output.TexCoord = texCoords[VertexIndex];
    return output;
}

const ao_blur_steps = 7;
const ao_blur_radius = 0.00f / f32(ao_blur_steps);
const ao_strength = 1;

@fragment
fn frag_main(@location(0) TexCoord : vec2<f32>) -> @location(0) vec4<f32> {
	var acc = 0f;
	let blur_offset = (ao_blur_radius * f32(ao_blur_steps)) / 2;
	for (var x = 0; x < ao_blur_steps; x++){
		for (var y = 0; y < ao_blur_steps; y++){
			acc += textureSample(secondary_buffer, screen_sampler, vec2<f32>(TexCoord.x - blur_offset + ao_blur_radius * f32(x), TexCoord.y - blur_offset + ao_blur_radius * f32(y))).x;
		}
	}
	acc /= f32(ao_blur_steps) * f32(ao_blur_steps);

    // return vec4<f32>(acc, acc, acc, 1.0);
    return textureSample(color_buffer, screen_sampler, TexCoord) * (1 - acc * ao_strength);
}
