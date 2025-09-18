import React, { PureComponent } from 'react';
import { } from 'react-native';
import { connect, useSelector } from 'react-redux';

import { IReduxState, IStore } from '../../../app/types';
import { hideSheet } from '../../../base/dialog/actions';
import BottomSheet from '../../../base/dialog/components/native/BottomSheet';
import { bottomSheetStyles } from '../../../base/dialog/components/native/styles';
import { isSharedVideoEnabled } from '../../../shared-video/functions';
import SpeakerStatsButton from '../../../speaker-stats/components/native/SpeakerStatsButton';
import { isSpeakerStatsDisabled } from '../../../speaker-stats/functions';
 
import { customButtonPressed } from '../../actions.native';
import { getVisibleNativeButtons } from '../../functions.native';
import { useNativeToolboxButtons } from '../../hooks.native';
import { IToolboxNativeButton } from '../../types';

import RaiseHandButton from './RaiseHandButton';


/**
 * The type of the React {@code Component} props of {@link OverflowMenu}.
 */
interface IProps {

    /**
     * True if breakout rooms feature is available, false otherwise.
     */
    _isBreakoutRoomsSupported?: boolean;

    /**
     * True if the overflow menu is currently visible, false otherwise.
     */
    _isOpen: boolean;

    /**
     * Whether the shared video is enabled or not.
     */
    _isSharedVideoEnabled: boolean;

    /**
     * Whether or not speaker stats is disable.
     */
    _isSpeakerStatsDisabled?: boolean;

    /**
     * Toolbar buttons.
     */
    _mainMenuButtons?: Array<IToolboxNativeButton>;

    /**
     * Overflow menu buttons.
     */
    _overflowMenuButtons?: Array<IToolboxNativeButton>;

    /**
     * Whether the recoding button should be enabled or not.
    */
    _recordingEnabled: boolean;

    /**
    * Whether or not any reactions buttons should be displayed.
    */
    // reactions footer removed

    /**
     * Used for hiding the dialog when the selection was completed.
     */
    dispatch: IStore['dispatch'];
}

interface IState {

    /**
     * True if the bottom sheet is scrolled to the top.
     */
    scrolledToTop: boolean;
}

/**
 * Implements a React {@code Component} with some extra actions in addition to
 * those in the toolbar.
 */
class OverflowMenu extends PureComponent<IProps, IState> {
    /**
     * Initializes a new {@code OverflowMenu} instance.
     *
     * @inheritdoc
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            scrolledToTop: true
        };

        // Bind event handlers so they are only bound once per instance.
        this._onCancel = this._onCancel.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            _isBreakoutRoomsSupported,
            _isSpeakerStatsDisabled,
            dispatch
        } = this.props;

        const buttonProps = {
            afterClick: this._onCancel,
            showLabel: true,
            styles: bottomSheetStyles.buttons
        };

        const topButtonProps = {
            afterClick: this._onCancel,
            dispatch,
            showLabel: true,
            styles: {
                ...bottomSheetStyles.buttons,
                style: {
                    ...bottomSheetStyles.buttons.style,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16
                }
            }
        };

        return (
            <BottomSheet>
                { /* Only keep: Raise your hand, Start screen sharing, Enter tile view, Participants stats */ }
                <RaiseHandButton { ...buttonProps } />
                { this._renderOverflowMenuButtons(topButtonProps) }
                { !_isSpeakerStatsDisabled && <SpeakerStatsButton { ...buttonProps } /> }
            </BottomSheet>
        );
    }

    /**
     * Hides this {@code OverflowMenu}.
     *
     * @private
     * @returns {void}
     */
    _onCancel() {
        this.props.dispatch(hideSheet());
    }

    /**
     * Function to render the reaction menu as the footer of the bottom sheet.
     *
     * @returns {React.ReactElement}
     */
    _renderReactionMenu() { /* Removed footer: no reactions menu in overflow per requirements */ }

    

    /**
     * Function to render the custom buttons for the overflow menu.
     *
     * @param {Object} topButtonProps - Styling button properties.
     * @returns {React.ReactElement}
     */
    _renderOverflowMenuButtons(topButtonProps: Object) {
        const { _overflowMenuButtons, dispatch } = this.props;

        if (!_overflowMenuButtons?.length) {
            return;
        }

        return (
            <>
                {
                    _overflowMenuButtons
                        ?.filter(({ key }) => key === 'screensharing' || key === 'tileview')
                        .map(({ Content, key, text, ...rest }: IToolboxNativeButton) => (
                            <Content
                                { ...topButtonProps }
                                { ...rest }
                                /* eslint-disable react/jsx-no-bind */
                                handleClick = { () => dispatch(customButtonPressed(key, text)) }
                                isToolboxButton = { false }
                                key = { key }
                                text = { text } />
                        ))
                }
            </>
        );
    }
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @private
 * @returns {IProps}
 */
function _mapStateToProps(state: IReduxState) {
    const { conference } = state['features/base/conference'];

    return {
        _isBreakoutRoomsSupported: conference?.getBreakoutRooms()?.isSupported(),
        _isSharedVideoEnabled: isSharedVideoEnabled(state),
        _isSpeakerStatsDisabled: isSpeakerStatsDisabled(state)
    };
}

export default connect(_mapStateToProps)(props => {
    const { clientWidth } = useSelector((state: IReduxState) => state['features/base/responsive-ui']);
    const { customToolbarButtons } = useSelector((state: IReduxState) => state['features/base/config']);
    const {
        mainToolbarButtonsThresholds,
        toolbarButtons
    } = useSelector((state: IReduxState) => state['features/toolbox']);

    const allButtons = useNativeToolboxButtons(customToolbarButtons);

    const { mainMenuButtons, overflowMenuButtons } = getVisibleNativeButtons({
        allButtons,
        clientWidth,
        mainToolbarButtonsThresholds,
        toolbarButtons
    });

    return (
        <OverflowMenu

            // @ts-ignore
            { ... props }
            _mainMenuButtons = { mainMenuButtons }
            _overflowMenuButtons = { overflowMenuButtons } />
    );
});
