/*
 * Copyright @ 2024-present 8x8, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jitsi.meet.sdk;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.jitsi.meet.sdk.log.JitsiMeetLogger;

/**
 * React Native module to control the native fake conference overlay.
 */
public class FakeOverlayModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "FakeOverlay";

    public FakeOverlayModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * Shows the native fake conference overlay.
     */
    @ReactMethod
    public void show() {
        JitsiMeetLogger.i("FakeOverlay: show() called from React Native");
        
        getCurrentActivity().runOnUiThread(() -> {
            JitsiMeetView jitsiView = findJitsiMeetView();
            if (jitsiView != null) {
                jitsiView.showFakeOverlay();
            }
        });
    }

    /**
     * Hides the native fake conference overlay.
     */
    @ReactMethod
    public void hide() {
        JitsiMeetLogger.i("FakeOverlay: hide() called from React Native");
        
        getCurrentActivity().runOnUiThread(() -> {
            JitsiMeetView jitsiView = findJitsiMeetView();
            if (jitsiView != null) {
                jitsiView.hideFakeOverlay();
            }
        });
    }

    /**
     * Called by React Native when the conference has fully loaded.
     * This provides a reliable way to hide the fake overlay.
     */
    @ReactMethod
    public void onConferenceLoaded() {
        JitsiMeetLogger.i("FakeOverlay: onConferenceLoaded() - hiding fake overlay");
        
        getCurrentActivity().runOnUiThread(() -> {
            JitsiMeetView jitsiView = findJitsiMeetView();
            if (jitsiView != null) {
                jitsiView.forceHideFakeOverlay();
            }
        });
    }

    /**
     * Finds the JitsiMeetView in the current activity.
     */
    private JitsiMeetView findJitsiMeetView() {
        if (getCurrentActivity() instanceof JitsiMeetActivityInterface) {
            // Assuming JitsiMeetActivity has a way to get the JitsiMeetView
            if (getCurrentActivity() instanceof JitsiMeetActivity) {
                return ((JitsiMeetActivity) getCurrentActivity()).getJitsiView();
            }
        }
        return null;
    }
}
