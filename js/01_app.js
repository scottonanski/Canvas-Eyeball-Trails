console.log('JavaScript reporting for duty, sir!');

let scene, camera, renderer, cube, cubeColor, intensity, light;

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

let particleArray = [];

const sprite = new Image();
sprite.src = 'https://raw.githubusercontent.com/scottonanski/Canvas-Eyeball-Trails/main/eyes.png';

const maxSize = 8;
const minSize = 0;
const mouseRadius = 60;

let mouse = {
    x: undefined,
    y: undefined
};

window.addEventListener("mousemove", function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
    console.log(mouse);
});

function Particle(x, y, directionX, directionY, radius, speedX, speedY, size, frameX, frameY) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.size = size;
    this.frameX = frameX;
    this.frameY = frameY;
}

Particle.prototype.draw = function () {
    ctx.drawImage(sprite, this.size * this.frameX, this.size * this.frameY, this.size, this.size, this.x - this.radius * 5, this.y - this.radius * 5, this.radius * 10, this.radius * 10);
};

Particle.prototype.update = function () {
    if (this.x + this.radius * 1 > canvas.width || this.x - this.radius * 1 < 0) {
        this.directionX = -this.directionX;
    }
    if (this.y + this.radius * 1 > canvas.height || this.y - this.radius * 1 < 0) {
        this.directionY = -this.directionY;
    }
    this.x += this.directionX;
    this.y += this.directionY;

    if (
        mouse.x - this.x < mouseRadius &&
        mouse.x - this.x > -mouseRadius &&
        mouse.y - this.y < mouseRadius &&
        mouse.y - this.y > -mouseRadius
    ) {
        if (this.radius < maxSize) {
            this.radius += 1;
        }
    } else if (this.radius > minSize) {
        this.radius -= 0.05;
    }
    if (this.radius < 0) {
        this.radius = 0;
    }
    this.draw();
};

function init() {

    scene = new THREE.Scene();

    cubeColor = 0xffffff;
    intensity = 1;
  
    light = new THREE.DirectionalLight(cubeColor, intensity);
    light.position.set(0, 0, 100);
  
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
  
    renderer.background = null;
  
    renderer.setSize(window.innerWidth, window.innerHeight);
  
    document.body.appendChild(renderer.domElement);
  
    // let's add a bit of geometry!
  
    const geometry = new THREE.BoxGeometry(2, 2, 2);
  
    // Instead of using a basic color, we're going to throw in a a texture to make it look pretty!
  
    const texture = new THREE.TextureLoader().load(
      "https://raw.githubusercontent.com/scottonanski/Canvas-Eyeball-Trails/main/snellen.png"
    );
    const material = new THREE.MeshPhongMaterial({
      map: texture
    });
  
    cube = new THREE.Mesh(geometry, material);
  
    scene.add(cube, light);
  
    camera.position.z = 5;

  const floatingEyesPerSquareUnit = 0.001; // Adjust this value to change the density of floating eyes
    const viewportArea = window.innerWidth * window.innerHeight;
    const numberOfFloatingEyes = Math.floor(viewportArea * floatingEyesPerSquareUnit);
  
    particleArray = [];
    for (let i = 0; i < numberOfFloatingEyes; i++) {
        let radius = 0;
        let x = Math.random() * (innerWidth - radius * 2 - radius * 2 + radius * 2);
        let y = Math.random() * (innerHeight - radius * 2 - radius * 2 + radius * 2);
        let directionX = Math.random() * 2 - 1;
        let directionY = Math.random() * 2 - 1;
        let speedX = (Math.random() * 2) -1;
        let speedY = (Math.random() * 2) - 1;
        let size = 250;
        let frameX = Math.floor(Math.random() * 4);
        let frameY = Math.floor(Math.random() * 4);

        particleArray.push(
            new Particle(x, y, directionX, directionY, radius, speedX, speedY, size, frameX, frameY)
        );
    }
}

let targetRotationX = 0;
let targetRotationY = 0;

// Add a new function to rotate the cube towards the mouse pointer
function rotateCubeTowardsMouse() {
    const canvasCenterX = window.innerWidth / 2;
    const canvasCenterY = window.innerHeight / 2;

    const deltaX = mouse.x - canvasCenterX;
    const deltaY = mouse.y - canvasCenterY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.sqrt(canvasCenterX * canvasCenterX + canvasCenterY * canvasCenterY);

    // Add a minimum distance threshold
    const minDistanceThreshold = 1;
    if (distance > minDistanceThreshold) {
        const angleX = deltaY / distance * (Math.PI / 2) * (distance / maxDistance);
        const angleY = deltaX / distance * (Math.PI / 2) * (distance / maxDistance);

        targetRotationX = angleX;
        targetRotationY = angleY;
    }
}


function animate() {
    requestAnimationFrame(animate);

    if (mouse.x !== undefined && mouse.y !== undefined) {
        const dampingFactor = 0.07;
        cube.rotation.x += (targetRotationX - cube.rotation.x) * dampingFactor;
        cube.rotation.y += (targetRotationY - cube.rotation.y) * dampingFactor;
    }
  
    renderer.render(scene, camera);

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
    }
}

// Call the rotateCubeTowardsMouse function in the mousemove event listener
window.addEventListener("mousemove", function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
    rotateCubeTowardsMouse(); // Update the cube's rotation
    console.log(mouse);
});

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }

  window.addEventListener("resize", onWindowResize, false);
  init();
  animate();

setInterval(function () {
    mouse.x = undefined;
    mouse.y = undefined;
}, 1000);

