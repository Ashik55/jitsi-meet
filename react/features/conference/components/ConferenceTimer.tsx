import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { IReduxState } from '../../app/types';
import { getConferenceTimestamp } from '../../base/conference/functions';
import { getCallingState } from '../../base/conference/functions';
import { getParticipantCount } from '../../base/participants/functions';
import { isCallEndingDueToTimeout } from '../../base/conference/callingMiddleware';
import { getLocalizedDurationFormatter } from '../../base/i18n/dateUtil';

// @ts-ignore - Platform-specific import handled by bundler
import ConferenceTimerDisplay from './native/ConferenceTimerDisplay';

/**
 * The type of the React {@code Component} props of {@link ConferenceTimer}.
 */
interface IProps {

    /**
     * Style to be applied to the rendered text.
     */
    textStyle?: Object;
}

export interface IDisplayProps {

    /**
     * Style to be applied to text (native only).
     */
    textStyle?: Object;

    /**
     * String to display as time.
     */
    timerValue: string;
}

const ConferenceTimer = ({ textStyle }: IProps) => {
    const conferenceTimestamp = useSelector(getConferenceTimestamp);
    const isInCallingState = useSelector(getCallingState);
    const participantCount = useSelector(getParticipantCount);
    
    // Check if we're in connecting state (before calling)
    const connectionState = useSelector((state: IReduxState) => state['features/base/connection']);
    const conferenceState = useSelector((state: IReduxState) => state['features/base/conference']);
    
    // Show "Connecting..." when:
    // 1. Connection is being established (connecting is true)
    // 2. Or conference is joining but not yet in calling state
    // 3. But not when already in calling state
    const isConnecting = (Boolean(connectionState.connecting) || Boolean(conferenceState.joining)) && !isInCallingState && !conferenceState.conference;
    
    const [ timerValue, setTimerValue ] = useState(getLocalizedDurationFormatter(0));
    const [ timerStartTime, setTimerStartTime ] = useState<number | null>(null);
    const interval = useRef<number>();
    const previousCallingState = useRef(isInCallingState);
    const previousParticipantCount = useRef(participantCount);
    

    /**
     * Sets the current state values that will be used to render the timer.
     *
     * @param {number} refValueUTC - The initial UTC timestamp value.
     * @param {number} currentValueUTC - The current UTC timestamp value.
     *
     * @returns {void}
     */
    const setStateFromUTC = useCallback((refValueUTC, currentValueUTC) => {
        if (!refValueUTC || !currentValueUTC) {
            return;
        }

        if (currentValueUTC < refValueUTC) {
            return;
        }

        const timerMsValue = currentValueUTC - refValueUTC;

        const localizedTime = getLocalizedDurationFormatter(timerMsValue);

        setTimerValue(localizedTime);
    }, []);

    /**
     * Start conference timer.
     *
     * @returns {void}
     */
    const startTimer = useCallback(() => {
        if (!interval.current && timerStartTime) {
            // Set initial timer value immediately
            const currentTime = new Date().getTime();
            setStateFromUTC(timerStartTime, currentTime);

            interval.current = setInterval(() => {
                const now = new Date().getTime();
                setStateFromUTC(timerStartTime, now);
            }, 1000);
        }
    }, [ timerStartTime, setStateFromUTC ]);

    /**
     * Stop conference timer.
     *
     * @returns {void}
     */
    const stopTimer = useCallback(() => {
        if (interval.current) {
            clearInterval(interval.current);
            interval.current = undefined;
        }

        setTimerValue(getLocalizedDurationFormatter(0));
    }, []);

    // Handle calling state and participant changes
    useEffect(() => {
        const callingStateChanged = previousCallingState.current !== isInCallingState;
        const participantCountChanged = previousParticipantCount.current !== participantCount;


        if (callingStateChanged) {
            if (isInCallingState) {
                // Calling state started - stop the timer and reset
                stopTimer();
                setTimerStartTime(null);
            } else {
                // Start timer when calling state ends (someone joined) and we don't have a timer yet
                // BUT NOT if call is ending due to timeout (prevents brief timer flash before hangup)
                if (!isCallEndingDueToTimeout()) {
                    const now = new Date().getTime();
                    setTimerStartTime(now);
                }
            }
        }
        
        // Also handle direct participant count increase when not in calling state (fallback)
        // BUT NOT if call is ending due to timeout (prevents brief timer flash before hangup)
        if (participantCountChanged && !isInCallingState && timerStartTime === null && participantCount > 1 && !isCallEndingDueToTimeout()) {
            const now = new Date().getTime();
            setTimerStartTime(now);
        }

        // Emergency fallback: If we have participants but no calling state and no timer, force start
        // BUT NOT if call is ending due to timeout (prevents brief timer flash before hangup)
        if (!isInCallingState && participantCount > 1 && timerStartTime === null && !interval.current && !isCallEndingDueToTimeout()) {
            const now = new Date().getTime();
            setTimerStartTime(now);
        }

        // Update refs after processing
        previousCallingState.current = isInCallingState;
        previousParticipantCount.current = participantCount;
    }, [participantCount, isInCallingState, timerStartTime]);

    // Start/stop timer based on whether we have a start time and calling state
    useEffect(() => {

        if (!isInCallingState && timerStartTime && !interval.current) {
            startTimer();
        } else if (isInCallingState && interval.current) {
            stopTimer();
        }

        return () => {
            if (interval.current) {
                clearInterval(interval.current);
                interval.current = undefined;
            }
        };
    }, [timerStartTime, isInCallingState]);


    // If we're connecting (before calling), show "Connecting..."
    if (isConnecting) {
        return (<ConferenceTimerDisplay
            textStyle = { textStyle }
            timerValue = "Connecting..." />);
    }

    // If we're in calling state, show "Calling..." instead of timer
    if (isInCallingState) {
        return (<ConferenceTimerDisplay
            textStyle = { textStyle }
            timerValue = "Calling..." />);
    }

    // Show timer if we have a timer start time
    if (timerStartTime !== null) {
        return (<ConferenceTimerDisplay
            textStyle = { textStyle }
            timerValue = { timerValue } />);
    }

    return null;
};

export default ConferenceTimer;
