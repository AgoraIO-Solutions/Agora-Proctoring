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
import React, { props, useContext, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import ReactPlayer from 'react-player';

const RecPlayer = (props: any) => {
  const playUrl = props.playbackUrl;
  const playing = props.playing;
  const elapsed = props.elapse;

  if (!props.playbackAction) {
    return null;
  }

  return (
    <View
      style={{
        width: '896px',
        height: '816px',
        borderWidth: 0,
        paddingTop: 18,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderStyle: 'solid',
        position: 'absolute',
        top: '0%',
        left: '20%',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 1000,
        display: 'flex'
      }}
    >
      <Text
        style={{ marginRight: "auto", backgroundColor: "black", padding: 2, color: 'white' }}>
        Alert offset into recording: {props.elapsed}
      </Text>
      <button
        style={{
          marginLeft: "auto",
          backgroundColor: 'black',
          color: 'white',
        }}
        onClick={() => {
          props.setplaybackAction(false);
          props.setPlaying(false);
        }}
      > {"X"}
      </button>
      <ReactPlayer
        width='896px'
        height='1216px'
        playing={playing}
        controls
        url={playUrl}
      />
    </View>
  );
}

export default RecPlayer;

//      <ReactPlayer controls url='https://www.youtube.com/watch?v=9boMnm5X9ak' />