let pointCloud_scene01;
let particles_scene01 = [];

function pushScene01() {
  console.log("scene01");
  for (let i = 0; i < MAX_PARTICLE_NUMBER/2; i++) {
    let tParticle = new Particle()
      // .setPosition(random(-WORLD_SIZE / 2, WORLD_SIZE / 2), random(-WORLD_SIZE / 2, WORLD_SIZE / 2), random(-WORLD_SIZE / 2, WORLD_SIZE / 2))
      .setPosition(0, 0, 0)
      .setVelocity(random(-0.5, 0.5), random(-0.5, 0.5), random(-0.5, 0.5))
    particles_scene01.push(tParticle);
  }
  
  pointCloud_scene01 = getPoints(particles_scene01);
  scene.add(pointCloud_scene01);
  group.add(pointCloud_scene01);
  
  if (part2_start) {
    group.position.set(-300, 100, -2300);  
  } else {
    group.position.set(-1300, 100, -2300);
  }
}

function updateScene01() {
  for (let i = 0; i < particles_scene01.length; i++) {
    let p = particles_scene01[i];
    p.attractedTo(0, 0, 0);
    p.move();
    p.adjustVelocity(-0.005);
  }

  // then update the points
  let positionArray = pointCloud_scene01.geometry.attributes.position.array;
  let clrArray = pointCloud_scene01.geometry.attributes.color.array;
  for (let i = 0; i < particles_scene01.length; i++) {
    let p = particles_scene01[i];
    let ptIndex = i * 3;
    positionArray[ptIndex + 0] = p.pos.x;
    positionArray[ptIndex + 1] = p.pos.y;
    positionArray[ptIndex + 2] = p.pos.z;
    
    let r = map(i, 0, particles_scene01.length, 0, 1.0);
    let g = map(i, 0, particles_scene01.length, 1.0, 0);
    let b = map(i, 0, particles_scene01.length, 1.0, 0);
    
    // let r = abs(sin(noise(frame ** 0.04) * 0.4));
    // let g = abs(sin(noise(frame ** 0.05)));
    // let b = abs(cos(noise(frame * 0.08) * 0.8));
    
    // if (frame % 3 == 0) {
      // clrArray[ptIndex + 0] = r;
      // clrArray[ptIndex + 1] = g;
      // clrArray[ptIndex + 2] = b;
    // } else if (frame % 3 == 1) {
    //   clrArray[ptIndex + 0] = r;
    //   clrArray[ptIndex + 1] = g;
    // } else if (frame % 3 == 2) {
    //   clrArray[ptIndex + 1] = g;
    //   clrArray[ptIndex + 2] = b;
    // }
    
  }
  //https://threejs.org/docs/#manual/en/introduction/How-to-update-things
  // pointCloud_scene01.geometry.setDrawRange(0, params.drawCount);
  pointCloud_scene01.geometry.attributes.position.needsUpdate = true; // ***
  pointCloud_scene01.geometry.attributes.color.needsUpdate = true;
}

/* global
MAX_PARTICLE_NUMBER particles_scene01 pointCloud_scene01 scene group getPoints Particle part2_start
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
