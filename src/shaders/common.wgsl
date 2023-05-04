@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> scene: SceneParameter;
@group(0) @binding(2) var<storage, read> scene_data: SceneData;

override grid_size: f32 = 2f;
override voxel_count: i32 = 4;
var<private> voxel_size: f32 = grid_size / f32(voxel_count);
var<private> boundary_min: vec3<f32> = vec3<f32>(f32(-grid_size) / 2, f32(-grid_size) / 2, f32(-grid_size) / 2);
var<private> boundary_max: vec3<f32> = vec3<f32>(f32(grid_size) / 2, f32(grid_size) / 2, f32(grid_size) / 2);
var<private> depth_clip_min: f32 = 1f;
var<private> depth_clip_max: f32 = 10f;

var<private> rng_seed: u32;

const samples: i32 = 3;
const light_bounces: i32 = 3;
const reflection_bounces: i32 = 3;
const scatter: i32 = 5;
const ambient_light: f32 = 0.03;

struct SceneParameter {
    camera_pos: vec3<f32>,
    rng_start: f32,
    camera_forward: vec3<f32>,
    camera_right: vec3<f32>,
    camera_up: vec3<f32>,
    direct_light: vec3<f32>,
    direct_light_brightness: f32,
}

struct Voxel {
	color: vec3<f32>,
	opacity: f32,
	roughness: f32,
	lightness: f32,
}

struct SceneData {
	data: array<Voxel>,
}

struct Ray {
    origin: vec3<f32>,
    direction: vec3<f32>,
    inv_direction: vec3<f32>,
}

struct RayHit {
	position: vec3<f32>,
	depth: f32,
	voxel_position: vec3<i32>,
	voxel: Voxel,
	normal: vec3<f32>,
}

@compute @workgroup_size(16,16,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));
    //rng_seed = GlobalInvocationID.x + GlobalInvocationID.y * GlobalInvocationID.x * u32(scene.rng_start);
    rng_seed = GlobalInvocationID.x + 50 + (GlobalInvocationID.y + 50) * (GlobalInvocationID.x + 100) * 1000 * u32(scene.rng_start);
    //rng_seed = GlobalInvocationID.x + GlobalInvocationID.y * u32(scene.rng_start);

    var pixel_color: vec3<f32>;
    for (var i = 0; i < samples; i++){

	    let horizontal_coefficient: f32 = (f32(screen_pos.x) + rng() - 0.5 - f32(screen_size.x) / 2) / f32(screen_size.x);
	    let vertical_coefficient: f32 = (f32(screen_pos.y) + rng() - 0.5 - f32(screen_size.y) / 2) / -f32(screen_size.y);

	    let ray_direction = normalize(scene.camera_forward
			    + horizontal_coefficient * scene.camera_right
			    + vertical_coefficient * scene.camera_up);
	    let ray: Ray = Ray(scene.camera_pos, ray_direction, 1 / ray_direction);
	    pixel_color += trace(ray, light_bounces);
    }

    let correction = 1.0 / f32(samples);
    pixel_color = sqrt(correction * pixel_color);

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}

fn rng_hash(seed: u32) -> u32 {
	var x = ( seed << 10u );
	x ^= ( x >>  6u );
	x += ( x <<  3u );
	x ^= ( x >> 11u );
	x += ( x << 15u );
	return x;
}

fn rng() -> f32 {
	rng_seed++;
	return bitcast<f32>((rng_hash(rng_seed) >> 9) | 0x3f800000 ) - 1.0;
}

fn ray_reflect(ray: Ray, position: vec3<f32>, normal: vec3<f32>) -> Ray {
	let reflect = ray.direction - 2 * dot(ray.direction, normal) * normal;
	return Ray(position, reflect, 1 / reflect);
}

fn get_voxel_id(v: vec3<i32>) -> i32 {
	return v.z * voxel_count * voxel_count + v.y * voxel_count + v.x;
}

fn get_voxel(v: vec3<i32>) -> Voxel {
	return scene_data.data[v.z * voxel_count * voxel_count + v.y * voxel_count + v.x];
}

fn get_voxel_by_position(v: vec3<f32>) -> Voxel {
	return get_voxel(vec3<i32>((v - boundary_min) / f32(voxel_size)));
}

fn random_unit_sphere_point() -> vec3<f32> {
	var v = vec3<f32>(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);
	while (v.x * v.x + v.y * v.y + v.z * v.z > 1.0){
		v = vec3<f32>(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);
	}
	return v;
}

fn random_unit_hemisphere_point(normal: vec3<f32>) -> vec3<f32> {
	var v = vec3<f32>(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);
	while (v.x * v.x + v.y * v.y + v.z * v.z > 1.0 || dot(normal, v) < 0){
		v = vec3<f32>(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1);
	}
	return v;
}

fn random_unit_vector() -> vec3<f32> {
	return normalize(random_unit_sphere_point());
}
