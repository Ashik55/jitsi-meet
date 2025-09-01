import ColorSchemeRegistry from '../../../base/color-scheme/ColorSchemeRegistry';
import { schemeColor } from '../../../base/color-scheme/functions';
import BaseTheme from '../../../base/ui/components/BaseTheme.native';

const BUTTON_SIZE = 48;

// Toolbox, toolbar:

/**
 * The style of toolbar buttons.
 */
const toolbarButton = {
    borderRadius: BaseTheme.shape.borderRadius,
    borderWidth: 0,
    flex: 0,
    flexDirection: 'row',
    height: BUTTON_SIZE,
    justifyContent: 'center',
    marginHorizontal: 6,
    marginVertical: 6,
    width: BUTTON_SIZE
};

/**
 * The icon style of the toolbar buttons.
 */
const toolbarButtonIcon = {
    alignSelf: 'center',
    color: BaseTheme.palette.icon04,
    fontSize: 24
};


/**
 * The icon style of toolbar buttons which display white icons.
 */
const whiteToolbarButtonIcon = {
    ...toolbarButtonIcon,
    color: BaseTheme.palette.icon01
};

/**
 * The style of reaction buttons.
 */
const reactionButton = {
    ...toolbarButton,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginTop: 0,
    marginHorizontal: 0
};

const gifButton = {
    ...reactionButton,
    backgroundColor: '#000'
};

/**
 * The style of the emoji on the reaction buttons.
 */
const reactionEmoji = {
    fontSize: 20,
    color: BaseTheme.palette.icon01
};

const reactionMenu = {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BaseTheme.palette.ui01
};

/**
 * The Toolbox and toolbar related styles.
 */
const styles = {

    sheetGestureRecognizer: {
        alignItems: 'stretch',
        flexDirection: 'column'
    },

/**
 * The style of the toolbar.
 */
toolbox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: BaseTheme.spacing[4],
    marginBottom: BaseTheme.spacing[6],
    paddingVertical: BaseTheme.spacing[2],
    paddingHorizontal: BaseTheme.spacing[4]
},

toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1
},

toolbarButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: BaseTheme.spacing[1]
},

/**
 * The style of the root/top-level container of {@link Toolbox}.
 */
toolboxContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'column',
    maxWidth: 580,
    marginHorizontal: 'auto',
    marginVertical: BaseTheme.spacing[0],
    width: '100%'
},

    toolboxButtonIconContainer: {
        alignItems: 'center',
        borderRadius: BaseTheme.shape.borderRadius,
        height: BaseTheme.spacing[7],
        justifyContent: 'center',
        width: BaseTheme.spacing[7]
    }
};

export default styles;

/**
 * Color schemed styles for the @{Toolbox} component.
 */
ColorSchemeRegistry.register('Toolbox', {
    /**
     * Styles for buttons in the toolbar.
     */
    buttonStyles: {
        iconStyle: toolbarButtonIcon,
        style: toolbarButton
    },

    buttonStylesBorderless: {
        iconStyle: {
            ...whiteToolbarButtonIcon,
            fontSize: 28
        },
        style: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 0,
            marginVertical: 0
        },
        underlayColor: 'rgba(255, 255, 255, 0.4)'
    },

    backgroundToggle: {
        backgroundColor: BaseTheme.palette.ui04
    },

    hangupMenuContainer: {
        marginHorizontal: BaseTheme.spacing[2],
        marginVertical: BaseTheme.spacing[2]
    },

    hangupButton: {
        flex: 1,
        marginHorizontal: BaseTheme.spacing[2],
        marginVertical: BaseTheme.spacing[2]
    },

    hangupButtonStyles: {
        iconStyle: {
            ...whiteToolbarButtonIcon,
            fontSize: 28
        },
        style: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: schemeColor('hangup'),
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 0,
            marginVertical: 0
        },
        underlayColor: BaseTheme.palette.ui04
    },

    reactionDialog: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent'
    },

    overflowReactionMenu: {
        ...reactionMenu,
        padding: BaseTheme.spacing[3]
    },

    reactionMenu: {
        ...reactionMenu,
        paddingHorizontal: BaseTheme.spacing[3],
        borderRadius: 3,
        width: 360
    },

    reactionRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    reactionButton: {
        gifButton,
        style: reactionButton,
        underlayColor: BaseTheme.palette.ui04,
        emoji: reactionEmoji
    },

    emojiAnimation: {
        color: BaseTheme.palette.icon01,
        position: 'absolute',
        zIndex: 1001,
        elevation: 2,
        fontSize: 20,
        left: '50%',
        top: '100%'
    },

    /**
     * Styles for toggled buttons in the toolbar.
     */
    toggledButtonStyles: {
        iconStyle: whiteToolbarButtonIcon,
        style: {
            ...toolbarButton
        },
        underlayColor: 'transparent'
    }
});
