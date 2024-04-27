import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
const controls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();

const data = [];
let spheres = [];

const getRadius = event => {
  if (!event.magnitudos) return 1 / 150;
  const m = event.magnitudos[0].value;
  return Math.cbrt((3 * Math.pow(10, m)) / (4 * Math.PI)) / 100;
};

const getColor = event => {
  if (!event.magnitudos) return new THREE.Color(1/10, 1/10, 1/10);
  let m = event.magnitudos[0].value;
  m = m > 4 ? 4 : m;
  m = m < 0 ? 0 : m;
  m = m / 4;
  return new THREE.Color(m, 0, 1 - m);
};

const render_scene = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  controls.update();
  const geometry = new THREE.PlaneGeometry(10, 10);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  material.transparent = true;
  material.opacity = 1 / 20;
  const texture = new THREE.TextureLoader().load('campi-texture.png');
  const special_material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    map: texture,
  });
  special_material.transparent = true;
  special_material.opacity = 1 / 4;
  const special_plane = new THREE.Mesh(geometry, special_material);
  special_plane.rotateX(3 * Math.PI / 2);
  special_plane.rotateZ(Math.PI);
  const c = 1/32;
  const grid_color = new THREE.Color(c, c, c);
  const grids = [];
  for (let i = 0; i < 4; i++) {
    const grid = new THREE.GridHelper(10, 10, grid_color, grid_color);
    if (i % 2 === 0) {
      grid.rotateX(Math.PI / 2);
    } else {
      grid.rotateZ(Math.PI / 2);
    }
    grids.push(grid);
  }
  const planes = [];
  for (let i = 0; i < 4; i++) {
    const plane = new THREE.Mesh(geometry, material);
    if (i % 2 === 1) {
      plane.rotateY(Math.PI / 2);
    }
    planes.push(plane);
  }
  const positions = [[0, -5, -5], [-5, -5, 0], [0, -5, 5], [5, -5, 0]];
  for (let i = 0; i < positions.length; i++) {
    grids[i].position.set(...positions[i]);
    planes[i].position.set(...positions[i]);
  }
  scene.add(special_plane, ...grids, ...planes);
};

const start_date_input = document.getElementById('start-date');
const end_date_input = document.getElementById('end-date');

const checkDate = event => {
  const { epoch, date } = event;
  if (!epoch || !date) return false;
  const start_epoch = new Date(`${start_date_input.value}T00:00:00.000Z`).getTime() / 1000;
  const end_epoch = new Date(`${end_date_input.value}T00:00:00.000Z`).getTime() / 1000;
  if (date.startsWith(start_date_input.value)) {
    return true;
  } else if (date.startsWith(end_date_input.value)) {
    return true;
  } else if (start_epoch <= epoch && epoch <= end_epoch) {
    return true;
  } else {
    return false;
  }
};

const update_spheres = () => {
  let histogram = {};
  for (let i = 0; i < data.length; i++) {
    const event = data[i];
    let key;
    if (!event.magnitudos) {
      key = 'undefined';
    } else {
      const magnitude = event.magnitudos[0].value;
      key = `${magnitude}`;
    }
    histogram[key] = typeof histogram[key] !== 'number' ? 1 : histogram[key] + 1;
  }
  console.log(histogram);

  for (let i = 0; i < data.length; i++) {
    const event = data[i];
    if (!checkDate(event)) continue;
    if (!event.location) continue;
    const geometry = new THREE.SphereGeometry(getRadius(event), 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: getColor(event) });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(84.14 * (14.1386 - event.location.longitude), -event.location.depth, 111.12 * (event.location.latitude - 40.8249));
    spheres.push(sphere);
  }

  for (let i = 0; i < spheres.length; i++) {
    scene.add(spheres[i]);
  }
};

document.getElementById('update').addEventListener('click', e => {
  for (let i = 0; i < spheres.length; i++) {
    scene.remove(spheres[i]);
    spheres[i].geometry.dispose();
    spheres[i].material.dispose();
    spheres[i] = undefined;
  }
  spheres = [];
  update_spheres();
});

const main = async () => {
  render_scene();

  for (let i = 2005; i <= 2024; i++) {
    data.push(...await fetch(`data/${i}.json`).then(res => res.json()));
  }

  update_spheres();

  renderer.render(scene, camera);
  
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  
  if (WebGL.isWebGLAvailable()) {
    animate();
  } else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
  }
};

main();
