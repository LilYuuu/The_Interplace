///// p5.js /////
const PARTICLE_SCALE = 500;
const RESOLUTION_MIN = 2;
const RESOLUTION_MAX = 4;
const WIDTH = 240;
const HEIGHT = 180;

let capture;
let pcapture;
let diffImg;

let buffer;
let result;

function setup() {
  let canvas = createCanvas(320, 240);
  canvas.parent("container-p5");
  canvas.hide();
  background(50);

  //setupEdgeDetection();
  setupDiffPixels();

  initTHREE();
}

function draw() {
  //background(0);
  //updateDiffPixels();
  //image(diffImg, 0, 0);
}

function setupDiffPixels() {
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();
  pcapture = createImage(320, 240);
  diffImg = createImage(320, 240);
}

function updateDiffPixels() {
  capture.loadPixels();
  pcapture.loadPixels();
  diffImg.loadPixels();
  let w = capture.width;
  let h = capture.height;
  for (let y = 0; y < h; y += int(random(RESOLUTION_MIN, RESOLUTION_MAX))) {
    for (let x = 0; x < w; x += int(random(RESOLUTION_MIN, RESOLUTION_MAX))) {
      let index = (x + y * w) * 4;
      // currrent pixels
      let cr = capture.pixels[index + 0];
      let cg = capture.pixels[index + 1];
      let cb = capture.pixels[index + 2];
      // previous pixels
      let pr = pcapture.pixels[index + 0];
      let pg = pcapture.pixels[index + 1];
      let pb = pcapture.pixels[index + 2];
      //
      let r = abs(cr - pr);
      let g = abs(cr - pr);
      let b = abs(cr - pr);

      let adj = 3.0;
      diffImg.pixels[index + 0] = constrain(r * adj, 0, 255);
      diffImg.pixels[index + 1] = constrain(g * adj, 0, 255);
      diffImg.pixels[index + 2] = constrain(b * adj, 0, 255);
      diffImg.pixels[index + 3] = 255;
    }
  }
  diffImg.updatePixels();

  // prev capture
  pcapture.copy(capture, 0, 0, w, h, 0, 0, w, h);
}

function generateParticlesFromDiffPixels() {
  capture.loadPixels();
  pcapture.loadPixels();
  let w = capture.width;
  let h = capture.height;
  for (let y = 0; y < h; y += int(random(RESOLUTION_MIN, RESOLUTION_MAX))) {
    for (let x = 0; x < w; x += int(random(RESOLUTION_MIN, RESOLUTION_MAX))) {
      let index = (x + y * w) * 4;
      // currrent pixels
      let cr = capture.pixels[index + 0];
      let cg = capture.pixels[index + 1];
      let cb = capture.pixels[index + 2];
      // previous pixels
      let pr = pcapture.pixels[index + 0];
      let pg = pcapture.pixels[index + 1];
      let pb = pcapture.pixels[index + 2];
      //
      let r = abs(cr - pr);
      let g = abs(cr - pr);
      let b = abs(cr - pr);

      let sum = r + g + b;
      if (sum > 100 && particles.length < PARTICLES_NUMBER) {
        let px = map(x, 0, w, 1.0, -1.0) * PARTICLE_SCALE;
        let py = map(y, 0, w, 1.0, -1.0) * PARTICLE_SCALE;
        let pz = random(-1, 1) * 50;
        let tParticle = new Particle().setPosition(px, py, pz).setVelocity(
          random(-0.5, 0.5),
          random(1.0, 3.0),
          random(-2.0, -0.5)
        );
        //tParticle.viewY = tParticle.pos.y - PARTICLE_SCALE * 0.2;
        particles.push(tParticle);
      }
    }
  }

  // prev capture
  pcapture.copy(capture, 0, 0, w, h, 0, 0, w, h);
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

    jsfeat.diffImgproc.grayscale(capture.pixels, WIDTH, HEIGHT, buffer);
    jsfeat.diffImgproc.gaussian_blur(buffer, buffer, blurSize, 0);
    jsfeat.diffImgproc.canny(buffer, buffer, lowThreshold, highThreshold);
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

function updateEdgeDetection() {
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
            .setPosition(
              (-x + WIDTH / 2) * adj,
              (-y + HEIGHT / 2) * adj,
              random(-40, 40)
            )
            .setVelocity(
              random(-0.1, 0.1),
              random(0.0, 0.3),
              random(-0.1, 0.1)
            );
          particles.push(tParticle);
        }
      }
    }
  }
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

/* global
PARTICLES_NUMBER Particle particles initTHREE WIDTH HEIGHT jsfeat rgba_array
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan creatediffImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
