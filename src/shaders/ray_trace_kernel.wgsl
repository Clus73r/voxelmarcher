@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> scene: SceneData;

const grid_size: i32 = 2;
const voxel_count: i32 = 4;
const voxel_size: f32 = f32(grid_size) / f32(voxel_count);

struct Ray {
    origin: vec3<f32>,
    direction: vec3<f32>,
    inv_direction: vec3<f32>,
}

struct Sphere {
    center: vec3<f32>,
        color: vec3<f32>,
	    radius: f32,
	    }

struct SceneData {
    cameraPos: vec3<f32>,
    cameraForwards: vec3<f32>,
    cameraRight: vec3<f32>,
    cameraUp: vec3<f32>,
}

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let screen_size: vec2<u32> = textureDimensions(color_buffer);
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));

    let horizontal_coefficient: f32 = (f32(screen_pos.x) - f32(screen_size.x) / 2) / f32(screen_size.x);
    let vertical_coefficient: f32 = (f32(screen_pos.y) - f32(screen_size.y) / 2) / f32(screen_size.y);

    let boundary_min: vec3<f32> = vec3<f32>(-1.0, -1.0, -1.0);
    let boundary_max: vec3<f32> = vec3<f32>(1.0, 1.0, 1.0);

    let ray_direction = normalize(scene.cameraForwards
	+ horizontal_coefficient * scene.cameraRight
	+ vertical_coefficient * scene.cameraUp);
    let ray: Ray = Ray(scene.cameraPos, ray_direction, 1 / ray_direction);

    var pixel_color : vec3<f32> = vec3<f32>(ray_direction[0], ray_direction[1], ray_direction[2]);

    var<function> tmin: f32 = 0.0;
    var<function> tmax: f32 = 300000000;
    if (ray_box_intersection(ray, boundary_min, boundary_max, &tmin, &tmax)){
    	let ray_hit = ray.origin + ray_direction * tmin;
	let hit_disc = vec3<i32>(
		i32((ray_hit[0] - boundary_min[0]) / f32(voxel_size)),
		i32((ray_hit[1] - boundary_min[1]) / f32(voxel_size)),
		i32((ray_hit[2] - boundary_min[2]) / f32(voxel_size)));

	pixel_color = vec3<f32>(
		f32(hit_disc[0]) / f32(voxel_count),
		f32(hit_disc[1]) / f32(voxel_count),
		f32(hit_disc[2]) / f32(voxel_count));
    }

    var mySphere: Sphere;
    mySphere.center = vec3<f32>(-3.0, 0.0, 0.0);
    mySphere.radius = 0.1;
    
    if (hit(ray, mySphere)) {
        pixel_color = vec3<f32>(0.5, 1.0, 0.75);
    }

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}

fn ray_box_intersection(ray: Ray, bmin: vec3<f32>, bmax: vec3<f32>, tmin: ptr<function, f32>, tmax: ptr<function, f32>) -> bool {
    for (var d: i32 = 0; d < 3; d++) {
	let t1 = (bmin[d] - ray.origin[d]) * ray.inv_direction[d];
	let t2 = (bmax[d] - ray.origin[d]) * ray.inv_direction[d];

	*tmin = min(max(t1, *tmin), max(t2, *tmin));
	*tmax = max(min(t1, *tmax), min(t2, *tmax));
    }

    return *tmin <= *tmax;
}

fn hit(ray: Ray, sphere: Sphere) -> bool {
    
        let a: f32 = dot(ray.direction, ray.direction);
	    let b: f32 = 2.0 * dot(ray.direction, ray.origin - sphere.center);
	        let c: f32 = dot(ray.origin - sphere.center, ray.origin - sphere.center) - sphere.radius * sphere.radius;
		    let discriminant: f32 = b * b - 4.0 * a * c;

		        return discriminant > 0;
			    
			    }
