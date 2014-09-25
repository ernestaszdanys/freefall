function Sound(audioContext, soundArrayBuffer, volume) {
    var decodedAudio,
        gainNode = audioContext.createGain(),
        soundSource = audioContext.createBufferSource();

    audioContext.decodeAudioData(soundArrayBuffer, function(buffer) {
        decodedAudio = buffer;
    });

    //soundSource.loop = true;
    gainNode.gain.value = volume;
    soundSource.connect(gainNode);
    gainNode.connect(audioContext.destination);
    soundSource.start();

    // play
    this.play = function() {
        soundSource.buffer = decodedAudio;
    };
    // stop
    this.stop = function () {
        soundSource.stop();
    }
}