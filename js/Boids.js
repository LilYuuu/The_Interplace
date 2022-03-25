class Boids {
  constructor(NbBoids, MaxPosition) {
    this.boids = [];
    for (let i = 0; i < NbBoids; i++) {
      this.boids[i] = {
        pos: new THREE.Vector3(
          random(-5 * MaxPosition.x, 5 * MaxPosition.x),
          random(-200, MaxPosition.y * 1.2),
          random(1500, 1520)
        ),
        vel: new THREE.Vector3(0, 0, 0)
      };
    }
    this.center = new THREE.Vector3();
  }

  // rule0: a boid move to center of boids.
  BoidRule0(move_index) {
    let center = new THREE.Vector3();
    for (let i = 0; i < this.boids.length; i++) {
      if (i != move_index) {
        center.add(this.boids[i].pos);
        this.center.add(this.boids[i].pos);
      }
    }
    center.divideScalar(this.boids.length - 1);
    this.center.divideScalar(this.boids.length - 1);

    // calculate offset using center position.
    const kDivisionNum = 100.0;
    center.sub(this.boids[move_index].pos);
    center.divideScalar(kDivisionNum);

    this.boids[move_index].vel.add(center);
  }

  // rule1: a boid keep the constant distance between the other boid.
  BoidRule1(move_index) {
    const kDistanceMin = 50;
    for (let i = 0; i < this.boids.length; i++) {
      if (i != move_index) {
        let distance = this.boids[i].pos.distanceTo(this.boids[move_index].pos);
        if (distance < kDistanceMin) {
          let diff = new THREE.Vector3();
          diff.subVectors(this.boids[i].pos, this.boids[move_index].pos);
          this.boids[move_index].vel.sub(diff);
        }
      }
    }
  }

  // rule2: a boid keep his velocity to mean velocity of boids
  BoidRule2(move_index) {
    let mean_velocity = new THREE.Vector3();
    for (let i = 0; i < this.boids.length; i++) {
      if (i != move_index) {
        mean_velocity.add(this.boids[i].vel);
      }
    }
    const kDivisionNum = 10.0;
    mean_velocity.divideScalar(this.boids.length - 1);
    let diff = new THREE.Vector3();
    diff.subVectors(mean_velocity, this.boids[move_index].vel);
    diff.divideScalar(kDivisionNum);
    this.boids[move_index].vel.add(diff);
  }

  MoveObjects(kMaxPosition) {
    for (let i = 0; i < this.boids.length; i++) {
      this.BoidRule0(i);
      this.BoidRule1(i);
      this.BoidRule2(i);

      //Limit speed
      let boid = this.boids[i];
      let speed = boid.vel.length();
      const kMaxSpeed = 4;
      if (speed > kMaxSpeed) {
        let r = kMaxSpeed / speed;
        boid.vel.multiplyScalar(r);
      }
      // Inverse velocity when out of screen.
      if (
        (this.boids[i].pos.x < -1 * kMaxPosition.x &&
          this.boids[i].vel.x < 0) ||
        (this.boids[i].pos.x > kMaxPosition.x && this.boids[i].vel.x > 0)
      )
        this.boids[i].vel.x *= -1;
      if (
        (this.boids[i].pos.y < 0 &&
          this.boids[i].vel.y < 0) ||
        (this.boids[i].pos.y > kMaxPosition.y && this.boids[i].vel.y > 0)
      )
        this.boids[i].vel.y *= -1;
      if (
        (this.boids[i].pos.z < -1 * kMaxPosition.z &&
          this.boids[i].vel.z < 0) ||
        (this.boids[i].pos.z > kMaxPosition.z && this.boids[i].vel.z > 0)
      )
        this.boids[i].vel.z *= -1;

      this.boids[i].pos.add(this.boids[i].vel);
    }
  }
}

/* global
WORLD_SIZE frame jsfeat
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/