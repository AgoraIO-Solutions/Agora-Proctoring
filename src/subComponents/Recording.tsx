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
import { whiteboardContext } from '../components/WhiteboardConfigure';
import MinUidContext from '../../agora-rn-uikit/src/MinUidContext';
import MaxUidContext from '../../agora-rn-uikit/src/MaxUidContext';
import { useChannelInfo, useRole } from '../pages/VideoCall';
import { introspectionFromSchema, isTypeSystemDefinitionNode } from 'graphql';
import { InjectStreamStatus } from 'react-native-agora';

//const recordingServerBaseUrl = "https://proctoring-recording-six-gray.vercel.app/api/";  //Monica's Vercel
const recordingServerBaseUrl = "https://proctoring-recording.vercel.app/api/";             //Vineeth's Vercel
const startLayoutRecordingQuery = async (list: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  console.log(list);
  urlParams.append('list', JSON.stringify(list));
  const recordingAPI = recordingServerBaseUrl + "startlayout?" + urlParams.toString();

  const start = await fetch(
    `${recordingAPI}`,
    {
      method: 'GET',
      credentials: 'same-origin',
    },
  );
  return start.json();
};

//for default recording layout, not being used
const startRecordingQuery = async () => {
  const recordingAPI = recordingServerBaseUrl + "start" + window.location.search;
  const start = await fetch(
    `${recordingAPI}`,
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
  const recordingAPI = recordingServerBaseUrl + "stop?" + urlParams.toString();
  const stop = await fetch(
    `${recordingAPI}`,
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
  const recordingAPI = recordingServerBaseUrl + "query?" + urlParams.toString();
  const query = await fetch(
    `${recordingAPI}`,
    {
      method: 'GET',
      credentials: 'same-origin',
    },
  );
  return query.json();
};

const getUserList = (users: any, userList: any, students: any) => {

  let items = [];
  for (var i = 0; i < students.length; i++) {
    const item = { name: '', pUid: 0, sUid: 0, screen: 0 };
    users.map(
      (u) => {
        userList[u.uid]?.name?.split('-')[0] === students[i] ? (
          item.name = students[i],
          userList[u.uid]?.name?.split('-')[1].endsWith('Primary') ?
            (item.pUid = userList[u.uid]?.screenUid - 1,
              item.screen = userList[u.uid]?.screenUid) :
            (userList[u.uid]?.name?.split('-')[1].endsWith('Secondary') ?
              item.sUid = userList[u.uid]?.screenUid - 1 : null)
        ) : null
      })
    items.push(item);
  }
  console.log("stuent uid list:", items);
  return (items);
}

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
  const recordingStartTime = props.recordingStartTime;
  const setRecordingStartTime = props.setRecordingStartTime;
  const setPlaybackSubUrl = props.setPlaybackSubUrl;
  const playbackSubUrl = props.playbackSubUrl;
  const dataRef = useRef('');
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const users = [...max, ...min];
  const [teacher, students] = useChannelInfo();

  const { whiteboardActive, setWhiteboardURL, whiteboardURLState, joinWhiteboardRoom, leaveWhiteboardRoom } =
    useContext(whiteboardContext);
  const { engine, userList, sendControlMessage, updateWbUserAttribute } =
    useContext(ChatContext);

  useEffect(() => {
    if (recordingActive) {
      Toast.show({ text1: 'Recording & Exam Started', visibilityTime: 1600 });
    }
    // else if(!recordingActive)
    // Toast.show({text1: 'Recording Finished', visibilityTime: 1000})
  }, [recordingActive]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (!recordingActive) {
          setRecordingActive(true);
          const ulist = getUserList(users, userList, students);
          // If recording is not going on, start the recording by executing the graphql query
          startLayoutRecordingQuery(ulist)
            .then((res) => {
              console.log('started recording:', res);
              dataRef.current = JSON.stringify(res);
              sendControlMessage(controlMessageEnum.cloudRecordingActive);
              // set the local recording state to true to update the UI
              setRecordingActive(true);
              setRecordingStartTime(Date.now());
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
          sendControlMessage(controlMessageEnum.whiteboardStarted + whiteboardURLState);
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
