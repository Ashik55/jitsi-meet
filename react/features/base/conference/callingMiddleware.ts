import { AnyAction } from 'redux';

import { IStore } from '../../app/types';
import { CALLING_SOUND_ID } from '../../invite/constants';
import MiddlewareRegistry from '../redux/MiddlewareRegistry';
import { hangup } from '../connection/actions.native';
import { callingStarted, callingStopped } from './actions.any';
import { disconnect } from '../connection/actions.any';
import { CALLING_STARTED, CALLING_STOPPED, CONFERENCE_JOINED, CONFERENCE_LEFT, CONFERENCE_FAILED } from './actionTypes';
import { PARTICIPANT_JOINED, PARTICIPANT_LEFT, PARTICIPANT_UPDATED } from '../participants/actionTypes';
import { getRemoteParticipantCount } from '../participants/functions';
import { playCallingSound, stopCallingSound } from '../sounds/SimpleAudioPlayer';

// Export function to check if call is ending due to timeout
export const isCallEndingDueToTimeout = () => isCallEndingDueToTimeoutFlag;

// Track if call is ending due to timeout to prevent timer from starting
let isCallEndingDueToTimeoutFlag = false;

type CallType = 'audio' | 'video';

interface CallingState {
    isCalling: boolean;
    callType: CallType;
    sessionId: number;
    isBlocked: boolean;
}

let callingTimeoutId: ReturnType<typeof setTimeout> | undefined;
const CALLING_TIMEOUT_DURATION = 30000; // 30 seconds

// Guard the lifecycle across joins/leaves to avoid stale timeouts triggering after leaving.
let currentSessionId = 0;
let callingState = {
    isCalling: false,
    callType: 'audio' as CallType,
    sessionId: 0,
    isBlocked: false
};

// Track if we're waiting for participants to avoid race conditions
let isWaitingForParticipants = false;


/**
 * Middleware that handles the calling state logic.
 * Implements Android-like behavior:
 * - Plays looping calling sound when alone in conference
 * - Stops sound and calling state when participant joins
 * - Leaves conference automatically after 30-second timeout if no one joins
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register((store: IStore) => (next: Function) => (action: AnyAction) => {
    const result = next(action);

    switch (action.type) {
    case CONFERENCE_JOINED: {
        // New session begins
        currentSessionId++;
        callingState = {
            isCalling: false,
            callType: 'audio',
            sessionId: currentSessionId,
            isBlocked: false
        };
        isWaitingForParticipants = false;

        const state = store.getState();
        const remoteParticipantCount = getRemoteParticipantCount(state);


        // If no remote participants, start calling state immediately
        if (remoteParticipantCount === 0) {
            isWaitingForParticipants = true;
            // Use setTimeout to ensure the dispatch happens after the current action is processed
            setTimeout(() => {
                if (isWaitingForParticipants && currentSessionId === callingState.sessionId) {
                    store.dispatch(callingStarted());
                }
            }, 100); // Small delay to ensure proper state initialization
        }
        break;
    }

    case PARTICIPANT_JOINED: {
        const { participant } = action;

        // Don't count local participants or fake participants for calling state
        if (participant.local || participant.fakeParticipant) {
            break;
        }

        // Real participant joined - stop waiting and calling immediately
        isWaitingForParticipants = false;
        
        const state = store.getState();
        const { calling } = state['features/base/conference'];

        // If we were in calling state or waiting for participants, stop calling immediately
        if (calling || callingState.isCalling) {

            // Stop calling sound immediately - don't wait for redux state update
            stopCallingSound();
            
            // Clear any pending timeouts
            if (callingTimeoutId) {
                clearTimeout(callingTimeoutId);
                callingTimeoutId = undefined;
            }
            
            // Update local state immediately
            callingState = {
                ...callingState,
                isCalling: false
            };
            
            // Dispatch the action to update redux state
            store.dispatch(callingStopped());
        }
        break;
    }

    case PARTICIPANT_LEFT: {
        const { participant } = action;
        
        // Don't count local participants or fake participants for calling state
        if (participant.local || participant.fakeParticipant) {
            break;
        }

        const state = store.getState();
        const remoteParticipantCount = getRemoteParticipantCount(state);

        // If this was the last remote participant, start calling again (only if not blocked for this session)
        if (remoteParticipantCount === 0 && !callingState.isBlocked && callingState.sessionId === currentSessionId) {
            isWaitingForParticipants = true;
            // Small delay to ensure participant count is properly updated
            setTimeout(() => {
                if (isWaitingForParticipants && !callingState.isBlocked && callingState.sessionId === currentSessionId) {
                    store.dispatch(callingStarted());
                }
            }, 200);
        }
        break;
    }

    case CALLING_STARTED: {
        try {
            const callType = action.callType || 'audio';
            
            // Check if this session is blocked or if we're no longer waiting
            if (callingState.isBlocked && callingState.sessionId === currentSessionId) {
                return result;
            }
            
            // Double-check we still have no remote participants
            const state = store.getState();
            const remoteParticipantCount = getRemoteParticipantCount(state);
            if (remoteParticipantCount > 0) {
                isWaitingForParticipants = false;
                return result;
            }

            
            // Update calling state
            callingState = {
                isCalling: true,
                callType,
                sessionId: currentSessionId,
                isBlocked: false
            };
            
            isWaitingForParticipants = false; // We're now actively calling

            // Clear any existing timeouts and sounds first
            stopCallingSound();
            if (callingTimeoutId) {
                clearTimeout(callingTimeoutId);
                callingTimeoutId = undefined;
            }
            
            // Play the calling sound immediately
            playCallingSound(0); // No duration limit, we'll handle timeout separately
            
            // Set timeout for calling state (30 seconds)
            callingTimeoutId = setTimeout(() => {
                // Ignore if session changed or was blocked after we scheduled
                if (callingState.sessionId !== currentSessionId || callingState.isBlocked || !callingState.isCalling) {
                    return;
                }
                
                // Mark that call is ending due to timeout to prevent timer from starting
                isCallEndingDueToTimeoutFlag = true;
                
                // Block further ringing within this session
                callingState = {
                    ...callingState,
                    isCalling: false,
                    isBlocked: true
                };
                
                isWaitingForParticipants = false;
                
                // Stop sound and cleanup
                stopCallingSound();
                callingTimeoutId = undefined;
                
                // Dispatch stopped action first
                store.dispatch(callingStopped());
                
                // Leave the call after a short delay
                setTimeout(() => {
                    store.dispatch(hangup());
                }, 500);
            }, CALLING_TIMEOUT_DURATION);
        } catch (error) {
            // Ensure we clean up on error
            stopCallingSound();
            isWaitingForParticipants = false;
            callingState = {
                ...callingState,
                isCalling: false
            };
            if (callingTimeoutId) {
                clearTimeout(callingTimeoutId);
                callingTimeoutId = undefined;
            }
        }
        break;
    }

    case CALLING_STOPPED: {
        try {
            
            // Clear any pending timeouts first
            if (callingTimeoutId) {
                clearTimeout(callingTimeoutId);
                callingTimeoutId = undefined;
            }
            
            // Stop waiting for participants
            isWaitingForParticipants = false;
            
            // Stop the calling sound immediately
            stopCallingSound();
            
            // Update calling state
            const wasCalling = callingState.isCalling;
            callingState = {
                ...callingState,
                isCalling: false
            };
            
        } catch (error) {
            // Ensure we clean up even if there's an error
            stopCallingSound();
            isWaitingForParticipants = false;
            callingState = {
                ...callingState,
                isCalling: false
            };
            if (callingTimeoutId) {
                clearTimeout(callingTimeoutId);
                callingTimeoutId = undefined;
            }
        }
        break;
    }

    case CONFERENCE_FAILED:
    case CONFERENCE_LEFT: {
        
        // Stop waiting for participants
        isWaitingForParticipants = false;
        
        // Reset timeout ending flag
        isCallEndingDueToTimeoutFlag = false;
        
        // End of session: block further calling for this session and cleanup
        callingState = {
            ...callingState,
            isCalling: false,
            isBlocked: true
        };
        
        // Clear any pending timeouts
        if (callingTimeoutId) {
            clearTimeout(callingTimeoutId);
            callingTimeoutId = undefined;
        }
        
        // Stop calling sound when leaving/failing conference
        stopCallingSound();
        
        // Ensure calling state is stopped in redux
        if (callingState.isCalling) {
            store.dispatch(callingStopped());
        }
        
        // Reset for next session (will be incremented on next join)
        break;
    }
    }

    return result;
});
