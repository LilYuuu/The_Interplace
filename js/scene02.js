let cubes = [];

function pushScene02() {
  for (let x = -400; x < 400; x += 100) {
    for (let z = -800; z < 0; z += 100) {
      let c = new Cube(
          random(30, 100),
          random(30, 100),
          random(30, 100),
          x + random(-30, 30),
          random(-50, 50),
          z + random(-30, 30)
        );
      
      cubes.push(c);
      group.add(c.cube);
     
    }
  }
   group.position.set(-1300, 70, -1200);
}

function updateScene02() {
  // console.log("02update");
  for (let i=0; i<cubes.length; i++) {
    let c = cubes[i];
    c.userControl();
  }
}

function getBox(sx, sy, sz, px, py, pz) {
  // let geometry = new THREE.BoxGeometry(sx, sy, sz, 10, 10, 10);
  const geometry = new THREE.ConeGeometry(sx, sy, sz);
  let material = new THREE.MeshNormalMaterial();
  let mesh = new THREE.Mesh(geometry, material);
  let vertices = mesh.geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i] += px;
    vertices[i + 1] += py;
    vertices[i + 2] += pz;
  }
  const ptgeo = new THREE.BufferGeometry();
  ptgeo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  const texture = new THREE.TextureLoader().load(
    "https://cdn.glitch.com/5b4962fa-3aa0-4836-b7b7-e7af5bfbfae2%2Fparticle_texture.jpg?v=1618725204955"
  );
  const ptmat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: random(1, 5),
    sizeAttenuation: true,
    opacity: 0.8,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    map: texture
  });
  const points = new THREE.Points(ptgeo, ptmat);
  const attributes = [sx, sy, sz, px, py, pz];
  return points;
}


class Cube {
  constructor(sx, sy, sz, px, py, pz) {
    this.cube = getBox(sx, sy, sz, px, py, pz);
    scene.add(this.cube);
    this.attri = [sx, sy, sz, px, py, pz];
    this.diffRate = 0.01;
    // console.log(this.diffRate);
  }

  autoControl() {
    let positionArray = this.cube.geometry.attributes.position.array;
    for (let i = 0; i < positionArray.length; i += 3) {
      let xFreq = frame ** 0.005;
      let zFreq = frame ** 0.01;
      let noiseValue = map(noise(xFreq, zFreq, i * 0.0005), 0, 1, -1, 1);
      let diff = this.attri[1] * sin((this.attri[0] * xFreq + this.attri[2] * zFreq) * 500 * noiseValue);
      positionArray[i + 1] += this.diffRate * diff;
    }
    this.cube.geometry.attributes.position.needsUpdate = true;
  }

  userControl() {
    // this.diffRate = params.amplitude;
    this.diffRate = map(cos(frame * 0.1), -1, 1, 0.005, 0.02);
    let positionArray = this.cube.geometry.attributes.position.array;
    for (let i = 0; i < positionArray.length; i += 3) {
      let xFreq = frame ** 0.005;
      let zFreq = frame ** 0.01;
      let noiseValue = map(noise(xFreq, zFreq, random(positionArray.length) * 0.00005), 0, 1, -1, 1);
      let diff = this.attri[1] * sin((this.attri[0] * xFreq + this.attri[2] * zFreq) * 500 * noiseValue);
      positionArray[i + 1] += this.diffRate * diff;
      // positionArray[i + 0] += random(-0.5, 0.5);
      // positionArray[i + 2] += params.VelZ;
    }
    // this.cube.material.color.r = abs(cos(noise(frame * 0.01)));
    // this.cube.material.color.g = abs(sin(noise(frame * 0.01)));
    // this.cube.material.color.b = abs(sin(noise(frame * 0.01)));

    this.cube.geometry.attributes.position.needsUpdate = true;
  }
}

/* global
scene frame Cube cubes group
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/