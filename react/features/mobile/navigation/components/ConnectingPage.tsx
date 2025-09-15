import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, Text, View, ViewStyle } from 'react-native';

import JitsiScreen from '../../../base/modal/components/JitsiScreen';
import LoadingIndicator from '../../../base/react/components/native/LoadingIndicator';
// Import the main Conference component
import Conference from '../../../conference/components/native/Conference';

import { TEXT_COLOR, navigationStyles } from './styles';


const ConnectingPage = () => {
    const { t } = useTranslation();

    // Option 1: Use the full Conference UI directly
    return <Conference />;

    // Option 2: Use Conference UI with a connecting overlay (commented out)
    // return (
    //     <View style={{ flex: 1 }}>
    //         <Conference />
    //         <View style={navigationStyles.connectingOverlay}>
    //             <SafeAreaView>
    //                 <LoadingIndicator
    //                     color={TEXT_COLOR}
    //                     size='large' />
    //                 <Text style={navigationStyles.connectingScreenText}>
    //                     {t('connectingOverlay.joiningRoom')}
    //                 </Text>
    //             </SafeAreaView>
    //         </View>
    //     </View>
    // );
};

export default ConnectingPage;
