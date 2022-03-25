const WORLD_SIZE = 300;
//const PARTICLES_NUMBER = WIDTH * HEIGHT;
const PARTICLES_NUMBER = 20000;

let pointCloud;
let particles = [];
let particleIndex = 0;
let rgba_array;

let plane;
let avatar_light;
let avatar_light_intensity = 0.0;

function setupTHREE() {
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

  plane = getPlane();
  plane.position.set(0, -50, 50);
  plane.rotation.x = PI / 2;
  scene.add(plane);

  avatar_light = new PointLight(avatar_light_intensity).setPosition(60, 1000, 1000);;
}

function updateTHREE() {
  // EdgeDetection
  //updateEdgeDetection();
  
  // Plane
  let planePosArray = plane.geometry.attributes.position.array;
  for (let i = 0; i < planePosArray.length; i += 3) {
    let x = planePosArray[i + 0];
    let y = planePosArray[i + 1];
    let z = planePosArray[i + 2];

    let xOffset = (x + WORLD_SIZE) * 0.02 + frame * 0.01;
    let yOffset = (y + WORLD_SIZE) * 0.02 + frame * 0.01;

    // let xOffset = (x + WORLD_HALF_SIZE) * 0.01;
    // let yOffset = (y + WORLD_HALF_SIZE) * 0.01;
    let amp = 3;

    planePosArray[i + 2] = (noise(xOffset, yOffset) * amp) ** 3;
  }
  plane.geometry.attributes.position.needsUpdate = true;

  ///// PARTICLES /////
  generateParticlesFromDiffPixels();

  // update the particles
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    //p.flow();
    //p.float();
    p.move();
    p.age();
    // remove the particle
    if (p.isDone) {
      particles.splice(i, 1);
      i--;
    }
  }

  // update the vertices of the points
  let posArray = pointCloud.geometry.attributes.position.array;
  let clrArray = pointCloud.geometry.attributes.color.array;

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    let index = i * 3;
    posArray[index + 0] = p.pos.x;
    posArray[index + 1] = p.pos.y; //p.viewY;
    posArray[index + 2] = p.pos.z;

    clrArray[index + 0] = p.lifespan;
    clrArray[index + 1] = p.lifespan;
    clrArray[index + 2] = p.lifespan;
  }
  pointCloud.geometry.setDrawRange(0, particles.length);
  pointCloud.geometry.attributes.position.needsUpdate = true;
  pointCloud.geometry.attributes.color.needsUpdate = true;
  
  // Avatar Light
  if (particles.length > 0) {
    let temp_sum = 0;
    for (let p of particles) {
      temp_sum += p.pos.x;
    }
    let diffImgCenter = temp_sum / particles.length;
    avatar_light.setPosition(diffImgCenter, 100, 1000);
    
    avatar_light_intensity = map(particles.length, 0, 15000, 0.0, 1.0);
    avatar_light.setIntensity(avatar_light_intensity);
    
    avatar_light.update();
  }
 

  params.drawCount = particles.length;
}

function getPlane() {
  const geometry = new THREE.PlaneGeometry(
    WORLD_SIZE * 50,
    WORLD_SIZE * 50,
    64,
    64
  );
  const material = new THREE.MeshPhongMaterial({
    // wireframe: true,
    color: 0xffffff,
    // map: texture,
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(geometry, material);
  return plane;
}

function getPointLight(intensity) {
  const light = new THREE.PointLight( 0xffffff, intensity, 500 );
  light.castShadow = true; // default false
  
  // const pointLightHelper = new THREE.PointLightHelper( light, 10 ); // sphere size
  //scene.add( pointLightHelper );
  
  //Set up shadow properties for the light
  light.shadow.mapSize.width = 1024; // default
  light.shadow.mapSize.height = 1024; // default
  
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

function getPoints() {
  let vertices = [];
  let colors = [];
  for (let i = 0; i < PARTICLES_NUMBER * 3; i += 3) {
    //vertices[i + 0] = 0;
    //vertices[i + 1] = 0;
    //vertices[i + 2] = 0;
    vertices.push(0, 0, 0);
    colors.push(1.0, 1.0, 1.0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const texture = new THREE.TextureLoader().load(
    "https://cdn.glitch.com/5b4962fa-3aa0-4836-b7b7-e7af5bfbfae2%2Fparticle_texture.jpg?v=1618725204955"
  );
  const material = new THREE.PointsMaterial({
    //color: 0xffffff,
    vertexColors: true,
    size: 15,
    sizeAttenuation: true,
    opacity: 0.8,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    map: texture
  });

  const points = new THREE.Points(geometry, material);
  return points;
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

  // container
  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);

  // controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  // gui
  // https://davidwalsh.name/dat-gui
  gui = new dat.gui.GUI();

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
generateParticlesFromDiffPixels diffImg jsfeat displayEdgeDetection Particle PointLight
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
