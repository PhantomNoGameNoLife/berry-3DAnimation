import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 380;

const scene = new THREE.Scene();
let berry;
const loader = new GLTFLoader();

const branchCamera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
branchCamera.position.z = 100;

const branchScenes = [];
const branchRenderers = [];
let treeBranches = [];
let fallingBerries = [];

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

loader.load('./../tree_branch.glb',
    function (gltf) {
        const treeBranchModel = gltf.scene;
        const sections = ['banner', 'intro', 'description', 'contact'];

        sections.forEach((sectionId) => {
            const branchScene = new THREE.Scene();
            const branch = treeBranchModel.clone();
            if (sectionId === "intro" || sectionId == "contact") {
                branch.position.set(getXByScreenPercent(-880), -1, 0);
                branch.rotation.set(0, 0, 0);
            } else {
                branch.position.set(getXByScreenPercent(1000), 5, 0);
                branch.rotation.set(3, 3, 0);
            }
            branch.scale.set(.9, .9, .9);
            branchScene.add(branch);

            const branchAmbientLight = new THREE.AmbientLight(0xffffff, 1.3);
            branchScene.add(branchAmbientLight);
            const branchTopLight = new THREE.DirectionalLight(0xffffff, 1);
            branchTopLight.position.set(50, 50, 50);
            branchScene.add(branchTopLight);

            const branchRenderer = new THREE.WebGLRenderer({ alpha: true });
            branchRenderer.setSize(window.innerWidth, window.innerHeight);
            const container = document.getElementById(`treeBranch-${sectionId}`);
            if (container) {
                container.appendChild(branchRenderer.domElement);
            } else {
                console.error(`Container treeBranch-${sectionId} not found`);
            }

            branchScenes.push(branchScene);
            branchRenderers.push(branchRenderer);
            treeBranches.push({ branch, scene: branchScene, renderer: branchRenderer });

            startFallingBerries(branch, branchScene, sectionId);
        });

        const renderBranches = () => {
            requestAnimationFrame(renderBranches);
            treeBranches.forEach(({ renderer, scene }) => {
                renderer.render(scene, branchCamera);
            });
        };
        renderBranches();
    },
    function (xhr) { },
    function (error) { console.error(error); }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

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
        id: 'intro',
        position: { x: getXByScreenPercent(-2500), y: -10, z: 0.6 },
        rotation: { x: 0.5, y: -0.5, z: 0 }
    },
    {
        id: 'description',
        position: { x: getXByScreenPercent(3000), y: 0, z: 0.5 },
        rotation: { x: 0.8, y: 1, z: 0.2 }
    },
    {
        id: 'contact',
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

function startFallingBerries(branch, branchScene, sectionId) {
    setInterval(() => {
        const fallingBerry = berry.clone();
        if (sectionId === 'intro' || sectionId == 'contact') {
            fallingBerry.position.set(
                getXByScreenPercent(-4500) + getXByScreenPercent(Math.random() * 2000),
                branch.position.y,
                -300
            );
        } else {
            fallingBerry.position.set(
                getXByScreenPercent(4500) + getXByScreenPercent(Math.random() * -2000),
                branch.position.y,
                -300
            );
        }
        fallingBerry.scale.set(0.25, 0.25, 0.25);
        branchScene.add(fallingBerry);
        fallingBerries.push(fallingBerry);

        gsap.to(fallingBerry.position, {
            y: fallingBerry.position.y - 30,
            duration: 3,
            ease: "power1.in",
            onComplete: () => {
                branchScene.remove(fallingBerry);
                fallingBerries = fallingBerries.filter(b => b !== fallingBerry);
            }
        });

        gsap.to(fallingBerry.rotation, {
            x: Math.random() * Math.PI,
            y: Math.random() * Math.PI,
            z: Math.random() * Math.PI,
            duration: 3,
            ease: "none"
        });
    }, 1000);
}

if (window.innerWidth <= 567) {
    camera.position.z = 500;
    branchCamera.position.z = 170;
    camera.updateProjectionMatrix();
    branchCamera.updateProjectionMatrix();
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

    branchRenderers.forEach((branchRenderer) => {
        branchRenderer.setSize(window.innerWidth, window.innerHeight);
    });
    branchCamera.aspect = window.innerWidth / window.innerHeight;
    branchCamera.updateProjectionMatrix();
});