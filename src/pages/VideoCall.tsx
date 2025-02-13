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
import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
//import ProctorConfigure from '../components/ProctorConfigure';
import ProctorContext from '../components/ProctorContext';

import RtcConfigure from '../../agora-rn-uikit/src/RTCConfigure';
import { PropsProvider } from '../../agora-rn-uikit/src/PropsContext';
import Navbar from '../components/Navbar';
import Precall from '../components/Precall';
import ParticipantsView from '../components/ParticipantsView';
import SettingsView from '../components/SettingsView';
import PinnedVideo from '../components/PinnedVideo';
import Controls from '../components/Controls';
import GridVideo from '../components/GridVideo';
import styles from '../components/styles';
import { useParams, useLocation, useHistory } from '../components/Router';
import Chat from '../components/Chat';
import RtmConfigure from '../components/RTMConfigure';
import DeviceConfigure from '../components/DeviceConfigure';

import Logo from '../subComponents/Logo';
import ChatContext from '../components/ChatContext';
import { SidePanelType } from '../subComponents/SidePanelEnum';
import { videoView } from '../../theme.json';
import Layout from '../subComponents/LayoutEnum';
import Toast from '../../react-native-toast-message';
import WhiteboardConfigure from '../components/WhiteboardConfigure';
import { Role } from '../../bridge/rtc/webNg/Types';
import { MaxVideoView } from '../../agora-rn-uikit/Components';
import FallbackLogo from '../subComponents/FallbackLogo';

const useChatNotification = (
  messageStore: string | any[],
  privateMessageStore: string | any[],
  chatDisplayed: boolean,
) => {
  // store the last checked state from the messagestore, to identify unread messages
  const [lastCheckedPublicState, setLastCheckedPublicState] = useState(0);
  const [lastCheckedPrivateState, setLastCheckedPrivateState] = useState({});
  useEffect(() => {
    if (chatDisplayed) {
      setLastCheckedPublicState(messageStore.length);
    }
  }, [messageStore]);

  const setPrivateMessageLastSeen = ({ userId, lastSeenCount }) => {
    setLastCheckedPrivateState((prevState) => {
      return { ...prevState, [userId]: lastSeenCount || 0 };
    });
  };
  return [
    lastCheckedPublicState,
    setLastCheckedPublicState,
    lastCheckedPrivateState,
    setLastCheckedPrivateState,
    setPrivateMessageLastSeen,
  ];
};

const NotificationControl = ({ children, chatDisplayed, setSidePanel }) => {
  const role = useRole();
  const { messageStore, privateMessageStore, userList, localUid } =
    useContext(ChatContext);
  const [
    lastCheckedPublicState,
    setLastCheckedPublicState,
    lastCheckedPrivateState,
    setLastCheckedPrivateState,
    setPrivateMessageLastSeen,
  ] = useChatNotification(messageStore, privateMessageStore, chatDisplayed);
  const pendingPublicNotification =
    messageStore.length - lastCheckedPublicState;
  const privateMessageCountMap = Object.keys(privateMessageStore).reduce(
    (acc, curItem) => {
      let individualPrivateMessageCount = privateMessageStore[curItem].reduce(
        (total, item) => {
          return item.uid === curItem ? total + 1 : total;
        },
        0,
      );
      return { ...acc, [curItem]: individualPrivateMessageCount };
    },
    {},
  );
  const totalPrivateMessage = Object.keys(privateMessageCountMap).reduce(
    (acc, item) => acc + privateMessageCountMap[item],
    0,
  );
  const totalPrivateLastSeen = Object.keys(lastCheckedPrivateState).reduce(
    (acc, item) => acc + lastCheckedPrivateState[item],
    0,
  );
  const pendingPrivateNotification = totalPrivateMessage - totalPrivateLastSeen;

  return children({
    pendingPublicNotification,
    pendingPrivateNotification,
    lastCheckedPublicState,
    setLastCheckedPublicState,
    lastCheckedPrivateState,
    setLastCheckedPrivateState,
    privateMessageCountMap,
    setPrivateMessageLastSeen,
  });
};

enum RnEncryptionEnum {
  /**
   * @deprecated
   * 0: This mode is deprecated.
   */
  None = 0,
  /**
   * 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES128XTS = 1,
  /**
   * 2: 128-bit AES encryption, ECB mode.
   */
  AES128ECB = 2,
  /**
   * 3: 256-bit AES encryption, XTS mode.
   */
  AES256XTS = 3,
  /**
   * 4: 128-bit SM4 encryption, ECB mode.
   *
   * @since v3.1.2.
   */
  SM4128ECB = 4,
}

export function useRole() {
  const { phrase } = useParams<{ phrase: string }>();
  return React.useMemo(
    () =>
      phrase === 'proctor'
        ? Role.Teacher
        : phrase === 'exam'
          ? Role.Student
          : Role.Unknown,
    [phrase],
  );
}

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function useChannelInfo() {
  const params = useQuery();
  const role = useRole();
  let students: string[];
  if (role === Role.Teacher) {
    students = params.get('students')?.split(',') as string[];
  } else {
    students = [params.get('student') as string];
  }
  return [params.get('teacher'), students] as [string, string[]];
}

const VideoCall: React.FC = () => {
  // const {store} = useContext(StorageContext);
  const { deviceType, setDeviceType } = useContext(ProctorContext);

  const [teacher, students] = useChannelInfo();
  const [photoIDUrl, setPhotoIDUrl] = useState<string>('');
  const role = useRole();
  const [username, setUsername] = useState(
    role === Role.Teacher ? teacher : `${students[0]}-Primary`,
  );
  const [callActive, setCallActive] = useState($config.PRECALL ? false : true);
  const [recordingActive, setRecordingActive] = useState(false);
  const [recordingFileReady, setRecordingFileReady] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(0);
  const [queryComplete, setQueryComplete] = useState(true);
  const [playbackSubUrl, setPlaybackSubUrl] = useState<string[]>([]);

  const [sidePanel, setSidePanel] = useState<SidePanelType>(SidePanelType.None);

  const [layout, sl] = useState(
    role === Role.Student ? Layout.Pinned : Layout.Grid,
  );
  const setLayout = (param) => {
    if (role === Role.Teacher) {
      sl(param);
    }
  };

  const history = useHistory();

  const [errorMessage, setErrorMessage] = useState(null);
  let isHost = true; //change to false by default after testing
  let title = '';
  let rtcProps = {
    appId: $config.APP_ID,
    channel: role === Role.Teacher ? teacher : `${teacher}_${students[0]}`,
    uid: null,
    token: null,
    rtm: null,
    screenShareUid: null,
    screenShareToken: null,
    profile: $config.PROFILE,
    dual: true,
    encryption: false,
  };
  let whiteboardProps = {
    roomUuid: null,
    roomToken: null,
  };
  const callbacks = {
    EndCall: () =>
      setTimeout(() => {
        history.push('/goodbye');
      }, 0),
  };

  //http://localhost:9000/exam?teacher=Ben&loadtest=true&student=ssss1
  /*
  if (window.location.search.indexOf("loadtest")>0 && !callActive && deviceType!=2) {
    setCallActive(true);
    setDeviceType(2);
    //setSnapped(true);
    //setPhotoIDUrl(result); /src/assets/photoid.png
  }
*/
  // alert(window.location.search);
  // alert(new URLSearchParams(window.location.search));
  return (
    <>
      {queryComplete || !callActive ? (
        <>
          <PropsProvider
            value={{
              rtcProps,
              callbacks,
              styleProps,
            }}>
            <RtcConfigure callActive={callActive}>
              <WhiteboardConfigure>
                <DeviceConfigure>
                  <RtmConfigure
                    photoIDUrl={photoIDUrl}
                    setRecordingActive={setRecordingActive}
                    name={username}
                    callActive={callActive}>
                    {callActive ? (
                      <View style={style.full}>
                        <NotificationControl
                          setSidePanel={setSidePanel}
                          chatDisplayed={sidePanel === SidePanelType.Chat}>
                          {({
                            pendingPublicNotification,
                            pendingPrivateNotification,
                            setLastCheckedPublicState,
                            lastCheckedPublicState,
                            lastCheckedPrivateState,
                            setLastCheckedPrivateState,
                            privateMessageCountMap,
                            setPrivateMessageLastSeen,
                          }) => (
                            <>

                              {role === Role.Teacher ? (
                                <Navbar
                                  sidePanel={sidePanel}
                                  setSidePanel={setSidePanel}
                                  layout={layout}
                                  setLayout={setLayout}
                                  recordingActive={recordingActive}
                                  setRecordingActive={setRecordingActive}
                                  isHost={isHost}
                                  username={username}
                                  title={title}
                                  pendingMessageLength={
                                    pendingPublicNotification +
                                    pendingPrivateNotification
                                  }
                                  setLastCheckedPublicState={
                                    setLastCheckedPublicState
                                  }
                                />
                              ) : (
                                <></>
                              )}
                              <View
                                style={[
                                  style.videoView,
                                  { backgroundColor: '#ffffff00' },
                                ]}>
                                {role === Role.Student ? (
                                  deviceType == 2 ? (
                                    <MaxVideoView
                                      fallback={() => {
                                        return FallbackLogo("Proc");
                                      }}
                                      user={{
                                        uid: 'local',
                                        audio: true,
                                        video: true,
                                        streamType: 'high',
                                      }}
                                      key={'local'}
                                    />
                                  ) : (
                                    <PinnedVideo />
                                  )) : (
                                  <GridVideo
                                    setLayout={setLayout}
                                    layoutForAlerts={layout}
                                    recordingFileReady={recordingFileReady}
                                    playbackSubUrl={playbackSubUrl}
                                    recordingStartTime={recordingStartTime}
                                  />

                                )}
                                {sidePanel === SidePanelType.Participants ? (
                                  <ParticipantsView
                                    isHost={isHost}
                                    username={username}
                                    setSidePanel={setSidePanel}
                                  />
                                ) : (
                                  <></>
                                )}
                                {sidePanel === SidePanelType.Chat ? (
                                  $config.CHAT & role === Role.Teacher ? (
                                    <Chat
                                      privateMessageCountMap={
                                        privateMessageCountMap
                                      }
                                      pendingPublicNotification={
                                        pendingPublicNotification
                                      }
                                      pendingPrivateNotification={
                                        pendingPrivateNotification
                                      }
                                      setPrivateMessageLastSeen={
                                        setPrivateMessageLastSeen
                                      }
                                      lastCheckedPrivateState={
                                        lastCheckedPrivateState
                                      }
                                    />
                                  ) : (
                                    <></>
                                  )
                                ) : (
                                  <></>
                                )}
                                {sidePanel === SidePanelType.Settings ? (
                                  <SettingsView
                                    isHost={isHost}
                                    username={username}
                                    // setParticipantsView={setParticipantsView}
                                    setSidePanel={setSidePanel}
                                  />
                                ) : (
                                  <></>
                                )}
                              </View>
                              {Platform.OS !== 'web' &&
                                sidePanel === SidePanelType.Chat ? (
                                <></>
                              ) : (
                                <Controls
                                  setLayout={sl}
                                  recordingActive={recordingActive}
                                  setRecordingActive={setRecordingActive}
                                  recordingFileReady={recordingFileReady}
                                  setRecordingFileReady={setRecordingFileReady}
                                  recordingStartTime={recordingStartTime}
                                  setRecordingStartTime={setRecordingStartTime}
                                  playbackSubUrl={playbackSubUrl}
                                  setPlaybackSubUrl={setPlaybackSubUrl}
                                  // chatDisplayed={chatDisplayed}
                                  // setChatDisplayed={setChatDisplayed}
                                  isHost={isHost}
                                  username={username}
                                  // participantsView={participantsView}
                                  // setParticipantsView={setParticipantsView}
                                  sidePanel={sidePanel}
                                  setSidePanel={setSidePanel}
                                  pendingMessageLength={
                                    pendingPublicNotification +
                                    pendingPrivateNotification
                                  }
                                  setLastCheckedPublicState={
                                    setLastCheckedPublicState
                                  }
                                />
                              )}
                            </>
                          )}
                        </NotificationControl>
                      </View>
                    ) : $config.PRECALL ? (
                      <Precall
                        error={errorMessage}
                        setPhotoIDUrl={setPhotoIDUrl}
                        username={username}
                        setUsername={(name: string) => {
                          if (role === Role.Student) {
                            setUsername(`${students[0]}-${name}`);
                          } else {
                            setUsername(name);
                          }
                        }}
                        setCallActive={setCallActive}
                        queryComplete={queryComplete}
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}

                      />
                    ) : (
                      <></>
                    )}
                  </RtmConfigure>
                </DeviceConfigure>
              </WhiteboardConfigure>
            </RtcConfigure>
          </PropsProvider>
        </>
      ) : (
        <View style={style.loader}>
          <View style={style.loaderLogo}>
            <Logo />
          </View>
          <Text style={style.loaderText}>Starting Call. Just a second.</Text>
        </View>
      )}
    </>
  );
};

const styleProps = {
  maxViewStyles: styles.temp,
  minViewStyles: styles.temp,
  localBtnContainer: styles.bottomBar,
  localBtnStyles: {
    muteLocalAudio: styles.localButton,
    muteLocalVideo: styles.localButton,
    switchCamera: styles.localButton,
    endCall: styles.endCall,
    fullScreen: styles.localButton,
    recording: styles.localButton,
    screenshare: styles.localButton,
  },
  theme: $config.PRIMARY_COLOR,
  remoteBtnStyles: {
    muteRemoteAudio: styles.remoteButton,
    muteRemoteVideo: styles.remoteButton,
    remoteSwap: styles.remoteButton,
    minCloseBtnStyles: styles.minCloseBtn,
  },
  BtnStyles: styles.remoteButton,
};
//change these to inline styles or sth
const style = StyleSheet.create({
  full: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '100vh'
  },
  videoView: videoView,
  loader: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loaderLogo: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loaderText: { fontWeight: '500', color: $config.PRIMARY_FONT_COLOR },
});

export default VideoCall;
