const WORLD_SIZE = 1000;
const WORLD_HALF_SIZE = 200;
//const PARTICLES_NUMBER = WIDTH * HEIGHT;
const PARTICLES_NUMBER = 20000;
const MAX_PARTICLE_NUMBER = 10000;
const COLOR_BG = 0x000000;

let pointCloud;
let particles = [];
let particleIndex = 0;
let rgba_array;

let plane;
let avatar_light;
let avatar_light_intensity = 0.0;

let nb_spirits_gone = 0;

// spirits
let pointCloud_list_spirits = [];
let boids_list = [];
const kNbBoids = 8;
let kMaxPosition;

// body center
let diffImgCenter_x, diffImgCenter_y;
let body_center;
let prev_body_center;

// part2
let group;
let counter = 1;
let part2_start = true;
let spd = 2;
let fog_near= 1000;
//to change rotation direction
let cur_direction = 1;    // -1: left, 1: right
let body_direction = 1;   // -1: left, 1: right
let ifRotate;             // -1: y, 1: n

// loop over
// let start = true;
let prevFrame;

function setupTHREE() {
  pointCloud = getPoints();
  scene.add(pointCloud);

  params = {
    drawCount: PARTICLES_NUMBER,
  };
  // let guiFolder = gui.addFolder("DrawCount");
  // guiFolder
  //   .add(params, "drawCount")
  //   .min(0)
  //   .max(PARTICLES_NUMBER)
  //   .step(1)
  //   .listen()

  // spirits
  kMaxPosition = new THREE.Vector3(1000.0, 1000.0, 10.0);
  for (let i = 0; i < kNbBoids; i++) {
    boids_list.push(new Boids(kNbBoids, kMaxPosition));
  }
  for (let i = 0; i < kNbBoids; i++) {
    let pointCloud = getPointsWithObjects(boids_list[i].boids);
    pointCloud_list_spirits.push(pointCloud);
    scene.add(pointCloud);
  }
  
  // mirror
  addMirror();

  // part2
  group = new THREE.Group();
  scene.add(group);
  group.position.set(0, 0, -800);
  
  prev_body_center = new THREE.Vector3();
  
  
  // end
  // sprite = getSprite();
  // sprite.scale.set(120, 120, 1);
  // scene.add(sprite);

  // sphere = getSphere();
  // sphere.scale.set(WORLD_SIZE * 4, WORLD_SIZE * 4, WORLD_SIZE * 4);
  // scene.add(sphere);
}

function updateTHREE() {
  
  playAudio();

  ///// AVATAR PARTICLES /////
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
  
  let avatar_opacity = map(nb_spirits_gone, 0, 8, 0.1, 0.9);
  
  if (start_transition) {
    addTransition();
    play_audio02 = true;
  }
  
  // if (avatar_opacity >= 0.9) {
  // if (frame > 100) {                         // for test
  if (nb_spirits_gone == 8) {
    if (particles_transition.length == 0) {
      start_transition = true;
    }
  }
  
  if (particles_transition.length > 0) {
    if (camera.position.z > -300 && camera.position.z <= 3000) {
      camera.position.z -= 10;
      updateTransition();
    } else {
      removeTransition();
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
    if (camera.position.z < -200) {
      posArray[index + 2] = -500;
    } else {
      posArray[index + 2] = p.pos.z + 1600;  
    }
    
    clrArray[index + 0] = p.lifespan * avatar_opacity;
    clrArray[index + 1] = p.lifespan * avatar_opacity;
    clrArray[index + 2] = p.lifespan * avatar_opacity;
  }
  pointCloud.geometry.setDrawRange(0, particles.length);
  pointCloud.geometry.attributes.position.needsUpdate = true;
  pointCloud.geometry.attributes.color.needsUpdate = true;

  // calculate body center
  if (particles.length > 0) {
    let temp_sum_x = 0;
    let temp_sum_y = 0;
    let counter = 0;
    for (let p of particles) {
      if (p.lifespan > 0.7) {
        temp_sum_x += p.pos.x;
        temp_sum_y += p.pos.y;        
        counter++;
      }
    }
    diffImgCenter_x = temp_sum_x / counter;
    diffImgCenter_y = temp_sum_y / counter;
    
  }

  params.drawCount = particles.length;

  // spirits
  for (let i = 0; i < boids_list.length; i++) {
    let b = boids_list[i];
    b.MoveObjects(kMaxPosition);
    
    let pointCloud = pointCloud_list_spirits[i];
    let positionArray = pointCloud.geometry.attributes.position.array;
    
    for (let j = 0; j < b.boids.length; j++) {
      let particle_b = b.boids[j];
      let ptIndex = j * 3;
      positionArray[ptIndex + 0] = particle_b.pos.x;
      positionArray[ptIndex + 1] = particle_b.pos.y;
      positionArray[ptIndex + 2] = particle_b.pos.z;
    }
    pointCloud.geometry.attributes.position.needsUpdate = true;
    
    body_center = new THREE.Vector3(diffImgCenter_x, diffImgCenter_y, 0);
    let dist = body_center.distanceTo(b.center);
    if (frame > 500) {
      // console.log("start");
      if (dist <= 750) {
        console.log("caught: " + i);
        nb_spirits_gone++;
        windchime.play();
        scene.remove(pointCloud);
        pointCloud_list_spirits.splice(i, 1);
        boids_list.splice(i, 1);
        i--;
      }
    }
  }
  
  // mirror
  updateMirror();
  
  // part2
  if (camera.position.z < 800) {  
    
    play_audio03 = true;
    
    fog_near = cos(frame * 0.02) * 1000 + 1000;
  
    scene.fog = new THREE.Fog(COLOR_BG, fog_near, 2000);
    
    // USER INTERACTION //
    
    // prev_body_center.copy(body_center);    // not working *********
    // console.log(prev_body_center, body_center);
    
//     if (prev_body_center.x - body_center.x > 0) {    // to the left
//       body_direction = -1;
//       console.log("left");
//     } else if (prev_body_center.x - body_center.x < 0) {    // to the right
//       body_direction = 1;
//       console.log("right");
//     }
//     ifRotate = body_direction * cur_direction;    // -1 or 1
    
//     if (ifRotate < 0) {  // change rotation direction
//       console.log("change");
//       spd *= -1;
//     }
    
//     spd += 0.01 * ifRotate;
    spd =  1 * spd ** 1.0003 ;
    // console.log(spd);
    // USER INTERACTION ENDS //
    
    if (group.position.x > 1400) {
      
      part2_start = false;

      scene.remove(group);

      if (counter == 1) {
        group.remove(pointCloud_scene01);
        for (let i=0; i<particles_scene01.length; i++) {
          particles_scene01.splice(i, 1);
          i--;
        }
        // counter++;
        console.log("scene01 out");
      } 
      else if (counter == 2) {
        for (let i=0; i<cubes.length; i++) {
          let c = cubes[i];
          // console.log(i);
          group.remove(c);
          cubes.splice(i, 1);
          i--;
        }
        // counter++;
        console.log("scene02 out");
      } else if (counter == 3) {
        group.remove(pointCloud_scene03);
        for (let i=0; i<particles_scene03.length; i++) {
          particles_scene03.splice(i, 1);
          i--;
        }
        console.log("scene03 out");
      }

      if (counter < 3) {
        counter++;
      } else {
        group = new THREE.Group();
        counter = 1;
      }

      group.position.set(0, 0, 0);

    } 
    else {

      group.position.x += spd;

      if (counter == 1) {
        if (particles_scene01.length == 0) {
          group = new THREE.Group();
          scene.add(group);
          pushScene01();  
        }
        updateScene01();
      } 
      else if (counter == 2) {
        if (cubes.length == 0) {
          group = new THREE.Group();
          scene.add(group);
          pushScene02();
          // group.position.set(0, 0, 0);
        }
        updateScene02();
      }
      else if (counter == 3) {
        if (particles_scene03.length == 0) {
          group = new THREE.Group();
          scene.add(group);
          pushScene03();  
        }
        updateScene03();
      }
    }
  }

  // end
  if (spd > 25) {
    // console.log("enough spd");
    if (camera.position.z < 2999) {
      // console.log("too far");
      camera.position.z += 25;
      if (audio03.volume > 0.01) {
      audio03.volume -= 0.005;
    } else {
      audio03.pause();
    }
    }
  }
  
  if (camera.position.z >= 2999 && spd > 3) {
    spd = 2;
    // delay(300);
    prevFrame = frame;
    // if (frame % 30 == 0) {
      // console.log("windchime");
      windchime.play();  
    // }
    
    
    // setTimeout(location.reload(), 10000);
  }
  if (frame - prevFrame >= 350) {
    prevFrame = frame;
    setTimeout(location.reload(), 1000);
  }
  
  
  
}

function getPlane() {
  const geometry = new THREE.PlaneGeometry(
    WORLD_SIZE * 5,
    WORLD_SIZE * 5,
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
  const light = new THREE.PointLight(0xffffff, intensity, 500);
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
    // color: 0xffffff,
    vertexColors: true,
    size: 15,
    sizeAttenuation: true,
    //opacity: 0.8,
    // transparent: true,
    // depthTest: false,
    blending: THREE.AdditiveBlending,
    map: texture
  });

  const points = new THREE.Points(geometry, material);
  return points;
}

function getPointsWithObjects(objects) {
  const vertices = [];
  for (let obj of objects) {
    vertices.push(obj.pos.x, obj.pos.y, obj.pos.z);
  }
  // geometry
  const geometry = new THREE.BufferGeometry();
  // attributes
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  // geometry.setAttribute(
  //   "color",
  //   new THREE.Float32BufferAttribute(vertices, 3)
  // );
  // draw range
  // const drawCount = objects.length; // draw the whole objects
  // geometry.setDrawRange(0, drawCount);
  // material
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    // vertexColors: true,
    size: 10
  });
  // Points
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
    45,
    window.innerWidth / window.innerHeight,
    0.5,
    4000
  );
  camera.position.z = 3000;

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
  // gui = new dat.gui.GUI();

  // stats
  // stats = new Stats();
  // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  // container.appendChild(stats.dom);

  setupTHREE();

  // let's draw!
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  // stats.update();
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
generateParticlesFromDiffPixels diffImg jsfeat displayEdgeDetection Particle PointLight Boids ParticleScene01 
mirror getPlaneMirror addMirror updateMirror
addTransition updateTransition removeTransition start_transition pointCloud_transition particles_transition
pushScene01 updateScene01 particles_scene01 pointCloud_scene01 cubes pushScene02 updateScene02 particles_scene02 pointCloud_scene02 pushScene03 updateScene03 particles_scene03 pointCloud_scene03
sprite sphere
playAudio                                                                                                                                                                                                                                                                                                                                                     
THREE p5 ml5 Stats dat alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase 2D Primitives arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex plane box sphere cylinder cone ellipsoid torus loadModel model HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS print frameCount deltaTime focused cursor frameRate noCursor displayWidth displayHeight windowWidth windowHeight windowResized width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams remove disableFriendlyErrors noLoop loop isLooping push pop redraw select selectAll removeElements changed input createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement createCanvas resizeCanvas noCanvas createGraphics blendMode drawingContext setAttributes boolean string number applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate storeItem getItem clearStorage removeItem createStringDict createNumberDict append arrayCopy concat reverse shorten shuffle sort splice subset float int str byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ turnAxis setMoveThreshold setShakeThreshold deviceMoved deviceTurned deviceShaken keyIsPressed key keyCode keyPressed keyReleased keyTyped keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseWheel mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveFrames image tint noTint imageMode pixels blend copy filter THRESHOLD GRAY OPAQUE INVERT POSTERIZE BLUR ERODE DILATE get loadPixels set updatePixels loadImage loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo Output createWriter save saveJSON saveStrings saveTable day hour minute millis month second year abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess camera perspective ortho frustum createCamera setCamera ADD CENTER CORNER CORNERS POINTS WEBGL RGB ARGB HSB LINES CLOSE BACKSPACE DELETE ENTER RETURN TAB ESCAPE SHIFT CONTROL OPTION ALT UP_ARROW DOWN_ARROW LEFT_ARROW RIGHT_ARROW sampleRate freqToMidi midiToFreq soundFormats getAudioContext userStartAudio loadSound createConvolver setBPM saveSound getMasterVolume masterVolume soundOut chain drywet biquadFilter process freq res gain toggle setType pan phase triggerAttack triggerRelease setADSR attack decay sustain release dispose notes polyvalue AudioVoice noteADSR noteAttack noteRelease isLoaded playMode set isPlaying isPaused setVolume getPan rate duration currentTime jump channels frames getPeaks reverseBuffer onended setPath setBuffer processPeaks addCue removeCue clearCues getBlob getLevel toggleNormalize waveform analyze getEnergy getCentroid linAverages logAverages getOctaveBands fade attackTime attackLevel decayTime decayLevel releaseTime releaseLevel setRange setExp width output stream mediaStream currentSource enabled amplitude getSources setSource bands panner positionX positionY positionZ orient orientX orientY orientZ setFalloff maxDist rollof leftDelay rightDelay delayTime feedback convolverNode impulses addImpulse resetImpulse toggleImpulse sequence getBPM addPhrase removePhrase getPhrase replaceSequence onStep musicalTimeMode maxIterations synced bpm timeSignature interval iterations compressor knee ratio threshold reduction record isDetected update onPeak WaveShaperNode getAmount getOversample amp setInput connect disconnect play pause stop start add mult
*/
