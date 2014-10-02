function SoundManager(audioContext) {
    var masterGain = audioContext.createGain();

    this.setMasterGain = function (volume) {
        if (!isFiniteNumber(volume)) {
            throw new Error("Argument must be finite number.");
        }
        masterGain.gain.value = volume;
    };
    
    this.getMasterGain = function () {
        return masterGain.gain.value;
    };

    this.setMasterGain(1);
    masterGain.connect(audioContext.destination);

    function Sound(soundArrayBuffer, volume) {
        var decodedAudio,
            gainNode,
            soundSource;

        audioContext.decodeAudioData(soundArrayBuffer, function (buffer) {
            decodedAudio = buffer;
        });
        
        /**
         * @param {boolean} loop
         */
        this.play = function (loop) {
            if (soundSource) {
                soundSource.disconnect(0);
            }
            
            if (gainNode) {
                gainNode.disconnect(0);
            }

            gainNode = audioContext.createGain();
            gainNode.gain.value = volume;
            soundSource = audioContext.createBufferSource();
            soundSource.loop = !!loop; // Cast to boolean
            soundSource.buffer = decodedAudio;

            soundSource.connect(gainNode);
            gainNode.connect(masterGain);
            
            soundSource.start(0);
        };

        this.stop = function () {
            if (soundSource) {
                soundSource.stop();
            }
        };
    }
    
    this.Sound = Sound;
}