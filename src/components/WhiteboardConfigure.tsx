import React, {useState} from 'react';
import {createContext} from 'react';

export const whiteboardPaper = document.createElement('div');
whiteboardPaper.className = 'whiteboardPaper';

export const whiteboardContext = createContext(
  {} as whiteboardContextInterface,
);

export interface whiteboardContextInterface {
  whiteboardActive: boolean;
  setWhiteboardURL: (url : string) => void;
  whiteboardURLState: string;
  joinWhiteboardRoom: () => void;
  leaveWhiteboardRoom: () => void;
}

const WhiteboardConfigure: React.FC = (props) => {
  // Defines intent, whether whiteboard should be active or not
  const [whiteboardActive, setWhiteboardActive] = useState(false);
  const [whiteboardURLState, setWhiteboardURLState] = useState("https://docs.google.com/forms/d/e/1FAIpQLSe7nYsfoCskW9Fow8bpvv6gRirjSwEnGsLEOFPM90dHna4XgQ/viewform");

  // Defines whiteboard room state, whether disconnected, Connected, Connecting etc.

  const setWhiteboardURL = (url : string) => {
    setWhiteboardURLState(url);
  };

  const joinWhiteboardRoom = () => {
    setWhiteboardActive(true);
  };

  const leaveWhiteboardRoom = () => {
    setWhiteboardActive(false);
  };

  return (
    <whiteboardContext.Provider
      value={{
        whiteboardActive,
        setWhiteboardURL,
        whiteboardURLState,
        joinWhiteboardRoom,
        leaveWhiteboardRoom,
      }}>
      {props.children}
    </whiteboardContext.Provider>
  );
};

export default WhiteboardConfigure;
