import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, ViewStyle } from 'react-native';

// Import the main Conference component and required parts
import BrandingImageBackground from '../../../dynamic-branding/components/native/BrandingImageBackground';
import Filmstrip from '../../../filmstrip/components/native/Filmstrip';
import LargeVideo from '../../../large-video/components/LargeVideo.native';
import Toolbox from '../../../toolbox/components/native/Toolbox';
import Container from '../../../base/react/components/native/Container';

import { navigationStyles } from './styles';

interface IProps {
    /**
     * Navigation object provided by React Navigation.
     */
    navigation?: any;
}

const ConnectingPage = ({ navigation }: IProps) => {
    const { t } = useTranslation();

    const handleLargeVideoClick = useCallback(() => {
        // Handle click interactions - can be used to hide/show toolbox
    }, []);

    return (
        <View style={{ flex: 1 }}>
            {/* Main Conference UI - Clean and Direct */}
            <Container style={[navigationStyles.conferenceContainer]}>
                <BrandingImageBackground />
                
                {/* Large Video Area */}
                <LargeVideo onClick={handleLargeVideoClick} />
                
                {/* Bottom Toolbar Container */}
                <View style={navigationStyles.toolboxAndFilmstripContainer as ViewStyle}>
                    {/* Filmstrip (participant thumbnails) */}
                    <Filmstrip />
                    
                    {/* Toolbox (Bottom Toolbar with controls) */}
                    <Toolbox />
                </View>
            </Container>
        </View>
    );
};

export default ConnectingPage;
