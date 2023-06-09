const ao_samples: i32 = 20;
const ao_range: f32 = 0.2;

struct penetration {
	color: vec3<f32>,
	ao: f32,
	opacity: f32,
}

fn gamma_correct(color: vec3<f32>) -> vec3<f32> {
    return color / f32(samples);
}

fn trace(ray: Ray, depth: i32) -> vec3<f32> {
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
				// return TraceResult(vec3<f32>(hit.uv.x), 0.0);
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
				// return TraceResult(vec3<f32>(0.1), 0.0);
				color = scene.background_color;
				break;
			}
		}
		if (hits == 0){
			break;
			// return background;
			// return ray.direction;
		}
		// return vec3<f32>(0.2, 0.4, 0.5);
		// return vec3<f32>(bounces[0].uv.x, bounces[0].uv.y, 0.0);

		for (var i: i32 = hits; i >= 0; i--){
				// return TraceResult(vec3<f32>(0.5), 0.0);
			// return TraceResult(vec3<f32>(bounces[i].uv.x), 0.0);
			let t = bounces[i].voxel.roughness;
			color = color * (1 - t) + t * bounces[i].voxel.color * illumination(bounces[i].position);
			if (i == 0){
				//ao = get_point_ao(bounces[0].position);
				ao = 0;
				let nrm = vec3<i32>(bounces[i].normal);
				let uv = bounces[i].uv;
				let am = voxel_ao(bounces[i].voxel_position + nrm, nrm.zxy, nrm.yzx);
				ao = mix(mix(am.z, am.w, uv.x), mix(am.y, am.x, uv.x), uv.y);
				// return vec3<f32>(uv.x / 10 + interp_ao, uv.y / 10 + interp_ao, interp_ao) / 2;
				// return vec3<f32>(interp_ao);
				// let interp_ao = 
				// ao = get_point_ao_lambert(bounces[0].position, bounces[0].normal);
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
			
			// let vox = bounces[i].voxel_position;
			// let gi_vox = vox + vec3<i32>(bounces[i].normal);
			// color += get_meta_voxel(gi_vox).gi / 5;
		}
		penetrations[p] = penetration(color, ao, first_hit.voxel.opacity);
		penetration_count++;
		curr_ray = Ray(first_hit.exit_position, ray.direction, ray.inv_direction);
		if (first_hit.voxel.opacity > 0.99){
			break;
		}
	}

	if (penetration_count == 0){
		return scene.background_color;
		// return TraceResult(scene.background_color, 0);
	}

	var color = penetrations[penetration_count].color;
	var ao = penetrations[penetration_count].ao;
	for (var i: i32 = penetration_count - 1; i >= 0; i--){
		color = penetrations[i].color * penetrations[i].opacity + color * (1 - penetrations[i].opacity);
		ao = penetrations[i].ao * penetrations[i].opacity + ao * (1 - penetrations[i].opacity);
	}

	return color * ao;
	// return TraceResult(color, ao);
	// return vec3<f32>(ao);
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
	let vstep: vec3<i32> = vec3<i32>(sign(ray.direction));
	let tdelta: vec3<f32> = select(voxel_size / abs(ray.direction), vec3<f32>(tmax), direction_zeros);
	let voxel_boundary: vec3<f32> = vec3<f32>(voxel + max(vec3<i32>(0), vstep)) * voxel_size;
	var tmax_comp: vec3<f32> = select(tmin + (boundary_min + voxel_boundary - ray_entry) / ray.direction, vec3<f32>(tmax), direction_zeros);
	var thit: f32 = tmin;
	var hit_normal: vec3<f32> = vec3<f32>(0, 0, 0);
	var mask: vec3<f32>;

	while(all(voxel >= vec3<i32>(0)) && all(voxel < vec3<i32>(voxel_count))) {
		let hit_voxel = get_voxel(voxel);
		if (hit_voxel.opacity > 0.01 && all(tmax_comp > vec3<f32>(start_tolerance))){
			(*hit).position = ray.origin + ray.direction * thit;
			(*hit).voxel = hit_voxel;
			(*hit).voxel_position = voxel;
			(*hit).depth = 1 - (thit - depth_clip_min) / (depth_clip_max - depth_clip_min);
			(*hit).normal = hit_normal;
			(*hit).ray_direction = ray.direction;
			// let v_diff = (*hit).position - (vec3<f32>(voxel) * voxel_size - boundary_min);
			let uv = (((*hit).position - boundary_min) - (vec3<f32>(voxel) * voxel_size)) / voxel_size;
			let uvx = select(vec3<f32>(1) * mask - mask * uv.yzx, mask * uv.yzx, sign(ray.direction) < vec3<f32>(0));
			let uvy = select(vec3<f32>(1) * mask - mask * uv.zxy, mask * uv.zxy, sign(ray.direction) < vec3<f32>(0));
			// let uvy = mask * uv.zxy;
			(*hit).uv = vec2<f32>(
				max(uvx.x, max(uvx.y, uvx.z)),
				max(uvy.x, max(uvy.y, uvy.z)),
				// dot(mask * v_diff.zxy, vec3<f32>(voxel_size)) / voxel_size,
			);
			let next_mask = step(tmax_comp.xyz, tmax_comp.yzx) * step(tmax_comp.xyz, tmax_comp.zxy);
			let tmax_masked = vec3<f32>(next_mask) * tmax_comp;
			(*hit).exit_position = ray.origin + ray.direction * max(tmax_masked.x, max(tmax_masked.y, tmax_masked.z));

						// if (tmax_comp.x < tmax_comp.y && tmax_comp.x < tmax_comp.z) {
			// 	(*hit).exit_position = ray.origin + ray.direction * tmax_comp.x;
			// } else if (tmax_comp.y < tmax_comp.z){
			// 	(*hit).exit_position = ray.origin + ray.direction * tmax_comp.y;
			// } else {
			// 	(*hit).exit_position = ray.origin + ray.direction * tmax_comp.z;
			// }
			return true;
		}
		mask = step(tmax_comp.xyz, tmax_comp.yzx) * step(tmax_comp.xyz, tmax_comp.zxy);
		voxel += vstep * vec3<i32>(mask);
		let tmax_masked = vec3<f32>(mask) * tmax_comp;
		thit = max(tmax_masked.x, max(tmax_masked.y, tmax_masked.z));
		hit_normal = -(vec3<f32>(vstep) * mask);
		tmax_comp += mask * tdelta;
	}

	return false;
}

fn voxel_ao(pos: vec3<i32>, d1: vec3<i32>, d2: vec3<i32>) -> vec4<f32> {
	let side = vec4<f32>(get_voxel(pos + d1).opacity, get_voxel(pos + d2).opacity, get_voxel(pos - d1).opacity, get_voxel(pos - d2).opacity);
	let corner = vec4<f32>(get_voxel(pos + d1 + d2).opacity, get_voxel(pos - d1 + d2).opacity, get_voxel(pos - d1 - d2).opacity, get_voxel(pos + d1 - d2).opacity);
	let ao = vec4<f32>(
		vertex_ao(side.xy, corner.x),
		vertex_ao(side.yz, corner.y),
		vertex_ao(side.zw, corner.z),
		vertex_ao(side.wx, corner.w),
	);
	return 1.0 - ao * 0.8;
}

fn vertex_ao(side: vec2<f32>, corner: f32) -> f32 {
	// return (side.x + side.y) / 2.0;
	return max(side.x + side.y, max(corner, side.x * side.y)) / 2;
	return (side.x + side.y + max(corner, side.x * side.y)) / 3.0;
}

fn get_point_ao_lambert(point: vec3<f32>, normal: vec3<f32>) -> f32 {
	var ao: f32 = 0.0;
	for (var i = 0; i < ao_samples; i++) {
		let sample_point = (random_unit_vector() + normal) * rng() * voxel_size * 0.6 + point ;
		ao += get_voxel_by_position(sample_point).opacity;
	}
	return max(0, ao / f32(ao_samples));
}

fn get_point_ao(point: vec3<f32>) -> f32 {
	var ao: f32 = 0.0;
	for (var i = 0; i < ao_samples; i++) {
		let sample_point = random_unit_vector() * rng() * ao_range + point;
		ao += get_voxel_by_position(sample_point).opacity;
	}
	return max(0, ao / f32(ao_samples) - 0.5);
}
