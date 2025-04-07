import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatBox from './Chatbox';
import vscodeIcon from '../assets/vscode.svg';
import chatgpt from '../assets/chatgpt.svg';
import { fetchUserProfile } from "../Features/counter/getProfile";
import drawIcon from '../assets/drawing.svg';
import toolsIcon from '../assets/moreTools.svg';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import CodeEditor from './codeMIrror'; // Import the CodeEditor
import Drawing from "./DrawingCollab";
import { useDispatch, useSelector } from 'react-redux';
import MoreTools from './MoreTools';
import videoIcon from "../assets/videoIcon.svg"
import chatGpt from "./chatGpt"
import ChatGptBox from './chatGpt';
import code from "../assets/codeSender.svg"
import CodeSender from './codeSender';
import Loader from './notificationCircle';
// import { useDispatch, useSelector } from 'react-redux';
import { toggleState, setTrue, setFalse } from "../Features/counter/toggleConnectUsers";

const LeftBar = () => {
  const dispatch = useDispatch();

  const [isChatBoxVisible, setIsChatBoxVisible] = useState(false);
  const [isVSCodeIconClicked, setIsVSCodeIconClicked] = useState(false);
  const [isDrawIconClicked, setIsDrawIconClicked] = useState(false);
  const [isToolsIconClicked, setIsToolsIconClicked] = useState(false);
  const [isCodeSenderClick, setCodeSenderClicked] = useState(false);
  const [isGptClicked, setGptClicked] = useState(false);
  const [messages, setMessages] = useState([]);
  const unreadMessage = useSelector((state) => state.connectedUsers.unreadMessage);
  const isCodeSharingOpen = useSelector((state) => state.connectedUsers.isCodeSharingOpen);

  console.log("unreadMessage", unreadMessage)
  console.log("isChatBoxVisible", isChatBoxVisible)


  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const handleChatIconClick = () => {
    setIsChatBoxVisible((prev) => {
      const newValue = !prev;
      console.log("Chatbox toggled. New isChatBoxVisible:", newValue);
      if (newValue) {
        // If chatbox is being opened, set unreadMessage to false
        dispatch(setFalse("unreadMessage"));
        console.log("Chatbox opened, unreadMessage set to false");
      }
      return newValue;
    });
  };

  const handleVSCodeIconClick = () => {
    setIsVSCodeIconClicked(!isVSCodeIconClicked);
  };

  const handleDrawIconClick = () => {
    setIsDrawIconClicked(!isDrawIconClicked);
  };
  const handleGptClick = () => {
    setGptClicked(!isGptClicked);
  };
  const handleCodeSender = () => {
    setCodeSenderClicked((prev) => {
      const newValue = !prev;
      if (newValue && isCodeSharingOpen) {
        dispatch(setFalse("isCodeSharingOpen"));
        console.log("CodeSender opened, isCodeSharingOpen reset to false");
      }
      console.log("CodeSender toggled:", newValue);
      return newValue;
    });

  };


  const handleToolsIconClick = () => {
    setIsToolsIconClicked(!isToolsIconClicked);
  };

  return (
    <>
      <StyledSidebar>
        <div className="sidebar-header">
          <div
            className={` message-icon ${isChatBoxVisible ? 'clicked' : ''}`}
            onClick={handleChatIconClick}
            data-tooltip-id="Chat"
            data-tooltip-content="Chat Box"
          >
            <svg
              className={`icon ${isChatBoxVisible ? '' : 'white-icon'}`}
              width="40px"
              height="40px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 9H17M7 13H12M21 20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V20Z"
                stroke={isChatBoxVisible ? "#00BFFF" : "white"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unreadMessage && !isChatBoxVisible && <Loader />}
            <Tooltip id="Chat" place="left" />
          </div>

          <div
            className={`icon-container ${isVSCodeIconClicked ? 'vscode-clicked' : ''}`}
            onClick={handleVSCodeIconClick}
            data-tooltip-id="vscode"
            data-tooltip-content="Code Editor"
          >
            <img src={vscodeIcon} alt="VSCode" className={`icon ${isVSCodeIconClicked ? 'white-icon' : ''}`} />
          </div>
          <Tooltip id="vscode" place="left" />

          <div
            className={`icon-container ${isDrawIconClicked ? 'draw-clicked' : ''}`}
            onClick={handleDrawIconClick}
            data-tooltip-id="Draw"
            data-tooltip-content="Drawing Box"
          >
            <img src={drawIcon} alt="Draw" className={`icon ${isDrawIconClicked ? 'white-icon' : ''} `} />
          </div>
          <Tooltip id="Draw" place="left" />

          {/* this A CHAT GPT ICON  */}
          <div
            className={`icon-container ${isGptClicked ? 'draw-clicked' : ''}`}
            onClick={handleGptClick}

            data-tooltip-id="ChatBot"
            data-tooltip-content="Your AI Assistant"
          >
            <img src={chatgpt} alt="Draw" className={`icon ${isGptClicked ? 'white-icon' : ''} chatGpt`} />
          </div>
          <Tooltip id="ChatBot" place="left" />
          {/* this A CHAT GPT ICON END */}

          <div
            className={`icon-container ${isCodeSenderClick ? 'draw-clicked' : ''}`}
            onClick={handleCodeSender}

            data-tooltip-id="CodeSender"
            data-tooltip-content="Code Sender"
          >
            <img src={code} alt="Draw" className={`icon ${isCodeSenderClick ? 'white-icon' : ''} chatGpt`} />
            {isCodeSharingOpen && !isCodeSenderClick && <Loader />}
            <Tooltip id="CodeSender" place="left" />
          </div>

          <div
            className={`icon-container ${isToolsIconClicked ? 'tools-clicked' : ''}`}
            onClick={handleToolsIconClick}
            data-tooltip-id="Tools"
            data-tooltip-content="more tools"
          >
            <img src={toolsIcon} alt="Tools" className={`icon ${isToolsIconClicked ? 'white-icon' : ''}`} />
          </div>
          <Tooltip id="Tools" place="left" />
        </div>

      </StyledSidebar>
      {/* Conditionally render the ChatBox, CodeEditor, and Drawing */}
      <ChatBox isVisible={isChatBoxVisible} toggleChatBox={handleChatIconClick} />
    {isVSCodeIconClicked && (  <EditorContainer><CodeEditor isEditorVisible={isVSCodeIconClicked} toggleEditor={handleVSCodeIconClick} /></EditorContainer> )}
      {isDrawIconClicked && (
        <DrawingContainer>
          <Drawing />
        </DrawingContainer>
      )}

      {isGptClicked && (
        <ChatGptBox />
      )}
        <CodeSender isCodeSenderClick={isCodeSenderClick} handleCodeSender={handleCodeSender}/>


    </>
  );
};

const StyledSidebar = styled.div`
  width: 80px;
  height: 100vh;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  gap: 40px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;

  .icon-container,.message-icon {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 60px;
    height: 60px;
  }

  .icon {
    width: 40px;
    height: 40px;
  }

  .sidebar-header
  {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  gap: 40px;


  }
.chatGpt
{
     height: 60px;
    width: 60px;
}

.message-icon
{
    background-color: #00BFFF;
    border-radius: 8px;
    width: 60px;
    height: 60px;
}
    .message-icon.clicked {
    background-color: transparent; /* Remove background when clicked */
  }



  .icon-container.clicked,
  .icon-container.vscode-clicked,
  .icon-container.draw-clicked,
  .icon-container.tools-clicked {
    background-color: #00BFFF;
    border-radius: 8px;
    width: 60px;
    height: 60px;
  }

  .icon-container.tools-clicked {
    background-color: #00BFFF;
  }

  .white-icon {
    stroke: white;
    filter: brightness(0) invert(1);
  }

  .more-tools-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 60px;
  }

`;



const EditorContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 90px; /* Adjust to match sidebar width */
`;



const DrawingContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 50%; /* Center horizontally */
  transform: translateX(-50%); /* Offset by half its width to truly center */
  width: 90%; /* Match DrawingCollab's responsive width */
  max-width: 1100px; /* Match DrawingCollab's max-width */
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default LeftBar;