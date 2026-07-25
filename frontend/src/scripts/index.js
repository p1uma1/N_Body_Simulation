import * as Three from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import generateParticles from "./utils";

const particles = generateParticles(1000);
const ws = new WebSocket('ws://localhost:8081');
const valuesPerParticle = 11;
const data = new Float32Array(particles.length * valuesPerParticle);

particles.forEach((particle, i) => {
  const offset = i * valuesPerParticle;

  data[offset] = particle.mass;
  data[offset + 1] = particle.radius;

  data[offset + 2] = particle.x;
  data[offset + 3] = particle.y;
  data[offset + 4] = particle.z;

  data[offset + 5] = particle.vx;
  data[offset + 6] = particle.vy;
  data[offset + 7] = particle.vz;

  data[offset + 8] = particle.ax;
  data[offset + 9] = particle.ay;
  data[offset + 10] = particle.az;
});
console.log("Data " ,data);
console.log("data buffer " ,data.buffer)

ws.onopen = () => {
  console.log('Connected to server');
  ws.send(data.buffer)
};
ws.on("particles", (particles) => {
  console.log(particles);

  particles.forEach((p, i) => {
    console.log(
      `Particle ${i}: (${p.x}, ${p.y}, ${p.z})`
    );
  });
});
ws.onmessage = (event) => {
  console.log("event data", event.data);
};

ws.onclose = () => {
  console.log('Disconnected from server');
};



const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  1, 1000
)
scene.add(camera)

const canvas = document.getElementById("webgl");
const renderer = new Three.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new Three.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new Three.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 0);
scene.add(directionalLight);

const dirX = new Three.Vector3(1, 0, 0);
const dirY = new Three.Vector3(0, 1, 0);
const dirZ = new Three.Vector3(0, 0, 1);

const origin = new Three.Vector3(20, 20, 0);
const length = 10;
const hex = 0xffff00;
const arrowHelpers = [new Three.ArrowHelper(dirX, origin, length, hex), new Three.ArrowHelper(dirY, origin, length, hex), new Three.ArrowHelper(dirZ, origin, length, hex)]

arrowHelpers.forEach((arrow) => {
  scene.add(arrow);
})

const planets = []


let i = 0;
particles.forEach(
  (particle) => {
    const geometry = new Three.SphereGeometry(particle.radius, 10, 10);
    const material = new Three.MeshStandardMaterial({
      color: 0x00ff00
    });
    const cylinder = new Three.Mesh(geometry, material);
    cylinder.translateX(particle.x);
    cylinder.translateY(particle.y);
    cylinder.translateZ(particle.z);
    planets.push(cylinder);
    scene.add(planets[i])
    i++;
  })



camera.position.z = 20;
0
const controls = new OrbitControls(camera, renderer.domElement)

// Animation loop
renderer.setAnimationLoop(() => {
  controls.update();
  i = 0;

  particles.forEach(
    (particle) => {

      planets[i].translateX(particle.vx);
      planets[i].translateY(particle.vy);
      planets[i].translateZ(particle.vz);
      i++
    })
  renderer.render(scene, camera);
});