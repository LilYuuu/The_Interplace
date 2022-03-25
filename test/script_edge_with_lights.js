const WORLD_HALF_SIZE = 200;
const WIDTH = 160;
const HEIGHT = 120;
const COLOR_BG = 0x000000;
const PARTICLES_NUMBER = 5000;


let poseNet;
let pose;
let poseArray;

let pointCloud;
let particles = [];
let particleIndex = 0;
let rgba_array;

let capture;
let buffer;
let result;

let targets = [];
let lights = [];
let mirror;



function setupTHREE() {
  
  setupEdgeDetection();
  
  pointCloud = getPoints();
  scene.add(pointCloud);

  params = {
    drawCount: PARTICLES_NUMBER
  };
  let guiFolder = gui.addFolder("DrawCount");
  guiFolder
    .add(params, "drawCount")
    .min(0)
    .max(PARTICLES_NUMBER)
    .step(1)
    .listen();
  
  poseNet = ml5.poseNet(capture, modelLoaded);
  poseNet.on('pose', gotPoses);
  
  const ambiLight = new THREE.AmbientLight( 0x333333 );
  scene.add( ambiLight );

  
  for (let i=0; i<5; i++) {
    let tempTargetBox = getBox();
    tempTargetBox.material.color.set(0xFF00FF);
    tempTargetBox.scale.set(5, 5, 5);
    scene.add(tempTargetBox);
    targets.push(tempTargetBox);
    
    let tempLight = new Light();
    tempLight.setPosition(0, 0, 0);
    tempLight.light.target = tempTargetBox;
    tempLight.mesh.rotation.z = random(PI/6, PI/6*5);
    // let scale = random(1, 10);
    // tempLight.mesh.scale.set(10, 10, 5);
    lights.push(tempLight);
    
    tempTargetBox.visible = false;
  }
  
  
  
//   const rectLight1 = new THREE.RectAreaLight( 0xff0000, 5, 4, 10 );
//   rectLight1.position.set( - 5, 5, 5 );
//   scene.add( rectLight1 );
  
  // scene.add( new RectAreaLightHelper( rectLight1 ) );
  
  
 
  mirror = getPlane();
	mirror.position.set(0,-50,50);
  mirror.rotation.x = PI / 2;
	scene.add(mirror);	
  
  
}

function updateTHREE() {
  
  // fog
  scene.fog = new THREE.Fog(COLOR_BG, params.near, params.far);
  
  // colors
  rgba_array = displayEdgeDetection(0, 0, 1.0);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let idx = x + y * WIDTH;
      let r = rgba_array[idx * 4];
      let g = rgba_array[idx * 4 + 1];
      let b = rgba_array[idx * 4 + 2];
      
      if (r == 255 && particles.length < PARTICLES_NUMBER) {
        if (random(1) < 0.2) {
          let adj = 1.0;
          let tParticle = new Particle()
            .setPosition((-x + WIDTH / 2) * adj, (-y + HEIGHT / 2) * adj, 0)
            .setVelocity(
              random(-0.1, 0.1),
              random(-0.3, 0.0),
              random(-0.1, 0.1)
            );
          particles.push(tParticle);
        }
      }
    }
  }

  // // update the particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.flow();
    p.move();
    p.adjustVelocity(-0.005);
    p.rotate();
    p.age();
    // remove the particle
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }

  // console.log(particles.length);

  // update the vertices of the points
  let posArray = pointCloud.geometry.attributes.position.array;
  let clrArray = pointCloud.geometry.attributes.color.array;
  
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    let index = i * 3;
    posArray[index + 0] = p.pos.x;
    posArray[index + 1] = p.pos.y + 50;
    posArray[index + 2] = p.pos.z;

    // clrArray[index + 0] = random(1.0); //p.clr.r;
    // clrArray[index + 1] = random(1.0);
    // clrArray[index + 2] = random(1.0);
    
    clrArray[index + 0] = 1.0; //p.clr.r;
    clrArray[index + 1] = 1.0;
    clrArray[index + 2] = 1.0;    
    
  }
  pointCloud.geometry.setDrawRange(0, particles.length);
  pointCloud.geometry.attributes.position.needsUpdate = true;
  pointCloud.geometry.attributes.color.needsUpdate = true;


  params.drawCount = particles.length;
  
  if (pose) {
    poseArray = [pose.nose, pose.leftShoulder, pose.leftKnee, pose.rightShoulder, pose.rightKnee];
    
    for (let i=0; i<lights.length; i++) {
      targets[i].position.x = 50 - poseArray[i].x;
      
      lights[i].pos.x = 50 - poseArray[i].x;
      lights[i].pos.y = 150 - poseArray[i].y;
      lights[i].update();
    }
  }

  
  let planePosArray = mirror.geometry.attributes.position.array;
  for (let i = 0; i < planePosArray.length; i += 3) {
    let x = planePosArray[i + 0];
    let y = planePosArray[i + 1];
    let z = planePosArray[i + 2];

    let xOffset = (x + WORLD_HALF_SIZE) * 0.02 + frame * 0.01;
    let yOffset = (y + WORLD_HALF_SIZE) * 0.02 + frame * 0.01;

    // let xOffset = (x + WORLD_HALF_SIZE) * 0.01;
    // let yOffset = (y + WORLD_HALF_SIZE) * 0.01;
    let amp = 5;

    planePosArray[i + 2] = (noise(xOffset, yOffset) * amp) ** 3;
  }
  mirror.geometry.attributes.position.needsUpdate = true;

}

// edge detection

function setupEdgeDetection() {
  capture = createCapture(VIDEO);
  capture.elt.setAttribute("playsinline", "");
  //createCanvas(w, h);
  capture.size(WIDTH, HEIGHT);
  capture.hide();
  buffer = new jsfeat.matrix_t(WIDTH, HEIGHT, jsfeat.U8C1_t);
}

function jsfeatToP5(src, dst) {
  if (!dst || dst.width != src.cols || dst.height != src.rows) {
    dst = createImage(src.cols, src.rows);
  }
  var n = src.data.length;
  dst.loadPixels();
  var srcData = src.data;
  var dstData = dst.pixels;
  for (var i = 0, j = 0; i < n; i++) {
    var cur = srcData[i];
    dstData[j++] = cur;
    dstData[j++] = cur;
    dstData[j++] = cur;
    dstData[j++] = 255;
  }
  dst.updatePixels();
  return dst;
}

function displayEdgeDetection(x, y, s) {
  push();
  translate(x, y);
  scale(s);

  image(capture, 0, 0, WIDTH, HEIGHT);

  capture.loadPixels();
  if (capture.pixels.length > 0) {
    // don't forget this!
    let blurSize = 15;
    let lowThreshold = 10;
    let highThreshold = 25;

    // blurSize = map(blurSize, 0, 100, 1, 12);
    // lowThreshold = map(lowThreshold, 0, 100, 0, 255);
    // highThreshold = map(highThreshold, 0, 100, 0, 255);

    jsfeat.imgproc.grayscale(capture.pixels, WIDTH, HEIGHT, buffer);
    jsfeat.imgproc.gaussian_blur(buffer, buffer, blurSize, 0);
    jsfeat.imgproc.canny(buffer, buffer, lowThreshold, highThreshold);
    var n = buffer.rows * buffer.cols;
    // uncomment the following lines to invert the image
    // for (var i = 0; i < n; i++) {
    //     buffer.data[i] = 255 - buffer.data[i];
    // }
    result = jsfeatToP5(buffer, result);
    image(result, 0, 0, 640, 480);

    return result.pixels;
  }

  pop();
}

function getPoints() {
  let vertices = [];
  
  for (let i = 0; i < PARTICLES_NUMBER * 3; i += 3) {
    vertices[i + 0] = 0;
    vertices[i + 1] = 0;
    vertices[i + 2] = 0;
  }
  

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(vertices, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    vertexColors: true,
    // map: texture,
    depthTest: false
    //blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  return points;
}


function getLight() {
  const light = new THREE.SpotLight( 0xffffff, 0.5, 150 );
  light.castShadow = true; // default false
  
  // const pointLightHelper = new THREE.PointLightHelper( light, 10 ); // sphere size
  //scene.add( pointLightHelper );
  
  //Set up shadow properties for the light
  light.shadow.mapSize.width = 1024; // default
  light.shadow.mapSize.height = 1024; // default
  
  // This works with PointLight!
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 200; // default
  light.shadow.camera.fov = 60;
  // const helper = new THREE.CameraHelper( light.shadow.camera );
  // scene.add( helper );
  
  return light;
}

function getSphere() {
  const geometry = new THREE.SphereGeometry(3, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getBox2() {
  const geometry = new THREE.BoxGeometry(30, 2, 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({
    //color: 0xffffff
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function getPlane() {
  const geometry = new THREE.PlaneGeometry(
    WORLD_HALF_SIZE * 2,
    WORLD_HALF_SIZE * 2,
    32
  );
  const material = new THREE.MeshPhongMaterial({
    //color: 0xffff00,
    // wireframe: true,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  //mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
}


class Light {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();
    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    this.rot = createVector();
    this.rotVel = createVector();
    this.rotAcc = createVector();
    
    this.mesh = getBox2();
    this.light = getLight();
    
    this.group = new THREE.Group();
    // this.group.add(this.mesh);
    this.group.add(this.light);
    
    scene.add(this.group);
  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setVelocity(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setRotationAngle(x, y, z) {
    this.rot = createVector(x, y, z);
    return this;
  }
  setRotationVelocity(x, y, z) {
    this.rotVel = createVector(x, y, z);
    return this;
  }
  setScale(w, h, d) {
    h = h === undefined ? w : h;
    d = d === undefined ? w : d;
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    return this;
  }
  setTranslation(x, y, z) {
    this.mesh.geometry.translate(x, y, z);
    return this;
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }
  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }
  update() {
    this.group.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.group.rotation.set(this.rot.x, this.rot.y, this.rot.z);
    this.group.scale.set(this.scl.x, this.scl.y, this.scl.z);
  }
}

class Particle {
  constructor() {
    this.pos = createVector();
    this.vel = createVector();
    this.acc = createVector();

    this.scl = createVector(1, 1, 1);
    this.mass = this.scl.x * this.scl.y * this.scl.z;

    this.clr = new THREE.Color(1, 1, 1);

    this.rot = createVector();
    this.rotVel = createVector();
    this.rotAcc = createVector();

    this.lifespan = 1.0;
    this.lifeReduction = random(0.02, 0.08);
    // this.lifeReduction = random(0.005, 0.02);
    this.isDone = false;
  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  setVelocity(x, y, z) {
    this.vel = createVector(x, y, z);
    return this;
  }
  setRotationAngle(x, y, z) {
    this.rot = createVector(x, y, z);
    return this;
  }
  setRotationVelocity(x, y, z) {
    this.rotVel = createVector(x, y, z);
    return this;
  }
  setScale(w, h, d) {
    h = h === undefined ? w : h;
    d = d === undefined ? w : d;
    const minScale = 0.01;
    if (w < minScale) w = minScale;
    if (h < minScale) h = minScale;
    if (d < minScale) d = minScale;
    this.scl = createVector(w, h, d);
    this.mass = this.scl.x * this.scl.y * this.scl.z;
    return this;
  }
  setColor(r, g, b) {
    this.clr = new THREE.Color(r, g, b);
  }
  move() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  adjustVelocity(amount) {
    this.vel.mult(1 + amount);
  }
  rotate() {
    this.rotVel.add(this.rotAcc);
    this.rot.add(this.rotVel);
    this.rotAcc.mult(0);
  }
  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }
  reappear() {
    if (this.pos.z > WORLD_SIZE / 2) {
      this.pos.z = -WORLD_SIZE / 2;
    }
  }
  disappear() {
    if (this.pos.z > WORLD_SIZE / 2) {
      this.isDone = true;
    }
  }
  age() {
    this.lifespan -= this.lifeReduction;
    if (this.lifespan <= 0) {
      this.lifespan = 0;
      this.isDone = true;
    }
  }
  attractedTo(x, y, z) {
    let target = new p5.Vector(x, y, z);
    let force = p5.Vector.sub(target, this.pos);
    if (force.mag() < 100) {
      force.mult(-0.002 * random(1, 5));
    } else {
      force.mult(0.0001);
    }
    this.applyForce(force);
  }
  isWhite() {
    return this.clr.r == 1;
  }
  flow() {
    let xFreq = this.pos.x * 0.5 + frame * 0.5;
    let yFreq = this.pos.y * 0.5 + frame * 0.5;
    let zFreq = this.pos.z * 0.5 + frame * 0.5;
    let noiseValue = map(noise(xFreq, yFreq, zFreq), 0.0, 1.0, -1.0, 1.0);
    let force = new p5.Vector(cos(frame * 0.005), sin(frame * 0.005), sin(frame * 0.002));
    force.normalize();
    force.mult(noiseValue * 0.01);
    this.applyForce(force);
  }
}


function modelLoaded() {
  console.log("PoseNet Ready");
}

function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}

///// p5.js /////

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("container-p5");
  canvas.hide();
  // background(50);
  
  capture = createCapture(VIDEO);
  capture.size(WIDTH, HEIGHT);
  capture.hide();


  initTHREE();
}

function draw() {
  // image(capture, 0, 0, WIDTH, HEIGHT);
  noLoop();
}

///// three.js /////

let container, stats, gui, params;
let scene, camera, renderer;
let time = 0;
let frame = 0;

function initTHREE() {
  // scene
  scene = new THREE.Scene();

  // camera (fov, ratio, near, far)
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.5,
    5000
  );
  camera.position.z = 100;

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor("#111111");
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  // container
  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);

  // controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  // gui
  // https://davidwalsh.name/dat-gui
  gui = new dat.gui.GUI();
  params = {
    near: 450,
    far: 500,
  };
  
  let guiFog = gui.addFolder("FOG");
  guiFog.add(params, "near", 1, 1000).step(1);
  guiFog.add(params, "far", 1, 1000).step(1);
  guiFog.open();

  // stats
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  container.appendChild(stats.dom);

  setupTHREE();

  // let's draw!
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  stats.update();
  time = performance.now();
  frame++;

  updateTHREE();

  render();
}

function render() {
  renderer.render(scene, camera);
}

// event listeners
window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* global
jsfeat
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
