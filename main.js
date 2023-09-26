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
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  const gridHelper = new THREE.GridHelper(100, 10);
  scene.add(gridHelper);

  const getColor = event => {
    if (!event.magnitudos) return 0x808080;
    const m = event.magnitudos[0].value;
    if (m >= 3) {
      return 0xff0000;
    } else if (m >= 2) {
      return 0x00ff00;
    } else if (m >= 1) {
      return 0x0000ff;
    } else {
      return 0x808080;
    }
  };

  for (let i = 0; i < data.length; i++) {
    const event = data[i];
    if (!event.location) continue;
    const size = event.magnitudos ? event.magnitudos[0].value : undefined;
    const geometry = new THREE.SphereGeometry(size/10 || 0.1, 32, 16);
    const color = getColor(event);
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(850 * (event.location.longitude - 14.1386), -10 * event.location.depth, 1110 * (event.location.latitude - 40.8249));
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
