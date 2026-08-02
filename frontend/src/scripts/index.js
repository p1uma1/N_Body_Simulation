import * as Three from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { deserializeParticles, generateParticles, serializeParticles, convertToJson, generateParticlesWithStar } from "./utils";

let particles = generateParticlesWithStar(1000);

console.log("particles ", particles)
const ws = new WebSocket('ws://localhost:8081');

const valuesPerParticle = 11;

const data = serializeParticles(particles, valuesPerParticle);

ws.onopen = () => {
  console.log('Connected to server');
  ws.send(data.buffer)
};

ws.onmessage = async (event) => {
  const floatArray = await deserializeParticles(event.data)
  particles = convertToJson(floatArray, 1000);

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

const light = new Three.PointLight(
  0xffffff,
  500,
  100
);
scene.add(light);

// const directionalLight = new Three.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(0, 0, 0);
// scene.add(directionalLight);

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
const textureLoader = new Three.TextureLoader();
const planetTexture = textureLoader.load(
  "/textures/planet_texture.jpg",
  () => console.log("Sun texture loaded"),
  undefined,
  (error) => console.error("Texture error:", error)
);
let i = 0;
particles.forEach(
  (particle, index) => {
    const geometry = new Three.SphereGeometry(particle.radius, 10, 10);
    const material = new Three.MeshStandardMaterial({
      map:planetTexture,
      color: Math.random() * 0xffffff
    });
    const cylinder = new Three.Mesh(geometry, material);
    cylinder.translateX(particle.x);
    cylinder.translateY(particle.y);
    cylinder.translateZ(particle.z);
    planets.push(cylinder);
    scene.add(planets[i])
    i++;
  })

const sunIndex = planets.length - 1;

const geometry = new Three.SphereGeometry(particles[sunIndex].radius, 100, 100);


const sunTexture = textureLoader.load(
  
  "/textures/sun_texture.jpg",
  () => console.log("Sun texture loaded"),
  undefined,
  (error) => console.error("Texture error:", error)
);
console.log("texture: ",sunTexture)
const material = new Three.MeshBasicMaterial({
  map: sunTexture,
  color: 0xfff900
});

const cylinder = new Three.Mesh(geometry, material);
scene.remove(planets[sunIndex]);
scene.add(cylinder);
planets[sunIndex] = cylinder;



camera.position.z = 20;
0
const controls = new OrbitControls(camera, renderer.domElement)

// Animation loop
renderer.setAnimationLoop(() => {
  controls.update();
  i = 0;

  for (let i = 0; i < 1000; i++) {
    const particle = particles[i];
    const planet = planets[i];

    planet.position.x = particle.x;
    planet.position.y = particle.y;
    planet.position.z = particle.z;
  }

  renderer.render(scene, camera);
});