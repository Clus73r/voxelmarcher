const light_scatter_samples: i32 = 2;

fn gamma_correct(color: vec3<f32>) -> vec3<f32> {
    let correction = 1.0 / f32(samples);
    return sqrt(correction * color);
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
		var hits: i32 = 0;

		var bounce_results: array<RayHit, light_bounces>;

		for (; hits < light_bounces;){
			if (voxel_ray_any(curr_ray, 0.0001, &curr_hit)) {
				let bounce_direction = random_unit_vector() + curr_hit.normal;
				if (all(bounce_direction == vec3<f32>(0))){
					curr_ray = Ray(curr_hit.position, curr_hit.normal, 1 / curr_hit.normal);
				} else {
					let normalized = normalize(bounce_direction);
					curr_ray = Ray(curr_hit.position, normalized, 1 / normalized);
				}
				bounce_results[hits] = curr_hit;
				hits++;
			} else {
				// accum = pow(textureSampleLevel(hdr_tex, hdr_sampler, sample_spherical_map(curr_ray.direction), 0.0).rgb, vec3<f32>(2)) * 5;
				accum = vec3<f32>(pow(max(0, dot(curr_ray.direction, scene.direct_light) - 0.98) * 40, 1));
				break;
			}
		}

		if (hits == 0){
			// return textureSampleLevel(hdr_tex, hdr_sampler, sample_spherical_map(ray.direction), 0.0).rgb;
			return vec3<f32>(pow(max(0, dot(ray.direction, scene.direct_light) - 0.95) * 20, 1));
		}
		if (hits == light_bounces){
			accum = vec3<f32>(0, 0, 0);
		} else {
			// accum = textureSampleLevel(hdr_tex, hdr_sampler, sample_spherical_map(bounce_results[hits - 1].ray_direction), 0.0).rgb;
			/* accum = vec3<f32>(max(0, dot(bounce_results[hits - 1].ray_direction, scene.direct_light))); */
			// accum = vec3<f32>(0);
		}
		for (var i: i32 = hits - 1; i >= 0; i--){
			let bounce = bounce_results[i];
			/* accum = min(vec3<f32>(1), accum) * min(vec3<f32>(1), bounce.voxel.color); */
			accum = accum * bounce.voxel.color
				+ bounce_results[i].voxel.lightness * bounce_results[i].voxel.color;
			// if (all(bounce.normal == vec3<f32>(0)) && all(bounce.ray_direction == vec3<f32>(0))){
			// 	// accum = textureSampleLevel(hdr_tex, hdr_sampler, sample_spherical_map(bounce_results[i].ray_direction), 0.0).rgb;
			// 	accum = vec3<f32>(0.5);
			// 	continue;
			// }
			// accum = accum * bounce.voxel.color;
			// accum = accum * bounce.voxel.color;
		}
	return accum; // / f32(light_scatter_samples);
}

fn direct_illumination(orig_hit: RayHit, refl: ptr<function, f32>) -> vec3<f32> {
	var hit: RayHit;
	if (!voxel_ray_any(Ray(orig_hit.position, scene.direct_light, 1 / scene.direct_light), 0.00001, &hit)){
		return scene.direct_light_brightness * orig_hit.voxel.color;
	} else {
		return 0.2 * orig_hit.voxel.color;
	}
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
			(*hit).ray_direction = ray.direction;
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
