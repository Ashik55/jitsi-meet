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

import android.content.Context;
import android.graphics.drawable.GradientDrawable;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

/**
 * A native Android overlay that shows a fake conference interface
 * while the React Native app is loading and connecting.
 */
public class FakeConferenceOverlayView extends FrameLayout {

    private static final int BACKGROUND_COLOR = 0xFF111111;
    private static final int TEXT_COLOR = 0xFFFFFFFF;
    private static final int BUTTON_COLOR = 0x33FFFFFF;
    private static final int BUTTON_SIZE_DP = 48;
    private static final int AVATAR_SIZE_DP = 120;

    private boolean isVisible = true;

    public FakeConferenceOverlayView(@NonNull Context context) {
        super(context);
        initialize();
    }

    public FakeConferenceOverlayView(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        initialize();
    }

    public FakeConferenceOverlayView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        initialize();
    }

    private void initialize() {
        setBackgroundColor(BACKGROUND_COLOR);
        setLayoutParams(new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        
        // Ensure overlay is always on top with maximum elevation
        setElevation(1000f);
        setTranslationZ(1000f);
        bringToFront();
        
        // Start visible
        setVisibility(VISIBLE);
        setAlpha(1.0f);
        isVisible = true;

        createOverlayContent();
        
        // Force to front after content is created
        post(() -> bringToFront());
    }

    private void createOverlayContent() {
        // Main container
        LinearLayout mainContainer = new LinearLayout(getContext());
        mainContainer.setOrientation(LinearLayout.VERTICAL);
        mainContainer.setLayoutParams(new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // Title bar
        TextView titleBar = createTitleBar();
        mainContainer.addView(titleBar);

        // Main content area (participant view)
        FrameLayout participantArea = createParticipantArea();
        LinearLayout.LayoutParams participantParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            0,
            1.0f
        );
        participantArea.setLayoutParams(participantParams);
        mainContainer.addView(participantArea);

        // Toolbox
        LinearLayout toolbox = createToolbox();
        mainContainer.addView(toolbox);

        addView(mainContainer);
    }

    private TextView createTitleBar() {
        TextView titleBar = new TextView(getContext());
        titleBar.setText("Connecting...");
        titleBar.setTextColor(TEXT_COLOR);
        titleBar.setTextSize(16);
        titleBar.setGravity(Gravity.CENTER);
        titleBar.setPadding(dpToPx(16), dpToPx(12), dpToPx(16), dpToPx(12));
        titleBar.setBackgroundColor(0x80000000); // Semi-transparent black

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        titleBar.setLayoutParams(params);

        return titleBar;
    }

    private FrameLayout createParticipantArea() {
        FrameLayout participantArea = new FrameLayout(getContext());
        participantArea.setBackgroundColor(BACKGROUND_COLOR);

        // Create centered content
        LinearLayout centerContent = new LinearLayout(getContext());
        centerContent.setOrientation(LinearLayout.VERTICAL);
        centerContent.setGravity(Gravity.CENTER);

        FrameLayout.LayoutParams centerParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            Gravity.CENTER
        );
        centerContent.setLayoutParams(centerParams);

        // Avatar
        ImageView avatar = createAvatar();
        centerContent.addView(avatar);

        // User name
        TextView userName = new TextView(getContext());
        userName.setText("You");
        userName.setTextColor(TEXT_COLOR);
        userName.setTextSize(18);
        userName.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams nameParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        nameParams.topMargin = dpToPx(16);
        userName.setLayoutParams(nameParams);
        centerContent.addView(userName);

        // Connecting indicator
        TextView connectingText = new TextView(getContext());
        connectingText.setText("Connecting...");
        connectingText.setTextColor(0xFFAAAAAA);
        connectingText.setTextSize(12);
        connectingText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams connectingParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        connectingParams.topMargin = dpToPx(8);
        connectingText.setLayoutParams(connectingParams);
        centerContent.addView(connectingText);

        participantArea.addView(centerContent);
        return participantArea;
    }

    private ImageView createAvatar() {
        ImageView avatar = new ImageView(getContext());
        
        // Create circular avatar background
        GradientDrawable avatarBackground = new GradientDrawable();
        avatarBackground.setShape(GradientDrawable.OVAL);
        avatarBackground.setColor(0xFF4A90E2); // Blue color
        
        avatar.setBackground(avatarBackground);
        
        // Set size
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            dpToPx(AVATAR_SIZE_DP),
            dpToPx(AVATAR_SIZE_DP)
        );
        avatar.setLayoutParams(params);

        return avatar;
    }

    private LinearLayout createToolbox() {
        LinearLayout toolbox = new LinearLayout(getContext());
        toolbox.setOrientation(LinearLayout.HORIZONTAL);
        toolbox.setGravity(Gravity.CENTER);
        toolbox.setBackgroundColor(0xB3000000); // Semi-transparent black
        toolbox.setPadding(dpToPx(16), dpToPx(20), dpToPx(16), dpToPx(20));

        LinearLayout.LayoutParams toolboxParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        toolbox.setLayoutParams(toolboxParams);

        // Add fake buttons
        toolbox.addView(createToolboxButton("🎤")); // Mic
        toolbox.addView(createToolboxButton("📹")); // Video
        toolbox.addView(createHangupButton());      // Hangup (red)
        toolbox.addView(createToolboxButton("⋯"));  // More options

        return toolbox;
    }

    private FrameLayout createToolboxButton(String icon) {
        FrameLayout button = new FrameLayout(getContext());
        
        // Create circular button background
        GradientDrawable buttonBackground = new GradientDrawable();
        buttonBackground.setShape(GradientDrawable.OVAL);
        buttonBackground.setColor(BUTTON_COLOR);
        button.setBackground(buttonBackground);

        // Set size and margins
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            dpToPx(BUTTON_SIZE_DP),
            dpToPx(BUTTON_SIZE_DP)
        );
        params.setMargins(dpToPx(8), 0, dpToPx(8), 0);
        button.setLayoutParams(params);

        // Add icon
        TextView iconText = new TextView(getContext());
        iconText.setText(icon);
        iconText.setTextColor(TEXT_COLOR);
        iconText.setTextSize(20);
        iconText.setGravity(Gravity.CENTER);
        
        FrameLayout.LayoutParams iconParams = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT,
            Gravity.CENTER
        );
        iconText.setLayoutParams(iconParams);
        button.addView(iconText);

        return button;
    }

    private FrameLayout createHangupButton() {
        FrameLayout button = createToolboxButton("📞");
        
        // Make hangup button red
        GradientDrawable buttonBackground = new GradientDrawable();
        buttonBackground.setShape(GradientDrawable.OVAL);
        buttonBackground.setColor(0xFFE74C3C); // Red color
        button.setBackground(buttonBackground);

        return button;
    }

    private int dpToPx(int dp) {
        float density = getContext().getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    /**
     * Shows the fake overlay.
     */
    public void show() {
        if (!isVisible) {
            setVisibility(VISIBLE);
            setAlpha(1.0f);
            setElevation(1000f);
            setTranslationZ(1000f);
            bringToFront();
            isVisible = true;
            
            // Force to front with a slight delay to ensure it's on top
            post(() -> {
                bringToFront();
                if (getParent() instanceof ViewGroup) {
                    ((ViewGroup) getParent()).bringChildToFront(this);
                }
            });
        }
    }

    /**
     * Hides the fake overlay with a fade-out animation.
     */
    public void hide() {
        if (isVisible) {
            animate()
                .alpha(0f)
                .setDuration(500)
                .withEndAction(() -> {
                    setVisibility(GONE);
                    isVisible = false;
                })
                .start();
        }
    }

    /**
     * Checks if the overlay is currently visible.
     */
    public boolean isShowing() {
        return isVisible && getVisibility() == VISIBLE;
    }

    /**
     * Shows an error message in the overlay.
     * @param errorMessage The error message to display
     */
    public void showError(String errorMessage) {
        // Make sure the overlay is visible
        show();
        
        // Find and update the title bar to show error
        if (getChildCount() > 0 && getChildAt(0) instanceof LinearLayout) {
            LinearLayout mainContainer = (LinearLayout) getChildAt(0);
            
            // Update title bar (first child)
            if (mainContainer.getChildCount() > 0 && mainContainer.getChildAt(0) instanceof TextView) {
                TextView titleBar = (TextView) mainContainer.getChildAt(0);
                titleBar.setText("Connection Error");
                titleBar.setBackgroundColor(0xFFE74C3C); // Red background
            }
            
            // Update connecting text in participant area (second child)
            if (mainContainer.getChildCount() > 1 && mainContainer.getChildAt(1) instanceof FrameLayout) {
                FrameLayout participantArea = (FrameLayout) mainContainer.getChildAt(1);
                
                if (participantArea.getChildCount() > 0 && participantArea.getChildAt(0) instanceof LinearLayout) {
                    LinearLayout centerContent = (LinearLayout) participantArea.getChildAt(0);
                    
                    // Find the connecting text (should be the last TextView)
                    for (int i = centerContent.getChildCount() - 1; i >= 0; i--) {
                        if (centerContent.getChildAt(i) instanceof TextView) {
                            TextView connectingText = (TextView) centerContent.getChildAt(i);
                            connectingText.setText(errorMessage);
                            connectingText.setTextColor(0xFFE74C3C); // Red text
                            break;
                        }
                    }
                }
            }
        }
    }
}
