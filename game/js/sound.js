function SoundManager(audioContext) {
    var masterGain = audioContext.createGain();

    this.setMasterGain = function (volume) {
        masterGain.gain.value = volume;
    };
    
    this.getMasterGain = function () {
        return masterGain.gain.value;
    };

    this.setMasterGain(1);
    masterGain.connect(audioContext.destination);

    function Sound(soundArrayBuffer, volume, loop) {
        var decodedAudio,
            gainNode,
            soundSource;

        audioContext.decodeAudioData(soundArrayBuffer, function (buffer) {
            decodedAudio = buffer;
        });

        // play
        this.play = function () {
            if (soundSource) {
                soundSource.disconnect(0);
            }
            if (gainNode) {
                gainNode.disconnect(0);
            }

            gainNode = audioContext.createGain();
            gainNode.gain.value = volume;
            soundSource = audioContext.createBufferSource();
            soundSource.loop = loop;
            soundSource.buffer = decodedAudio;

            soundSource.connect(gainNode);
            gainNode.connect(masterGain);
            soundSource.start();
        };

        // stop
        this.stop = function () {
            soundSource.stop();
        }
    }
    this.Sound = Sound;
}