/*
 * Copyright @ 2017-present 8x8, Inc.
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

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.ReactRootView;

import org.jitsi.meet.sdk.log.JitsiMeetLogger;


public class JitsiMeetView extends FrameLayout {

    /**
     * Background color used by {@code BaseReactView} and the React Native root
     * view.
     */
    private static final int BACKGROUND_COLOR = 0xFF111111;

    /**
     * React Native root view.
     */
    private ReactRootView reactRootView;

    /**
     * Native fake conference overlay view - simulates conference over React Native loading.
     */
    private FakeConferenceOverlayView fakeOverlay;
    
    /**
     * Timestamp when React Native started loading.
     */
    private long reactNativeStartTime;

    /**
     * Helper method to recursively merge 2 {@link Bundle} objects representing React Native props.
     *
     * @param a - The first {@link Bundle}.
     * @param b - The second {@link Bundle}.
     * @return The merged {@link Bundle} object.
     */
    private static Bundle mergeProps(@Nullable Bundle a, @Nullable Bundle b) {
        Bundle result = new Bundle();

        if (a == null) {
            if (b != null) {
                result.putAll(b);
            }

            return result;
        }

        if (b == null) {
            result.putAll(a);

            return result;
        }

        // Start by putting all of a in the result.
        result.putAll(a);

        // Iterate over each key in b and override if appropriate.
        for (String key : b.keySet()) {
            Object bValue = b.get(key);
            Object aValue = a.get(key);
            String valueType = bValue.getClass().getSimpleName();

            if (valueType.contentEquals("Boolean")) {
                result.putBoolean(key, (Boolean)bValue);
            } else if (valueType.contentEquals("String")) {
                result.putString(key, (String)bValue);
            } else if (valueType.contentEquals("Integer")) {
                result.putInt(key, (int)bValue);
            } else if (valueType.contentEquals("Bundle")) {
                result.putBundle(key, mergeProps((Bundle)aValue, (Bundle)bValue));
            } else {
                throw new RuntimeException("Unsupported type: " + valueType);
            }
        }

        return result;
    }

    public JitsiMeetView(@NonNull Context context) {
        super(context);
        initialize(context);
    }

    public JitsiMeetView(Context context, AttributeSet attrs) {
        super(context, attrs);
        initialize(context);
    }

    public JitsiMeetView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        initialize(context);
    }

    /**
     * Releases the React resources (specifically the {@link ReactRootView})
     * associated with this view.
     *
     * MUST be called when the {@link Activity} holding this view is destroyed,
     * typically in the {@code onDestroy} method.
     */
    public void dispose() {
        if (reactRootView != null) {
            removeView(reactRootView);
            reactRootView.unmountReactApplication();
            reactRootView = null;
        }
        
        if (fakeOverlay != null) {
            removeView(fakeOverlay);
            fakeOverlay = null;
        }
    }

    /**
     * Enters Picture-In-Picture mode, if possible. This method is designed to
     * be called from the {@code Activity.onUserLeaveHint} method.
     *
     * This is currently not mandatory, but if used will provide automatic
     * handling of the picture in picture mode when user minimizes the app. It
     * will be probably the most useful in case the app is using the welcome
     * page.
     */
    public void enterPictureInPicture() {
        PictureInPictureModule pipModule
            = ReactInstanceManagerHolder.getNativeModule(
                PictureInPictureModule.class);
        if (pipModule != null
                && pipModule.isPictureInPictureSupported()
                && !JitsiMeetActivityDelegate.arePermissionsBeingRequested()) {
            try {
                pipModule.enterPictureInPicture();
            } catch (RuntimeException re) {
                JitsiMeetLogger.e(re, "Failed to enter PiP mode");
            }
        }
    }

    /**
     * Joins the conference specified by the given {@link JitsiMeetConferenceOptions}. If there is
     * already an active conference, it will be left and the new one will be joined.
     * @param options - Description of what conference must be joined and what options will be used
     *                when doing so.
     */
    public void join(@Nullable JitsiMeetConferenceOptions options) {
        JitsiMeetLogger.i("JitsiMeetView", "=== DEBUG: join() called ===");
        JitsiMeetLogger.i("JitsiMeetView", "Options: " + (options != null ? "provided" : "null"));
        
        try {
            Bundle props = options != null ? options.asProps() : new Bundle();
            JitsiMeetLogger.i("JitsiMeetView", "Props size: " + props.size());
            
            if (options != null && options.getRoom() != null) {
                JitsiMeetLogger.i("JitsiMeetView", "Joining room: " + options.getRoom());
            }
            
            setProps(props);
            JitsiMeetLogger.i("JitsiMeetView", "=== join() completed ===");
            
        } catch (Exception e) {
            JitsiMeetLogger.e("JitsiMeetView", "CRASH: Error in join()", e);
            
            if (fakeOverlay != null) {
                fakeOverlay.showError("Failed to join conference: " + e.getMessage());
            }
            throw e;
        }
    }

    /**
     * Internal method which aborts running RN by passing empty props.
     * This is only meant to be used from the enclosing Activity's onDestroy.
     */
    public void abort() {
        setProps(new Bundle());
    }

    /**
     * Creates the {@code ReactRootView} for the given app name with the given
     * props. Once created it's set as the view of this {@code FrameLayout}.
     *
     * @param appName - The name of the "app" (in React Native terms) to load.
     * @param props - The React Component props to pass to the app.
     */
    private void createReactRootView(String appName, @Nullable Bundle props) {
        JitsiMeetLogger.i("JitsiMeetView", "=== DEBUG: createReactRootView started ===");
        JitsiMeetLogger.i("JitsiMeetView", "App name: " + appName);
        
        if (props == null) {
            props = new Bundle();
            JitsiMeetLogger.i("JitsiMeetView", "Props was null, created empty bundle");
        } else {
            JitsiMeetLogger.i("JitsiMeetView", "Props size: " + props.size());
        }

        if (reactRootView == null) {
            JitsiMeetLogger.i("JitsiMeetView", "Creating new ReactRootView...");
            
            try {
                reactNativeStartTime = System.currentTimeMillis(); // Record start time
                JitsiMeetLogger.i("JitsiMeetView", "React Native start time: " + reactNativeStartTime);
                
                reactRootView = new ReactRootView(getContext());
                JitsiMeetLogger.i("JitsiMeetView", "ReactRootView created successfully");
                
                JitsiMeetLogger.i("JitsiMeetView", "Starting React application...");
                JitsiMeetLogger.i("JitsiMeetView", "ReactInstanceManager ready: " + (ReactInstanceManagerHolder.getReactInstanceManager() != null));
                
                reactRootView.startReactApplication(
                    ReactInstanceManagerHolder.getReactInstanceManager(),
                    appName,
                    props);
                JitsiMeetLogger.i("JitsiMeetView", "React application started successfully");
                
                reactRootView.setBackgroundColor(BACKGROUND_COLOR);
                JitsiMeetLogger.i("JitsiMeetView", "Background color set");
                
                // Add React Native view normally - let it load in background
                addView(reactRootView);
                JitsiMeetLogger.i("JitsiMeetView", "ReactRootView added to container");
                
                // Ensure fake overlay stays on top when React Native loads
                if (fakeOverlay != null) {
                    bringChildToFront(fakeOverlay);
                    JitsiMeetLogger.i("JitsiMeetView", "Fake overlay brought to front");
                } else {
                    JitsiMeetLogger.w("JitsiMeetView", "Fake overlay is null when React Native created");
                }
                
                JitsiMeetLogger.i("JitsiMeetView", "=== ReactRootView creation completed ===");
                
            } catch (Exception e) {
                JitsiMeetLogger.e("JitsiMeetView", "CRASH: Error creating ReactRootView", e);
                
                // Try to show error in fake overlay
                if (fakeOverlay != null) {
                    fakeOverlay.showError("React Native failed to load: " + e.getMessage());
                }
                throw e; // Re-throw to maintain original behavior
            }
        } else {
            JitsiMeetLogger.i("JitsiMeetView", "Updating existing ReactRootView props...");
            try {
                reactRootView.setAppProperties(props);
                JitsiMeetLogger.i("JitsiMeetView", "Props updated successfully");
            } catch (Exception e) {
                JitsiMeetLogger.e("JitsiMeetView", "CRASH: Error updating ReactRootView props", e);
                throw e;
            }
        }
    }

    private void initialize(@NonNull Context context) {
        JitsiMeetLogger.i("JitsiMeetView", "=== DEBUG: Initialize started ===");
        
        // Check if the parent Activity implements JitsiMeetActivityInterface,
        // otherwise things may go wrong.
        if (!(context instanceof JitsiMeetActivityInterface)) {
            JitsiMeetLogger.e("JitsiMeetView", "CRASH: Context is not JitsiMeetActivityInterface: " + context.getClass().getName());
            throw new RuntimeException("Enclosing Activity must implement JitsiMeetActivityInterface");
        }
        JitsiMeetLogger.i("JitsiMeetView", "Activity interface check passed");

        setBackgroundColor(BACKGROUND_COLOR);
        JitsiMeetLogger.i("JitsiMeetView", "Background color set to: " + Integer.toHexString(BACKGROUND_COLOR));

        try {
            JitsiMeetLogger.i("JitsiMeetView", "Initializing ReactInstanceManager...");
            ReactInstanceManagerHolder.initReactInstanceManager((Activity) context);
            JitsiMeetLogger.i("JitsiMeetView", "ReactInstanceManager initialized successfully");
        } catch (Exception e) {
            JitsiMeetLogger.e("JitsiMeetView", "CRASH: Failed to initialize ReactInstanceManager", e);
            throw e;
        }
        
        // Create fake conference overlay to show on top of React Native loading
        post(() -> {
            try {
                JitsiMeetLogger.i("JitsiMeetView", "Creating fake overlay...");
                fakeOverlay = new FakeConferenceOverlayView(context);
                JitsiMeetLogger.i("JitsiMeetView", "Fake overlay created successfully");
                
                addView(fakeOverlay);
                JitsiMeetLogger.i("JitsiMeetView", "Fake overlay added to view");
                
                // Show fake overlay immediately to cover "Connecting..." message
                fakeOverlay.show();
                JitsiMeetLogger.i("JitsiMeetView", "Fake overlay shown");
                
                fakeOverlay.bringToFront();
                JitsiMeetLogger.i("JitsiMeetView", "Fake overlay brought to front");
                
                // Start checking for React Native readiness
                startReactNativeReadinessCheck();
                JitsiMeetLogger.i("JitsiMeetView", "React Native readiness check started");
                
            } catch (Exception e) {
                JitsiMeetLogger.e("JitsiMeetView", "CRASH: Error in fake overlay setup", e);
                throw e;
            }
        });
        
        JitsiMeetLogger.i("JitsiMeetView", "=== Initialize completed ===");
    }
    
    /**
     * Monitors React Native loading and hides fake overlay when ready.
     */
    private void startReactNativeReadinessCheck() {
        JitsiMeetLogger.i("JitsiMeetView", "=== Starting React Native readiness check ===");
        Handler handler = new Handler(Looper.getMainLooper());
        
        // Check every 500ms if React Native is ready
        Runnable readinessChecker = new Runnable() {
            @Override
            public void run() {
                JitsiMeetLogger.i("JitsiMeetView", "Checking React Native readiness...");
                
                try {
                    if (isReactNativeReady()) {
                        JitsiMeetLogger.i("JitsiMeetView", "=== React Native is ready! Hiding overlay ===");
                        // React Native is ready, hide the fake overlay
                        if (fakeOverlay != null && fakeOverlay.isShowing()) {
                            // Add a small delay to ensure smooth transition
                            handler.postDelayed(() -> {
                                if (fakeOverlay != null) {
                                    JitsiMeetLogger.i("JitsiMeetView", "Hiding fake overlay now");
                                    fakeOverlay.hide();
                                }
                            }, 300);
                        } else {
                            JitsiMeetLogger.w("JitsiMeetView", "React Native ready but overlay is null or not showing");
                        }
                    } else {
                        JitsiMeetLogger.i("JitsiMeetView", "React Native not ready yet, checking again in 500ms");
                        // Not ready yet, check again in 500ms
                        handler.postDelayed(this, 500);
                    }
                } catch (Exception e) {
                    JitsiMeetLogger.e("JitsiMeetView", "Error in readiness check", e);
                    // Continue checking despite error
                    handler.postDelayed(this, 500);
                }
            }
        };
        
        // Start checking after 2 seconds (give React Native time to start)
        JitsiMeetLogger.i("JitsiMeetView", "Will start checking in 2 seconds...");
        handler.postDelayed(readinessChecker, 2000);
    }
    
    /**
     * Checks if React Native is ready and conference has loaded.
     */
    private boolean isReactNativeReady() {
        // Check if React Native view exists
        if (reactRootView == null) {
            JitsiMeetLogger.i("JitsiMeetView", "React Native not ready: reactRootView is null");
            return false;
        }
        
        // Check if React Native has finished loading
        // We consider it ready when the ReactRootView has child views
        // which indicates the React components have rendered
        boolean hasReactContent = reactRootView.getChildCount() > 0;
        JitsiMeetLogger.i("JitsiMeetView", "React Native content check: hasContent=" + hasReactContent + ", childCount=" + reactRootView.getChildCount());
        
        // Additional check: ensure the ReactRootView is visible and has layout
        boolean isLayoutReady = reactRootView.getVisibility() == VISIBLE && 
                               reactRootView.getWidth() > 0 && 
                               reactRootView.getHeight() > 0;
        JitsiMeetLogger.i("JitsiMeetView", "React Native layout check: isVisible=" + (reactRootView.getVisibility() == VISIBLE) + 
                         ", width=" + reactRootView.getWidth() + ", height=" + reactRootView.getHeight());
        
        // Check if we're past the initial loading phase
        // This can be determined by checking if React Native has been running for a reasonable time
        long elapsedTime = System.currentTimeMillis() - reactNativeStartTime;
        boolean hasTimeElapsed = elapsedTime > 4000; // 4 seconds minimum
        JitsiMeetLogger.i("JitsiMeetView", "React Native time check: elapsed=" + elapsedTime + "ms, hasTimeElapsed=" + hasTimeElapsed);
        
        boolean isReady = hasReactContent && isLayoutReady && hasTimeElapsed;
        JitsiMeetLogger.i("JitsiMeetView", "React Native readiness result: " + isReady + 
                         " (content=" + hasReactContent + ", layout=" + isLayoutReady + ", time=" + hasTimeElapsed + ")");
        
        return isReady;
    }
    
    /**
     * Forces hiding the fake overlay (useful for manual control or fallback).
     */
    public void forceHideFakeOverlay() {
        if (fakeOverlay != null) {
            fakeOverlay.hide();
        }
    }

    /**
     * Helper method to set the React Native props.
     * @param newProps - New props to be set on the React Native view.
     */
    private void setProps(@NonNull Bundle newProps) {
        JitsiMeetLogger.i("JitsiMeetView", "=== DEBUG: setProps started ===");
        JitsiMeetLogger.i("JitsiMeetView", "New props size: " + newProps.size());
        
        try {
            // Merge the default options with the newly provided ones.
            JitsiMeetLogger.i("JitsiMeetView", "Getting default props...");
            Bundle defaultProps = JitsiMeet.getDefaultProps();
            JitsiMeetLogger.i("JitsiMeetView", "Default props size: " + (defaultProps != null ? defaultProps.size() : 0));
            
            Bundle props = mergeProps(defaultProps, newProps);
            JitsiMeetLogger.i("JitsiMeetView", "Props merged, final size: " + props.size());

            // XXX The setProps() method is supposed to be imperative i.e.
            // a second invocation with one and the same URL is expected to join
            // the respective conference again if the first invocation was followed
            // by leaving the conference. However, React and, respectively,
            // appProperties/initialProperties are declarative expressions i.e. one
            // and the same URL will not trigger an automatic re-render in the
            // JavaScript source code. The workaround implemented below introduces
            // "imperativeness" in React Component props by defining a unique value
            // per setProps() invocation.
            long timestamp = System.currentTimeMillis();
            props.putLong("timestamp", timestamp);
            JitsiMeetLogger.i("JitsiMeetView", "Timestamp added: " + timestamp);

            JitsiMeetLogger.i("JitsiMeetView", "Creating React root view with App...");
            createReactRootView("App", props);
            JitsiMeetLogger.i("JitsiMeetView", "=== setProps completed successfully ===");
            
        } catch (Exception e) {
            JitsiMeetLogger.e("JitsiMeetView", "CRASH: Error in setProps", e);
            
            // Show error in fake overlay if possible
            if (fakeOverlay != null) {
                fakeOverlay.showError("Failed to start conference: " + e.getMessage());
            }
            throw e;
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        dispose();
        super.onDetachedFromWindow();
    }

    /**
     * Shows the fake conference overlay.
     */
    public void showFakeOverlay() {
        if (fakeOverlay != null) {
            fakeOverlay.show();
        }
    }

    /**
     * Hides the fake conference overlay.
     */
    public void hideFakeOverlay() {
        if (fakeOverlay != null) {
            fakeOverlay.hide();
        }
    }

    /**
     * Checks if the fake conference overlay is currently showing.
     */
    public boolean isFakeOverlayShowing() {
        return fakeOverlay != null && fakeOverlay.isShowing();
    }
}
