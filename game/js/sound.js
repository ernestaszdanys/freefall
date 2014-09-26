function Sound(audioContext, soundArrayBuffer, vol) {
    var volume = vol,
        decodedAudio,
        gainNode,
        soundSource;

    audioContext.decodeAudioData(soundArrayBuffer, function(buffer) {
        decodedAudio = buffer;
    });

    // play
    this.play = function() {
        if (soundSource) {
            soundSource.disconnect(0);
        }
        if (gainNode) {
            gainNode.disconnect(0);
        }

        gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        soundSource = audioContext.createBufferSource();
        soundSource.buffer = decodedAudio;

        soundSource.connect(gainNode);
        gainNode.connect(audioContext.destination);
        soundSource.start();
    };

    // stop
    this.stop = function () {
        soundSource.stop();
    }
}