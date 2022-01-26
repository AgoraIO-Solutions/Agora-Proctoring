import React, { useState, useContext, useEffect } from 'react';
import {
    View
  } from 'react-native';
import ReactPlayer from 'react-player';
import { Accelerator } from 'electron';

const RecordingPlayer = (props: any) => {
   
    const playbackUrl = 'https://www.youtube.com/watch?v=9boMnm5X9ak' 

    return (
        <View
        style={{
        width: '640px',
        height: '368px',
        borderWidth: 0,
        paddingTop: 18,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderStyle: 'solid',
        position: 'absolute' ,
        top: '10%',
        left: '30%',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 1000,
        display: props.isRecordingOpen ? 'flex' : 'none'
        }}                   
        >
                <button
                   style={{
                    marginLeft: "auto",
                    backgroundColor: 'black',
                    color: 'white',
                    }}        
                    onClick={() => {
                        props.setIsRecordingOpen(false);
                    }}
                > {"X"} 
                </button>            
        <ReactPlayer
            width='100%'
            height='100%'
            url={playbackUrl}
        />
    </View>
    );
};


export default RecordingPlayer;
