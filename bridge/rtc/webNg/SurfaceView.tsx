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
import { RtcContext } from '../../../agora-rn-uikit/Contexts';
import { ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import React, { useContext, useEffect } from 'react';
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { VideoMirrorMode, VideoRenderMode } from 'react-native-agora';
import { useRole } from '../../../src/pages/VideoCall';
import ProctorContext from '../../../src/components/ProctorContext';

import { Role } from './Types';

export interface RtcSurfaceViewProps extends ViewProps {
  zOrderMediaOverlay?: boolean;
  zOrderOnTop?: boolean;
  renderMode?: VideoRenderMode;
  channelId?: string;
  mirrorMode?: VideoMirrorMode;
}
export interface RtcUidProps {
  uid: number;
}
export interface StyleProps {
  style?: StyleProp<ViewStyle>;
}

interface SurfaceViewInterface
  extends RtcSurfaceViewProps,
  RtcUidProps,
  StyleProps { }

const SurfaceView = (props: SurfaceViewInterface) => {
  //   console.log('Surface View props', props);
  const { hasJoinedChannel } = useContext(RtcContext);
  const { deviceType, loadTester} = useContext(ProctorContext);
  const role = useRole();
  // stream will be of type ILocalVideoTrack or IRemoteVideoTrack
  const stream: ILocalVideoTrack | IRemoteVideoTrack =
    props.uid === 0
      ? window.engine.localStream.video
      : props.uid === 1
        ? window.engine.screenStream.video
        : window.engine.remoteStreams.get(props.uid)?.video;


  //console.warn(" render 1 ");


  useEffect(() => {
    console.log(" useEffect 1 ");
    if (
      deviceType == 1 && !loadTester &&
      role === Role.Student &&
      window?.AgoraProctorUtils
    ) {

      if (props.uid === 0 && document.getElementById('0')?.children[0]?.children[0]) {
        // set canvas and video elements
        window?.AgoraProctorUtils?.faceDetect(
          document.getElementById('canvas'),
          document.getElementById('0')?.children[0]?.children[0],
        );

      } else {        
        setInterval(() => {
          // @ts-ignore
          if (props.uid === 0 && document.getElementById('0')?.children[0]?.children[0]) {
            // set canvas and video elements
            window?.AgoraProctorUtils?.faceDetect(
              document.getElementById('canvas'),
              document.getElementById('0')?.children[0]?.children[0],
            );
          } else {
            console.log(" useEffect no video element ", stream);
          }
        }, 2000);
      }
    }
  }, [hasJoinedChannel, props.uid, props.renderMode, stream]);//, [hasJoinedChannel,props.uid, props.renderMode, stream]);
  //}, [hasJoinedChannel]);

  useEffect(
    function () {
      if (stream?.play) {
        if (props.renderMode === 2) {
          stream.play(String(props.uid), { fit: 'contain' });
        } else {
          stream.play(String(props.uid));
        }
      }
      return () => {
          stream && stream.stop();
      };
    },
    [props.uid, props.renderMode, stream],
  );

  return stream ? (
    <>
      <div
        id={String(props.uid)}
        className={'video-container'}
        style={{
          ...style.full,
          ...(props.style as Object),
          overflow: 'hidden',
          backgroundColor: 'transparent',
          display:
            //props.uid === 0 && hasJoinedChannel && role !== Role.Teacher && role !== Role.Student 
            props.uid === 0 && hasJoinedChannel && role !== Role.Teacher && !loadTester && deviceType == 1 
              ? 'none'
              : 'block',
        }}
      />
      <canvas
        id={props.uid === 0 ? "canvas" : ''}
        style={{
          zIndex: -1,
          borderRadius: 15,
          flex: 1,
          display:
            props.uid === 0 && hasJoinedChannel && role !== Role.Teacher && !loadTester && deviceType == 1
              ? 'block'
              : 'none',
        }}
        width="848"
        height="480"
      />
    </>
  ) : (
    <div style={{ ...style.full, backgroundColor: 'orange' }} />
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
    position: 'relative',
  },
});

export default SurfaceView;
