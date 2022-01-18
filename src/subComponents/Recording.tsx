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
import React, { useContext, useEffect, useRef } from 'react';
import { Image, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import icons from '../assets/icons';
import ChatContext, { controlMessageEnum } from '../components/ChatContext';
import ColorContext from '../components/ColorContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import Toast from '../../react-native-toast-message';
import {whiteboardContext} from '../components/WhiteboardConfigure';

const startRecordingQuery = async () => {
  const start = await fetch(
    `https://proctoring-recording.vercel.app/api/start${window.location.search}`,
    {
      method: 'GET',
      credentials: 'same-origin',
    },
  );
  return start.json();
};

const stopRecordingQuery = async (data: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.append('data', data);
  const stop = await fetch(
    `https://proctoring-recording.vercel.app/api/stop?${urlParams.toString()}`,
    {
      method: 'GET',
      credentials: 'same-origin',
    },
  );
  return stop.json();
};

const queryRecordingQuery = async (data: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.append('data', data);
  const query = await fetch(
    `https://proctoring-recording.vercel.app/api/query?${urlParams.toString()}`,
    {
      method: 'GET',
      credentials: 'same-origin',
    },
  );
  return query.json();
};

/**
 * Component to start / stop Agora cloud recording.
 * Sends a control message to all users in the channel over RTM to indicate that
 * Cloud recording has started/stopped.
 */
const Recording = (props: any) => {
  const { rtcProps } = useContext(PropsContext);
  const { primaryColor } = useContext(ColorContext);
  const setRecordingActive = props.setRecordingActive;
  const recordingActive = props.recordingActive;
  const setRecordingFileReady = props.setRecordingFileReady;
  const recordingFileReady = props.recordingFileReady;
  const setPlaybackSubUrl = props.setPlaybackSubUrl;
  const playbackSubUrl = props.playbackSubUrl;
  const dataRef = useRef('');
  
  const {whiteboardActive,  setWhiteboardURL, whiteboardURLState, joinWhiteboardRoom, leaveWhiteboardRoom} =
  useContext(whiteboardContext);
  const {engine, sendControlMessage, updateWbUserAttribute} =
  useContext(ChatContext);

  useEffect(() => {
    if (recordingActive) {
      Toast.show({ text1: 'Recording Started', visibilityTime: 1000 });
    }
    // else if(!recordingActive)
    // Toast.show({text1: 'Recording Finished', visibilityTime: 1000})
  }, [recordingActive]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (!recordingActive) {
          setRecordingActive(true);
          // If recording is not going on, start the recording by executing the graphql query
          startRecordingQuery()
            .then((res) => {
              console.log('started recording:', res);
              dataRef.current = JSON.stringify(res);
              sendControlMessage(controlMessageEnum.cloudRecordingActive);
              // set the local recording state to true to update the UI

              setTimeout(() => queryRecordingQuery(dataRef.current)
                .then((res) => {
                  let fileName = Array(res.length).fill('null');
                  for (var i in res) {
                    var json = JSON.parse(res[i]);
                    fileName[i] = json.serverResponse.fileList[0].fileName;
                    setPlaybackSubUrl((p) => ([...p, fileName[i]]));
                    //console.log("playback URL:", fileName[i], playbackSubUrl);
                  }
                  setRecordingFileReady(true);
                  sendControlMessage(controlMessageEnum.cloudRecordingFileReady);
                })
                .catch((err) => {
                  console.log(err);
                }), 15000);
            })
            .catch((err) => {
              console.log(err);
            });

            // start exam
            joinWhiteboardRoom();
            sendControlMessage(controlMessageEnum.whiteboardStarted+whiteboardURLState);
            updateWbUserAttribute('active');

        } else {
          // If recording is already going on, stop the recording by executing the graphql query.
          setRecordingActive(false);
          stopRecordingQuery(dataRef.current)
            .then((res) => {
              console.log('stopped recording:', res);
              // Once the backend sucessfuly stops recording,
              // send a control message to everbody in the channel indicating that cloud recording is now inactive.
              sendControlMessage(controlMessageEnum.cloudRecordingUnactive);
              // set the local recording state to false to update the UI

              // send a control message to everbody in the channel indicating that cloud recording does not have a file to play.
              sendControlMessage(controlMessageEnum.cloudRecordingFileNotReady);
              // set the local recording file ready state to false
              //setRecordingFileReady(false);
            })
            .catch((err) => {
              console.log(err);
            });

            // stop exam
            leaveWhiteboardRoom();
            sendControlMessage(controlMessageEnum.whiteboardStoppped);
            updateWbUserAttribute('inactive');
        }
      }}>
      <View style={[style.localButton, { borderColor: primaryColor }]}>
        <Image
          source={{
            uri: recordingActive
              ? icons.recordingActiveIcon
              : icons.recordingIcon,
          }}
          style={[
            style.buttonIcon,
            { tintColor: recordingActive ? '#FD0845' : primaryColor },
          ]}
          resizeMode={'contain'}
        />
      </View>
      <Text
        style={{
          textAlign: 'center',
          marginTop: 5,
          color: recordingActive ? '#FD0845' : $config.PRIMARY_COLOR,
        }}>
        {recordingActive ? 'Stop Exam' : 'Start Exam'}
      </Text>
    </TouchableOpacity >
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    borderRadius: 23,
    borderColor: $config.PRIMARY_COLOR,
    borderWidth: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: '100%',
    height: '100%',
    tintColor: $config.PRIMARY_COLOR,
  },
});

export default Recording;
