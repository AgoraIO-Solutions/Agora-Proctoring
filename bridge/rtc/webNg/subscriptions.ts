import {
  IAgoraRTCClient,
  UID,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { VariablesInAllowedPositionRule } from 'graphql';

type callbackType = (uid?: UID) => void;
interface RemoteStream {
  audio?: IRemoteAudioTrack;
  video?: IRemoteVideoTrack;
}

export default function setupListeners(
  client: IAgoraRTCClient,
  eventsMap: Map<string, callbackType>,
  inScreenshare: boolean,
  screenClient: IAgoraRTCClient,
  remoteStreams: Map<UID, RemoteStream>,
  emitOnlyOnPublish: boolean = false,
) {
  client.on('user-joined', (user) => {
    const uid = inScreenshare
      ? user.uid !== screenClient.uid
        ? user.uid
        : 1
      : user.uid;
    if (!emitOnlyOnPublish) {
      (eventsMap.get('UserJoined') as callbackType)(uid);
      (eventsMap.get('RemoteVideoStateChanged') as callbackType)(uid, 0, 0, 0);
      (eventsMap.get('RemoteAudioStateChanged') as callbackType)(uid, 0, 0, 0);
    }
  });

  client.on('user-left', (user) => {
    const uid = inScreenshare
      ? user.uid !== screenClient.uid
        ? user.uid
        : 1
      : user.uid;

    // if (uid ===1) {
    //   this.screenStream.audio?.close();
    //   this.screenStream.video?.close();
    //   this.screenStream = {}
    // }
    // else
    if (remoteStreams.has(uid)) {
      remoteStreams.delete(uid);
    }
    (eventsMap.get('UserOffline') as callbackType)(uid);
    // (eventsMap.get('UserJoined') as callbackType)(uid);
  });
  client.on('user-published', async (user, mediaType) => {
    // Initiate the subscription
    if (inScreenshare && user.uid === screenClient.uid) {
      (eventsMap.get('RemoteVideoStateChanged') as callbackType)(1, 2, 0, 0);
    } else {
      if (emitOnlyOnPublish) {
        (eventsMap.get('UserJoined') as callbackType)(user.uid);
        (eventsMap.get('RemoteVideoStateChanged') as callbackType)(
          user.uid,
          0,
          0,
          0,
        );
        (eventsMap.get('RemoteAudioStateChanged') as callbackType)(
          user.uid,
          0,
          0,
          0,
        );
      }
      
      if (window.deviceType!=2) {
        alert("subscribe "+mediaType+" "+window.deviceType);  
        await client.subscribe(user, mediaType);
      }
    }

    // If the subscribed track is an audio track
    if (mediaType === 'audio') {
      const audioTrack = user.audioTrack;
      // Play the audio
      audioTrack?.play();
      remoteStreams.set(user.uid, {
        ...remoteStreams.get(user.uid),
        audio: audioTrack,
      });
      (eventsMap.get('RemoteAudioStateChanged') as callbackType)(
        user.uid,
        2,
        0,
        0,
      );
    } else {
      const videoTrack = user.videoTrack;
      // Play the video
      // videoTrack.play(DOM_ELEMENT);
      remoteStreams.set(user.uid, {
        ...remoteStreams.get(user.uid),
        video: videoTrack,
      });
      (eventsMap.get('RemoteVideoStateChanged') as callbackType)(
        user.uid,
        2,
        0,
        0,
      );
    }
  });
  client.on('user-unpublished', async (user, mediaType) => {
    if (mediaType === 'audio') {
      const {audio, ...rest} = remoteStreams.get(user.uid) as RemoteStream;
      remoteStreams.set(user.uid, rest);
      (eventsMap.get('RemoteAudioStateChanged') as callbackType)(
        user.uid,
        0,
        0,
        0,
      );
    } else {
      const {video, ...rest} = remoteStreams.get(user.uid) as RemoteStream;
      remoteStreams.set(user.uid, rest);
      (eventsMap.get('RemoteVideoStateChanged') as callbackType)(
        user.uid,
        0,
        0,
        0,
      );
    }
    if (emitOnlyOnPublish) {
      if (!user.hasAudio && !user.hasVideo) {
        (eventsMap.get('UserOffline') as callbackType)(user.uid);
      }
    }
  });
}
