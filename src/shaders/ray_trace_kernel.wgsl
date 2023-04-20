@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> scene: SceneData;

const grid_size: i32 = 2;
const voxel_count: i32 = 4;
const voxel_size: f32 = f32(grid_size) / f32(voxel_count);
const boundary_min: vec3<f32> = vec3<f32>(f32(-grid_size) / 2, f32(-grid_size) / 2, f32(-grid_size) / 2);
const boundary_max: vec3<f32> = vec3<f32>(f32(grid_size) / 2, f32(grid_size) / 2, f32(grid_size) / 2);

struct Ray {
    origin: vec3<f32>,
    direction: vec3<f32>,
    inv_direction: vec3<f32>,
}

struct RayHit {
	position: vec3<f32>,
	voxel: i32,
}

struct SceneData {
    cameraPos: vec3<f32>,
    cameraForwards: vec3<f32>,
    cameraRight: vec3<f32>,
    cameraUp: vec3<f32>,
}

struct VoxelData {
	data: array<i32, 64>,
}

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));

    let horizontal_coefficient: f32 = (f32(screen_pos.x) - f32(screen_size.x) / 2) / f32(screen_size.x);
    let vertical_coefficient: f32 = (f32(screen_pos.y) - f32(screen_size.y) / 2) / f32(screen_size.y);


    let ray_direction = normalize(scene.cameraForwards
	+ horizontal_coefficient * scene.cameraRight
	+ vertical_coefficient * scene.cameraUp);
    let ray: Ray = Ray(scene.cameraPos, ray_direction, 1 / ray_direction);

    var pixel_color : vec3<f32> = vec3<f32>(ray_direction[0], ray_direction[1], ray_direction[2]);
    pixel_color += 0.8;
    /* pixel_color  */

	var hit: RayHit;
    if (voxel_ray_any(ray, &hit)){
	    pixel_color = vec3<f32>(hit.position + 1) / 2;
    }
    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
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
    	let ray_hit = ray.origin + ray.direction * tmin;
	let ray_exit = ray.origin + ray.direction * tmax;

	var voxel: vec3<i32> = vec3<i32>(
		min(voxel_count - 1, i32((ray_hit[0] - boundary_min[0]) / f32(voxel_size))),
		min(voxel_count - 1, i32((ray_hit[1] - boundary_min[1]) / f32(voxel_size))),
		min(voxel_count - 1, i32((ray_hit[2] - boundary_min[2]) / f32(voxel_size))));

	var tmax_comp: vec3<f32> = vec3<f32>(0, 0, 0);
	var tdelta: vec3<f32> = vec3<f32>(0, 0, 0);
	var step: vec3<i32> = vec3<i32>(0, 0, 0);

	for (var d: i32; d < 3; d++){
		if (ray.direction[d] > 0.0){
			step[d] = 1;
			tdelta[d] = 1 / ray.direction[d] * voxel_size;
			tmax_comp[d] = tmin + (boundary_min[d] + f32(voxel[d]) * voxel_size - ray_hit[d]) / ray.direction[d];
		} else if (ray.direction[d] < 0.0){
			return false;
			step[d] = -1;
			tdelta[d] = voxel_size / (-ray.direction[d]);
			let prev_voxel: i32 = voxel[d] - 1;
			tmax_comp[d] = tmin + (boundary_min[d] + f32(prev_voxel) * voxel_size - ray_hit[d]) / ray.direction[d];
		} else {
			return false;
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
		if (get_voxel(voxel) != 0){
			(*hit).position = ray.origin + ray.direction * tmax_comp;
			(*hit).voxel = get_voxel(voxel);
			return true;
		}
		if (tmax_comp.x < tmax_comp.y && tmax_comp.x < tmax_comp.z) {
			voxel.x += step.x;
			tmax_comp.x += tdelta.x;
		} else if (tmax_comp.y < tmax_comp.z){
			voxel.y += step.y;
			tmax_comp.y += tdelta.y;
		} else {
			voxel.z += step.z;
			tmax_comp.z += tdelta.z;
		}
	}

	return false;
}

fn get_voxel(v: vec3<i32>) -> i32 {
	let x: i32 = v.x;
	const g: array<i32, 64> = array<i32, 64>(
		1, 1, 1, 1,
		0, 0, 0, 0,
		1, 1, 1, 1,
		0, 0, 0, 0,
		1, 1, 1, 1,
		0, 0, 0, 0,
		1, 1, 1, 1,
		0, 0, 0, 0,
		1, 1, 1, 1,
		0, 0, 0, 0,
		1, 1, 1, 1,
		0, 0, 0, 0,
		1, 1, 1, 1,
		0, 0, 0, 0,
		0, 0, 0, 0,
		1, 1, 1, 1,
	);
	return g[v.z * voxel_count * voxel_count + v.y * voxel_count + v.x];
}
