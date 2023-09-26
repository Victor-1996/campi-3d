import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

const main = async () => {
  const data = await fetch('data.json').then(res => res.json());

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  const getSize = event => {
    if (!event.magnitudos) return 0;
    const m = event.magnitudos[0].value;
    return Math.cbrt((3 * Math.pow(10, m)) / (4 * Math.PI)) / 100;
  };

  const getColor = event => {
    if (!event.magnitudos) return 0x808080;
    let m = event.magnitudos[0].value;
    m = m > 4 ? 4 : m;
    m = m < 0 ? 0 : m;
    m = m / 4;
    return new THREE.Color(m, 0, 1 - m);
  };

  for (let i = 0; i < data.length; i++) {
    const event = data[i];
    if (!event.location) continue;
    const geometry = new THREE.SphereGeometry(getSize(event), 32, 16);
    const color = getColor(event);
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(85 * (event.location.longitude - 14.1386), -event.location.depth, 111 * (event.location.latitude - 40.8249));
    scene.add(sphere);
  }

  renderer.render(scene, camera);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  if (WebGL.isWebGLAvailable()) {
    animate();
  } else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
  }
};

main();
