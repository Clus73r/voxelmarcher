const ao_samples: i32 = 15;
const ao_range: f32 = 0.5;

struct penetration {
	color: vec3<f32>,
	ao: f32,
	opacity: f32,
}

fn gamma_correct(color: vec3<f32>) -> vec3<f32> {
    return color / f32(samples);
}

fn trace(ray: Ray, depth: i32) -> TraceResult {
	var hit: RayHit;
	var bounces: array<RayHit, reflection_bounces>;
	var curr_ray = ray;
	var hits: i32 = 0;
	var has_next_ray = true;
	var penetrations: array<penetration, max_penetrations>;
	var penetration_count = 0;

	for (var p = 0; p < max_penetrations; p++){
		var color = vec3<f32>(0.0);
		var ao = 0f;
		var first_hit: RayHit;
		for (var i = 0; i < reflection_bounces; i++){
			if(voxel_ray_any(curr_ray, 0.001, &hit)){
				bounces[i] = hit;
				curr_ray = ray_reflect(curr_ray, hit.position, hit.normal);
				hits++;
				if (i == 0){
					first_hit = hit;
				}
				if (hit.voxel.roughness > 0.99){
					break;
				}
			} else {
				color = scene.background_color;
				break;
			}
		}
		if (hits == 0){
			break;
			// return background;
			// return ray.direction;
		}

		for (var i: i32 = hits; i >= 0; i--){
			let t = bounces[i].voxel.roughness;
			color = color * (1 - t) + t * bounces[i].voxel.color * illumination(bounces[i].position);
			// color *= (1 - get_point_ao(bounces[i].position));
			if (i == 0){
				ao = get_point_ao(bounces[0].position);
			}
			
			for (var l: i32 = 0; l < i32(scene.light_count); l++){
				let light = lights.data[l];
				if i32(light.emitter_type) == 0 {
					let light_voxel = get_voxel(vec3<i32>(light.location));
					let light_voxel_location = light.location * voxel_size + boundary_min;
					let light_voxel_location_top = light_voxel_location + voxel_size;
					let light_voxel_location_mid = (light_voxel_location + light_voxel_location_top) / 2;
					let lray_dir = light_voxel_location_mid - bounces[i].position;
					let lray = Ray(bounces[i].position, lray_dir, 1 / lray_dir);
					var lhit: RayHit;
					if (voxel_ray_any(lray, 0.001, &lhit) && all(lhit.voxel_position == vec3<i32>(light.location))){
						let dist = distance(light_voxel_location_mid, bounces[i].position);
						let intensity = 1 / pow(dist, 2) * lhit.voxel.lightness;
						color += light_voxel.color * vec3<f32>(intensity) * bounces[i].voxel.color;
					}
				}
			}
		}
		penetrations[p] = penetration(color, ao, first_hit.voxel.opacity);
		penetration_count++;
		curr_ray = Ray(first_hit.exit_position, ray.direction, ray.inv_direction);
		if (first_hit.voxel.opacity > 0.99){
			break;
		}
	}

	if (penetration_count == 0){
		return TraceResult(scene.background_color, 0);
	}

	var color = penetrations[penetration_count].color;
	var ao = penetrations[penetration_count].ao;
	for (var i: i32 = penetration_count - 1; i >= 0; i--){
		color = penetrations[i].color * penetrations[i].opacity + color * (1 - penetrations[i].opacity);
		ao = penetrations[i].ao * penetrations[i].opacity + ao * (1 - penetrations[i].opacity);
	}

	return TraceResult(color, ao);
	// return color;
}

fn illumination(p: vec3<f32>) -> f32 {
	var hit: RayHit;
	if (!voxel_ray_any(Ray(p, scene.direct_light, 1 / scene.direct_light), 0.001, &hit)){
		return scene.direct_light_brightness;
	}
	return 0.2;
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
			if (tmax_comp.x < tmax_comp.y && tmax_comp.x < tmax_comp.z) {
				(*hit).exit_position = ray.origin + ray.direction * tmax_comp.x;
			} else if (tmax_comp.y < tmax_comp.z){
				(*hit).exit_position = ray.origin + ray.direction * tmax_comp.y;
			} else {
				(*hit).exit_position = ray.origin + ray.direction * tmax_comp.z;
			}
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

fn get_point_ao(point: vec3<f32>) -> f32 {
	var ao: f32 = 0.0;
	for (var i = 0; i < ao_samples; i++) {
		let sample_point = random_unit_vector() * rng() * ao_range + point;
		ao += get_voxel_by_position(sample_point).opacity;
	}
	return max(0, ao / f32(ao_samples) - 0.5);
}
