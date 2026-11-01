import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('[data-scene]');
const sceneWrap = document.querySelector('[data-scene-wrap]');

if (canvas && sceneWrap && !reducedMotion) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.25, 8.7);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const world = new THREE.Group();
  scene.add(world);

  const glossy = (color, options = {}) => new THREE.MeshPhysicalMaterial({
    color,
    roughness: options.roughness ?? 0.22,
    metalness: options.metalness ?? 0.08,
    clearcoat: options.clearcoat ?? 1,
    clearcoatRoughness: 0.16,
    transmission: options.transmission ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: THREE.DoubleSide
  });

  const pearl = glossy(0xf7f5ff, { roughness: 0.16, transmission: 0.08 });
  const violet = glossy(0x7658ff, { roughness: 0.18 });
  const pink = glossy(0xed5ac8, { roughness: 0.2 });
  const blue = glossy(0x8fd9ff, { roughness: 0.18, transmission: 0.08 });
  const dark = glossy(0x17132b, { roughness: 0.2, metalness: 0.25 });

  const orbGroup = new THREE.Group();
  world.add(orbGroup);

  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.54, 6), glossy(0xb4ccff, { roughness: 0.08, transmission: 0.3, transparent: true, opacity: 0.92 }));
  orb.scale.set(1.06, 1.06, 1.06);
  orbGroup.add(orb);

  const orbCore = new THREE.Mesh(new THREE.SphereGeometry(0.64, 64, 64), glossy(0xed76d4, { roughness: 0.14, transmission: 0.22 }));
  orbCore.position.set(0.12, -0.05, 0.08);
  orbGroup.add(orbCore);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.78, 4),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.24 })
  );
  orbGroup.add(wire);

  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.04, 0.055, 20, 220), pearl);
  ringA.rotation.set(1.12, 0.15, -0.22);
  orbGroup.add(ringA);

  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.035, 16, 220), pink);
  ringB.rotation.set(0.18, 1.1, 0.35);
  orbGroup.add(ringB);

  const nodeGeometry = new THREE.SphereGeometry(0.052, 16, 16);
  const nodes = new THREE.Group();
  for (let i = 0; i < 70; i += 1) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const radius = 1.88 + Math.random() * 0.2;
    const mesh = new THREE.Mesh(nodeGeometry, i % 5 === 0 ? pink : pearl);
    mesh.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    nodes.add(mesh);
  }
  orbGroup.add(nodes);

  function canvasTexture(label, colorA, colorB, ink = '#17132b') {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, colorA);
    grad.addColorStop(1, colorB);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(255,255,255,.65)';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(256, 256, 205, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = '800 150px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 256, 270);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function createToken(label, colors, position, scale = 1) {
    const group = new THREE.Group();
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.62 * scale, 0.62 * scale, 0.18 * scale, 64), dark);
    edge.rotation.x = Math.PI / 2;
    group.add(edge);
    const texture = canvasTexture(label, colors[0], colors[1]);
    const faceMaterial = new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.2, metalness: 0.05, clearcoat: 1 });
    const front = new THREE.Mesh(new THREE.CircleGeometry(0.59 * scale, 64), faceMaterial);
    front.position.z = 0.095 * scale;
    group.add(front);
    const back = front.clone();
    back.position.z = -0.095 * scale;
    back.rotation.y = Math.PI;
    group.add(back);
    group.position.copy(position);
    world.add(group);
    return group;
  }

  const tokenAI = createToken('AI', ['#ffffff', '#cddaff'], new THREE.Vector3(2.62, 1.85, 0.4), 0.82);
  const tokenRx = createToken('Rx', ['#ffffff', '#f0a6df'], new THREE.Vector3(-2.25, -1.65, 0.1), 0.72);
  const tokenData = createToken('01', ['#ffffff', '#a8e9ff'], new THREE.Vector3(-2.45, 1.65, -0.2), 0.58);

  const capsule = new THREE.Group();
  const capsuleHalfA = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.72, 16, 40), violet);
  capsuleHalfA.scale.y = 0.52;
  capsuleHalfA.position.x = -0.35;
  capsuleHalfA.rotation.z = Math.PI / 2;
  capsule.add(capsuleHalfA);
  const capsuleHalfB = capsuleHalfA.clone();
  capsuleHalfB.material = pearl;
  capsuleHalfB.position.x = 0.35;
  capsule.add(capsuleHalfB);
  capsule.position.set(2.65, -1.5, -0.5);
  capsule.rotation.set(0.4, -0.3, -0.45);
  capsule.scale.setScalar(0.72);
  world.add(capsule);

  const helix = new THREE.Group();
  const helixMatA = blue;
  const helixMatB = pink;
  for (let i = 0; i < 22; i += 1) {
    const y = (i - 10.5) * 0.12;
    const angle = i * 0.58;
    const x = Math.cos(angle) * 0.34;
    const z = Math.sin(angle) * 0.34;
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 18), helixMatA);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 18), helixMatB);
    a.position.set(x, y, z);
    b.position.set(-x, y, -z);
    helix.add(a, b);
    if (i % 2 === 0) {
      const bridgeGeo = new THREE.CylinderGeometry(0.018, 0.018, Math.sqrt((2*x) ** 2 + (2*z) ** 2), 10);
      const bridge = new THREE.Mesh(bridgeGeo, pearl);
      bridge.position.set(0, y, 0);
      bridge.rotation.z = Math.PI / 2;
      bridge.rotation.y = -Math.atan2(2*z, 2*x);
      helix.add(bridge);
    }
  }
  helix.position.set(3.22, 0.12, -1.4);
  helix.rotation.z = -0.38;
  world.add(helix);

  const floorShadow = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 64),
    new THREE.MeshBasicMaterial({ color: 0x6046a3, transparent: true, opacity: 0.08, depthWrite: false })
  );
  floorShadow.scale.set(1.4, 0.32, 1);
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.set(0, -2.25, -0.6);
  world.add(floorShadow);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x7a5cff, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 5.2);
  key.position.set(4, 5, 7);
  scene.add(key);
  const rim = new THREE.PointLight(0xed5ac8, 28, 15);
  rim.position.set(-3.8, 2.8, 3.5);
  scene.add(rim);
  const blueLight = new THREE.PointLight(0x8fd9ff, 26, 15);
  blueLight.position.set(3.8, -2.5, 4);
  scene.add(blueLight);

  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragRotationX = 0;
  let dragRotationY = 0;

  sceneWrap.addEventListener('pointerdown', (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    sceneWrap.setPointerCapture(event.pointerId);
  });
  sceneWrap.addEventListener('pointerup', (event) => {
    isDragging = false;
    sceneWrap.releasePointerCapture(event.pointerId);
  });
  sceneWrap.addEventListener('pointermove', (event) => {
    const rect = sceneWrap.getBoundingClientRect();
    targetPointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.55;
    targetPointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.42;
    if (isDragging) {
      dragRotationY += (event.clientX - dragStartX) * 0.004;
      dragRotationX += (event.clientY - dragStartY) * 0.003;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
    }
  });

  const resize = () => {
    const width = Math.max(sceneWrap.clientWidth, 1);
    const height = Math.max(sceneWrap.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(sceneWrap);
  resize();

  const clock = new THREE.Clock();
  const animate = () => {
    const t = clock.getElapsedTime();
    pointerX += (targetPointerX - pointerX) * 0.045;
    pointerY += (targetPointerY - pointerY) * 0.045;
    const scrollProgress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.3);

    world.rotation.y += ((pointerX + dragRotationY) - world.rotation.y) * 0.035;
    world.rotation.x += ((pointerY * 0.55 + dragRotationX) - world.rotation.x) * 0.035;
    world.position.y = -scrollProgress * 0.55;
    world.scale.setScalar(1 - scrollProgress * 0.075);

    orbGroup.rotation.y = t * 0.16;
    orbGroup.rotation.x = Math.sin(t * 0.35) * 0.1;
    wire.rotation.z = -t * 0.12;
    ringA.rotation.z = t * 0.1;
    ringB.rotation.x = 0.18 + Math.sin(t * 0.24) * 0.16;
    nodes.rotation.y = -t * 0.09;

    tokenAI.rotation.set(0.35 + Math.sin(t * 0.7) * 0.08, t * 0.35, -0.24);
    tokenAI.position.y = 1.85 + Math.sin(t * 0.9) * 0.13;
    tokenRx.rotation.set(-0.22, -t * 0.25, 0.28);
    tokenRx.position.y = -1.65 + Math.sin(t * 0.8 + 2) * 0.12;
    tokenData.rotation.set(0.2, t * 0.24, -0.2);
    tokenData.position.x = -2.45 + Math.sin(t * 0.55) * 0.08;
    capsule.rotation.y = t * 0.28;
    capsule.position.y = -1.5 + Math.sin(t * 0.74 + 1) * 0.14;
    helix.rotation.y = t * 0.32;
    helix.position.y = 0.12 + Math.sin(t * 0.65) * 0.1;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
}

document.documentElement.classList.add('has-reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

if (!reducedMotion) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const header = document.querySelector('[data-header]');
let previousScroll = window.scrollY;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (header) {
    header.classList.toggle('is-hidden', current > previousScroll && current > 180);
  }
  previousScroll = current;
}, { passive: true });

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();
