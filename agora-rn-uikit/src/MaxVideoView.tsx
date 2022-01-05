import React, {useContext, useState,useEffect} from 'react';
import {RtcLocalView, RtcRemoteView, VideoRenderMode} from 'react-native-agora';
import styles from './Style';
import PropsContext from './PropsContext';
import {UidInterface} from './RtcContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import {View, Text, Image, Alert, useWindowDimensions} from 'react-native';
import { FullScreen, useFullScreenHandle } from "react-full-screen";


const LocalView = RtcLocalView.SurfaceView;
const RemoteView = RtcRemoteView.SurfaceView;

interface MaxViewInterface {
  user: UidInterface;
  expandUID?: string;
  setExpandUID?: any;
  username?: any;
  setExpandUsername?: any;
  fallback?: React.ComponentType;
}

const MaxVideoView: React.FC<MaxViewInterface> = (props) => {
  const {styleProps} = useContext(PropsContext);
  const {maxViewStyles} = styleProps || {};
  const fullScreenHandle = useFullScreenHandle();
  const [FSPressed,setFSPressed]= useState(false);
  const {hasJoinedChannel} = useContext(RtcContext);
  const [VideoStreamType,setVideoStreamType]= useState(1);
  const rtc = useContext(RtcContext);
  const Fallback = props.fallback;


  useEffect(() => {
    if (props.username) {
    let client=window.engine.clientMap.get(props.username);
    if (client) {
      client.setRemoteVideoStreamType(props.user.uid,1); // low stream 
    } 
  }
  },  [hasJoinedChannel]);
  
  //console.log("client for",props.username,window.engine.clientMap.get(props.username));  
 //console.log(" MVV "+props.user.uid);
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
       onClick={() => {
         if (!props.setExpandUID) {
           return;
         }
         let client=window.engine.clientMap.get(props.username);

       // setVideoStreamType(VideoStreamType+1);
        if(props.expandUID===props.user.uid.toString()) 
          {
            if (fullScreenHandle.active || FSPressed) {
              fullScreenHandle.exit()
              setFSPressed(false);
              props.setExpandUID("0");
              props.setExpandUsername("");
              if (client) {
                client.setRemoteVideoStreamType(props.user.uid,1); // low stream 
              }
            }  else {
              fullScreenHandle.enter();
              setFSPressed(true);
            
              if (client) {
                  client.setRemoteVideoStreamType(props.user.uid,0); // high stream 
              }
              
            }        
          } 
          else {
            props.setExpandUID(props.user.uid.toString())
            props.setExpandUsername(props.username);
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
