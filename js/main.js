import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 380;

const scene = new THREE.Scene();
let berry;

const loader = new GLTFLoader();
loader.load('./../grapes.glb',
    function (gltf) {
        berry = gltf.scene;
        berry.position.z = 0.4;
        berry.position.y = 0.01;
        scene.add(berry);
        modelMove();
    },
    function (xhr) { },
    function (error) { console.error(error); }
);


const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

// render loop + rotation
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (berry) {
        berry.rotation.y += 0.01;
    }
};
reRender3D();

function getXByScreenPercent(percent) {
    const px = window.innerWidth * (percent / 100);
    const screenToWorldRatio = 0.001;
    return (px - window.innerWidth / 2) * screenToWorldRatio;
}


let arrPositionModel = [
    {
        id: 'banner',
        position: { x: getXByScreenPercent(50), y: -20, z: 0.5 },
        rotation: { x: 0, y: 1.5, z: 0 }
    },
    {
        id: "intro",
        position: { x: getXByScreenPercent(-2500), y: -10, z: 0.6 },
        rotation: { x: 0.5, y: -0.5, z: 0 }
    },
    {
        id: "description",
        position: { x: getXByScreenPercent(3000), y: 0, z: 0.5 },
        rotation: { x: 0.8, y: 1, z: 0.2 }
    },
    {
        id: "contact",
        position: { x: getXByScreenPercent(-2500), y: -15, z: -80 },
        rotation: { x: 0.3, y: -3.5, z: 0 }
    },
];



let lastSection = null;

const modelMove = () => {
    const sections = document.querySelectorAll('.section');
    let currentSection;
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
        }
    });

    if (currentSection && currentSection !== lastSection) {
        lastSection = currentSection;
        let new_coordinates = arrPositionModel.find(val => val.id === currentSection);
        if (new_coordinates) {
            gsap.to(berry.position, {
                x: new_coordinates.position.x,
                y: new_coordinates.position.y,
                z: new_coordinates.position.z,
                duration: 3,
                ease: "power1.out"
            });
            gsap.to(berry.rotation, {
                x: new_coordinates.rotation.x,
                y: new_coordinates.rotation.y,
                z: new_coordinates.rotation.z,
                duration: 3,
                ease: "power1.out"
            });
        }
    }
};

if (window.innerWidth <= 567) {
    camera.position.z = 500;
    camera.updateProjectionMatrix();
}

window.addEventListener('scroll', () => {
    if (berry) {
        modelMove();
    }
});

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
