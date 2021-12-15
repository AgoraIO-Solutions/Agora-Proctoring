import React, {useContext, useState} from 'react';
import {RtcLocalView, RtcRemoteView, VideoRenderMode} from 'react-native-agora';
import styles from './Style';
import PropsContext from './PropsContext';
import {UidInterface} from './RtcContext';
import {View, Text, Image, Alert} from 'react-native';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

const LocalView = RtcLocalView.SurfaceView;
const RemoteView = RtcRemoteView.SurfaceView;

interface MaxViewInterface {
  user: UidInterface;
  expandUID: number;
  setExpandUID: any;
  keyp: String | number;
  fallback?: React.ComponentType;
}

const MaxVideoView: React.FC<MaxViewInterface> = (props) => {
  const {styleProps} = useContext(PropsContext);
  const {maxViewStyles} = styleProps || {};
  const fullScreenHandle = useFullScreenHandle();
  const [FSPressed,setFSPressed]= useState(false);


  const [VideoStreamType,setVideoStreamType]= useState(1);
  const Fallback = props.fallback;
 
  console.log(props.keyp+"  VideoStreamType "+VideoStreamType);
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
      // onClick={() => {fullScreenHandle.enter()}}      
       onClick={() => {
        setVideoStreamType(VideoStreamType+1);
        if( props.expandUID===props.user.uid) 
          {
            if (fullScreenHandle.active || FSPressed) {
              fullScreenHandle.exit()
              setFSPressed(false);
              props.setExpandUID(0);
            }  else {
              fullScreenHandle.enter();
              setFSPressed(true);
            }        
          } 
          else {
            props.setExpandUID(props.user.uid)
          }          
         }}       
      >    

        <FullScreen handle={fullScreenHandle}>
        <RemoteView        
          style={{...styles.fullView, ...(maxViewStyles as object)}}
          uid={props.user.uid as number}
          renderMode={VideoRenderMode.Fit}          
        />
        </FullScreen>   

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
