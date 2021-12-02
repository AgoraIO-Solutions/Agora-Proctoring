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
import React, {useMemo, useContext, useState, useEffect} from 'react';
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
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import chatContext from './ChatContext';
import icons from '../assets/icons';
import styles from './styles';
import ColorContext from './ColorContext';
import FallbackLogo from '../subComponents/FallbackLogo';
import Layout from '../subComponents/LayoutEnum';
import RtcContext, {
  DispatchType,
  UidInterface,
} from '../../agora-rn-uikit/src/RtcContext';
import WhiteboardView from './WhiteboardView';
import {whiteboardContext} from './WhiteboardConfigure';
import {useChannelInfo, useRole} from '../pages/VideoCall';
import {Role} from '../../bridge/rtc/webNg/Types';
import ChatContext from './ChatContext';

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
    dims: {r, c},
  };
};

// const isDesktop = Platform.OS === 'web';

interface GridVideoProps {
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
}

const GridVideo = (props: GridVideoProps) => {
  const {dispatch} = useContext(RtcContext);
  const {messageStore} = useContext(ChatContext);
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const role = useRole();
  const whiteboard = useContext(whiteboardContext);
  const whiteboardActive =
    role === Role.Teacher ? false : whiteboard.whiteboardActive;
  const wb: UidInterface = {
    uid: 'whiteboard',
    audio: false,
    video: false,
    streamType: 'high',
  };

  const {primaryColor} = useContext(ColorContext);
  const {userList, localUid} = useContext(chatContext);
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
  const isDesktop = dim[0] > dim[1] + 100;
  let {matrix, dims} = useMemo(
    // Whiteboard: Only iterate over n-1 elements when whiteboard not
    // active since last element is always whiteboard placeholder
    () =>
      // layout(
      //   whiteboardActive ? students.length : students.length - 1,
      //   isDesktop,
      // ),
      layout(students.length, isDesktop),
    [students.length, isDesktop, whiteboardActive],
  );

  return (
    <View
      style={[style.full, {paddingHorizontal: isDesktop ? 50 : 0}]}
      onLayout={onLayout}>
      {matrix.map((r, ridx) => (
        <View style={style.gridRow} key={ridx}>
          {r.map((c, cidx) => (
            <View style={style.gridVideoContainerInner} key={cidx}>
              <Text style={{fontSize: 22}}>
                {students[ridx * dims.c + cidx]}
              </Text>
              <View style={{flex: 1}}>
                <View
                  style={{
                    flex: 0.2,
                    overflowY: 'scroll',
                    marginBottom: 10,
                  }}>
                  <View style={{flexDirection: 'row', paddingVertical: 8}}>
                    <Text style={{flex: 1, fontWeight: '700'}}>Time</Text>
                    <Text style={{flex: 3, fontWeight: '700'}}>Message</Text>
                    <Text style={{flex: 1, fontWeight: '700'}}>Action</Text>
                  </View>
                  {users.map(
                    (u) =>
                      userList[u.uid]?.name?.split('-')[0] ===
                      students[ridx * dims.c + cidx]
                        ? messageStore
                            // .filter((m: any) => m.uid === u.uid)
                            .map((m: any, i) =>
                              m.uid === u.uid ||
                              m.uid + parseInt(0xffffffff) + 1 === u.uid ? (
                                <View style={{flexDirection: 'row'}} key={i}>
                                  <Text style={{flex: 1}}>
                                    {new Date(m.ts).getHours()}:
                                    {new Date(m.ts).getMinutes()}:
                                    {('0' + new Date(m.ts).getSeconds()).slice(
                                      -2,
                                    )}
                                  </Text>
                                  <Text style={{flex: 3}}>
                                    {m.msg.slice(1)}
                                  </Text>
                                  <Text
                                    style={{flex: 1, cursor: 'pointer'}}
                                    onPress={() => {
                                      console.log(m.ts);
                                    }}>
                                    Action
                                  </Text>
                                  {/* <Text style={{flex: 1}}>{m.uid}</Text> */}
                                </View>
                              ) : (
                                console.log(m.uid, u.uid)
                              ),
                            )
                        : null,
                    // : (<Text>{s} {userList[u.uid]?.name}</Text>)
                  )}
                </View>
                <View
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `1fr 1fr`,
                    gridTemplateRows: `1fr 1fr`,
                    flex: 1,
                    gridGrap: 8,
                    // flex: 1,
                    // flexDirection: 'row',
                    // overflowX: 'scroll',
                  }}>
                  {users.map(
                    (u, i) =>
                    userList[u.uid]?.name?.split('-')[0] ===
                    students[ridx * dims.c + cidx] &&
                      userList[u?.uid]?.name?.endsWith('Primary') && (
                        <View
                          style={{
                            width: '100%',
                            height: '100%',
                            // borderWidth: 1,
                            borderColor: '#ccc',
                            // marginRight: 10,
                            borderStyle: 'solid',
                          }}>
                          <Text
                            style={{
                              position: 'absolute',
                              // alignSelf: 'center',
                              padding: 5,
                              fontWeight: '700',
                              fontSize: 18,
                              color: '#fff',
                              textShadowColor: '#000',
                              textShadowRadius: 10,
                            }}>
                            Student Photo ID
                          </Text>
                          <img
                            style={{
                              height: isDesktop ? undefined : '100%',
                              width: isDesktop ? '100%' : undefined,
                              margin: 'auto',
                            }}
                            src={userList[u?.uid]?.id}
                          />
                        </View>
                      ),
                  )}
                  {users.map((u, i) =>
                    userList[u.uid]?.name?.split('-')[0] ===
                    students[ridx * dims.c + cidx] ? (
                      <React.Fragment key={u.uid}>
                        <View
                          style={{width: '100%', height: '100%'}}>
                          <MaxVideoView
                            fallback={() => {
                              if (u.uid === 'local') {
                                return FallbackLogo(userList[localUid]?.name);
                              } else {
                                return FallbackLogo(userList[u?.uid]?.name);
                              }
                            }}
                            user={u}
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
    // <View
    //   style={[style.full, {paddingHorizontal: isDesktop ? 50 : 0}]}
    //   onLayout={onLayout}>
    //   {matrix.map((r, ridx) => (
    //     <View style={style.gridRow} key={ridx}>
    //       {r.map((c, cidx) =>
    //         students.map((s) => {
    //           return users[ridx * dims.c + cidx].uid === 'whiteboard' ? (
    //             whiteboardActive && (
    //               <Pressable
    //                 onPress={() => {
    //                   props.setLayout(Layout.Pinned);
    //                 }}
    //                 style={{
    //                   flex: Platform.OS === 'web' ? 1 / dims.c : 1,
    //                   marginHorizontal: 'auto',
    //                 }}
    //                 key={cidx}>
    //                 <View style={style.gridVideoContainerInner}>
    //                   <WhiteboardView />
    //                 </View>
    //               </Pressable>
    //             )
    //           ) : userList[users[ridx * dims.c + cidx]?.uid]?.name?.startsWith(s) ? (
    //             <Pressable
    //               onPress={() => {
    //                 if (!(ridx === 0 && cidx === 0)) {
    //                   dispatch({
    //                     type: 'SwapVideo',
    //                     value: [users[ridx * dims.c + cidx]],
    //                   });
    //                 }
    //                 props.setLayout(Layout.Pinned);
    //               }}
    //               style={{
    //                 flex: Platform.OS === 'web' ? 1 / dims.c : 1,
    //                 marginHorizontal: 'auto',
    //               }}
    //               key={users[ridx * dims.c + cidx]?.uid}>
    //               <View style={style.gridVideoContainerInner}>
    //                 <View style={{flex: 1}}>
    //                   {/* <Text>{users[ridx * dims.c + cidx].uid}</Text> */}
    //                   <View
    //                     style={{
    //                       flex: 0.5,
    //                       overflowY: 'scroll',
    //                       marginBottom: 10,
    //                     }}>
    //                     <View
    //                       style={{flexDirection: 'row', paddingVertical: 8}}>
    //                       <Text style={{flex: 1, fontWeight: '700'}}>Time</Text>
    //                       <Text style={{flex: 3, fontWeight: '700'}}>
    //                         Message
    //                       </Text>
    //                       <Text style={{flex: 1, fontWeight: '700'}}>
    //                         Action
    //                       </Text>
    //                     </View>
    //                     {messageStore
    //                       .filter(
    //                         (m: any) =>
    //                           m.uid === users[ridx * dims.c + cidx].uid,
    //                       )
    //                       .map((m: any) => (
    //                         <View style={{flexDirection: 'row'}}>
    //                           <Text style={{flex: 1}}>
    //                             {new Date(m.ts).getHours()}:
    //                             {new Date(m.ts).getMinutes()}:
    //                             {('0' + new Date(m.ts).getSeconds()).slice(-2)}
    //                           </Text>
    //                           <Text style={{flex: 3}}>{m.msg.slice(1)}</Text>
    //                           <Text style={{flex: 1}}>Action</Text>
    //                           {/* <Text style={{flex: 1}}>{m.uid}</Text> */}
    //                         </View>
    //                       ))}
    //                   </View>
    //                   <Text>
    //                     image: {userList[users[ridx * dims.c + cidx].uid]?.id}
    //                   </Text>
    //                   <img
    //                     src={userList[users[ridx * dims.c + cidx]?.uid]?.id}
    //                   />
    //                   <MaxVideoView
    //                     fallback={() => {
    //                       if (users[ridx * dims.c + cidx].uid === 'local') {
    //                         return FallbackLogo(userList[localUid]?.name);
    //                       } else {
    //                         return FallbackLogo(
    //                           userList[users[ridx * dims.c + cidx]?.uid]?.name,
    //                         );
    //                       }
    //                     }}
    //                     user={users[ridx * dims.c + cidx]}
    //                     key={users[ridx * dims.c + cidx].uid}
    //                   />
    //                 </View>
    //                 <View
    //                   style={{
    //                     marginTop: -30,
    //                     backgroundColor: $config.SECONDARY_FONT_COLOR + 'bb',
    //                     alignSelf: 'flex-end',
    //                     paddingHorizontal: 8,
    //                     height: 30,
    //                     borderTopLeftRadius: 15,
    //                     borderBottomRightRadius: 15,
    //                     // marginHorizontal: 'auto',
    //                     maxWidth: '100%',
    //                     flexDirection: 'row',
    //                     // alignContent: 'flex-end',
    //                     // width: '100%',
    //                     // alignItems: 'flex-start',
    //                   }}>
    //                   {/* <View style={{alignSelf: 'flex-end', flexDirection: 'row'}}> */}
    //                   <View style={[style.MicBackdrop]}>
    //                     <Image
    //                       source={{
    //                         uri: users[ridx * dims.c + cidx].audio
    //                           ? icons.mic
    //                           : icons.micOff,
    //                       }}
    //                       style={[
    //                         style.MicIcon,
    //                         {
    //                           tintColor: users[ridx * dims.c + cidx].audio
    //                             ? primaryColor
    //                             : 'red',
    //                         },
    //                       ]}
    //                       resizeMode={'contain'}
    //                     />
    //                   </View>
    //                   <Text
    //                     textBreakStrategy={'simple'}
    //                     style={{
    //                       color: $config.PRIMARY_FONT_COLOR,
    //                       lineHeight: 30,
    //                       fontSize: 18,
    //                       fontWeight: '600',
    //                       // width: '100%',
    //                       // alignSelf: 'stretch',
    //                       // textAlign: 'center',
    //                     }}>
    //                     {users[ridx * dims.c + cidx].uid === 'local'
    //                       ? userList[localUid]
    //                         ? userList[localUid].name.slice(0, 20) + ' '
    //                         : 'You '
    //                       : userList[users[ridx * dims.c + cidx].uid]
    //                       ? userList[
    //                           users[ridx * dims.c + cidx].uid
    //                         ].name.slice(0, 20) + ' '
    //                       : users[ridx * dims.c + cidx].uid === 1
    //                       ? (userList[localUid]?.name + "'s screen ").slice(
    //                           0,
    //                           20,
    //                         )
    //                       : 'User '}
    //                   </Text>
    //                 </View>
    //               </View>
    //             </Pressable>
    //           ) : (null
    //             /* <Text>
    //               {userList[users[ridx * dims.c + cidx]?.uid]?.name} {s}
    //             </Text> */
    //           )
    //         }),
    //       )}
    //     </View>
    //   ))}
    //   {false && (
    //     <View style={style.gridRow} key={'ridx2'}>
    //       <WhiteboardView />
    //     </View>
    //   )}
    // </View>
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
    paddingVertical: 10,
  },
  gridVideoContainerInner: {
    borderColor: '#ddd',
    marginHorizontal: 2,
    // backgroundColor: '#ff00ff55',
    borderWidth: 2,
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
