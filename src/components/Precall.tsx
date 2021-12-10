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
import PhotoIdImg from '../assets/photoid.png';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Picker,
} from 'react-native';
import TextInput from '../atoms/TextInput';
import PrimaryButton from '../atoms/PrimaryButton';
import { MaxUidConsumer } from '../../agora-rn-uikit/src/MaxUidContext';
import { MaxVideoView } from '../../agora-rn-uikit/Components';
import { LocalAudioMute, LocalVideoMute } from '../../agora-rn-uikit/Components';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import SelectDevice from '../subComponents/SelectDevice';
import Logo from '../subComponents/Logo';
// import OpenInNativeButton from '../subComponents/OpenInNativeButton';
import ColorContext from './ColorContext';
// import {useHistory} from './Router';
// import {precallCard} from '../../theme.json';
import Error from '../subComponents/Error';
import { useRole } from '../pages/VideoCall';
import { Role } from '../../bridge/rtc/webNg/Types';
import { whiteboardContext } from './WhiteboardConfigure';
import ProctorContext from '../components/ProctorContext';


const Precall = (props: any) => {
  const { primaryColor } = useContext(ColorContext);
  const [snapped, setSnapped] = useState(false);
  const { whiteboardActive, setWhiteboardURL, whiteboardURLState, joinWhiteboardRoom, leaveWhiteboardRoom } =
    useContext(whiteboardContext);

  const {deviceType, setDeviceType} = useContext(ProctorContext);

  const { setCallActive, queryComplete, username, setUsername, error, setPhotoIDUrl } = props;

  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const role = useRole();

  useEffect(() => {

    var preview = document.getElementById('preview');

    if (preview &&  !snapped && deviceType==1) {      
      var ctx = preview.getContext('2d');
      var defImg = new Image();
      defImg.src = PhotoIdImg;
      console.log("load "+snapped+" ");
      defImg.onload = function () {
        preview.width = defImg.width;
        preview.height = defImg.height;
        ctx.drawImage(defImg, 0, 0);
      };
    }
  });

  return (
    <View style={style.main} onLayout={onLayout}>
      <View style={style.nav}>
        <Logo />
        {error ? <Error error={error} showBack={true} /> : <></>}
        {/* <OpenInNativeButton /> */}
      </View>

      <View style={style.content}>

      {window.innerWidth>window.innerHeight && (
                <>
        <View style={style.leftContent}>
          <MaxUidConsumer>
            {(maxUsers) => (
              <View style={{ borderRadius: 10, flex: 1 }}>
                <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
              </View>
            )}
          </MaxUidConsumer>          
          <View style={style.precallControls}>
            <LocalUserContext>
              <View style={{ alignSelf: 'center' }}>
                <LocalVideoMute />
              </View>
              <View style={{ alignSelf: 'center' }}>
                <LocalAudioMute />
              </View>
            </LocalUserContext>
          </View>
        </View>
        </>
      )}

        <View
          style={{
            flex: 1,
            backgroundColor: $config.SECONDARY_FONT_COLOR + '25',
            marginLeft: 50,
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: $config.PRIMARY_COLOR,
            height: '90%',
            minHeight: 300,
            minWidth: 400,
            alignSelf: 'center',
            justifyContent: 'center',
            marginBottom: '5%',
          }}>
          <View style={[{ shadowColor: primaryColor }, style.precallPickers]}>
            {/* <View style={{flex: 1}}> */}
            <Text
              style={[style.subHeading, { color: $config.PRIMARY_FONT_COLOR }]}>
              Select Input Device
            </Text>
            {/* </View> */}
            <View style={{ height: 20 }} />
            <View
              style={{
                flex: 1,
                maxWidth: Platform.OS === 'web' ? '25vw' : 'auto',
              }}>
              <SelectDevice />
            </View>

            {deviceType==1 && role === Role.Student && (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    margin: 8,
                    marginTop: 8,
                  }}>
                  {snapped ? 'Photo ID preview' : 'Please hold your photo ID up to your webcam'}

                </Text>
                <canvas
                  id="preview"
                  width="848"
                  height="480"
                  //style={{display: snapped ? 'block' : 'none', width: 424, height: 240}}
                  style={{ display: 'block', width: 320, height: 180 }}
                />
              </>
            )}
            <View
              style={{
                flex: 1,
                width: 350,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 50,
              }}>
                
              {deviceType==1 && role === Role.Student && (
                <>
                  <View style={{ marginBottom: 10 }} />
                  <PrimaryButton
                    onPress={() => {
                      document.getElementById('preview').width = 848;
                      document.getElementById('preview').height = 480;
                      window.AgoraProctorUtils.snap(
                        document.getElementsByTagName('video')[0],
                        document.getElementById('preview'),
                      ).then(function (result) {
                        console.log(result);
                        setSnapped(true);
                        setPhotoIDUrl(result);
                      });
                    }}
                    text={snapped ? 'Retake Photo' : 'Take Photo'}
                  />
                  <View style={{ height: 15 }} />
                </>
              )}

       
          {role === Role.Student && deviceType==0 && (
                <>
                  <View style={{ marginBottom: 10 }} />
                  
                  <Text
                    style={[style.subHeading, { color: $config.PRIMARY_FONT_COLOR }]}>
                   Select Device Type
                </Text>

                <View style={{ marginBottom: 10 }} />
                  <PrimaryButton
                    onPress={() => {            
                      setUsername('Primary');    
                      setDeviceType(1);
                    }}
                    text={'My Main Computer'}
                  />
                 
                  <Text
                  style={{
                    fontSize: 16,
                    margin: 2
                  }}>
                  where I will take the exam

                </Text>
                  <View style={{ height: 25 }} />

                  <View style={{ marginBottom: 20 }} />
                  <PrimaryButton
                    onPress={() => {            
                      setUsername('Secondary');     
                      setDeviceType(2);
                    }}
                    text={'Additional Device'}
                  />
                
                  <Text
                  style={{
                    fontSize: 16,
                    margin: 2
                  }}>
                   with camera to point at me

                </Text>
                  <View style={{ height: 15 }} />

                </>
              )}

              {role === Role.Teacher && (
                <>
                  <View style={{ marginVertical: 10 }} />
                  <Text
                    style={{
                      fontSize: 16,
                      margin: 8,
                      marginTop: 8,
                    }}>
                    Exam URL
                  </Text>
                  <TextInput
                    value={whiteboardURLState}
                    onChangeText={(text) => setWhiteboardURL(text)}
                    placeholder="Exam URL"
                  />
                  <View style={{ marginVertical: 10 }} />
                </>
              )}

              <View style={{ height: 20 }} />
              {(snapped || role != Role.Student || deviceType==2) && (
                <PrimaryButton
                  onPress={() => setCallActive(true)}
                  disabled={
                    !snapped &&
                    role === Role.Student &&
                    username.endsWith('Primary')
                  }
                  text={snapped ? 'Join Exam' : 'Join Exam'}
                />
              )}
            </View>
          </View>
        </View>
        {/* ) : (
          // </View>
          <></>
        )} */}
      </View>
    </View>
    // </ImageBackground>
  );
};

const style = StyleSheet.create({
  full: { flex: 1 },
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '10%',
    minHeight: 500,
  },
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupPicker: {
    height: 30,
    marginBottom: 0,
    borderRadius: 50,
    paddingHorizontal: 15,
    fontSize: 15,
    minHeight: 35,
  },
  content: { flex: 6, flexDirection: 'row' },
  leftContent: {
    width: '100%',
    flex: 1.3,
    justifyContent: 'space-evenly',
    marginTop: '2.5%',
    marginBottom: '1%',
    // marginRight: '5%',
  },
  subHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: $config.SECONDARY_FONT_COLOR,
  },
  headline: {
    fontSize: 20,
    fontWeight: '400',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 10,
  },
  inputs: {
    flex: 1,
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  textInput: {
    width: '100%',
    paddingLeft: 8,
    borderColor: $config.PRIMARY_COLOR,
    borderWidth: 2,
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 16,
    marginBottom: 10,
    maxWidth: 400,
    minHeight: 45,
    alignSelf: 'center',
  },
  text: {
    fontSize: 18,
  },
  primaryBtn: {
    width: '60%',
    backgroundColor: $config.PRIMARY_COLOR,
    maxWidth: 400,
    minHeight: 45,
    alignSelf: 'center',
  },
  primaryBtnDisabled: {
    width: '60%',
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    maxWidth: 400,
    minHeight: 45,
    minWidth: 200,
    alignSelf: 'center',
  },
  primaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
  ruler: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
    maxWidth: 200,
  },
  precallControls: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    width: '40%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
  precallPickers: {
    alignItems: 'center',
    alignSelf: 'center',
    // alignContent: 'space-around',
    justifyContent: 'space-around',
    // flex: 1,
    marginBottom: '10%',
    height: '90%',
    minHeight: 280,
  },
  margin5Btm: { marginBottom: '5%' },
});

export default Precall;
