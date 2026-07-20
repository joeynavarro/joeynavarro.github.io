import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const mount=document.querySelector('[data-scene]');
if(mount&&window.matchMedia('(prefers-reduced-motion: no-preference)').matches){
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(42,mount.clientWidth/mount.clientHeight,.1,100);
 camera.position.set(0,0,6.4);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.setSize(mount.clientWidth,mount.clientHeight);
 mount.appendChild(renderer.domElement);
 const group=new THREE.Group();scene.add(group);
 const geo=new THREE.IcosahedronGeometry(1.55,4);
 const mat=new THREE.MeshPhysicalMaterial({color:0x61dafb,roughness:.23,metalness:.28,transmission:.18,transparent:true,opacity:.92,wireframe:false});
 const core=new THREE.Mesh(geo,mat);group.add(core);
 const wire=new THREE.Mesh(new THREE.IcosahedronGeometry(1.82,2),new THREE.MeshBasicMaterial({color:0xa78bfa,wireframe:true,transparent:true,opacity:.2}));group.add(wire);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,.018,12,180),new THREE.MeshBasicMaterial({color:0x43e6b0,transparent:true,opacity:.7}));ring.rotation.x=1.1;group.add(ring);
 const points=[];for(let i=0;i<650;i++){const r=2.8+Math.random()*2.7;const t=Math.random()*Math.PI*2;const p=Math.acos(2*Math.random()-1);points.push(r*Math.sin(p)*Math.cos(t),r*Math.cos(p),r*Math.sin(p)*Math.sin(t))}
 const stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points,3)),new THREE.PointsMaterial({color:0xffffff,size:.018,transparent:true,opacity:.6}));scene.add(stars);
 scene.add(new THREE.AmbientLight(0xffffff,1.6));const key=new THREE.PointLight(0x61dafb,28,20);key.position.set(3,2,4);scene.add(key);const fill=new THREE.PointLight(0xa78bfa,22,20);fill.position.set(-3,-2,3);scene.add(fill);
 let mx=0,my=0;mount.addEventListener('pointermove',e=>{const r=mount.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*.8;my=((e.clientY-r.top)/r.height-.5)*.8});
 const clock=new THREE.Clock();function animate(){const t=clock.getElapsedTime();group.rotation.y=t*.18+mx;group.rotation.x=Math.sin(t*.3)*.12+my*.35;wire.rotation.z=-t*.1;ring.rotation.z=t*.13;stars.rotation.y=t*.018;renderer.render(scene,camera);requestAnimationFrame(animate)}animate();
 const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)};new ResizeObserver(resize).observe(mount);
}

document.querySelector('[data-year]').textContent=new Date().getFullYear();
