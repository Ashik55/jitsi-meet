import { Platform } from 'react-native';
import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

let callingSound = null;
let timeoutId = null;
let currentSoundId = 0;

// Track the currently playing sound ID and its state
let activeSoundId = 0;
let isSoundLoading = false;
let soundReleaseTimeout = null;

/**
 * Plays the calling sound with the specified duration.
 * @param {number} durationMs - Duration in milliseconds to play the sound before auto-stopping. Use 0 for no timeout.
 */
export const playCallingSound = async (durationMs = 0) => {
    try {
        // First stop any existing sound and ensure clean state
        stopCallingSound();
        
        // Small delay to ensure previous sound is fully released
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Generate a new sound ID for this playback attempt
        const soundId = ++currentSoundId;
        activeSoundId = soundId;
        isSoundLoading = true;
        
        console.log(`🎵 [${soundId}] Loading calling sound...`);

        // Build candidate sources per platform
        const sources = Platform.select({
            ios: [ 'calling_ringing.mp3' ],
            android: [ 'calling_ringing.mp3', 'asset:/sounds/calling_ringing.mp3' ]
        }) || [ 'calling_ringing.mp3' ];

        let sound = null;

        const tryLoadWithCtor = (src, useBundle, onDone) => {
            const bundleArg = useBundle ? Sound.MAIN_BUNDLE : undefined;
            console.log(`🎵 [${soundId}] Trying ${src} with ${useBundle ? 'MAIN_BUNDLE' : 'default'} loader`);
            sound = new Sound(src, bundleArg, (error) => onDone(error, sound));
        };

        const tryLoad = (index = 0, triedAlt = false) => {
            if (index >= sources.length) {
                isSoundLoading = false;
                console.error(`[${soundId}] Unable to load calling sound from any source`);
                return;
            }

            const src = sources[index];

            tryLoadWithCtor(src, true, (error, snd) => {
                // Skip if this is not the most recent sound instance
                if (soundId !== activeSoundId) {
                    console.log(`[${soundId}] Ignoring callback for old sound instance`);
                    snd && snd.release && snd.release();
                    return;
                }

                if (error) {
                    // On Android, also try without bundle arg for the same src
                    if (Platform.OS === 'android' && !triedAlt) {
                        console.warn(`[${soundId}] Load failed from ${src} with MAIN_BUNDLE. Retrying without bundle.`);
                        return tryLoadWithCtor(src, false, (err2, snd2) => {
                            if (soundId !== activeSoundId) {
                                snd2 && snd2.release && snd2.release();
                                return;
                            }
                            if (err2) {
                                console.error(`[${soundId}] Load failed from ${src} without bundle. Trying next source.`);
                                return tryLoad(index + 1, false);
                            }
                            // proceed to play
                            onLoaded(snd2, src);
                        });
                    }
                    console.error(`[${soundId}] Error loading sound from ${src}:`, error);
                    return tryLoad(index + 1, false);
                }

                onLoaded(snd, src);
            });
        };

        const onLoaded = (snd, src) => {
            isSoundLoading = false;
            console.log(`▶️ [${soundId}] Sound loaded, preparing to play`);
            try {
                // Configure sound properties
                snd.setVolume(1.0);
                snd.setNumberOfLoops(-1); // Loop indefinitely
                
                // Store the current sound
                callingSound = snd;
                
                // Start playback
                snd.play((success) => {
                    // Verify this is still the active sound
                    if (soundId === activeSoundId) {
                        console.log(`⏹️ [${soundId}] Sound finished playing, success:`, success);
                        try { snd.release(); } catch (e) { /* noop */ }
                        if (callingSound === snd) {
                            callingSound = null;
                        }
                    }
                });
                
                // Set auto-stop timeout only if duration is specified
                if (durationMs > 0) {
                    timeoutId = setTimeout(() => {
                        if (soundId === activeSoundId) {
                            console.log(`⏱️ [${soundId}] Sound duration reached, stopping`);
                            stopCallingSound();
                        }
                    }, durationMs);
                } else {
                    console.log(`🔄 [${soundId}] Sound will loop indefinitely until manually stopped`);
                }
                
                console.log(`🔊 [${soundId}] Sound started playing from: ${src}`);
            } catch (playError) {
                console.error(`[${soundId}] Error during sound playback:`, playError);
                try { snd.release(); } catch (e) { /* noop */ }
            }
        };

        // Start loading attempts
        tryLoad(0, false);
        
    } catch (error) {
        console.error('❌ Error in playCallingSound:', error);
        isSoundLoading = false;
        activeSoundId = 0;
    }
};

/**
 * Stops the currently playing calling sound and cleans up resources.
 */
export const stopCallingSound = () => {
    try {
        // Clear any pending timeouts
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        // Clear any pending release timeouts
        if (soundReleaseTimeout) {
            clearTimeout(soundReleaseTimeout);
            soundReleaseTimeout = null;
        }

        // Stop and release the current sound if it exists
        if (callingSound) {
            const soundId = activeSoundId;
            console.log(`⏹️ [${soundId}] Stopping sound (loading: ${isSoundLoading})`);
            
            try {
                // Stop the sound first
                if (typeof callingSound.stop === 'function') {
                    callingSound.stop();
                    console.log(`⏹️ [${soundId}] Sound stopped`);
                }
                
                // Release immediately to ensure proper cleanup for next playback
                if (typeof callingSound.release === 'function') {
                    callingSound.release();
                    console.log(`🗑️ [${soundId}] Sound released`);
                }
                callingSound = null;
                
            } catch (e) {
                console.warn(`[${soundId}] Error stopping/releasing sound:`, e);
                // Force cleanup even if there's an error
                try {
                    if (callingSound && typeof callingSound.release === 'function') {
                        callingSound.release();
                    }
                } catch (err) {
                    console.warn(`[${soundId}] Error in forced release:`, err);
                }
                callingSound = null;
            }
        } else if (isSoundLoading) {
            console.log(`⏹️ [${activeSoundId}] Sound loading in progress - marking for stop`);
        }
        
        // Reset all state variables to ensure clean slate for next playback
        isSoundLoading = false;
        activeSoundId = 0;
        
        console.log('🧹 SimpleAudioPlayer state reset complete');
    } catch (error) {
        console.error('Error stopping calling sound:', error);
        // Ensure cleanup even on error
        callingSound = null;
        isSoundLoading = false;
        activeSoundId = 0;
    }
};

// Export the functions
export default {
    playCallingSound,
    stopCallingSound
};
