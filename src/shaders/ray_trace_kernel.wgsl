@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));

    var pixel_color : vec3<f32> = vec3<f32>(f32(screen_pos[0]) / f32(screen_size[0]), 0.0, 0.25);

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}