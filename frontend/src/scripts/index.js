import * as Three from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(
    75,
    innerWidth/innerHeight,
    1,1000
)
scene.add(camera)

const canvas = document.getElementById("webgl");
const renderer = new Three.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new Three.SphereGeometry(10,100,100);
const material = new Three.MeshStandardMaterial({ color: 0x00ff00
 });
const cylinder = new Three.Mesh(geometry, material);

const particles = []

scene.add(cylinder);

const ambientLight = new Three.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new Three.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const dirX = new Three.Vector3( 1, 0, 0 );
const dirY = new Three.Vector3( 0, 1, 0 );
const dirZ = new Three.Vector3( 0, 0, 1 );

const origin = new Three.Vector3( 20, 20, 0 );
const length = 10;
const hex = 0xffff00;
const arrowHelpers = [new Three.ArrowHelper( dirX, origin, length, hex ),new Three.ArrowHelper( dirY, origin, length, hex ),new Three.ArrowHelper( dirZ, origin, length, hex )]

arrowHelpers.forEach((arrow)=>{
  scene.add( arrow);
})



camera.position.z = 20;
0
const controls = new OrbitControls(camera,renderer.domElement)

// Animation loop
renderer.setAnimationLoop(() => {
  controls.update();

  renderer.render(scene, camera);
});