@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> scene: SceneParameter;
@group(0) @binding(2) var<storage, read> scene_data: SceneData;
// @group(0) @binding(3) var hdr_tex: texture_2d<f32>;
// @group(0) @binding(4) var hdr_sampler: sampler;
@group(0) @binding(3) var<storage, read> lights: LightData;
@group(0) @binding(4) var secondary_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(5) var<storage, read> scene_meta_data: SceneMetaData;

override grid_size: f32 = 2f;
override voxel_count: i32 = 4;
var<private> voxel_size: f32 = grid_size / f32(voxel_count);
var<private> boundary_min: vec3<f32> = vec3<f32>(f32(-grid_size) / 2, f32(-grid_size) / 2, f32(-grid_size) / 2);
var<private> boundary_max: vec3<f32> = vec3<f32>(f32(grid_size) / 2, f32(grid_size) / 2, f32(grid_size) / 2);
var<private> depth_clip_min: f32 = 1f;
var<private> depth_clip_max: f32 = 10f;

var<private> rng_seed: u32;
var<private> rng_seed_steady: u32;

const samples: i32 = 1;
const light_bounces: i32 = 6;
const max_penetrations: i32 = 8;
const reflection_bounces: i32 = 5;
const scatter: i32 = 5;
// const ambient_light: f32 = 0.03;
const pi = 3.14159265359;

// const background: vec3<f32> = vec3<f32>(24f / 255f, 24f / 255f, 37f / 255f);

struct SceneParameter {
    camera_pos: vec3<f32>,
    rng_start: f32,
    camera_forward: vec3<f32>,
    light_count: f32,
    camera_right: vec3<f32>,
	ao_strength: f32,
    camera_up: vec3<f32>,
	ambient_light: f32,
    direct_light: vec3<f32>,
    direct_light_brightness: f32,
	background_color: vec3<f32>,
}

struct Voxel {
	color: vec3<f32>,
	opacity: f32,
	roughness: f32,
	lightness: f32,
}

struct MetaVoxel {
	gi: vec3<f32>,
	somethingelse: vec3<f32>
}

struct SceneData {
	data: array<Voxel>,
}

struct SceneMetaData {
	data: array<MetaVoxel>,
}

struct LightData {
	data: array<Light>,
}

struct Light {
	location: vec3<f32>,
	emitter_type: f32,
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
	ray_direction: vec3<f32>,
	exit_position: vec3<f32>,
	ao: f32,
	uv: vec2<f32>,
}

struct TraceResult {
	color: vec3<f32>,
	ao: f32,
}

@compute @workgroup_size(16,16,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));
    // rng_seed = GlobalInvocationID.x + 50 + (GlobalInvocationID.y + 50) * (GlobalInvocationID.x + 100) * 1000 * u32(scene.rng_start);
    rng_seed = GlobalInvocationID.x + 50 + (GlobalInvocationID.y + 50) * (GlobalInvocationID.x + 100) * 1000;
    rng_seed_steady = GlobalInvocationID.x + 150 + (GlobalInvocationID.y + 75) * (GlobalInvocationID.x + 350) * 1000;

    var pixel_color: vec3<f32>;
    var pixel_ao: f32;
    for (var i = 0; i < samples; i++){

	    let rng_offset: vec2<f32> = select(vec2<f32>(0), vec2<f32>(rng() - 0.5, rng() - 0.5), samples > 1);
	    let horizontal_coefficient: f32 = (f32(screen_pos.x) + rng_offset.x - f32(screen_size.x) / 2) / f32(screen_size.x);
	    let vertical_coefficient: f32 = (f32(screen_pos.y) + rng_offset.y - f32(screen_size.y) / 2) / -f32(screen_size.y);

	    let ray_direction = normalize(scene.camera_forward
			    + horizontal_coefficient * scene.camera_right
			    + vertical_coefficient * scene.camera_up);
	    let ray: Ray = Ray(scene.camera_pos, ray_direction, 1 / ray_direction);
	    let trace_result = trace(ray, light_bounces);
	    // pixel_color += trace(ray, light_bounces);
	    // pixel_color += trace_result.color;
	    pixel_color += trace_result;
	    // pixel_ao += trace_result.ao;
    }

    // let correction = 1.0 / f32(samples);
    // pixel_color = sqrt(correction * pixel_color);

	pixel_color /= f32(samples);
	// pixel_ao /= f32(samples);

    /* pixel_color = textureSampleLevel(hdr_tex, hdr_sampler, vec2<f32>(f32(GlobalInvocationID.x) / f32(screen_size.x), f32(GlobalInvocationID.y) / f32(screen_size.y) * 2), 0.0).rgb; */

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
    // textureStore(secondary_buffer, screen_pos, vec4<f32>(pixel_ao, 0, 0, 1.0));
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

fn rng_steady() -> f32 {
	rng_seed_steady++;
	return bitcast<f32>((rng_hash(rng_seed_steady) >> 9) | 0x3f800000 ) - 1.0;
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

fn get_meta_voxel(v: vec3<i32>) -> MetaVoxel {
	return scene_meta_data.data[v.z * voxel_count * voxel_count + v.y * voxel_count + v.x];
}

fn get_voxel_by_position(v: vec3<f32>) -> Voxel {
	return get_voxel(vec3<i32>((v - boundary_min) / f32(voxel_size)));
}

fn sample_spherical_map(v: vec3<f32>) -> vec2<f32> {
	let theta = atan2(v.x, v.y);
	let phi = acos(v.z);
	let raw_u = theta / (2 * pi);
	let uv = vec2<f32>(
		1 - (raw_u + 0.5),
		phi / pi
	);
	return uv;
}

fn random_unit_vector() -> vec3<f32> {
	let phi = rng() * pi * 2;
	let costheta = rng() * 2 - 1;
		let theta = acos(costheta);
	let x = sin(theta) * cos(phi);
	let y = sin(theta) * sin(phi);
	let z = cos(theta);
	return vec3<f32>(x, y, z);
}
