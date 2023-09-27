import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

const getMinMax = arr => {
  let maximum = arr[0];
  let minimum = arr[0];
  for (let i = 0 ; i < arr.length; i++) {
    if (maximum < arr[i]) {
      maximum = arr[i];
    } else {
      minimum = arr[i];
    }
  }
  return { max: maximum, min: minimum };
};

const main = async () => {
  const data = await fetch('data.json').then(res => res.json());
  const { min: min_epoch, max: max_epoch } = getMinMax(data.map(x => x.epoch));

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  (() => {
    const c = 1/32;
    const grid_c = new THREE.Color(c, c, c);

    const grid_2 = new THREE.GridHelper(10, 10, grid_c, grid_c);
    const grid_3 = new THREE.GridHelper(10, 10, grid_c, grid_c);
    const grid_4 = new THREE.GridHelper(10, 10, grid_c, grid_c);
    const grid_5 = new THREE.GridHelper(10, 10, grid_c, grid_c);

    grid_2.rotateX(Math.PI / 2);
    grid_2.position.set(0, -5, -5);

    grid_3.rotateZ(Math.PI / 2);
    grid_3.position.set(-5, -5, 0);

    grid_4.rotateX(Math.PI / 2);
    grid_4.position.set(0, -5, 5);

    grid_5.rotateZ(Math.PI / 2);
    grid_5.position.set(5, -5, 0);

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

    const plane_1 = new THREE.Mesh(geometry, special_material);
    const plane_2 = new THREE.Mesh(geometry, material);
    const plane_3 = new THREE.Mesh(geometry, material);
    const plane_4 = new THREE.Mesh(geometry, material);
    const plane_5 = new THREE.Mesh(geometry, material);
    
    plane_1.rotateX(3 * Math.PI / 2);
    plane_1.rotateZ(Math.PI);

    plane_2.position.set(0, -5, -5);

    plane_3.rotateY(Math.PI / 2);
    plane_3.position.set(-5, -5, 0);

    plane_4.position.set(0, -5, 5);

    plane_5.rotateY(Math.PI / 2);
    plane_5.position.set(5, -5, 0);


    scene.add(plane_1, plane_2, plane_3, plane_4, plane_5, grid_2, grid_3, grid_4, grid_5);
  })();

  const getRadius = event => {
    if (!event.magnitudos) return 0;
    const m = event.magnitudos[0].value;
    return Math.cbrt((3 * Math.pow(10, m)) / (4 * Math.PI)) / 100;
  };

  const getColor = event => {
    if (!event.magnitudos) return 0x0000ff;
    let m = event.magnitudos[0].value;
    m = m > 4 ? 4 : m;
    m = m < 0 ? 0 : m;
    m = m / 4;
    return new THREE.Color(m, 0, 1 - m);
  };

  const spheres = [];
  for (let i = 0; i < data.length; i++) {
    const event = data[i];
    if (!event.epoch) continue;
    if (!event.location) continue;
    const geometry = new THREE.SphereGeometry(getRadius(event), 32, 16);
    const c = (event.epoch - min_epoch) / (max_epoch - min_epoch);
    const material = new THREE.MeshBasicMaterial({ color: getColor(event) });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(84.14 * (14.1386 - event.location.longitude), -event.location.depth, 111.12 * (event.location.latitude - 40.8249));
    spheres.push({ epoch: event.epoch, sphere });
  }

  for (let i = 0; i < spheres.length; i++) {
    scene.add(spheres[i].sphere);
  }

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
