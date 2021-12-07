import React, {useContext} from 'react';
import {RtcLocalView, RtcRemoteView, VideoRenderMode} from 'react-native-agora';
import styles from './Style';
import PropsContext from './PropsContext';
import {UidInterface} from './RtcContext';
import {View, Text, Image, Alert} from 'react-native';

const LocalView = RtcLocalView.SurfaceView;
const RemoteView = RtcRemoteView.SurfaceView;

interface MaxViewInterface {
  user: UidInterface;
  expandUID: number;
  setExpandUID: any;
  fallback?: React.ComponentType;
}

const MaxVideoView: React.FC<MaxViewInterface> = (props) => {
  const {styleProps} = useContext(PropsContext);
  const {maxViewStyles} = styleProps || {};
  const Fallback = props.fallback;
 

  return props.user.uid === 'local' ? (
    props.user.video ? (
      <LocalView         
        style={{...styles.fullView, ...(maxViewStyles as object)}}
        renderMode={VideoRenderMode.Fit}
      />
    ) : Fallback ? (
      <Fallback />
    ) : (
      <View style={{flex: 1, backgroundColor: '#ede'}} />
    )
  ) : (
    <>
      <div style={{flex: 1, display: props.user.video ? 'flex' : 'none'}}
        onClick={() => {props.expandUID===props.user.uid ? props.setExpandUID(0) : props.setExpandUID(props.user.uid) }}
      >
        <RemoteView
          style={{...styles.fullView, ...(maxViewStyles as object)}}
          uid={props.user.uid as number}
          renderMode={VideoRenderMode.Fit}
          
        />
      </div>
      {props.user.video ? (
        <></>
      ) : (
        <>
          {Fallback ? (
            <Fallback />
          ) : (
            <View style={{flex: 1, backgroundColor: '#efd'}} />
          )}
        </>
      )}
    </>
  );
};

export default MaxVideoView;
