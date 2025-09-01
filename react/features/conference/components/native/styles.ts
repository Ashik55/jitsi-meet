import BaseTheme from '../../../base/ui/components/BaseTheme.native';

export const INSECURE_ROOM_NAME_LABEL_COLOR = BaseTheme.palette.actionDanger;

const TITLE_BAR_BUTTON_SIZE = 24;


/**
 * The styles of the safe area view that contains the title bar.
 */
const titleBarSafeView = {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
};

const alwaysOnTitleBar = {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, .5)',
    borderRadius: BaseTheme.shape.borderRadius,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: BaseTheme.spacing[3],
    paddingRight: BaseTheme.spacing[0],
    '&:not(:empty)': {
        padding: BaseTheme.spacing[1]
    }
};

/**
 * The styles of the feature conference.
 */
export default {

    /**
     * {@code Conference} Style.
     */
    conference: {
        alignSelf: 'stretch',
        backgroundColor: BaseTheme.palette.uiBackground,
        flex: 1
    },

    displayNameContainer: {
        margin: BaseTheme.spacing[3]
    },

    /**
     * View that contains the indicators.
     */
    indicatorContainer: {
        flex: 1,
        flexDirection: 'row'
    },

    titleBarButtonContainer: {
        borderRadius: 20,
        height: 40,
        marginRight: 8,
        zIndex: 1,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },

    titleBarButton: {
        iconStyle: {
            color: '#FFFFFF', //white icons
            padding: 8,
            fontSize: TITLE_BAR_BUTTON_SIZE
        },
        underlayColor: 'rgba(255, 255, 255, 0.1)', // Subtle white highlight
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },

    lonelyMeetingContainer: {
        alignSelf: 'stretch',
        alignItems: 'center',
        padding: BaseTheme.spacing[3]
    },

    lonelyMessage: {
        color: BaseTheme.palette.text01,
        paddingVertical: BaseTheme.spacing[2]
    },

    pipButtonContainer: {
        '&:not(:empty)': {
            borderRadius: 3,
            height: BaseTheme.spacing[7],
            marginTop: BaseTheme.spacing[1],
            marginLeft: BaseTheme.spacing[1],
            zIndex: 1,
            width: BaseTheme.spacing[7]
        }
    },

    pipButton: {
        iconStyle: {
            color: BaseTheme.palette.icon01,
            padding: 12,
            fontSize: TITLE_BAR_BUTTON_SIZE
        },
        underlayColor: 'transparent'
    },

    titleBarSafeViewColor: {
        ...titleBarSafeView,
        backgroundColor: BaseTheme.palette.uiBackground
    },

    titleBarSafeViewTransparent: {
        ...titleBarSafeView
    },

    titleBarWrapper: {
        alignItems: 'center',
        backgroundColor: '#000000',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        flexDirection: 'row',
        height: 56,
        paddingHorizontal: 16,
        paddingTop: 8,
        justifyContent: 'space-between'
    },

    // Minimize/back button
    minimizeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8
    },

    minimizeIcon: {
        color: '#FFFFFF',
        fontSize: 24
    },

    // Center content wrapper for title and timer
    titleContentWrapper: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 8
    },

    // Right side icons container
    topRightIcons: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    alwaysOnTitleBar: {
        ...alwaysOnTitleBar,
        marginRight: BaseTheme.spacing[2]
    },

    alwaysOnTitleBarWide: {
        ...alwaysOnTitleBar,
        marginRight: BaseTheme.spacing[12]
    },

    expandedLabelWrapper: {
        zIndex: 1
    },

    roomTimer: {
        ...BaseTheme.typography.bodyShortRegular,
        color: '#B1C4B7',
        fontSize: 13,
        lineHeight: 16,
        textAlign: 'left',
        marginTop: 2
    },

    roomTimerView: {
        backgroundColor: BaseTheme.palette.ui03,
        borderRadius: BaseTheme.shape.borderRadius,
        height: 32,
        justifyContent: 'center',
        paddingHorizontal: BaseTheme.spacing[2],
        paddingVertical: BaseTheme.spacing[1],
        minWidth: 50
    },

    roomName: {
        color: '#FFFFFF',
        ...BaseTheme.typography.bodyShortBold,
        fontSize: 16,
        lineHeight: 20,
        paddingVertical: 0,
        marginBottom: 2
    },

    roomNameView: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderBottomLeftRadius: 3,
        borderTopLeftRadius: 3,
        flexShrink: 1,
        justifyContent: 'center',
        paddingHorizontal: 10
    },

    roomNameWrapper: {
        flexDirection: 'row',
        marginRight: 10,
        marginLeft: 8,
        flexShrink: 1,
        flexGrow: 1
    },

    /**
     * The style of the {@link View} which expands over the whole
     * {@link Conference} area and splits it between the {@link Filmstrip} and
     * the {@link Toolbox}.
     */
    toolboxAndFilmstripContainer: {
        bottom: 0,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0
    },

    insecureRoomNameLabel: {
        backgroundColor: INSECURE_ROOM_NAME_LABEL_COLOR,
        borderRadius: BaseTheme.shape.borderRadius,
        height: 32
    },

    raisedHandsCountLabel: {
        alignItems: 'center',
        backgroundColor: BaseTheme.palette.warning02,
        borderRadius: BaseTheme.shape.borderRadius,
        flexDirection: 'row',
        marginBottom: BaseTheme.spacing[0],
        marginLeft: BaseTheme.spacing[0]
    },

    raisedHandsCountLabelText: {
        color: BaseTheme.palette.uiBackground,
        paddingLeft: BaseTheme.spacing[2]
    }
};
