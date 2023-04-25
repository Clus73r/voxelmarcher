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
    cameraPos: vec3<f32>,
    cameraForwards: vec3<f32>,
    cameraRight: vec3<f32>,
    cameraUp: vec3<f32>,
}

struct Voxel {
	color: vec3<f32>,
	opacity: f32,
	roughness: f32,
}

struct SceneData {
	data: array<Voxel>,
}

@compute @workgroup_size(4,4,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));

    let horizontal_coefficient: f32 = (f32(screen_pos.x) - f32(screen_size.x) / 2) / f32(screen_size.x);
    let vertical_coefficient: f32 = (f32(screen_pos.y) - f32(screen_size.y) / 2) / -f32(screen_size.y);

    let ray_direction = normalize(scene.cameraForwards
	+ horizontal_coefficient * scene.cameraRight
	+ vertical_coefficient * scene.cameraUp);
    let ray: Ray = Ray(scene.cameraPos, ray_direction, 1 / ray_direction);

    /* var pixel_color : vec3<f32> = vec3<f32>(ray_direction[0], ray_direction[1], ray_direction[2]); */
    var pixel_color : vec3<f32> = vec3<f32>(0.2, 0.2, 0.4);
    /* pixel_color += 0.8; */

    /* var hit: RayHit; */
    /* if (voxel_ray_any(ray, &hit)){} */
	    /* pixel_color = vec3<f32>(hit.voxel_position) / f32(voxel_count); */
	    /* pixel_color = hit.voxel.color + vec3<f32>(hit.voxel_position) / f32(voxel_count) / 2; */
	    /* pixel_color = hit.voxel.color; */
	    /*     	    pixel_color = hit.normal; */

	pixel_color = voxel_ray_color(ray).color;

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}

fn voxel_ray_color(ray: Ray) -> ColorRay {
	var hit: RayHit;
	var color_ray: ColorRay;

	if (voxel_ray_any(ray, &hit)){
		color_ray.color = hit.voxel.color;
		/* if (hit.normal.x == 0.0 && hit.normal.y == 0.0 && hit.normal.z == 0.0){ */
		/* 	color_ray.color = vec3<f32>(0.0); */
		/* 	return color_ray; */
		/* } */
		let reflected = ray_reflect(ray, hit.position + hit.normal, hit.normal);
		let reflect_roughness = hit.voxel.roughness;
		if (voxel_ray_any(reflected, &hit)){
			color_ray.color = color_ray.color * reflect_roughness + hit.voxel.color * (1 - reflect_roughness);
		}
	} else {
		color_ray.color = ray.direction / 16;
	}

	return color_ray;
}

fn voxel_ray_any(ray: Ray, hit: ptr<function, RayHit>) -> bool {
	var tmin: f32 = 0.0;
	var tmax: f32 = 300000000;
	for (var d: i32 = 0; d < 3; d++) {
		let t1 = (boundary_min[d] - ray.origin[d]) * ray.inv_direction[d];
		let t2 = (boundary_max[d] - ray.origin[d]) * ray.inv_direction[d];

		tmin = min(max(t1, tmin), max(t2, tmin));
		tmax = max(min(t1, tmax), min(t2, tmax));
	}
	if tmin > tmax { return false; }
    	let ray_entry = ray.origin + ray.direction * tmin;
	let ray_exit = ray.origin + ray.direction * tmax;

	var voxel: vec3<i32> = vec3<i32>(
		max(0, min(voxel_count - 1, i32((ray_entry[0] - boundary_min[0]) / f32(voxel_size)))),
		max(0, min(voxel_count - 1, i32((ray_entry[1] - boundary_min[1]) / f32(voxel_size)))),
		max(0, min(voxel_count - 1, i32((ray_entry[2] - boundary_min[2]) / f32(voxel_size)))));
	var voxel_upper_edge: vec3<i32> = vec3<i32>(
		voxel[0] + 1,
		voxel[1] + 1,
		voxel[2] + 1,
	);

	var tmax_comp: vec3<f32> = vec3<f32>(0, 0, 0);
	var tdelta: vec3<f32> = vec3<f32>(0, 0, 0);
	var step: vec3<i32> = vec3<i32>(0, 0, 0);
	var thit: f32 = tmin;
	var hit_normal: vec3<f32> = vec3<f32>(0, 0, 0);

	for (var d: i32 = 0; d < 3; d++){
		if (ray.direction[d] > 0.0){
			step[d] = 1;
			tdelta[d] = voxel_size / ray.direction[d];
			tmax_comp[d] = tmin + (boundary_min[d] + f32(voxel_upper_edge[d]) * voxel_size - ray_entry[d]) / ray.direction[d];

		} else if (ray.direction[d] < 0.0){
			step[d] = -1;
			tdelta[d] = voxel_size / (-ray.direction[d]);
			tmax_comp[d] = tmin + (boundary_min[d] + f32(voxel[d]) * voxel_size - ray_entry[d]) / ray.direction[d];
		} else {
			step[d] = 0;
			tdelta[d] = tmax;
			tmax_comp[d] = tmax;
		}
	}
	
	while(
		voxel.x >= 0 && voxel.x < voxel_count &&
		voxel.y >= 0 && voxel.y < voxel_count &&
		voxel.z >= 0 && voxel.z < voxel_count
	) {
		let hit_voxel = get_voxel(voxel);
		if (hit_voxel.opacity > 0.01){
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
