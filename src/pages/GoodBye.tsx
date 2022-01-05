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
import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Logo from '../subComponents/Logo';

const GoodBye = () => {
  return (
    <View style={style.main}>
      <View style={style.nav}>
        <Logo />
      </View>
      <View style={style.content} >
      <Text style={style.headline}>Thank you for taking the exam. Good luck!</Text>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  main: {
    marginBottom: 10,
    marginTop: 30,
    justifyContent: 'space-evenly',
    marginHorizontal: '8%',
    marginVertical: '2%',
  },
  nav: {
    
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',

  },
  headline: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    alignSelf: 'center',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 10,
    marginTop: 60,
  },
  content: {},
});

export default GoodBye;