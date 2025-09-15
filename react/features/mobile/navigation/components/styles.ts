import { BoxModel } from '../../../base/styles/components/styles/BoxModel';
import BaseTheme from '../../../base/ui/components/BaseTheme.native';


export const TEXT_COLOR = BaseTheme.palette.text01;

const unreadCounterDescription = {
    ...BaseTheme.typography.bodyShortBoldLarge,
    color: BaseTheme.palette.text03
};

const HEADER_ACTION_BUTTON_SIZE = 16;

const headerNavigationButtonLabel = {
    color: BaseTheme.palette.link01,
    fontSize: HEADER_ACTION_BUTTON_SIZE,
    lineHeight: BaseTheme.spacing[3]
};

const headerNavigationButton = {
    borderRadius: BaseTheme.shape.borderRadius,
    height: BaseTheme.spacing[6],
    marginLeft: BaseTheme.spacing[3]
};

/**
 * Styles of the navigation feature.
 */
export const navigationStyles = {

    connectingScreenContainer: {
        backgroundColor: BaseTheme.palette.uiBackground,
        flex: 1
    },

    connectingScreenContent: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    },

    connectingScreenIndicator: {
        margin: BoxModel.margin
    },

    connectingScreenText: {
        color: TEXT_COLOR,
        marginTop: BaseTheme.spacing[3],
        textAlign: 'center' as 'center'
    },

    // Conference container styles
    conferenceContainer: {
        alignSelf: 'stretch',
        backgroundColor: BaseTheme.palette.uiBackground,
        flex: 1
    },

    // Toolbox and filmstrip container
    toolboxAndFilmstripContainer: {
        bottom: 0,
        flexDirection: 'column' as 'column',
        justifyContent: 'flex-end' as 'flex-end',
        left: 0,
        position: 'absolute' as 'absolute',
        right: 0,
        top: 0
    },

    // Connecting overlay styles with proper types
    connectingOverlay: {
        position: 'absolute' as 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center' as 'center',
        justifyContent: 'center' as 'center',
        zIndex: 1000
    },

    connectingOverlayContent: {
        alignItems: 'center' as 'center',
        justifyContent: 'center' as 'center'
    },

    headerNavigationButton: {
        ...headerNavigationButton
    },

    headerNavigationButtonIcon: {
        ...headerNavigationButton,
        padding: BaseTheme.spacing[2]
    },

    headerNavigationButtonDisabled: {
        backgroundColor: 'transparent',
        marginLeft: BaseTheme.spacing[2]
    },

    headerNavigationButtonLabel: {
        ...headerNavigationButtonLabel
    },

    headerNavigationButtonLabelDisabled: {
        ...headerNavigationButtonLabel,
        color: BaseTheme.palette.text03
    },

    headerNavigationButtonLabelBold: {
        ...headerNavigationButtonLabel,
        ...BaseTheme.typography.bodyShortRegularLarge
    },

    headerNavigationButtonLabelBoldDisabled: {
        ...headerNavigationButtonLabel,
        ...BaseTheme.typography.bodyShortRegularLarge,
        color: BaseTheme.palette.text03
    },

    unreadCounterContainer: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row'
    },

    unreadCounterDescription: {
        ...unreadCounterDescription
    },

    unreadCounterDescriptionFocused: {
        ...unreadCounterDescription,
        color: BaseTheme.palette.text01
    },

    unreadCounterCircle: {
        backgroundColor: BaseTheme.palette.warning01,
        borderRadius: BaseTheme.spacing[4] / 2,
        height: BaseTheme.spacing[4],
        justifyContent: 'center',
        marginLeft: BaseTheme.spacing[2],
        width: BaseTheme.spacing[4]
    },

    unreadCounter: {
        ...BaseTheme.typography.bodyShortBold,
        alignSelf: 'center',
        color: BaseTheme.palette.text04
    }
};
