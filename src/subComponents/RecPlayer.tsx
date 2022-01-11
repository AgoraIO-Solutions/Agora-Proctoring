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
import React, { Props, useContext, useEffect, useRef } from 'react';
import { Image, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import icons from '../assets/icons';
import ChatContext, { controlMessageEnum } from '../components/ChatContext';
import ColorContext from '../components/ColorContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import Toast from '../../react-native-toast-message';
import ReactPlayer from 'react-player';

const Recplayer = (props: any) => {

  const playUrl = props.playUrl
  console.log("time:", props.playUrl)
  return (
    <View
    >
      <Text>Playingback</Text>
      <ReactPlayer controls url={playUrl} />

    </View>
  )
}

export default Recplayer;

//      <ReactPlayer controls url='https://www.youtube.com/watch?v=9boMnm5X9ak' />