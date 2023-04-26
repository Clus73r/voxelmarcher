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

const samples: i32 = 500;
const reflection_bounces: i32 = 1;
const light_bounces: i32 = 2;
const scatter: i32 = 5;
const ambient_light: f32 = 0.03;
const ao: f32 = 0.2;

var<private> rng_seed: u32;
var<private> rand_seed: vec2<f32>;

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

struct ColorRay {
	color: vec3<f32>,
}

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

@compute @workgroup_size(16,16,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));
    rng_seed = GlobalInvocationID.x + GlobalInvocationID.y * 1000;
    /* rng_seed = GlobalInvocationID.x + GlobalInvocationID.y * u32(scene.rng_start); */
    init_rand(GlobalInvocationID.x, vec4<f32>(0.454, -0.789, 0.456, -0.45));

    var pixel_color: vec3<f32>;
    for (var i = 0; i < samples; i++){

	    let horizontal_coefficient: f32 = (f32(screen_pos.x) + rand() - 0.5 - f32(screen_size.x) / 2) / f32(screen_size.x);
	    let vertical_coefficient: f32 = (f32(screen_pos.y) + rand() - 0.5 - f32(screen_size.y) / 2) / -f32(screen_size.y);

	    let ray_direction = normalize(scene.camera_forward
			    + horizontal_coefficient * scene.camera_right
			    + vertical_coefficient * scene.camera_up);
	    let ray: Ray = Ray(scene.camera_pos, ray_direction, 1 / ray_direction);
	    pixel_color += trace(ray, light_bounces);
    }
    /* pixel_color /= f32(samples); */

    let correction = 1.0 / f32(samples);
    pixel_color = sqrt(correction * pixel_color);

    /* pixel_color = random_unit_vector(); */

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}

fn trace(ray: Ray, depth: i32) -> vec3<f32> {
	if (depth <= 0) {
		return vec3<f32>(0);
	}
	var accum: vec3<f32> = vec3<f32>(0.0);
	var mask: vec3<f32> = vec3<f32>(1.0);
	var curr_ray: Ray = ray;
	var curr_hit: RayHit;
	var refl: f32 = 1.0;

	var bounce_results: array<RayHit, light_bounces>;

	for (var i = 0; i < light_bounces; i++){
		if (voxel_ray_any(curr_ray, 0.0001, &curr_hit)) {
			let bounce_direction = random_unit_vector() + curr_hit.normal;
			if (all(bounce_direction == vec3<f32>(0))){
				curr_ray = Ray(curr_hit.position, curr_hit.normal, 1 / curr_hit.normal);
			} else {
				curr_ray = Ray(curr_hit.position, bounce_direction, 1 / bounce_direction);
			}
			bounce_results[i] = curr_hit;
		}
	}
	accum = vec3<f32>(0.2, 0.2, 0.2);
	for (var i: i32 = light_bounces; i >= 0; i--){
		if (all(bounce_results[i].normal == vec3<f32>(0))){
			continue;
		}
		/* accum = direct_illumination(bounce_results[i], &refl) * accum + bounce_results[i].voxel.lightness * bounce_results[i].voxel.color; */
		accum = bounce_results[i].voxel.color * accum + bounce_results[i].voxel.lightness * bounce_results[i].voxel.color;
	}
	return accum;

	/* let illum = direct_illumination(curr_hit, &refl); */


			/*  */
			/* for (var scatter_i = 0; scatter_i < scatter; scatter_i++){ */
			/* 	let bounce_direction = random_unit_vector() + curr_hit.normal; */
			/* 	let bounce_ray = Ray(curr_hit.position, bounce_direction, 1 / bounce_direction); */
			/* 	if (voxel_ray_any(bounce_ray, 0.0001, &curr_hit)){ */
			/* 		illum += direct_illumination(curr_hit, &refl); */
			/* 	} */
			/* } */
			/* return illum / f32(scatter); */

	//return ColorRay(curr_hit.position);
	//}
}

fn direct_illumination(orig_hit: RayHit, refl: ptr<function, f32>) -> vec3<f32> {
	var hit: RayHit;
	if (!voxel_ray_any(Ray(orig_hit.position, scene.direct_light, 1 / scene.direct_light), 0.00001, &hit)){
		return scene.direct_light_brightness * orig_hit.voxel.color;
	} else {
		return 0.2 * orig_hit.voxel.color;
	}
	//Refl
}

//fn pbr(hit: RayHit, ray: Ray) -> vec3<f32> {
//	let ambient_color = vec3<f32>(ambient_light) * hit.voxel.color * (1.0 - ao);
//	let f0 = vec3<f32>(0.04); //dielectric
//}

fn voxel_ray_any(ray: Ray, start_tolerance: f32, hit: ptr<function, RayHit>) -> bool {
	var tmin: f32 = 0.0;
	var tmax: f32 = 300000000;
	for (var d: i32 = 0; d < 3; d++) {
		let t1 = (boundary_min[d] - ray.origin[d]) * ray.inv_direction[d];
		let t2 = (boundary_max[d] - ray.origin[d]) * ray.inv_direction[d];

		tmin = min(max(t1, tmin), max(t2, tmin));
		tmax = max(min(t1, tmax), min(t2, tmax));
	}
	// Hier ist noch ein Fehler drin, tritt nur von ausserhalb des grid auf, das kommt ja vielleicht eh noch weg
	if tmin > tmax { return false; }
    	let ray_entry = ray.origin + ray.direction * tmin;
	let ray_exit = ray.origin + ray.direction * tmax;

	var voxel: vec3<i32> = max(vec3<i32>(0), min(vec3<i32>(voxel_count - 1), vec3<i32>((ray_entry - boundary_min) / f32(voxel_size))));
	//var end_voxel: vec3<i32> = max(vec3<i32>(0), min(vec3<i32>(voxel_count - 1), vec3<i32>((ray_exit - boundary_min - ray.direction * 0.000001) / f32(voxel_size))));

	let direction_zeros: vec3<bool> = ray.direction == vec3<f32>(0);
	let step: vec3<i32> = vec3<i32>(sign(ray.direction));
	let tdelta: vec3<f32> = select(voxel_size / abs(ray.direction), vec3<f32>(tmax), direction_zeros);
	let voxel_boundary: vec3<f32> = vec3<f32>(voxel + max(vec3<i32>(0), step)) * voxel_size;
	var tmax_comp: vec3<f32> = select(tmin + (boundary_min + voxel_boundary - ray_entry) / ray.direction, vec3<f32>(tmax), direction_zeros);
	var thit: f32 = tmin;
	var hit_normal: vec3<f32> = vec3<f32>(0, 0, 0);

	while(all(voxel >= vec3<i32>(0)) && all(voxel < vec3<i32>(voxel_count))) {
		let hit_voxel = get_voxel(voxel);
		if (hit_voxel.opacity > 0.01 && all(tmax_comp > vec3<f32>(start_tolerance))){
			(*hit).position = ray.origin + ray.direction * thit;
			(*hit).voxel = hit_voxel;
			(*hit).voxel_position = voxel;
			(*hit).depth = 1 - (thit - depth_clip_min) / (depth_clip_max - depth_clip_min);
			(*hit).normal = hit_normal;
			return true;
		}

		if (tmax_comp.x < tmax_comp.y && tmax_comp.x < tmax_comp.z) {
			voxel.x += step.x;
			thit = tmax_comp.x;
			tmax_comp.x += tdelta.x;
			hit_normal = vec3<f32>(f32(-step.x), 0, 0);
		} else if (tmax_comp.y < tmax_comp.z){
			voxel.y += step.y;
			thit = tmax_comp.y;
			tmax_comp.y += tdelta.y;
			hit_normal = vec3<f32>(0, f32(-step.y), 0);
		} else {
			voxel.z += step.z;
			thit = tmax_comp.z;
			tmax_comp.z += tdelta.z;
			hit_normal = vec3<f32>(0, 0, f32(-step.z));
		}
	}

	return false;
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

 fn rng() -> f32 {
	var z = rng_seed + 0x9e3779b9;
	rng_seed++;
	z ^= z >> 15;
	z *= 0x853bca6b;
	z ^= z >> 13;
	z *= 0xc2b2ae35;
	z ^= (z >> 16);
	return bitcast<f32>((z >> 9) | 0x3f800000) - 1.0;
 }

fn random_unit_vector() -> vec3<f32> {
	return normalize(vec3<f32>(rand() - 0.5, rand() - 0.5, rand() - 0.5));
}

fn init_rand(invocation_id : u32, seed : vec4<f32>) {
	rand_seed = seed.xz;
	rand_seed = fract(rand_seed * cos(35.456+f32(invocation_id) * seed.yw));
	rand_seed = fract(rand_seed * cos(41.235+f32(invocation_id) * seed.xw));
}

fn rand() -> f32 {
	rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
	rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
	return rand_seed.y;
}
