(()=>{"use strict";let t=1e-6,e=Float32Array;function n(t=0,n=0){const o=new e(2);return void 0!==t&&(o[0]=t,void 0!==n&&(o[1]=n)),o}const o=n;function i(t,n,o){return(o=o||new e(2))[0]=t[0]-n[0],o[1]=t[1]-n[1],o}const s=i;function r(t,n,o){return(o=o||new e(2))[0]=t[0]*n,o[1]=t[1]*n,o}const c=r;function a(t,n){return(n=n||new e(2))[0]=1/t[0],n[1]=1/t[1],n}const l=a;function h(t,e){return t[0]*e[0]+t[1]*e[1]}function u(t){const e=t[0],n=t[1];return Math.sqrt(e*e+n*n)}const d=u;function _(t){const e=t[0],n=t[1];return e*e+n*n}const m=_;function v(t,e){const n=t[0]-e[0],o=t[1]-e[1];return Math.sqrt(n*n+o*o)}const f=v;function g(t,e){const n=t[0]-e[0],o=t[1]-e[1];return n*n+o*o}const M=g;function x(t,n){return(n=n||new e(2))[0]=t[0],n[1]=t[1],n}const w=x;function p(t,n,o){return(o=o||new e(2))[0]=t[0]*n[0],o[1]=t[1]*n[1],o}const y=p;function z(t,n,o){return(o=o||new e(2))[0]=t[0]/n[0],o[1]=t[1]/n[1],o}const b=z;var q=Object.freeze({__proto__:null,add:function(t,n,o){return(o=o||new e(2))[0]=t[0]+n[0],o[1]=t[1]+n[1],o},addScaled:function(t,n,o,i){return(i=i||new e(2))[0]=t[0]+n[0]*o,i[1]=t[1]+n[1]*o,i},angle:function(t,e){const n=t[0],o=t[1],i=t[0],s=t[1],r=Math.sqrt(n*n+o*o)*Math.sqrt(i*i+s*s),c=r&&h(t,e)/r;return Math.acos(c)},ceil:function(t,n){return(n=n||new e(2))[0]=Math.ceil(t[0]),n[1]=Math.ceil(t[1]),n},clamp:function(t,n=0,o=1,i){return(i=i||new e(2))[0]=Math.min(o,Math.max(n,t[0])),i[1]=Math.min(o,Math.max(n,t[1])),i},clone:w,copy:x,create:n,cross:function(t,n,o){o=o||new e(3);const i=t[0]*n[1]-t[1]*n[0];return o[0]=0,o[1]=0,o[2]=i,o},dist:f,distSq:M,distance:v,distanceSq:g,div:b,divScalar:function(t,n,o){return(o=o||new e(2))[0]=t[0]/n,o[1]=t[1]/n,o},divide:z,dot:h,equals:function(t,e){return t[0]===e[0]&&t[1]===e[1]},equalsApproximately:function(e,n){return Math.abs(e[0]-n[0])<t&&Math.abs(e[1]-n[1])<t},floor:function(t,n){return(n=n||new e(2))[0]=Math.floor(t[0]),n[1]=Math.floor(t[1]),n},fromValues:o,inverse:a,invert:l,len:d,lenSq:m,length:u,lengthSq:_,lerp:function(t,n,o,i){return(i=i||new e(2))[0]=t[0]+o*(n[0]-t[0]),i[1]=t[1]+o*(n[1]-t[1]),i},lerpV:function(t,n,o,i){return(i=i||new e(2))[0]=t[0]+o[0]*(n[0]-t[0]),i[1]=t[1]+o[1]*(n[1]-t[1]),i},max:function(t,n,o){return(o=o||new e(2))[0]=Math.max(t[0],n[0]),o[1]=Math.max(t[1],n[1]),o},min:function(t,n,o){return(o=o||new e(2))[0]=Math.min(t[0],n[0]),o[1]=Math.min(t[1],n[1]),o},mul:y,mulScalar:r,multiply:p,negate:function(t,n){return(n=n||new e(2))[0]=-t[0],n[1]=-t[1],n},normalize:function(t,n){n=n||new e(2);const o=t[0],i=t[1],s=Math.sqrt(o*o+i*i);return s>1e-5?(n[0]=o/s,n[1]=i/s):(n[0]=0,n[1]=0),n},random:function(t=1,n){n=n||new e(2);const o=2*Math.random()*Math.PI;return n[0]=Math.cos(o)*t,n[1]=Math.sin(o)*t,n},round:function(t,n){return(n=n||new e(2))[0]=Math.round(t[0]),n[1]=Math.round(t[1]),n},scale:c,setDefaultType:function(t){const n=e;return e=t,n},sub:s,subtract:i,transformMat3:function(t,n,o){o=o||new e(2);const i=t[0],s=t[1];return o[0]=n[0]*i+n[4]*s+n[8],o[1]=n[1]*i+n[5]*s+n[9],o},transformMat4:function(t,n,o){o=o||new e(2);const i=t[0],s=t[1];return o[0]=i*n[0]+s*n[4]+n[12],o[1]=i*n[1]+s*n[5]+n[13],o},zero:function(t){return(t=t||new e(2))[0]=0,t[1]=0,t}});Float32Array;new Map([[Float32Array,()=>new Float32Array(12)],[Float64Array,()=>new Float64Array(12)],[Array,()=>new Array(12).fill(0)]]).get(Float32Array);let E=Float32Array;function A(t,e,n){const o=new E(3);return void 0!==t&&(o[0]=t,void 0!==e&&(o[1]=e,void 0!==n&&(o[2]=n))),o}const I=A;function S(t,e,n){return(n=n||new E(3))[0]=t[0]-e[0],n[1]=t[1]-e[1],n[2]=t[2]-e[2],n}const F=S;function L(t,e,n){return(n=n||new E(3))[0]=t[0]*e,n[1]=t[1]*e,n[2]=t[2]*e,n}const B=L;function k(t,e){return(e=e||new E(3))[0]=1/t[0],e[1]=1/t[1],e[2]=1/t[2],e}const T=k;function V(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]}function D(t){const e=t[0],n=t[1],o=t[2];return Math.sqrt(e*e+n*n+o*o)}const P=D;function j(t){const e=t[0],n=t[1],o=t[2];return e*e+n*n+o*o}const O=j;function X(t,e){const n=t[0]-e[0],o=t[1]-e[1],i=t[2]-e[2];return Math.sqrt(n*n+o*o+i*i)}const Y=X;function C(t,e){const n=t[0]-e[0],o=t[1]-e[1],i=t[2]-e[2];return n*n+o*o+i*i}const R=C;function U(t,e){return(e=e||new E(3))[0]=t[0],e[1]=t[1],e[2]=t[2],e}const G=U;function H(t,e,n){return(n=n||new E(3))[0]=t[0]*e[0],n[1]=t[1]*e[1],n[2]=t[2]*e[2],n}const J=H;function K(t,e,n){return(n=n||new E(3))[0]=t[0]/e[0],n[1]=t[1]/e[1],n[2]=t[2]/e[2],n}const N=K;var Q=Object.freeze({__proto__:null,add:function(t,e,n){return(n=n||new E(3))[0]=t[0]+e[0],n[1]=t[1]+e[1],n[2]=t[2]+e[2],n},addScaled:function(t,e,n,o){return(o=o||new E(3))[0]=t[0]+e[0]*n,o[1]=t[1]+e[1]*n,o[2]=t[2]+e[2]*n,o},angle:function(t,e){const n=t[0],o=t[1],i=t[2],s=t[0],r=t[1],c=t[2],a=Math.sqrt(n*n+o*o+i*i)*Math.sqrt(s*s+r*r+c*c),l=a&&V(t,e)/a;return Math.acos(l)},ceil:function(t,e){return(e=e||new E(3))[0]=Math.ceil(t[0]),e[1]=Math.ceil(t[1]),e[2]=Math.ceil(t[2]),e},clamp:function(t,e=0,n=1,o){return(o=o||new E(3))[0]=Math.min(n,Math.max(e,t[0])),o[1]=Math.min(n,Math.max(e,t[1])),o[2]=Math.min(n,Math.max(e,t[2])),o},clone:G,copy:U,create:A,cross:function(t,e,n){n=n||new E(3);const o=t[2]*e[0]-t[0]*e[2],i=t[0]*e[1]-t[1]*e[0];return n[0]=t[1]*e[2]-t[2]*e[1],n[1]=o,n[2]=i,n},dist:Y,distSq:R,distance:X,distanceSq:C,div:N,divScalar:function(t,e,n){return(n=n||new E(3))[0]=t[0]/e,n[1]=t[1]/e,n[2]=t[2]/e,n},divide:K,dot:V,equals:function(t,e){return t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]},equalsApproximately:function(e,n){return Math.abs(e[0]-n[0])<t&&Math.abs(e[1]-n[1])<t&&Math.abs(e[2]-n[2])<t},floor:function(t,e){return(e=e||new E(3))[0]=Math.floor(t[0]),e[1]=Math.floor(t[1]),e[2]=Math.floor(t[2]),e},fromValues:I,getAxis:function(t,e,n){const o=4*e;return(n=n||new E(3))[0]=t[o+0],n[1]=t[o+1],n[2]=t[o+2],n},getScaling:function(t,e){e=e||new E(3);const n=t[0],o=t[1],i=t[2],s=t[4],r=t[5],c=t[6],a=t[8],l=t[9],h=t[10];return e[0]=Math.sqrt(n*n+o*o+i*i),e[1]=Math.sqrt(s*s+r*r+c*c),e[2]=Math.sqrt(a*a+l*l+h*h),e},getTranslation:function(t,e){return(e=e||new E(3))[0]=t[12],e[1]=t[13],e[2]=t[14],e},inverse:k,invert:T,len:P,lenSq:O,length:D,lengthSq:j,lerp:function(t,e,n,o){return(o=o||new E(3))[0]=t[0]+n*(e[0]-t[0]),o[1]=t[1]+n*(e[1]-t[1]),o[2]=t[2]+n*(e[2]-t[2]),o},lerpV:function(t,e,n,o){return(o=o||new E(3))[0]=t[0]+n[0]*(e[0]-t[0]),o[1]=t[1]+n[1]*(e[1]-t[1]),o[2]=t[2]+n[2]*(e[2]-t[2]),o},max:function(t,e,n){return(n=n||new E(3))[0]=Math.max(t[0],e[0]),n[1]=Math.max(t[1],e[1]),n[2]=Math.max(t[2],e[2]),n},min:function(t,e,n){return(n=n||new E(3))[0]=Math.min(t[0],e[0]),n[1]=Math.min(t[1],e[1]),n[2]=Math.min(t[2],e[2]),n},mul:J,mulScalar:L,multiply:H,negate:function(t,e){return(e=e||new E(3))[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e},normalize:function(t,e){e=e||new E(3);const n=t[0],o=t[1],i=t[2],s=Math.sqrt(n*n+o*o+i*i);return s>1e-5?(e[0]=n/s,e[1]=o/s,e[2]=i/s):(e[0]=0,e[1]=0,e[2]=0),e},random:function(t=1,e){e=e||new E(3);const n=2*Math.random()*Math.PI,o=2*Math.random()-1,i=Math.sqrt(1-o*o)*t;return e[0]=Math.cos(n)*i,e[1]=Math.sin(n)*i,e[2]=o*t,e},round:function(t,e){return(e=e||new E(3))[0]=Math.round(t[0]),e[1]=Math.round(t[1]),e[2]=Math.round(t[2]),e},scale:B,setDefaultType:function(t){const e=E;return E=t,e},sub:F,subtract:S,transformMat3:function(t,e,n){n=n||new E(3);const o=t[0],i=t[1],s=t[2];return n[0]=o*e[0]+i*e[4]+s*e[8],n[1]=o*e[1]+i*e[5]+s*e[9],n[2]=o*e[2]+i*e[6]+s*e[10],n},transformMat4:function(t,e,n){n=n||new E(3);const o=t[0],i=t[1],s=t[2],r=e[3]*o+e[7]*i+e[11]*s+e[15]||1;return n[0]=(e[0]*o+e[4]*i+e[8]*s+e[12])/r,n[1]=(e[1]*o+e[5]*i+e[9]*s+e[13])/r,n[2]=(e[2]*o+e[6]*i+e[10]*s+e[14])/r,n},transformMat4Upper3x3:function(t,e,n){n=n||new E(3);const o=t[0],i=t[1],s=t[2];return n[0]=o*e[0]+i*e[4]+s*e[8],n[1]=o*e[1]+i*e[5]+s*e[9],n[2]=o*e[2]+i*e[6]+s*e[10],n},zero:function(t){return(t=t||new E(3))[0]=0,t[1]=0,t[2]=0,t}});Float32Array,Float32Array,Float32Array;class W{constructor(t,e){this.origin=t,this.direction=Q.normalize(e),this.inv_direction=[1,1,1],Q.div(this.inv_direction,e,this.inv_direction)}}class Z{constructor(t,e,n,o){this.position=t,this.voxel_position=e,this.voxel=n,this.normal=o}}class ${constructor(){this.color=Q.create(),this.opacity=0,this.roughness=1,this.lightness=0}}function tt(t){return t*Math.PI/180}class et{constructor(t,e,n){this.dragged=!1,this.velocity=[0,0],this.distance=8,this.forward=Q.create(),this.right=Q.create(),this.up=Q.create(),this.position=Q.create(),this.eulers=[0,n,e],this.distance=t}update(){this.eulers[1]=Math.min(80,Math.max(-80,this.eulers[1])),this.eulers[2]=this.eulers[2]%360,this.forward=[Math.cos(tt(this.eulers[2]))*Math.cos(tt(this.eulers[1])),Math.sin(tt(this.eulers[2]))*Math.cos(tt(this.eulers[1])),Math.sin(tt(this.eulers[1]))],Q.normalize(Q.cross(this.forward,[0,0,1],this.right),this.right),Q.normalize(Q.cross(this.right,this.forward,this.up),this.up),Q.scale(this.forward,-this.distance,this.position)}tick(t){this.dragged||(this.eulers[1]-=this.velocity[1],this.eulers[2]-=this.velocity[0]),q.scale(this.velocity,.96*(1-t),this.velocity),this.update()}screen_to_ray(t,e,n,o){const i=(t-n/2)/n,s=(e-o/2)/-o;let r=Q.create();return Q.add(r,this.forward,r),Q.add(r,Q.scale(this.right,i),r),Q.add(r,Q.scale(this.up,s),r),new W(this.position,r)}}const nt=document.getElementById("canv"),ot=document.getElementById("fps"),it=(document.getElementById("kloppenheim_02"),new class{constructor(){this.grid_size=8,this.voxel_count=32,this.grid=new Array(this.grid_size*this.grid_size*this.grid_size),this.boundary_min=[-this.grid_size/2,-this.grid_size/2,-this.grid_size/2],this.boundary_max=[this.grid_size/2,this.grid_size/2,this.grid_size/2],this.voxel_size=this.grid_size/this.voxel_count,this.initialize_grid(),this.direct_light=Q.normalize([1.5,.6,1]),this.direct_light_brightness=1}initialize_grid(){this.grid=new Array(this.voxel_count**3);for(let t=0;t<this.voxel_count;t++)for(let e=0;e<this.voxel_count;e++)for(let n=0;n<this.voxel_count;n++){let o=new $;o.color=[0,0,0],o.opacity=0,this.grid[n*this.voxel_count*this.voxel_count+e*this.voxel_count+t]=o}}initialize_default_grid(){for(let t=0;t<this.voxel_count;t++)for(let e=0;e<this.voxel_count;e++)for(let n=0;n<this.voxel_count;n++){let o=new $;n<3&&(o.color=[t/32,e/32,.6],o.opacity=1,o.lightness=0,o.roughness=1),Q.dist([t,e,n],[this.voxel_count/2,this.voxel_count/2,this.voxel_count/2])<5&&(o.opacity=1,o.color=[.2,e/64+.3,n/64+.3],o.lightness=0,o.roughness=1),o.color[0]=Math.min(1,o.color[0]),o.color[1]=Math.min(1,o.color[1]),o.color[2]=Math.min(1,o.color[2]),this.set_voxel_comp(o,t,e,n)}}ray_any(t){let e=0,n=1/0;for(let o=0;o<3;o++){let i=(this.boundary_min[o]-t.origin[o])*t.inv_direction[o],s=(this.boundary_max[o]-t.origin[o])*t.inv_direction[o];e=Math.min(Math.max(i,e),Math.max(s,e)),n=Math.max(Math.min(i,n),Math.min(s,n))}if(e>n)return;const o=Q.add(t.origin,Q.scale(t.direction,e)),i=Q.add(t.origin,Q.scale(t.direction,n));let s=[Math.max(0,Math.min(this.voxel_count-1,Math.floor((o[0]-this.boundary_min[0])/this.voxel_size))),Math.max(0,Math.min(this.voxel_count-1,Math.floor((o[1]-this.boundary_min[1])/this.voxel_size))),Math.max(0,Math.min(this.voxel_count-1,Math.floor((o[2]-this.boundary_min[2])/this.voxel_size)))],r=[s[0]+1,s[1]+1,s[2]+1],c=[0,0,0],a=[0,0,0],l=[0,0,0],h=[0,0,0],u=e,d=[0,0,0];for(let u=0;u<3;u++)h[u]=Math.max(0,Math.min(this.voxel_count-1,Math.floor((i[u]-this.boundary_min[u])/this.voxel_size))),t.direction[u]>0?(c[u]=1,l[u]=this.voxel_size/t.direction[u],a[u]=e+(this.boundary_min[u]+r[u]*this.voxel_size-o[u])/t.direction[u]):t.direction[u]<0?(c[u]=-1,l[u]=this.voxel_size/-t.direction[u],a[u]=e+(this.boundary_min[u]+s[u]*this.voxel_size-o[u])/t.direction[u]):(c[u]=0,l[u]=n,a[u]=n);for(;s[0]<this.voxel_count&&s[0]>=0&&s[1]<this.voxel_count&&s[1]>=0&&s[2]<this.voxel_count&&s[2]>=0;){if(this.get_voxel(s).opacity>.01){const e=Q.add(t.origin,Q.scale(t.direction,u));return new Z(e,s,this.get_voxel(s),d)}a[0]<a[1]&&a[0]<a[2]?(s[0]+=c[0],u=a[0],a[0]+=l[0],d=[-c[0],0,0]):a[1]<a[2]?(s[1]+=c[1],u=a[1],a[1]+=l[1],d=[0,-c[1],0]):(s[2]+=c[2],u=a[2],a[2]+=l[2],d=[0,0,-c[2]])}}get_voxel_id_comp(t,e,n){return n*this.voxel_count*this.voxel_count+e*this.voxel_count+t}get_voxel_id(t){return t[2]*this.voxel_count*this.voxel_count+t[1]*this.voxel_count+t[0]}get_voxel_comp(t,e,n){return this.grid[n*this.voxel_count*this.voxel_count+e*this.voxel_count+t]}get_voxel(t){return this.grid[t[2]*this.voxel_count*this.voxel_count+t[1]*this.voxel_count+t[0]]}set_voxel(t,e){e[0]>0&&e[0]<this.voxel_count-1&&e[1]>0&&e[1]<this.voxel_count-1&&e[2]>0&&e[2]<this.voxel_count-1&&(this.grid[e[2]*this.voxel_count*this.voxel_count+e[1]*this.voxel_count+e[0]]=t)}set_voxel_comp(t,e,n,o){e>0&&e<this.voxel_count-1&&n>0&&n<this.voxel_count-1&&o>0&&o<this.voxel_count-1&&(this.grid[o*this.voxel_count*this.voxel_count+n*this.voxel_count+e]=t)}});let st=new class{constructor(t,e,n,o,i){this.mouse_down=!1,this.mouse_dragged=!1,this.last_move=0,this.velocity=[0,0],this.selected_color=[0,0,0],this.selected_roughness=1,this.selected_opacity=1,this.selected_lightness=0,this.camera=new et(n,o,i),this.setup(),this.last_move=performance.now(),this.last_movement=[0,0],this.scene=t,this.canvas=e,this.selected_tool="place"}tick(t){this.camera.tick(t)}setup(){var t,e,n,o,i,s,r;addEventListener("mousedown",(t=>{0==t.button&&(this.mouse_down=!0,this.mouse_dragged=!1,this.camera.dragged=!0,this.last_move=performance.now())})),addEventListener("mouseup",(t=>{if(0==t.button&&(this.mouse_down=!1,this.camera.dragged=!1,this.camera.velocity=[...this.velocity],!this.mouse_dragged)){const e=this.canvas.getBoundingClientRect(),n=t.clientX-e.left,o=t.clientY-e.top;let i=this.scene.ray_any(this.camera.screen_to_ray(n,o,e.width,e.height));if(i)switch(this.selected_tool){case"place":let t=new $;t.color=this.selected_color,t.roughness=this.selected_roughness,t.lightness=this.selected_lightness,t.opacity=this.selected_opacity,this.scene.set_voxel(t,i.voxel_position.map(((t,e)=>t+i.normal[e])));break;case"replace":let e=new $;e.color=this.selected_color,e.roughness=this.selected_roughness,e.lightness=this.selected_lightness,e.opacity=this.selected_opacity,this.scene.set_voxel(e,i.voxel_position);break;case"remove":let n=new $;n.opacity=0,this.scene.set_voxel(n,i.voxel_position)}}})),addEventListener("mousemove",(t=>{this.last_movement=q.scale([t.movementX,t.movementY],.2),this.mouse_down&&this.mouse_drag(t),this.calculate_velocity(),this.last_move=performance.now()})),null===(t=document.getElementById("color_value"))||void 0===t||t.addEventListener("input",(t=>{var e;const n=t.target.value;this.selected_color=Q.scale(null===(e=n.match(/\w\w/g))||void 0===e?void 0:e.map((t=>parseInt(t,16))),1/255)})),null===(e=document.getElementById("roughness_value"))||void 0===e||e.addEventListener("input",(t=>{this.selected_roughness=1-parseInt(t.target.value)/100})),null===(n=document.getElementById("lightness_value"))||void 0===n||n.addEventListener("input",(t=>{this.selected_lightness=parseInt(t.target.value)/100})),null===(o=document.getElementById("opacity_value"))||void 0===o||o.addEventListener("input",(t=>{this.selected_opacity=parseInt(t.target.value)/100})),null===(i=document.getElementById("tool-place-button"))||void 0===i||i.addEventListener("change",(t=>{this.selected_tool="place"})),null===(s=document.getElementById("tool-replace-button"))||void 0===s||s.addEventListener("change",(t=>{this.selected_tool="replace"})),null===(r=document.getElementById("tool-remove-button"))||void 0===r||r.addEventListener("change",(t=>{this.selected_tool="remove"}))}calculate_velocity(){const t=performance.now()-this.last_move;q.scale(this.last_movement,1/t,this.velocity)}mouse_drag(t){this.camera.eulers[1]=this.camera.eulers[1]-this.last_movement[1],this.camera.eulers[2]=this.camera.eulers[2]-this.last_movement[0],this.mouse_dragged=!0}}(it,nt,12,0,0);it.initialize_default_grid();let rt=performance.now(),ct=!1;requestAnimationFrame((function t(){const e=performance.now()-rt;st.tick(e/1e3),rt=performance.now(),ot.innerText=Math.round(1/e*1e3).toString()+" fps",requestAnimationFrame(t)})),addEventListener("mousedown",(t=>{2==t.button&&(ct=!0)})),addEventListener("contextmenu",(t=>(t.preventDefault(),!1)))})();
//# sourceMappingURL=main.js.map