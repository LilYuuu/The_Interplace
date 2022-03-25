let play_audio01 = true;
let play_audio02 = false;
let play_audio03 = false;
let play_audio04 = false;

let audio01 = document.getElementById('audio01');
let audio02 = document.getElementById('audio02');
let audio03 = document.getElementById('audio03');
let audio04 = document.getElementById('audio04');

let windchime = document.getElementById('windchime');

function playAudio() {
  if (play_audio01 && frame > 10) {
    getSoundAndFadeInAudio(audio01);
    audio01.play();
    audio01.loop = true;
    play_audio01 = false;
    
  } else if (play_audio02) {
    audio02.play();
    audio02.loop = true;
    
    if (audio01.volume > 0.1) {
      audio01.volume -= 0.1;
    } else {
      audio01.pause();
    }
    // crossFade(audio01, audio02);
    play_audio02 = false;
    
  } else if (play_audio03) {
    audio03.play();
    audio03.loop = true;
    
    if (audio02.volume > 0.1) {
      audio02.volume -= 0.1;
    } else {
      audio02.pause();
    }
    // crossFade(audio02, audio03);
    play_audio03 = false;
    
  } else if (play_audio04) {
    audio04.play();
    audio04.loop = true;
    
    if (audio03.volume > 0.1) {
      audio03.volume -= 0.1;
    } else {
      audio03.pause();
    }
    play_audio04 = false;
  }
}

function getSoundAndFadeOutAudio (audiosnippetId) {

    // var sound = document.getElementById(audiosnippetId);
  var sound = audiosnippetId;

    // Set the point in playback that fadeout begins. This is for a 2 second fade out.
    var fadePoint = sound.duration - 2; 

    var fadeAudio = setInterval(function () {

        // Only fade if past the fade out point or not at zero already
        if ((sound.currentTime >= fadePoint) && (sound.volume != 0.0)) {
            sound.volume -= 0.1;
        }
        // When volume at zero stop all the intervalling
        if (sound.volume === 0.0) {
            clearInterval(fadeAudio);
            sound.pause();
        };
    }, 200);

}

function getSoundAndFadeInAudio (audiosnippetId) {

    // var sound = document.getElementById(audiosnippetId);
  var sound = audiosnippetId;

    // Set the point in playback that fadeout begins. This is for a 2 second fade out.
    var fadePoint = 0; 

    var fadeAudio = setInterval(function () {

        // Only fade if past the fade out point or not at zero already
        if ((sound.currentTime >= fadePoint) && (sound.volume < 1)) {
            sound.volume -= 0.1;
        }
        // When volume at zero stop all the intervalling
        if (sound.volume >= 1) {
            clearInterval(fadeAudio);
        }
    }, 200);

}

function crossFade (audio1, audio2){
  getSoundAndFadeOutAudio (audio1);
  getSoundAndFadeInAudio (audio2);
}