import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.set(8, 8, 0);

const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;
control.enableDamping = true;
control.minDistance = 5;
control.maxDistance = 100;
control.enablePan = false;
control.maxPolarAngle = Math.PI / 2 - 0.05;
control.update();

const directionLight = new THREE.DirectionalLight();
scene.add(directionLight);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const planeGep = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  color: "Gray",
});
const plane = new THREE.Mesh(planeGep, planeMat);
plane.rotation.set(-Math.PI / 2, 0, 0);
plane.position.set(0, 0, 0);
scene.add(plane);

const grid = new THREE.GridHelper(100, 100);
scene.add(grid);

let mixer;
let animationActions = [];
let activeAction;
let lastAction;

const fbxLoader = new FBXLoader();
fbxLoader.load("./model/X Bot.fbx", function (object) {
  object.scale.set(0.1, 0.1, 0.1);
  scene.add(object);

  const animationStanding = new FBXLoader();
  animationStanding.load(
    "./animations/Standing Idle.fbx",
    function (animation) {
      mixer = new THREE.AnimationMixer(object);
      const standing = mixer.clipAction(animation.animations[0]);
      animationActions.push(standing);
      animationsFolder.add(animations, "standing");
      activeAction = animationActions[0];

      //...
      fbxLoader.load("./animations/Walking.fbx", function (animation) {
        const animationAction = mixer.clipAction(animation.animations[0]);
        animationActions.push(animationAction);
        animationsFolder.add(animations, "walking");

        //...
        fbxLoader.load("./animations/Fast Run.fbx", function (animation) {
          const animationAction = mixer.clipAction(animation.animations[0]);
          animationActions.push(animationAction);
          animationsFolder.add(animations, "run");
          //....
          fbxLoader.load("./animations/Jump.fbx", function (animation) {
            animation.animations[0].tracks.shift(); //delete the specific track that moves the object forward while running
            const animationAction = mixer.clipAction(animation.animations[0]);
            animationActions.push(animationAction);
            animationsFolder.add(animations, "jump");
          });
        });
      });
    }
  );
});

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const animations = {
  standing: function () {
    setAction(animationActions[0]);
  },
  walking: function () {
    setAction(animationActions[1]);
  },
  run: function () {
    setAction(animationActions[2]);
  },
  jump: function () {
    setAction(animationActions[3]);
  },
};

const setAction = (toAction) => {
  if (toAction != activeAction) {
    lastAction = activeAction;
    activeAction = toAction;
    //lastAction.stop();
    lastAction.fadeOut(1);
    activeAction.reset();
    activeAction.fadeIn(1);
    activeAction.play();
  } else {
    activeAction.play();
  }
};

const gui = new GUI();
const animationsFolder = gui.addFolder("Animations");
animationsFolder.open();

const stats = new Stats();
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  const delta = clock.getDelta();

  //if (mixer) mixer.update(delta);
  if (mixer) mixer.update(delta);

  stats.update();
  control.update();
}

animate();
