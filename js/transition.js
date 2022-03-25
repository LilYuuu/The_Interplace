let start_transition = false;
let pointCloud_transition;
let particles_transition = [];

function addTransition() {
  for (let i=0; i<150; i++) {
    let temp_x1 = random(0, 50);
    let temp_y1 = line1(temp_x1);
    let p1 = new Particle().setPosition(temp_x1, temp_y1, random(400, 800)).setVelocity(0, 0, 0.7);
    particles_transition.push(p1);
    
    let temp_x2 = random(-50, 0);
    let temp_y2 = line2(temp_x2);
    let p2 = new Particle().setPosition(temp_x2, temp_y2, random(400, 800)).setVelocity(0, 0, 0.7);
    particles_transition.push(p2);
    
    let temp_x3 = random(-50, 50);
    let temp_y3 = -30;
    let p3 = new Particle().setPosition(temp_x3, temp_y3, random(400, 800)).setVelocity(0, 0, 0.7);
    particles_transition.push(p3);
    
    let temp_x4 = random(0, 15);
    let temp_y4 = line3(temp_x4);
    let p4 = new Particle().setPosition(temp_x4, temp_y4, random(400, 800)).setVelocity(0, 0, 0.7);
    particles_transition.push(p4);
    
    let temp_x5 = random(-15, 0);
    let temp_y5 = line4(temp_x5);
    let p5 = new Particle().setPosition(temp_x5, temp_y5, random(400, 800)).setVelocity(0, 0, 0.7);
    particles_transition.push(p5);
    
    let temp_x6 = random(-15, 15);
    let temp_y6 = 18;
    let p6 = new Particle().setPosition(temp_x6, temp_y6, random(400, 800)).setVelocity(0, 0, 0.7);
    particles_transition.push(p6);
  }
  
  pointCloud_transition = getPointsWithObjects(particles_transition);
  pointCloud_transition.material.size = 1;
  scene.add(pointCloud_transition);
  
  start_transition = false;
}

function updateTransition() {
  // console.log("update transition");
  if (frame % 3 == 0) {
    for (let i=0; i<100; i++) {
      let temp_x1 = random(0, 50);
      let temp_y1 = line1(temp_x1);
      let p1 = new Particle().setPosition(temp_x1, temp_y1, random(400, 800)).setVelocity(0, 0, 0.9);
      particles_transition.push(p1);

      let temp_x2 = random(-50, 0);
      let temp_y2 = line2(temp_x2);
      let p2 = new Particle().setPosition(temp_x2, temp_y2, random(400, 800)).setVelocity(0, 0, 0.9);
      particles_transition.push(p2);

      let temp_x3 = random(-50, 50);
      let temp_y3 = -30;
      let p3 = new Particle().setPosition(temp_x3, temp_y3, random(400, 800)).setVelocity(0, 0, 0.9);
      particles_transition.push(p3);
      
      let temp_x4 = random(0, 15);
      let temp_y4 = line3(temp_x4);
      let p4 = new Particle().setPosition(temp_x4, temp_y4, random(400, 800)).setVelocity(0, 0, 0.9);
      particles_transition.push(p4);

      let temp_x5 = random(-15, 0);
      let temp_y5 = line4(temp_x5);
      let p5 = new Particle().setPosition(temp_x5, temp_y5, random(400, 800)).setVelocity(0, 0, 0.9);
      particles_transition.push(p5);

      let temp_x6 = random(-15, 15);
      let temp_y6 = 18;
      let p6 = new Particle().setPosition(temp_x6, temp_y6, random(400, 800)).setVelocity(0, 0, 0.9);
      particles_transition.push(p6);
    }
  }
  
  for (let i = 0; i < particles_transition.length; i++) {
    let p = particles_transition[i];
    p.move();
    p.age();
    if (p.isDone) {
      particles_transition.splice(i, 1);
      i--;
    }
  }

  // then update the points
  let positionArray = pointCloud_transition.geometry.attributes.position.array;
  for (let i = 0; i < particles_transition.length; i++) {
    let p = particles_transition[i];
    let ptIndex = i * 3;
    positionArray[ptIndex + 0] = p.pos.x;
    positionArray[ptIndex + 1] = p.pos.y;
    positionArray[ptIndex + 2] = p.pos.z;
  }
  //https://threejs.org/docs/#manual/en/introduction/How-to-update-things
  // pointCloud_transition.geometry.setDrawRange(0, params.drawCount);
  pointCloud_transition.geometry.attributes.position.needsUpdate = true;
}

function removeTransition() {
  scene.remove(pointCloud_transition);

  for (let i=0; i<particles_transition.length; i++) {
    particles_transition.splice(i, 1);
    i--;
  }
}

function line1(x) {
  let y1 = (-30 - 60) / 50 * x + 60;
  return y1;
}
  
function line2(x) {
  let y2 = (-30 - 60) / (-50) * x + 60;
  return y2;
}

function line3(x) {
  let y3 = (-15 - 15) / (0 - 15) * x - 15;
  return y3;
}

function line4(x) {
  let y4 = (-15 - 15) / (0 - (-15)) * x - 15;
  return y4;
}

/* global
Particle particles_transition pointCloud_transition getPointsWithObjects scene frame start_transition
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
