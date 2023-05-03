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

const samples: i32 = 1;
const reflection_bounces: i32 = 2;

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
}

struct SceneData {
	data: array<Voxel>,
}

@compute @workgroup_size(16,16,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));
    //rng_seed = GlobalInvocationID.x + GlobalInvocationID.y * 1000;
    rng_seed = GlobalInvocationID.x + GlobalInvocationID.y * u32(scene.rng_start);
    init_rand(GlobalInvocationID.x, vec4<f32>(0.454, -0.789, 0.456, -0.45));
    var pixel_color: vec3<f32>;
    for (var i = 0; i < samples; i++){

	    let horizontal_coefficient: f32 = (f32(screen_pos.x) + rand() - 0.5 - f32(screen_size.x) / 2) / f32(screen_size.x);
	    let vertical_coefficient: f32 = (f32(screen_pos.y) + rand() - 0.5 - f32(screen_size.y) / 2) / -f32(screen_size.y);

	    let ray_direction = normalize(scene.camera_forward
			    + horizontal_coefficient * scene.camera_right
			    + vertical_coefficient * scene.camera_up);
	    let ray: Ray = Ray(scene.camera_pos, ray_direction, 1 / ray_direction);
	    pixel_color += trace(ray);
    }
    pixel_color /= f32(samples);

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}

fn trace(ray: Ray) -> vec3<f32> {
	var hit: RayHit;
	var bounces: array<RayHit, reflection_bounces>;
	var curr_ray = ray;
	//var color = vec3<f32>(0.2);
	var color = ray.direction;

	for (var i = 0; i < reflection_bounces; i++){
		if(voxel_ray_any(curr_ray, 0.001, &hit)){
			//return vec3<f32>(get_hit_ao(hit));
			bounces[i] = hit;
			curr_ray = ray_reflect(curr_ray, hit.position, hit.normal);
		}
	}

	for (var i: i32 = reflection_bounces; i >= 0; i--){
		if (all(bounces[i].normal == vec3<f32>(0))){
			continue;
		}
		let t = bounces[i].voxel.roughness;
		//color = bounces[i].voxel.color * illumination(bounces[i].position);
		color = color * (1 - t) + t * bounces[i].voxel.color * illumination(bounces[i].position) * (1 - get_hit_ao(bounces[i]));
	}

	return color;
}

fn illumination(p: vec3<f32>) -> f32 {
	var hit: RayHit;
	if (!voxel_ray_any(Ray(p, scene.direct_light, 1 / scene.direct_light), 0.001, &hit)){
		return scene.direct_light_brightness;
	}
	return 0.2;
}

fn voxel_ray_color(ray: Ray) -> ColorRay {
	var hit: RayHit;
	var color_ray: ColorRay;
	var lightness: f32;

	if (voxel_ray_any(ray, 0.0, &hit)){
		color_ray.color = hit.voxel.color;
		var direct_light_hit = RayHit();
		if (!voxel_ray_any(Ray(hit.position, scene.direct_light, 1 / scene.direct_light), 0.00001, &direct_light_hit)){
			lightness = 1.0;
		} else {
			lightness = 0.1;
		}
		var last_ray: Ray = ray;
		var reflection_hits = array<vec2<f32>, reflection_bounces>();
		for (var i = 0; i < reflection_bounces; i++) {
			let reflected = ray_reflect(last_ray, hit.position, hit.normal); // 2. PARAMETER ??
			let reflect_roughness = hit.voxel.roughness;
			if (voxel_ray_any(reflected, 0.00001, &hit)){
				color_ray.color = color_ray.color * reflect_roughness + hit.voxel.color * (1 - reflect_roughness);
			} else {
				break;
			}
			last_ray = reflected;
		}
	} else {
		color_ray.color = ray.direction / 16;
	}

	return color_ray;
}

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

fn get_hit_ao(hit: RayHit) -> f32 {
	let voxel = hit.voxel_position + vec3<i32>(hit.normal);
	let expo = 6f;
	let fac = 0.2;

	let dist = pow(((hit.position - (vec3<f32>(voxel) * voxel_size - grid_size / 2)) / voxel_size), vec3<f32>(expo));
	let inv_dist = pow(((hit.position - (vec3<f32>(voxel + 1) * voxel_size - grid_size / 2)) / voxel_size), vec3<f32>(expo));

	let ao = dist * fac * (1 - abs(hit.normal));
	let inv_ao = inv_dist * fac * (1 - abs(hit.normal));

	let cond_ao = ao * vec3<f32>(
		get_voxel(vec3<i32>(voxel.x + 1, voxel.y, voxel.z)).opacity,
		get_voxel(vec3<i32>(voxel.x, voxel.y + 1, voxel.z)).opacity,
		get_voxel(vec3<i32>(voxel.x, voxel.y, voxel.z + 1)).opacity,
	);

	let cond_inv_ao = inv_ao * vec3<f32>(
		get_voxel(vec3<i32>(voxel.x - 1, voxel.y, voxel.z)).opacity,
		get_voxel(vec3<i32>(voxel.x, voxel.y - 1, voxel.z)).opacity,
		get_voxel(vec3<i32>(voxel.x, voxel.y, voxel.z - 1)).opacity,
	);

	var corner_ao = 0f;
	if (get_voxel(vec3<i32>(voxel.x + 1, voxel.y + 1, voxel.z)).opacity > 0.01){
		corner_ao = max(corner_ao, min(ao.x, ao.y) * (1 - min(1, ceil(cond_ao.x + cond_ao.y))));
	}
	if (get_voxel(vec3<i32>(voxel.x - 1, voxel.y + 1, voxel.z)).opacity > 0.01){
		corner_ao = max(corner_ao, min(inv_ao.x, ao.y) * (1 - min(1, ceil(cond_inv_ao.x + cond_ao.y))));
	}
	if (get_voxel(vec3<i32>(voxel.x + 1, voxel.y - 1, voxel.z)).opacity > 0.01){
		corner_ao = max(corner_ao, min(ao.x, inv_ao.y) * (1 - min(1, ceil(cond_ao.x + cond_inv_ao.y))));
	}
	if (get_voxel(vec3<i32>(voxel.x - 1, voxel.y - 1, voxel.z)).opacity > 0.01){
		corner_ao = max(corner_ao, min(inv_ao.x, inv_ao.y) * (1 - min(1, ceil(cond_inv_ao.x + cond_inv_ao.y))));
	}

	if (get_voxel(vec3<i32>(voxel.x, voxel.y + 1, voxel.z + 1)).opacity > 0.01){
		corner_ao = max(corner_ao, min(ao.y, ao.z) * (1 - min(1, ceil(cond_ao.y + cond_ao.z))));
	}
	if (get_voxel(vec3<i32>(voxel.x, voxel.y - 1, voxel.z + 1)).opacity > 0.01){
		corner_ao = max(corner_ao, min(inv_ao.y, ao.z) * (1 - min(1, ceil(cond_inv_ao.y + cond_ao.z))));
	}
	if (get_voxel(vec3<i32>(voxel.x, voxel.y - 1, voxel.z - 1)).opacity > 0.01){
		corner_ao = max(corner_ao, min(inv_ao.y, inv_ao.z) * (1 - min(1, ceil(cond_inv_ao.y + cond_inv_ao.z))));
	}
	if (get_voxel(vec3<i32>(voxel.x, voxel.y + 1, voxel.z - 1)).opacity > 0.01){
		corner_ao = max(corner_ao, min(ao.y, inv_ao.z) * (1 - min(1, ceil(cond_ao.y + cond_inv_ao.z))));
	}

	if (get_voxel(vec3<i32>(voxel.x + 1, voxel.y, voxel.z + 1)).opacity > 0.01){
		corner_ao = max(corner_ao, min(ao.x, ao.z) * (1 - min(1, ceil(cond_ao.x + cond_ao.z))));
	}
	if (get_voxel(vec3<i32>(voxel.x - 1, voxel.y, voxel.z + 1)).opacity > 0.01){
		corner_ao = max(corner_ao, min(inv_ao.x, ao.z) * (1 - min(1, ceil(cond_inv_ao.x + cond_ao.z))));
	}
	if (get_voxel(vec3<i32>(voxel.x - 1, voxel.y, voxel.z - 1)).opacity > 0.01){
		corner_ao = max(corner_ao, min(inv_ao.x, inv_ao.z) * (1 - min(1, ceil(cond_inv_ao.x + cond_inv_ao.z))));
	}
	if (get_voxel(vec3<i32>(voxel.x + 1, voxel.y, voxel.z - 1)).opacity > 0.01){
		corner_ao = max(corner_ao, min(ao.x, inv_ao.z) * (1 - min(1, ceil(cond_ao.x + cond_inv_ao.z))));
	}

	//var remove_ao: f32;
	//if (get_voxel(vec3<))

	return cond_ao.x + cond_ao.y + cond_ao.z + cond_inv_ao.x + cond_inv_ao.y + cond_inv_ao.z + corner_ao;
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
