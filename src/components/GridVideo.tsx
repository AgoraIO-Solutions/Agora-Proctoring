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
import React, { useMemo, useContext, useState, useEffect, Props } from 'react';
import {
  View,
  Platform,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import MinUidContext from '../../agora-rn-uikit/src/MinUidContext';
import MaxUidContext from '../../agora-rn-uikit/src/MaxUidContext';
import { MaxVideoView } from '../../agora-rn-uikit/Components';

import icons from '../assets/icons';
import styles from './styles';
import ColorContext from './ColorContext';
import FallbackLogo from '../subComponents/FallbackLogo';
import Layout from '../subComponents/LayoutEnum';
import RtcContext, {
  DispatchType,
  UidInterface,
} from '../../agora-rn-uikit/src/RtcContext';
import { whiteboardContext } from './WhiteboardConfigure';
import { useChannelInfo, useRole } from '../pages/VideoCall';
import { Role } from '../../bridge/rtc/webNg/Types';
import ChatContext from './ChatContext';
import RecPlayer from '../subComponents/RecPlayer';
import { boolean } from 'yargs';

const layout = (len: number, isDesktop: boolean = true) => {
  const rows = Math.round(Math.sqrt(len));
  const cols = Math.ceil(len / rows);
  let [r, c] = isDesktop ? [rows, cols] : [cols, rows];
  return {
    matrix:
      len > 0
        ? [
          ...Array(r - 1)
            .fill(null)
            .map(() => Array(c).fill('X')),
          Array(len - (r - 1) * c).fill('X'),
        ]
        : [],
    dims: { r, c },
  };
};

interface GridVideoProps {
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
  layoutAlerts: any;
  playbackSubUrl: string[];
  recordingFileReady: boolean;
}

const GridVideo = (props: GridVideoProps) => {
  const { dispatch } = useContext(RtcContext);
  const { messageStore, userAlertCounts, userList, clearAlertCount } = useContext(ChatContext);

  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const role = useRole();
  const whiteboard = useContext(whiteboardContext);
  const recordingFileReady = props.recordingFileReady;

  const whiteboardActive =
    role === Role.Teacher ? false : whiteboard.whiteboardActive;
  const wb: UidInterface = {
    uid: 'whiteboard',
    audio: false,
    video: false,
    streamType: 'high',
  };

  //const playbackUrl = 'https://www.youtube.com/watch?v=9boMnm5X9ak'
  //const playbackUrl = 'https://www.youtube.com/watch?v=AQAgpVUg5_s'
  const playbackBaseUrl = 'https://agora-proctoring.s3.us-west-1.amazonaws.com/';
  const playbackSubUrl = props.playbackSubUrl;
  const { primaryColor } = useContext(ColorContext);
  const [currentPlaybackUrl, setCurrentPlaybackUrl] = useState('');

  // Whiteboard: Add an extra user with uid as whiteboard to intercept
  // later and replace with whiteboardView
  const users = [...max, ...min, wb];
  const [teacher, students] = useChannelInfo();
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);

  const [expandUID, setExpandUID] = useState("0");
  const [expandUsername, setExpandUsername] = useState("");
  const [playbackAction, setplaybackAction] = useState(false);
  const [playing, setPlaying] = useState(true);

  const [showAlertTable, setShowAlertTable] = useState(false);
  const [playbackFullUrl, setPlaybackFullUrl] = useState<string[]>([]);
  const isDesktop = dim[0] > dim[1] + 100;
  let { matrix, dims } = useMemo(
    // Whiteboard: Only iterate over n-1 elements when whiteboard not
    // active since last element is always whiteboard placeholder
    () =>
      layout(students.length, isDesktop),
    [students.length, isDesktop, whiteboardActive],
  );

  if (props.layoutAlerts != Layout.Pinned) {
    console.log(" layoutAlerts " + props.layoutAlerts);
    clearAlertCount();
  }

  return (
    <React.Fragment>
      <RecPlayer
        playbackAction={playbackAction}
        setplaybackAction={setplaybackAction}
        playing={playing}
        setPlaying={setPlaying}
        playbackUrl={currentPlaybackUrl}
      />

      <View
        style={[style.full, { paddingHorizontal: isDesktop ? 10 : 0 }]}
        onLayout={onLayout}>

        {matrix.map((r, ridx) => (
          <View style={style.gridRow} key={ridx}>
            {r.map((c, cidx) => (
              // student cells
              <View style={style.gridVideoContainerInner} key={cidx}>
                {userAlertCounts.get(students[ridx * dims.c + cidx]) > 0 ? (
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#aa0000' }}>
                    {students[ridx * dims.c + cidx].charAt(0).toUpperCase() + students[ridx * dims.c + cidx].slice(1)}
                    &nbsp;
                    ({userAlertCounts.get(students[ridx * dims.c + cidx])})
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16 }}>
                    {students[ridx * dims.c + cidx].charAt(0).toUpperCase() + students[ridx * dims.c + cidx].slice(1)}
                  </Text>
                )}
                <View style={{ flex: 1 }}>
                  {props.layoutAlerts != Layout.Pinned ? (

                    <View
                      style={{
                        flex: 0.5,
                        overflowY: 'auto',
                        marginBottom: 10,
                      }}>

                      {users.map(
                        // alert message table
                        (u) =>
                          userList[u.uid]?.name?.split('-')[0] ===
                            students[ridx * dims.c + cidx]
                            ? messageStore.slice(0).reverse()
                              // .filter((m: any) => m.uid === u.uid)
                              .map((m: any, i) =>
                                m.uid === u.uid ||
                                  m.uid + parseInt(0xffffffff) + 1 === u.uid ? (
                                  <View style={{ flexDirection: 'row' }} key={i}>
                                    <Text style={{ flex: 1 }}>
                                      {new Date(m.ts).getHours()}:
                                      {new Date(m.ts).getMinutes()}:
                                      {('0' + new Date(m.ts).getSeconds()).slice(
                                        -2,
                                      )}
                                    </Text>
                                    <Text style={{ flex: 3 }}>
                                      {m.msg.slice(1)}
                                    </Text>
                                    {/* <Text style={{flex: 1}}>{m.uid}</Text> */}
                                    <button
                                      disabled={!recordingFileReady}
                                      onClick={() => {
                                        setplaybackAction(true);
                                        setPlaying(true)
                                        for (var j in playbackSubUrl) {
                                          if (playbackSubUrl[j].includes(students[ridx * dims.c + cidx])) {
                                            playbackFullUrl[ridx * dims.c + cidx] = playbackBaseUrl.concat(playbackSubUrl[j]);
                                            setPlaybackFullUrl(playbackFullUrl);
                                            break;
                                          }
                                        }
                                        setCurrentPlaybackUrl(playbackFullUrl[ridx * dims.c + cidx])
                                      }}
                                    > {">"}
                                    </button>
                                  </View>
                                ) : (
                                  console.log(m.uid, u.uid)
                                ),
                              )
                            : null,
                      )}
                    </View>
                  ) : (
                    <></>
                  )}
                  <View
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `1fr 1fr`,
                      gridTemplateRows: `1fr 1fr`,
                      flex: 1,
                      gridGrap: 2,
                      // flex: 1,
                      // flexDirection: 'row',
                      // overflowX: 'scroll',
                    }}>

                    {users.map(
                      // photo id
                      (u, i) =>
                        userList[u.uid]?.name?.split('-')[0] ===
                        students[ridx * dims.c + cidx] &&
                        userList[u?.uid]?.name?.endsWith('Primary') && (
                          <React.Fragment key={userList[u?.uid]?.id} >
                            <View
                              style={{
                                width: (expandUID != "0" && userList[u?.uid]?.id != expandUID && expandUsername === students[ridx * dims.c + cidx]) ? '0px' : '100%',
                                height: (expandUID != "0" && userList[u?.uid]?.id != expandUID && expandUsername === students[ridx * dims.c + cidx]) ? '0px' : '100%',
                                borderWidth: 1,
                                borderColor: 'transparent',
                                borderStyle: 'solid',
                                position: userList[u?.uid]?.id === expandUID ? 'absolute' : 'relative'
                              }}>
                              <img
                                style={{
                                  width: (expandUID != "0" && userList[u?.uid]?.id != expandUID && expandUsername === students[ridx * dims.c + cidx]) ? '0' : '100%',
                                  height: (expandUID != "0" && userList[u?.uid]?.id != expandUID && expandUsername === students[ridx * dims.c + cidx]) ? '0' : '100%',
                                  margin: 'auto',
                                  objectFit: 'contain'
                                }}
                                src={userList[u?.uid]?.id}

                                onClick={() => {
                                  // alert(expandUID);
                                  if (expandUID == userList[u?.uid]?.id) {
                                    setExpandUID("0");
                                    setExpandUsername("");
                                  }
                                  else {
                                    setExpandUID(userList[u?.uid]?.id)
                                    setExpandUsername(students[ridx * dims.c + cidx]);
                                  }
                                }}
                              />
                            </View>
                          </React.Fragment>
                        ),
                    )}

                    {users.map((u, i) =>
                      // student video cells
                      userList[u.uid]?.name?.split('-')[0] ===
                        students[ridx * dims.c + cidx] ? (
                        <React.Fragment key={u.uid} >
                          <View
                            style={{
                              width: (expandUID != "0" && u?.uid.toString() != expandUID && expandUsername === students[ridx * dims.c + cidx]) ? '0' : '100%',
                              height: (expandUID != "0" && u?.uid.toString() != expandUID && expandUsername === students[ridx * dims.c + cidx]) ? '0' : '100%',
                              borderWidth: 1,
                              borderColor: 'transparent',
                              borderStyle: 'solid',
                              position: u?.uid.toString() === expandUID ? 'absolute' : 'relative'
                            }}>

                            <MaxVideoView
                              fallback={() => {
                                return FallbackLogo(userList[u?.uid]?.name);
                              }}
                              user={u}
                              setExpandUID={setExpandUID}
                              expandUID={expandUID}
                              username={students[ridx * dims.c + cidx]}
                              setExpandUsername={setExpandUsername}
                              key={u.uid}
                            />
                          </View>
                        </React.Fragment>
                      ) : null,
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </React.Fragment>
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
    // padding: 20,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 2,
  },
  gridVideoContainerInner: {
    borderColor: '#ddd',
    marginHorizontal: 2,
    //backgroundColor: '#ff00ff',
    borderWidth: 1,
    // width: '100%',
    // borderRadius: 15,
    flex: 1,
    overflow: 'hidden',
    // margin: 1,
    paddingHorizontal: 10,
  },
  MicBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginHorizontal: 10,
    marginRight: 20,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    display: 'flex',
    justifyContent: 'center',
  },
  MicIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
});
export default GridVideo;
