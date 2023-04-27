(()=>{"use strict";var t="undefined"!=typeof Float32Array?Float32Array:Array;function e(){var e=new t(3);return t!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function r(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t}function i(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t}function n(t,e){var r=e[0],i=e[1],n=e[2],o=r*r+i*i+n*n;return o>0&&(o=1/Math.sqrt(o)),t[0]=e[0]*o,t[1]=e[1]*o,t[2]=e[2]*o,t}function o(t,e,r){var i=e[0],n=e[1],o=e[2],s=r[0],a=r[1],c=r[2];return t[0]=n*c-o*a,t[1]=o*s-i*c,t[2]=i*a-n*s,t}Math.random,Math.PI,Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)});var s=function(t,e){var r=e[0]-t[0],i=e[1]-t[1],n=e[2]-t[2];return Math.hypot(r,i,n)};function a(t){return t*Math.PI/180}e();class c{constructor(t,r){var i,o,s;this.origin=t,this.direction=n(e(),r),this.inv_direction=[1,1,1],i=this.inv_direction,o=this.inv_direction,s=r,i[0]=o[0]/s[0],i[1]=o[1]/s[1],i[2]=o[2]/s[2]}}class l{constructor(t,e,r){this.position=t,this.voxel_position=e,this.voxel=r}}class u{constructor(){this.color=e(),this.opacity=0,this.roughness=1,this.lightness=0}}const v="@group(0) @binding(0) var screen_sampler : sampler;\r\n@group(0) @binding(1) var color_buffer : texture_2d<f32>;\r\n\r\nstruct VertexOutput {\r\n        @builtin(position) Position : vec4<f32>,\r\n            @location(0) TexCoord : vec2<f32>,\r\n}\r\n\r\n@vertex\r\nfn vert_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {\r\n    var positions = array<vec2<f32>, 6>(\r\n        vec2<f32>( 1.0,  1.0),\r\n        vec2<f32>( 1.0, -1.0),\r\n        vec2<f32>(-1.0, -1.0),\r\n        vec2<f32>( 1.0,  1.0),\r\n        vec2<f32>(-1.0, -1.0),\r\n        vec2<f32>(-1.0,  1.0)\r\n    );\r\n\r\n    var texCoords = array<vec2<f32>, 6>(\r\n        vec2<f32>(1.0, 0.0),\r\n        vec2<f32>(1.0, 1.0),\r\n        vec2<f32>(0.0, 1.0),\r\n        vec2<f32>(1.0, 0.0),\r\n        vec2<f32>(0.0, 1.0),\r\n        vec2<f32>(0.0, 0.0)\r\n    );\r\n\r\n    var output : VertexOutput;\r\n    output.Position = vec4<f32>(positions[VertexIndex], 0.0, 1.0);\r\n    output.TexCoord = texCoords[VertexIndex];\r\n    return output;\r\n}\r\n\r\n@fragment\r\nfn frag_main(@location(0) TexCoord : vec2<f32>) -> @location(0) vec4<f32> {\r\n    return textureSample(color_buffer, screen_sampler, TexCoord);\r\n}";var d=function(t,e,r,i){return new(r||(r=Promise))((function(n,o){function s(t){try{c(i.next(t))}catch(t){o(t)}}function a(t){try{c(i.throw(t))}catch(t){o(t)}}function c(t){var e;t.done?n(t.value):(e=t.value,e instanceof r?e:new r((function(t){t(e)}))).then(s,a)}c((i=i.apply(t,e||[])).next())}))};const h=document.getElementById("canv"),_=document.getElementById("fps");let f=new class{constructor(r,i,n){var o;this.forward=e(),this.right=e(),this.up=e(),this.position=r,this.eulers=[0,n,i],this.view=(o=new t(16),t!=Float32Array&&(o[1]=0,o[2]=0,o[3]=0,o[4]=0,o[6]=0,o[7]=0,o[8]=0,o[9]=0,o[11]=0,o[12]=0,o[13]=0,o[14]=0),o[0]=1,o[5]=1,o[10]=1,o[15]=1,o),this.update(),this.inputs=[!1,!1,!1,!1,!1,!1],this.speed=4}tick(t){let o=e();this.inputs[0]&&r(o,o,this.forward),this.inputs[1]&&r(o,o,this.right),this.inputs[2]&&r(o,o,i(e(),this.forward,-1)),this.inputs[3]&&r(o,o,i(e(),this.right,-1)),this.inputs[4]&&r(o,o,this.up),this.inputs[5]&&r(o,o,i(e(),this.up,-1)),n(o,o),r(this.position,this.position,i(e(),o,this.speed*t))}update(){this.forward=[Math.cos(a(this.eulers[2]))*Math.cos(a(this.eulers[1])),Math.sin(a(this.eulers[2]))*Math.cos(a(this.eulers[1])),Math.sin(a(this.eulers[1]))],n(this.right,o(this.right,this.forward,[0,0,1])),n(this.up,o(this.up,this.right,this.forward)),r(e(),this.position,this.forward)}mouse_move(t,e){t.eulers[1]=Math.min(90,Math.max(-90,t.eulers[1]-e.movementY)),t.eulers[2]=(t.eulers[2]-e.movementX)%360,t.update()}keyboard_down(t,e){"e"==e.key&&(t.inputs[0]=!0),"d"==e.key&&(t.inputs[2]=!0),"f"==e.key&&(t.inputs[1]=!0),"s"==e.key&&(t.inputs[3]=!0),"r"==e.key&&(t.inputs[4]=!0),"w"==e.key&&(t.inputs[5]=!0)}keyboard_up(t,e){"e"==e.key&&(t.inputs[0]=!1),"d"==e.key&&(t.inputs[2]=!1),"f"==e.key&&(t.inputs[1]=!1),"s"==e.key&&(t.inputs[3]=!1),"r"==e.key&&(t.inputs[4]=!1),"w"==e.key&&(t.inputs[5]=!1)}screen_to_ray(t,n,o,s){const a=(t-o/2)/o,l=(n-s/2)/-s;let u=e();return r(u,u,this.forward),r(u,u,i(e(),this.right,a)),r(u,u,i(e(),this.up,l)),new c(this.position,u)}}([-18,0,0],0,0);const m=new class{constructor(t){this.grid_size=8,this.voxel_count=16,this.camera=t,this.grid=new Array(this.grid_size*this.grid_size*this.grid_size),this.boundary_min=[-this.grid_size/2,-this.grid_size/2,-this.grid_size/2],this.boundary_max=[this.grid_size/2,this.grid_size/2,this.grid_size/2],this.voxel_size=this.grid_size/this.voxel_count,this.initialize_grid(),this.direct_light=n(e(),[1.5,.6,1]),this.direct_light_brightness=.5}initialize_grid(){this.grid=new Array(this.voxel_count**3);for(let t=0;t<this.voxel_count;t++)for(let e=0;e<this.voxel_count;e++)for(let r=0;r<this.voxel_count;r++){let i=new u;r<1&&(i.opacity=1,i.color=[.8,.2,.3],i.lightness=2,i.roughness=e/16),r>14&&(i.opacity=1,i.color=[.2,.8,.7],i.roughness=.2,i.lightness=2),s([t,e,0],[this.voxel_count/2,this.voxel_count/2,0])<4&&(i.opacity=1,i.color=[t/16,e/16,r/16],i.roughness=1),this.set_voxel_comp(i,t,e,r)}}ray_any(t){let n=0,o=1/0;for(let e=0;e<3;e++){let r=(this.boundary_min[e]-t.origin[e])*t.inv_direction[e],i=(this.boundary_max[e]-t.origin[e])*t.inv_direction[e];n=Math.min(Math.max(r,n),Math.max(i,n)),o=Math.max(Math.min(r,o),Math.min(i,o))}if(n>o)return;const s=r(e(),t.origin,i(e(),t.direction,n)),a=r(e(),t.origin,i(e(),t.direction,o));let c=[Math.max(0,Math.min(this.voxel_count-1,Math.floor((s[0]-this.boundary_min[0])/this.voxel_size))),Math.max(0,Math.min(this.voxel_count-1,Math.floor((s[1]-this.boundary_min[1])/this.voxel_size))),Math.max(0,Math.min(this.voxel_count-1,Math.floor((s[2]-this.boundary_min[2])/this.voxel_size)))],u=[c[0]+1,c[1]+1,c[2]+1],v=[0,0,0],d=[0,0,0],h=[0,0,0],_=[0,0,0],f=n;for(let e=0;e<3;e++)_[e]=Math.max(0,Math.min(this.voxel_count-1,Math.floor((a[e]-this.boundary_min[e])/this.voxel_size))),t.direction[e]>0?(v[e]=1,h[e]=this.voxel_size/t.direction[e],d[e]=n+(this.boundary_min[e]+u[e]*this.voxel_size-s[e])/t.direction[e]):t.direction[e]<0?(v[e]=-1,h[e]=this.voxel_size/-t.direction[e],d[e]=n+(this.boundary_min[e]+c[e]*this.voxel_size-s[e])/t.direction[e]):(v[e]=0,h[e]=o,d[e]=o);for(;c[0]<this.voxel_count&&c[0]>=0&&c[1]<this.voxel_count&&c[1]>=0&&c[2]<this.voxel_count&&c[2]>=0;){if(this.get_voxel(c).opacity>.01){const n=r(e(),t.origin,i(e(),t.direction,f));return new l(n,c,this.get_voxel(c))}d[0]<d[1]&&d[0]<d[2]?(c[0]+=v[0],d[0]+=h[0],f+=h[0]):d[1]<d[2]?(c[1]+=v[1],d[1]+=h[1],f+=h[1]):(c[2]+=v[2],d[2]+=h[2],f+=h[2])}}get_voxel_id_comp(t,e,r){return r*this.voxel_count*this.voxel_count+e*this.voxel_count+t}get_voxel_id(t){return t[2]*this.voxel_count*this.voxel_count+t[1]*this.voxel_count+t[0]}get_voxel_comp(t,e,r){return this.grid[r*this.voxel_count*this.voxel_count+e*this.voxel_count+t]}get_voxel(t){return this.grid[t[2]*this.voxel_count*this.voxel_count+t[1]*this.voxel_count+t[0]]}set_voxel(t,e){this.grid[e[2]*this.voxel_count*this.voxel_count+e[1]*this.voxel_count+e[0]]=t}set_voxel_comp(t,e,r,i){this.grid[i*this.voxel_count*this.voxel_count+r*this.voxel_count+e]=t}}(f),p=new class{constructor(t,e){this.render=()=>{var t,e,r,i,n;null===(t=this.device)||void 0===t||t.queue.writeBuffer(this.sceneParameters,0,new Float32Array([this.scene.camera.position[0],this.scene.camera.position[1],this.scene.camera.position[2],(new Date).getMilliseconds(),this.scene.camera.forward[0],this.scene.camera.forward[1],this.scene.camera.forward[2],0,this.scene.camera.right[0],this.scene.camera.right[1],this.scene.camera.right[2],0,this.scene.camera.up[0],this.scene.camera.up[1],this.scene.camera.up[2],0,this.scene.direct_light[0],this.scene.direct_light[1],this.scene.direct_light[2],this.scene.direct_light_brightness]),0,20);const o=new Float32Array(8*this.scene.grid.length);for(let t=0;t<this.scene.grid.length;++t)o[8*t]=this.scene.grid[t].color[0],o[8*t+1]=this.scene.grid[t].color[1],o[8*t+2]=this.scene.grid[t].color[2],o[8*t+3]=this.scene.grid[t].opacity,o[8*t+4]=this.scene.grid[t].roughness,o[8*t+5]=this.scene.grid[t].lightness,o[8*t+6]=0,o[8*t+7]=0;null===(e=this.device)||void 0===e||e.queue.writeBuffer(this.sceneData,0,o,0,8*this.scene.grid.length);const s=null===(r=this.device)||void 0===r?void 0:r.createCommandEncoder(),a=null==s?void 0:s.beginComputePass();null==a||a.setPipeline(this.ray_tracing_pipeline),null==a||a.setBindGroup(0,this.ray_tracing_bind_group),null==a||a.dispatchWorkgroups(this.canvas.width/16,this.canvas.height/16,1),null==a||a.end();const c=null===(i=this.context)||void 0===i?void 0:i.getCurrentTexture().createView(),l=null==s?void 0:s.beginRenderPass({colorAttachments:[{view:c,clearValue:{r:.5,g:0,b:.25,a:1},loadOp:"clear",storeOp:"store"}]});null==l||l.setPipeline(this.screen_pipeline),null==l||l.setBindGroup(0,this.screen_bind_group),null==l||l.draw(6,1,0,0),null==l||l.end(),null===(n=this.device)||void 0===n||n.queue.submit([null==s?void 0:s.finish()])},this.canvas=t,this.scene=e}initialize(){return d(this,void 0,void 0,(function*(){yield this.setupDevice(),yield this.createAssets(),yield this.setupPipeline()}))}setupDevice(){var t,e;return d(this,void 0,void 0,(function*(){this.adapter=yield null===(t=navigator.gpu)||void 0===t?void 0:t.requestAdapter(),this.device=yield null===(e=this.adapter)||void 0===e?void 0:e.requestDevice(),this.context=this.canvas.getContext("webgpu"),this.format="bgra8unorm",this.context.configure({device:this.device,format:this.format,alphaMode:"opaque"})}))}createAssets(){var t,e,r,i,n;return d(this,void 0,void 0,(function*(){this.color_buffer=null===(t=this.device)||void 0===t?void 0:t.createTexture({size:{width:this.canvas.width,height:this.canvas.height},format:"rgba8unorm",usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.TEXTURE_BINDING}),this.color_buffer_view=null===(e=this.color_buffer)||void 0===e?void 0:e.createView(),this.sampler=null===(r=this.device)||void 0===r?void 0:r.createSampler({addressModeU:"repeat",addressModeV:"repeat",magFilter:"linear",minFilter:"nearest",mipmapFilter:"nearest",maxAnisotropy:1}),this.sceneParameters=null===(i=this.device)||void 0===i?void 0:i.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const o=this.scene.voxel_count*this.scene.voxel_count*this.scene.voxel_count;this.sceneData=null===(n=this.device)||void 0===n?void 0:n.createBuffer({size:8*o*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST})}))}setupPipeline(){var t,e,r,i,n,o,s,a;return d(this,void 0,void 0,(function*(){const c=null===(t=this.device)||void 0===t?void 0:t.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,storageTexture:{access:"write-only",format:"rgba8unorm",viewDimension:"2d"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}}]});this.ray_tracing_bind_group=null===(e=this.device)||void 0===e?void 0:e.createBindGroup({layout:c,label:"Ray tracing bind group",entries:[{binding:0,resource:this.color_buffer_view},{binding:1,resource:{buffer:this.sceneParameters}},{binding:2,resource:{buffer:this.sceneData}}]});const l=null===(r=this.device)||void 0===r?void 0:r.createPipelineLayout({bindGroupLayouts:[c]});this.ray_tracing_pipeline=null===(i=this.device)||void 0===i?void 0:i.createComputePipeline({label:"Ray tracing pipeline",layout:l,compute:{entryPoint:"main",module:this.device.createShaderModule({code:"@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;\r\n@group(0) @binding(1) var<uniform> scene: SceneParameter;\r\n@group(0) @binding(2) var<storage, read> scene_data: SceneData;\r\n\r\noverride grid_size: f32 = 2f;\r\noverride voxel_count: i32 = 4;\r\nvar<private> voxel_size: f32 = grid_size / f32(voxel_count);\r\nvar<private> boundary_min: vec3<f32> = vec3<f32>(f32(-grid_size) / 2, f32(-grid_size) / 2, f32(-grid_size) / 2);\r\nvar<private> boundary_max: vec3<f32> = vec3<f32>(f32(grid_size) / 2, f32(grid_size) / 2, f32(grid_size) / 2);\r\nvar<private> depth_clip_min: f32 = 1f;\r\nvar<private> depth_clip_max: f32 = 10f;\r\n\r\nconst samples: i32 = 50;\r\nconst reflection_bounces: i32 = 1;\r\nconst light_bounces: i32 = 2;\r\nconst scatter: i32 = 5;\r\nconst ambient_light: f32 = 0.03;\r\nconst ao: f32 = 0.2;\r\n\r\nvar<private> rng_seed: u32;\r\nvar<private> rand_seed: vec2<f32>;\r\n\r\nstruct Ray {\r\n    origin: vec3<f32>,\r\n    direction: vec3<f32>,\r\n    inv_direction: vec3<f32>,\r\n}\r\n\r\nstruct RayHit {\r\n\tposition: vec3<f32>,\r\n\tdepth: f32,\r\n\tvoxel_position: vec3<i32>,\r\n\tvoxel: Voxel,\r\n\tnormal: vec3<f32>,\r\n}\r\n\r\nstruct ColorRay {\r\n\tcolor: vec3<f32>,\r\n}\r\n\r\nstruct SceneParameter {\r\n    camera_pos: vec3<f32>,\r\n    rng_start: f32,\r\n    camera_forward: vec3<f32>,\r\n    camera_right: vec3<f32>,\r\n    camera_up: vec3<f32>,\r\n    direct_light: vec3<f32>,\r\n    direct_light_brightness: f32,\r\n}\r\n\r\nstruct Voxel {\r\n\tcolor: vec3<f32>,\r\n\topacity: f32,\r\n\troughness: f32,\r\n\tlightness: f32,\r\n}\r\n\r\nstruct SceneData {\r\n\tdata: array<Voxel>,\r\n}\r\n\r\n@compute @workgroup_size(16,16,1)\r\nfn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {\r\n    let screen_size: vec2<u32> = textureDimensions(color_buffer);\r\n    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));\r\n    rng_seed = GlobalInvocationID.x + GlobalInvocationID.y * 1000;\r\n    /* rng_seed = GlobalInvocationID.x + GlobalInvocationID.y * u32(scene.rng_start); */\r\n    init_rand(GlobalInvocationID.x, vec4<f32>(0.454, -0.789, 0.456, -0.45));\r\n\r\n    var pixel_color: vec3<f32>;\r\n    for (var i = 0; i < samples; i++){\r\n\r\n\t    let horizontal_coefficient: f32 = (f32(screen_pos.x) + rand() - 0.5 - f32(screen_size.x) / 2) / f32(screen_size.x);\r\n\t    let vertical_coefficient: f32 = (f32(screen_pos.y) + rand() - 0.5 - f32(screen_size.y) / 2) / -f32(screen_size.y);\r\n\r\n\t    let ray_direction = normalize(scene.camera_forward\r\n\t\t\t    + horizontal_coefficient * scene.camera_right\r\n\t\t\t    + vertical_coefficient * scene.camera_up);\r\n\t    let ray: Ray = Ray(scene.camera_pos, ray_direction, 1 / ray_direction);\r\n\t    pixel_color += trace(ray, light_bounces);\r\n    }\r\n    /* pixel_color /= f32(samples); */\r\n\r\n    let correction = 1.0 / f32(samples);\r\n    pixel_color = sqrt(correction * pixel_color);\r\n\r\n    /* pixel_color = random_unit_vector(); */\r\n\r\n    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));\r\n}\r\n\r\nfn trace(ray: Ray, depth: i32) -> vec3<f32> {\r\n\tif (depth <= 0) {\r\n\t\treturn vec3<f32>(0);\r\n\t}\r\n\tvar accum: vec3<f32> = vec3<f32>(0.0);\r\n\tvar mask: vec3<f32> = vec3<f32>(1.0);\r\n\tvar curr_ray: Ray = ray;\r\n\tvar curr_hit: RayHit;\r\n\tvar refl: f32 = 1.0;\r\n\r\n\tvar bounce_results: array<RayHit, light_bounces>;\r\n\r\n\tfor (var i = 0; i < light_bounces; i++){\r\n\t\tif (voxel_ray_any(curr_ray, 0.0001, &curr_hit)) {\r\n\t\t\tlet bounce_direction = random_unit_vector() + curr_hit.normal;\r\n\t\t\tif (all(bounce_direction == vec3<f32>(0))){\r\n\t\t\t\tcurr_ray = Ray(curr_hit.position, curr_hit.normal, 1 / curr_hit.normal);\r\n\t\t\t} else {\r\n\t\t\t\tcurr_ray = Ray(curr_hit.position, bounce_direction, 1 / bounce_direction);\r\n\t\t\t}\r\n\t\t\tbounce_results[i] = curr_hit;\r\n\t\t}\r\n\t}\r\n\taccum = vec3<f32>(0.2, 0.2, 0.2);\r\n\tfor (var i: i32 = light_bounces; i >= 0; i--){\r\n\t\tif (all(bounce_results[i].normal == vec3<f32>(0))){\r\n\t\t\tcontinue;\r\n\t\t}\r\n\t\t/* accum = direct_illumination(bounce_results[i], &refl) * accum + bounce_results[i].voxel.lightness * bounce_results[i].voxel.color; */\r\n\t\taccum = bounce_results[i].voxel.color * accum + bounce_results[i].voxel.lightness * bounce_results[i].voxel.color;\r\n\t}\r\n\treturn accum;\r\n}\r\n\r\nfn direct_illumination(orig_hit: RayHit, refl: ptr<function, f32>) -> vec3<f32> {\r\n\tvar hit: RayHit;\r\n\tif (!voxel_ray_any(Ray(orig_hit.position, scene.direct_light, 1 / scene.direct_light), 0.00001, &hit)){\r\n\t\treturn scene.direct_light_brightness * orig_hit.voxel.color;\r\n\t} else {\r\n\t\treturn 0.2 * orig_hit.voxel.color;\r\n\t}\r\n\t//Refl\r\n}\r\n\r\n//fn pbr(hit: RayHit, ray: Ray) -> vec3<f32> {\r\n//\tlet ambient_color = vec3<f32>(ambient_light) * hit.voxel.color * (1.0 - ao);\r\n//\tlet f0 = vec3<f32>(0.04); //dielectric\r\n//}\r\n\r\nfn voxel_ray_any(ray: Ray, start_tolerance: f32, hit: ptr<function, RayHit>) -> bool {\r\n\tvar tmin: f32 = 0.0;\r\n\tvar tmax: f32 = 300000000;\r\n\tfor (var d: i32 = 0; d < 3; d++) {\r\n\t\tlet t1 = (boundary_min[d] - ray.origin[d]) * ray.inv_direction[d];\r\n\t\tlet t2 = (boundary_max[d] - ray.origin[d]) * ray.inv_direction[d];\r\n\r\n\t\ttmin = min(max(t1, tmin), max(t2, tmin));\r\n\t\ttmax = max(min(t1, tmax), min(t2, tmax));\r\n\t}\r\n\t// Hier ist noch ein Fehler drin, tritt nur von ausserhalb des grid auf, das kommt ja vielleicht eh noch weg\r\n\tif tmin > tmax { return false; }\r\n    \tlet ray_entry = ray.origin + ray.direction * tmin;\r\n\tlet ray_exit = ray.origin + ray.direction * tmax;\r\n\r\n\tvar voxel: vec3<i32> = max(vec3<i32>(0), min(vec3<i32>(voxel_count - 1), vec3<i32>((ray_entry - boundary_min) / f32(voxel_size))));\r\n\t//var end_voxel: vec3<i32> = max(vec3<i32>(0), min(vec3<i32>(voxel_count - 1), vec3<i32>((ray_exit - boundary_min - ray.direction * 0.000001) / f32(voxel_size))));\r\n\r\n\tlet direction_zeros: vec3<bool> = ray.direction == vec3<f32>(0);\r\n\tlet step: vec3<i32> = vec3<i32>(sign(ray.direction));\r\n\tlet tdelta: vec3<f32> = select(voxel_size / abs(ray.direction), vec3<f32>(tmax), direction_zeros);\r\n\tlet voxel_boundary: vec3<f32> = vec3<f32>(voxel + max(vec3<i32>(0), step)) * voxel_size;\r\n\tvar tmax_comp: vec3<f32> = select(tmin + (boundary_min + voxel_boundary - ray_entry) / ray.direction, vec3<f32>(tmax), direction_zeros);\r\n\tvar thit: f32 = tmin;\r\n\tvar hit_normal: vec3<f32> = vec3<f32>(0, 0, 0);\r\n\r\n\twhile(all(voxel >= vec3<i32>(0)) && all(voxel < vec3<i32>(voxel_count))) {\r\n\t\tlet hit_voxel = get_voxel(voxel);\r\n\t\tif (hit_voxel.opacity > 0.01 && all(tmax_comp > vec3<f32>(start_tolerance))){\r\n\t\t\t(*hit).position = ray.origin + ray.direction * thit;\r\n\t\t\t(*hit).voxel = hit_voxel;\r\n\t\t\t(*hit).voxel_position = voxel;\r\n\t\t\t(*hit).depth = 1 - (thit - depth_clip_min) / (depth_clip_max - depth_clip_min);\r\n\t\t\t(*hit).normal = hit_normal;\r\n\t\t\treturn true;\r\n\t\t}\r\n\r\n\t\tif (tmax_comp.x < tmax_comp.y && tmax_comp.x < tmax_comp.z) {\r\n\t\t\tvoxel.x += step.x;\r\n\t\t\tthit = tmax_comp.x;\r\n\t\t\ttmax_comp.x += tdelta.x;\r\n\t\t\thit_normal = vec3<f32>(f32(-step.x), 0, 0);\r\n\t\t} else if (tmax_comp.y < tmax_comp.z){\r\n\t\t\tvoxel.y += step.y;\r\n\t\t\tthit = tmax_comp.y;\r\n\t\t\ttmax_comp.y += tdelta.y;\r\n\t\t\thit_normal = vec3<f32>(0, f32(-step.y), 0);\r\n\t\t} else {\r\n\t\t\tvoxel.z += step.z;\r\n\t\t\tthit = tmax_comp.z;\r\n\t\t\ttmax_comp.z += tdelta.z;\r\n\t\t\thit_normal = vec3<f32>(0, 0, f32(-step.z));\r\n\t\t}\r\n\t}\r\n\r\n\treturn false;\r\n}\r\n\r\nfn ray_reflect(ray: Ray, position: vec3<f32>, normal: vec3<f32>) -> Ray {\r\n\tlet reflect = ray.direction - 2 * dot(ray.direction, normal) * normal;\r\n\treturn Ray(position, reflect, 1 / reflect);\r\n}\r\n\r\nfn get_voxel_id(v: vec3<i32>) -> i32 {\r\n\treturn v.z * voxel_count * voxel_count + v.y * voxel_count + v.x;\r\n}\r\n\r\nfn get_voxel(v: vec3<i32>) -> Voxel {\r\n\treturn scene_data.data[v.z * voxel_count * voxel_count + v.y * voxel_count + v.x];\r\n}\r\n\r\nfn random_unit_vector() -> vec3<f32> {\r\n\treturn normalize(vec3<f32>(rand() - 0.5, rand() - 0.5, rand() - 0.5));\r\n}\r\n\r\nfn init_rand(invocation_id : u32, seed : vec4<f32>) {\r\n\trand_seed = seed.xz;\r\n\trand_seed = fract(rand_seed * cos(35.456+f32(invocation_id) * seed.yw));\r\n\trand_seed = fract(rand_seed * cos(41.235+f32(invocation_id) * seed.xw));\r\n}\r\n\r\nfn rand() -> f32 {\r\n\trand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);\r\n\trand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);\r\n\treturn rand_seed.y;\r\n}\r\n"}),constants:{grid_size:this.scene.grid_size,voxel_count:this.scene.voxel_count}}});const u=null===(n=this.device)||void 0===n?void 0:n.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}}]});this.screen_bind_group=null===(o=this.device)||void 0===o?void 0:o.createBindGroup({layout:u,entries:[{binding:0,resource:this.sampler},{binding:1,resource:this.color_buffer_view}]});const d=null===(s=this.device)||void 0===s?void 0:s.createPipelineLayout({bindGroupLayouts:[u]});this.screen_pipeline=null===(a=this.device)||void 0===a?void 0:a.createRenderPipeline({layout:d,vertex:{module:this.device.createShaderModule({code:v}),entryPoint:"vert_main"},fragment:{module:this.device.createShaderModule({code:v}),entryPoint:"frag_main",targets:[{format:"bgra8unorm"}]},primitive:{topology:"triangle-list",cullMode:"back",frontFace:"cw"}})}))}}(h,m);p.initialize();let x=performance.now(),g=!1;addEventListener("mousedown",(t=>{2==t.button&&(g=!0)})),addEventListener("mouseup",(t=>{if(2==t.button&&(g=!1),0==t.button){const e=h.getBoundingClientRect(),r=t.clientX-e.left,i=t.clientY-e.top,n=m.ray_any(f.screen_to_ray(r,i,h.width,h.height));if(n){let t=new u;t.opacity=0,m.set_voxel(t,n.voxel_position)}}})),addEventListener("mousemove",(t=>{g&&f.mouse_move(f,t)})),addEventListener("contextmenu",(t=>(t.preventDefault(),!1))),addEventListener("keydown",(t=>{f.keyboard_down(f,t)})),addEventListener("keyup",(t=>{f.keyboard_up(f,t)})),requestAnimationFrame((function t(){p.render();const e=performance.now()-x;f.tick(e/1e3),x=performance.now(),_.innerText=Math.round(1/e*1e3).toString()+" fps",requestAnimationFrame(t)}))})();
//# sourceMappingURL=main.js.map