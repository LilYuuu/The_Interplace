let ring;
let texture;
let whale;
let pointCloud_scene03;
let particles_scene03 = [];

function pushScene03() {
  ring = getRing();
  ring.rotation.x = - PI/2;
  scene.add(ring);
  group.add(ring);
  
  group.position.set(-1300, -50, -1600);
  group.rotation.y = PI / 4;
  
  texture = new THREE.TextureLoader().load(
    "https://cdn.glitch.com/550f6519-569b-4223-a4b1-f8107e92a2d4%2Fterrain.png?v=1615210364174"
  );
 
  loadObject("https://cdn.glitch.com/da5fc998-cb4f-43fe-a32b-cb958561682b%2FWhale.obj?v=1620648948145");
}

function updateScene03() {
  let ringPosArray = ring.geometry.attributes.position.array;
  for (let i = 0; i < ringPosArray.length; i += 3) {
    let x = ringPosArray[i + 0];
    let y = ringPosArray[i + 1];
    let z = ringPosArray[i + 2];

    let xOffset = (x + WORLD_HALF_SIZE) * 0.02 + frame * 0.004;
    let yOffset = (y + WORLD_HALF_SIZE) * 0.02 + frame * 0.004;

    // let xOffset = (x + WORLD_HALF_SIZE) * 0.01;
    // let yOffset = (y + WORLD_HALF_SIZE) * 0.01;
    let amp = 6;

    ringPosArray[i + 2] = (noise(xOffset, yOffset) * amp) ** 3;
  }
  ring.geometry.attributes.position.needsUpdate = true;
  
    // morphing
  /*let morph_freq = frame * 0.02;
  params.percentage = (abs(cos(morph_freq)) + 1) * 0.1;
  
  for (let p of particles_scene03) {
    p.updateLerp(params.percentage);
  }
  
  let posArray = pointCloud_scene03.geometry.attributes.position.array;
  for (let i = 0; i< particles_scene03.length; i++) {
    let p = particles_scene03[i];
    let index = i * 3;
    posArray[index + 0] = p.pos.x;
    posArray[index + 1] = p.pos.y + 50;
    posArray[index + 2] = p.pos.z;
  }
  pointCloud_scene03.geometry.attributes.position.needsUpdate = true;*/
}

function loadObject(filepath) {
  // load .obj file
  const loader = new THREE.OBJLoader(); // NOT! THREE.ObjectLoader();

  loader.load(
    // resource URL
    filepath,
    // onLoad callback

    // Here the loaded data is assumed to be an object
    function(obj) {
      // Add the loaded object to the scene
      whale = obj;
      for (let child of whale.children) {
        //child.material = new THREE.MeshBasicMaterial();
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00FF00,
          wireframe: true
        });
        // child.rotation.y += PI/2;
      }
      // whale.children[0].rotation.y += PI / 2;
      
      //scene.add(whale);
      
      // console.log(whale.children[0].geometry.attributes.position.array);
      let posArray = whale.children[0].geometry.attributes.position.array;
      
      pointCloud_scene03 = getPoints_scene03(posArray);
      scene.add(pointCloud_scene03);
      group.add(pointCloud_scene03);
    },

    // onProgress callback
    function(xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function(err) {
      console.error('An error happened');
    }
  );
}

function getPoints_scene03(posArray) {
  
  let vertices = [];
  let scaleAdj = 100.0;
  for (let p of posArray) {
    vertices.push( p * scaleAdj );
  }
  
  // let's construct the particles
  for (let i=0; i<posArray.length; i+=3) {
    let x = posArray[i + 0];
    let y = posArray[i + 1];
    let z = posArray[i + 2];
    particles_scene03.push( new Particle_scene03(0, 0, 0, x * scaleAdj, y * scaleAdj, z * scaleAdj) );
  }
  
  // geometry
  const geometry = new THREE.BufferGeometry();
  // attributes
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices, 3));
  // geometry
  const texture = new THREE.TextureLoader().load(
    "https://cdn.glitch.com/6d967e98-4001-4b95-a1e3-3a52daacd19c%2Fparticle_texture.jpg?v=1615805765774"
  );
  const material = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 1,
    //vertexColors: true,
    depthTest: false,
    // blending: THREE.AdditiveBlending,
    // map: texture
  });
  // Points
  const points = new THREE.Points(geometry, material);
  return points;
}

function getRing() {
  // const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 64, 64);
  const geometry = new THREE.RingGeometry( WORLD_HALF_SIZE, 2 * WORLD_HALF_SIZE, 96, 96 );
  const material = new THREE.MeshBasicMaterial({
    wireframe: true,
    //color: 0xffff00,
    // map: texture,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(geometry, material);
  return ring;
}

class Particle_scene03 {
  constructor(x1, y1, z1, x2, y2, z2) {
    this.originPos = createVector(x1, y1, z1);
    this.targetPos = createVector(x2, y2, z2);
    this.pos = this.originPos.copy();
  }
  updateLerp(pct) {
    this.pos = p5.Vector.lerp(this.originPos, this.targetPos, pct);
  }
}

/* global
WORLD_HALF_SIZE ring scene whale group getPoints pointCloud_scene03 particles_scene03 params frame
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/