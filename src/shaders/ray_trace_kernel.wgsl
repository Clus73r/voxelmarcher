@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> scene: SceneData;

const grid_size: u32 = 10;
const voxel_size: f32 = 10;

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

    var pixel_color : vec3<f32> = vec3<f32>(f32(screen_pos[0]) / f32(screen_size[0]), 0.0, 0.25);

    let aabbmin: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    let aabbmax: vec3<f32> = vec3<f32>(2.0, 2.0, 2.0);

    let ray_direction = normalize(scene.cameraForwards
	+ horizontal_coefficient * scene.cameraRight
	+ vertical_coefficient * scene.cameraUp);
    let ray: Ray = Ray(ray_direction, scene.cameraPos, 1 / ray_direction);

    if (ray_box_intersection(ray, aabbmin, aabbmax)){
	pixel_color = vec3<f32>(0.0, 0.0, 0.0);
    }

        var mySphere: Sphere;
	    mySphere.center = vec3<f32>(-3.0, 0.0, 0.0);
	        mySphere.radius = 0.1;
    
    if (hit(ray, mySphere)) {
        pixel_color = vec3<f32>(0.5, 1.0, 0.75);
    }

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}

fn ray_box_intersection(ray: Ray, bmin: vec3<f32>, bmax: vec3<f32>) -> bool {
    var tmin: f32 = 0.0;
    var tmax: f32 = 300000000;

    for (var d: i32 = 0; d < 3; d++) {
	let t1 = (bmin[d] - ray.origin[d]) * ray.inv_direction[d];
	let t2 = (bmax[d] - ray.origin[d]) * ray.inv_direction[d];

	tmin = min(max(t1, tmin), max(t2, tmin));
	tmax = max(min(t1, tmax), min(t2, tmax));
    }

    return tmin <= tmax;
}

fn hit(ray: Ray, sphere: Sphere) -> bool {
    
        let a: f32 = dot(ray.direction, ray.direction);
	    let b: f32 = 2.0 * dot(ray.direction, ray.origin - sphere.center);
	        let c: f32 = dot(ray.origin - sphere.center, ray.origin - sphere.center) - sphere.radius * sphere.radius;
		    let discriminant: f32 = b * b - 4.0 * a * c;

		        return discriminant > 0;
			    
			    }
