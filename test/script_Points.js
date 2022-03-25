const WORLD_SIZE = 1000;

let capture;
let buffer;
let result;
let w = 160, h = 120;

let rgba_matrix;
let position_matrix = [];
// let color = new THREE.Color();
let color_matrix = [];
let points;

let particles = [];

function setupTHREE() {

  setupEdgeDetection();
  
  points = getPoints();

  for (let i = 1; i < h + 1; i++) {
    for (let j = 1; j < w + 1; j++) {
      let p = new Particle().setPosition(j, i, random(-5, 5));
      particles.push(p);
      // position_matrix.push(p.pos.x, p.pos.y, p.pos.z);
      color_matrix.push( p.color.r, p.color.g, p.color.b );
      position_matrix.push(j, i, random(-5, 5));
      // color.setRGB( 0, 0, 0 );
    }
  }
    
  points.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position_matrix, 3 ) );
  points.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( color_matrix, 3 ) );
  scene.add( points );
}

function updateTHREE() {
  
  // for (let i=0; i<particles.length; i++) {
  //   let p = particles[i];
  //   p.move();
  // }
  
  points.geometry.attributes.color.needsUpdate = true;

  // colors
  rgba_matrix = displayEdgeDetection(-60, -50, 0.5);
    
  let new_color_matrix = [];
  
  for (let i = rgba_matrix.length - 4; i > -1; i-=4) {

    let r = rgba_matrix[i];
    let g = rgba_matrix[i + 1];
    let b = rgba_matrix[i + 2];
    
    let new_color = new THREE.Color();
    
    new_color.setRGB(r, g, b);
    new_color_matrix.push(new_color.r, new_color.g, new_color.b);

  }
  
  points.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( new_color_matrix, 3 ) );
  

}

function getPoints() {
  
  let geometry = new THREE.BufferGeometry();
  let material = new THREE.PointsMaterial({
    // color: 0x000000,
    vertexColors: true
  });

  let points = new THREE.Points( geometry, material );

  return points;
}

// edge detection

function setupEdgeDetection() {
  capture = createCapture(VIDEO);
  capture.elt.setAttribute("playsinline", "");
  //createCanvas(w, h);
  capture.size(w, h);
  capture.hide();
  buffer = new jsfeat.matrix_t(w, h, jsfeat.U8C1_t);
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

  image(capture, 0, 0, 160, 120);
  capture.loadPixels();
  if (capture.pixels.length > 0) {
    // don't forget this!
    let blurSize = 50;
    let lowThreshold = 10;
    let highThreshold = 25;

    // blurSize = map(blurSize, 0, 100, 1, 12);
    // lowThreshold = map(lowThreshold, 0, 100, 0, 255);
    // highThreshold = map(highThreshold, 0, 100, 0, 255);

    jsfeat.imgproc.grayscale(capture.pixels, w, h, buffer);
    jsfeat.imgproc.gaussian_blur(buffer, buffer, blurSize, 0);
    jsfeat.imgproc.canny(buffer, buffer, lowThreshold, highThreshold);
    var n = buffer.rows * buffer.cols;
    // uncomment the following lines to invert the image
    // for (var i = 0; i < n; i++) {
    //     buffer.data[i] = 255 - buffer.data[i];
    // }
    result = jsfeatToP5(buffer, result);
    // image(result, 0, 0, 640, 480);
    
    return result.pixels;
  }

  pop();
}

class Particle {
  constructor() {
    this.pos = createVector();
    this.color = new THREE.Color().setRGB(0, 0, 0);
    // this.vel = createVector();
    // this.acc = createVector();
    // this.scl = createVector(1, 1, 1);
  }
  setPosition(x, y, z) {
    this.pos = createVector(x, y, z);
    return this;
  }
  move() {
    let sinValue = sin(renderer.info.render.frame * 0.05);
    this.pos.z = sinValue * 200;
  }
  update() {
    // this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    // this.vel.add(this.acc);
    // this.pos.add(this.vel);
    // this.acc.mult(0);
  }
}

///// p5.js /////

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("container-p5");
  canvas.hide();
  background(50);

  initTHREE();
}

function draw() {
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
  renderer.setClearColor("#333333");
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
  params = {
    // rotation: 0.25,
    R: 1,
    G: 1,
    B: 1
  };
  
  // gui.add(params, "rotation", 0, 1).step(0.01).listen();
  // let colors_folder = gui.addFolder("Colors");
  // colors_folder.add(params, "R", 0, 1).step(0.01).listen();
  // colors_folder.add(params, "G", 0, 1).step(0.01).listen();
  // colors_folder.add(params, "B", 0, 1).step(0.01).listen();
  // colors_folder.open();

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
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* global
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
