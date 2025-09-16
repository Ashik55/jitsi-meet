import { appNavigate } from '../../app/actions.native';
import { notifyConferenceFailed } from '../../conference/actions.native';
import { JitsiConferenceErrors } from '../lib-jitsi-meet';
import MiddlewareRegistry from '../redux/MiddlewareRegistry';

import { CONFERENCE_FAILED } from './actionTypes';
import { conferenceLeft, setIntentionalLeave } from './actions.any';
import { TRIGGER_READY_TO_CLOSE_REASONS } from './constants';

import './middleware.any';

MiddlewareRegistry.register(store => next => action => {
    const { dispatch } = store;
    const { error } = action;

    switch (action.type) {
    case CONFERENCE_FAILED: {
        const { getState } = store;
        const state = getState();
        const { notifyOnConferenceDestruction = true } = state['features/base/config'];
        const { intentionalLeave = false } = state['features/base/conference'];

        if (error?.name !== JitsiConferenceErrors.CONFERENCE_DESTROYED) {
            break;
        }

        // Don't show termination dialog if user intentionally left the call
        if (intentionalLeave) {
            dispatch(setIntentionalLeave(false)); // Reset the flag
            dispatch(conferenceLeft(action.conference));
            dispatch(appNavigate(undefined));
            break;
        }

        if (!notifyOnConferenceDestruction) {
            dispatch(setIntentionalLeave(false)); // Reset the flag
            dispatch(conferenceLeft(action.conference));
            dispatch(appNavigate(undefined));
            break;
        }

        const [ reason ] = error.params;

        const reasonKey = Object.keys(TRIGGER_READY_TO_CLOSE_REASONS)[
            Object.values(TRIGGER_READY_TO_CLOSE_REASONS).indexOf(reason)
        ];

        dispatch(notifyConferenceFailed(reasonKey, () => {
            dispatch(setIntentionalLeave(false)); // Reset the flag
            dispatch(conferenceLeft(action.conference));
            dispatch(appNavigate(undefined));
        }));
    }
    }

    return next(action);
});
