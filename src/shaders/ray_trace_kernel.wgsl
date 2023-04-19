@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> scene: SceneData;

const grid_size: i32 = 2;
const voxel_count: i32 = 4;
const voxel_size: f32 = f32(grid_size) / f32(voxel_count);
const boundary_min: vec3<f32> = vec3<f32>(f32(-grid_size) / 2, f32(-grid_size) / 2, f32(-grid_size) / 2);
const boundary_max: vec3<f32> = vec3<f32>(f32(grid_size) / 2, f32(grid_size) / 2, f32(grid_size) / 2);

const voxel_data: VoxelData = VoxelData(
array<i32, 64>(
	1, 1, 1, 1,
	1, 1, 1, 1,
	0, 0, 0, 0,
	0, 0, 0, 0,
	1, 1, 1, 1,
	1, 1, 1, 1,
	0, 0, 0, 0,
	0, 0, 0, 0,
	1, 1, 1, 1,
	1, 1, 1, 1,
	0, 0, 0, 0,
	0, 0, 0, 0,
	1, 1, 1, 1,
	1, 1, 1, 1,
	0, 0, 0, 0,
	0, 0, 0, 0,
));

struct Ray {
    origin: vec3<f32>,
    direction: vec3<f32>,
    inv_direction: vec3<f32>,
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

    if (ray_box_intersection(ray, boundary_min, boundary_max, &tmin, &tmax)){
    	let ray_hit = ray.origin + ray_direction * tmin;

	voxel_ray_any(ray, ray_hit);

	// let hit_disc = vec3<i32>(
	// 	min(voxel_count - 1, i32((ray_hit[0] - boundary_min[0]) / f32(voxel_size))),
	// 	min(voxel_count - 1, i32((ray_hit[1] - boundary_min[1]) / f32(voxel_size))),
	// 	min(voxel_count - 1, i32((ray_hit[2] - boundary_min[2]) / f32(voxel_size))));

	// pixel_color = vec3<f32>(
	// 	f32(hit_disc[0]) / f32(voxel_count),
	// 	f32(hit_disc[1]) / f32(voxel_count),
	// 	f32(hit_disc[2]) / f32(voxel_count));

    }

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}

fn voxel_ray_any(ray: Ray) -> bool {
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
	var voxel: vec3<i32> = vec3<i32>(
		min(voxel_count - 1, i32((ray_hit[0] - boundary_min[0]) / f32(voxel_size))),
		min(voxel_count - 1, i32((ray_hit[1] - boundary_min[1]) / f32(voxel_size))),
		min(voxel_count - 1, i32((ray_hit[2] - boundary_min[2]) / f32(voxel_size))));
	let step: vec3<i32> = vec3<i32>(
		i32(sign(ray.direction[0])),
		i32(sign(ray.direction[1])),
		i32(sign(ray.direction[2])),
	);

	let tmax_comp: vec3<f32> = vec3<f32>(
		step[0] == 0 ? {tmax : tmin + (boundary_min[0] + (voxel[0] - (ray.direction[0] < 0 ? 1 : 0)) * voxel_size - ray.origin[0]) / ray.direction[0]},
		0,
		0,
		//step[1] == 0 ? tmax : tmin + (boundary_min[1] + (voxel[1] - (ray.direction[1] < 0 ? 1 : 0)) * voxel_size - ray.origin[1]) / ray.direction[1],
		//step[2] == 0 ? tmax : tmin + (boundary_min[2] + (voxel[2] - (ray.direction[2] < 0 ? 1 : 0)) * voxel_size - ray.origin[2]) / ray.direction[2]
	);
	
	while(true) {
		if (tmax.x < tmax.y) {
			if (tmax.x < tmax.z){

			}
		}
	}

	return false;
}

fn get_voxel(x: i32, y: i32, z: i32) -> i32 {
	return voxel_data.data[z * grid_size * grid_size + y * grid_size + x];
}
