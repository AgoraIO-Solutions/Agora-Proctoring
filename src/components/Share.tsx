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
import React, {useState, useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
// import ColorContext from './ColorContext';
import {useHistory} from './Router';
import Clipboard from '../subComponents/Clipboard';
// import Illustration from '../subComponents/Illustration';
import platform from '../subComponents/Platform';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import icons from '../assets/icons';
import Toast from '../../react-native-toast-message';

// const res = new URLSearchParams(window.location.search)
// const string = res.get('students')
// const students = s.split(',')

const Share = (props: {teacherName: string; students: string[]}) => {
  const history = useHistory();
  const {teacherName, students} = props;
  const proctorUrl =
    'proctor?' +
    'teacher=' +
    teacherName +
    '&students=' +
    students.map((student) => student).join(',');
  const examUrl =
    'exam?' +
    'teacher=' +
    teacherName +
    '&students=' +
    students.map((student) => student).join(',');
  const enterMeeting = () => {
    if (proctorUrl) {
      window.open(window.location.origin + '/' + proctorUrl, '_blank');
      // history.push(`/${proctorUrl}`);
    }
  };

  //   const copyToClipboard = () => {
  //     Toast.show({text1: 'Copied to Clipboard', visibilityTime: 1000});
  //     let stringToCopy = '';

  //     $config.FRONTEND_ENDPOINT
  //       ? hostControlCheckbox
  //         ? (stringToCopy += `Meeting - ${roomTitle}
  // URL for Attendee: ${$config.FRONTEND_ENDPOINT}/${urlView}
  // URL for Host: ${$config.FRONTEND_ENDPOINT}/${urlHost}`)
  //         : (stringToCopy += `Meeting - ${roomTitle}
  // Meeting URL: ${$config.FRONTEND_ENDPOINT}/${urlHost}`)
  //       : platform === 'web'
  //       ? hostControlCheckbox
  //         ? (stringToCopy += `Meeting - ${roomTitle}
  // URL for Attendee: ${window.location.origin}/${urlView}
  // URL for Host: ${window.location.origin}/${urlHost}`)
  //         : (stringToCopy += `Meeting - ${roomTitle}
  // Meeting URL: ${window.location.origin}/${urlHost}`)
  //       : hostControlCheckbox
  //       ? (stringToCopy += `Meeting - ${roomTitle}
  // Attendee Meeting ID: ${urlView}
  // Host Meeting ID: ${urlHost}`)
  //       : (stringToCopy += `Meeting - ${roomTitle}
  // Meeting URL: ${urlHost}`);

  //     pstn
  //       ? (stringToCopy += `PSTN Number: ${pstn.number}
  // PSTN Pin: ${pstn.dtmf}`)
  //       : '';
  //     Clipboard.setString(stringToCopy);
  //   };

  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  return (
    <View style={style.content} onLayout={onLayout}>
      <View style={style.leftContent}>
        <View>
          <Text style={style.heading}>{$config.APP_NAME}</Text>
          <Text style={style.headline}>{$config.LANDING_SUB_HEADING}</Text>
        </View>
        <View style={style.urlContainer}>
          <View style={{width: '80%'}}>
            <Text style={style.urlTitle}>Proctor URL</Text>
            <View style={{marginVertical: 5}} />
            <View style={style.urlHolder}>
              <a
                href={
                  $config.FRONTEND_ENDPOINT
                    ? `${$config.FRONTEND_ENDPOINT}/${proctorUrl}`
                    : platform === 'web'
                    ? `${window.location.origin}/${proctorUrl}`
                    : proctorUrl
                }
                target="_blank"
                style={{
                  color: $config.PRIMARY_FONT_COLOR,
                  fontSize: 16,
                  fontFamily: 'sans-serif',
                }}>
                {$config.FRONTEND_ENDPOINT
                  ? `${$config.FRONTEND_ENDPOINT}/${proctorUrl}`
                  : platform === 'web'
                  ? `${window.location.origin}/${proctorUrl}`
                  : proctorUrl}
              </a>
            </View>
          </View>
          {/* <View
            style={{
              marginLeft: 'auto',
              flexDirection: 'row',
              alignSelf: 'center',
            }}>
            <View
              style={{
                backgroundColor: $config.PRIMARY_COLOR + '80',
                width: 1,
                height: 'auto',
                marginRight: 15,
              }}
            />
            <TouchableOpacity
              style={{width: 40, height: 40, marginVertical: 'auto'}}
              onPress={() => copyHostUrl()}>
              <Image
                resizeMode={'contain'}
                style={{
                  width: '100%',
                  height: '100%',
                  tintColor: $config.PRIMARY_COLOR,
                  opacity: 0.5,
                }}
                source={{uri: icons.clipboard}}
              />
            </TouchableOpacity>
          </View> */}
        </View>
        <View style={style.urlContainer}>
          <View style={{width: '100%'}}>
            <Text style={style.urlTitle}>Student exam URLs</Text>
            <View style={{marginVertical: 5}} />
            <View style={{...style.urlHolder, flexDirection: 'column'}}>
              {students.map((student, i) => (
                <View key={i} style={{flexDirection: 'row'}}>
                  <Text style={{fontWeight: '600', fontSize: 18}}>
                    {student}:{' '}
                  </Text>
                  <a
                    href={
                      $config.FRONTEND_ENDPOINT
                        ? `${$config.FRONTEND_ENDPOINT}/exam?teacher=${teacherName}&student=${student}`
                        : platform === 'web'
                        ? `${window.location.origin}/exam?teacher=${teacherName}&student=${student}`
                        : proctorUrl
                    }
                    target="_blank"
                    style={{
                      color: $config.PRIMARY_FONT_COLOR,
                      fontSize: 16,
                      fontFamily: 'sans-serif',
                    }}>
                    {$config.FRONTEND_ENDPOINT
                      ? `${$config.FRONTEND_ENDPOINT}/exam?teacher=${teacherName}&student=${student}`
                      : platform === 'web'
                      ? `${window.location.origin}/exam?teacher=${teacherName}&student=${student}`
                      : proctorUrl}
                  </a>
                  <View style={{marginVertical: 15}} />
                </View>
              ))}
            </View>
          </View>
        </View>
        <PrimaryButton
          onPress={() => enterMeeting()}
          text={'Join Exam as Proctor'}
        />
        <View style={{height: 10}} />
        {/* <SecondaryButton
          // onPress={() => copyToClipboard()}
          text={'Copy invite to clipboard'}
        /> */}
      </View>
    </View>
  );
};
// const urlWeb = {wordBreak: 'break-all'};
const urlWeb = {};

const style = StyleSheet.create({
  full: {flex: 1},
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '8%',
    marginVertical: '2%',
  },
  content: {flex: 6, flexDirection: 'row'},
  leftContent: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-evenly',
    marginBottom: '12%',
    marginTop: '2%',
    // marginRight: '5%',
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 20,
  },
  headline: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 20,
  },
  inputs: {
    flex: 1,
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  checkboxHolder: {
    marginVertical: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTitle: {
    color: $config.PRIMARY_FONT_COLOR,
    paddingHorizontal: 5,
    fontWeight: '700',
  },
  checkboxCaption: {color: '#333', paddingHorizontal: 5},
  checkboxTextHolder: {
    marginVertical: 0, //check if 5
    flexDirection: 'column',
  },
  urlContainer: {
    backgroundColor: $config.PRIMARY_COLOR + '22',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    width: '100%',
    // minWidth: ''
    maxWidth: 1200,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  urlTitle: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  pstnHolder: {
    width: '100%',
    // paddingHorizontal: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 10,
  },
  urlHolder: {
    width: '100%',
    // paddingHorizontal: 10,
    // marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    // maxWidth: 600,
    minHeight: 30,
  },
  url: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 18,
    // textDecorationLine: 'underline',
  },
  // pstnHolder: {
  //   flexDirection: 'row',
  //   width: '80%',
  // },
  pstnMargin: {
    // marginRight: '10%',
  },
});

export default Share;
