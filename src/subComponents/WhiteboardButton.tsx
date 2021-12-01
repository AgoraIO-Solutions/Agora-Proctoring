/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/

import React, {useContext, useEffect} from 'react';
import {Image, TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import icons from '../assets/icons';
import ColorContext from '../components/ColorContext';
import Layout from './LayoutEnum';
import {whiteboardContext} from '../components/WhiteboardConfigure';

// import RtcEngine from 'react-native-agora';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import {useRole} from '../pages/VideoCall';
import {Role} from '../../bridge/rtc/webNg/Types';

const WhiteboardButton = ({setLayout}) => {
  const {primaryColor} = useContext(ColorContext);

    const {whiteboardActive,  setWhiteboardURL, whiteboardURLState, joinWhiteboardRoom, leaveWhiteboardRoom} =
    useContext(whiteboardContext);
  const {engine, sendControlMessage, updateWbUserAttribute} =
    useContext(ChatContext);
  const role = useRole();
  useEffect(() => {
    if (engine) {
      if (whiteboardActive) {
        if (role === Role.Student) {
          setLayout(Layout.Pinned);
        }
        updateWbUserAttribute('active');
      } else {
        updateWbUserAttribute('inactive');
      }
    }
  }, [whiteboardActive, engine]);

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (whiteboardActive) {
            leaveWhiteboardRoom();
            sendControlMessage(controlMessageEnum.whiteboardStoppped);
            updateWbUserAttribute('inactive');
          } else {
            joinWhiteboardRoom();
            sendControlMessage(controlMessageEnum.whiteboardStarted+whiteboardURLState);
            updateWbUserAttribute('active');
          }
        }}>
        <View
          style={
            whiteboardActive
              ? style.greenLocalButton
              : [style.localButton, {borderColor: primaryColor}]
          }>
          <Image
            source={{
              uri: whiteboardActive ? icons.whiteboard : icons.whiteboard,
            }}
            style={[style.buttonIcon, {tintColor: primaryColor}]}
            resizeMode={'contain'}
          />
        </View>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 5,
            color: $config.PRIMARY_COLOR,
          }}>
          Start Exam
        </Text>
      </TouchableOpacity>
    </>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    borderRadius: 20,
    borderColor: $config.PRIMARY_COLOR,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenLocalButton: {
    backgroundColor: '#4BEB5B',
    borderRadius: 20,
    borderColor: '#F86051',
    width: 40,
    height: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: '80%',
    height: '70%',
    tintColor: $config.PRIMARY_COLOR,
  },
});

export default WhiteboardButton;
