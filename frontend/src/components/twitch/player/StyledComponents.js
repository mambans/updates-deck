import styled from "styled-components";
import { FaInfoCircle } from "react-icons/fa";
import { MdCompareArrows } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import { MdChat } from "react-icons/md";
import { MdMovieCreation } from "react-icons/md";
import { Button } from "react-bootstrap";

export const VideoAndChatContainer = styled.div`
  position: fixed;
  width: 100vw;
  height: calc(100vh - 50px);
  top: 50px;
  transition: top 300ms, height 300ms;
  display: grid;
  transform: translate3d(0, 0, 0);
  grid-template-areas: ${({ switchedChatState, hidechat }) =>
    hidechat
      ? '"video"'
      : switchedChatState === "true"
      ? '"chat devider video"'
      : switchedChatState === "hide"
      ? '"video"'
      : '"video devider chat"'};
  color: var(--navTextColorActive);
  cursor: ${({ resizeActive }) => (resizeActive ? "w-resize" : "unset")};
  grid-template-columns: ${({ videowidth, hidechat, switched }) =>
    `${hidechat ? "100vw" : switched ? `auto 5px ${videowidth}px` : `${videowidth}px 5px auto`} `};

  &:hover #switchSides {
    opacity: 0.6;
  }

  div#twitch-embed {
    grid-area: video;
  }

  div#chat {
    grid-area: chat;
  }

  .IframeContainer {
    width: 100%;
    height: 100%;
  }
`;

export const StyledChat = styled.iframe`
  height: 100%;
  border: none;
  width: 100%;
`;

export const StyledVideo = styled.iframe`
  width: ${({ width }) => width || "91vw"};
  border: none;
`;

export const ToggleSwitchChatSide = styled(MdCompareArrows).attrs({ size: 30 })`
  position: absolute;
  z-index: 1;
  cursor: pointer;
  transition: opacity 300ms;
  bottom: 60px;
  right: ${({ switched }) => (switched === "true" ? "unset" : "10px")};
  left: ${({ switched }) => (switched === "true" ? "10px" : "unset")};
  background: rgba(0, 0, 0, 0.25) none repeat scroll 0% 0%;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0px 5px 1px;

  &:hover {
    opacity: 1 !important;
  }
`;

export const PlayerNavbar = styled.div`
  height: 35px;
  background: #0000005c;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  align-self: center;

  button,
  a.btn {
    margin: 2px 20px;
    transition: background-color 200ms, border-color 200ms, color 200ms, box-shadow 200ms;
    padding: 0px 6px;

    background-color: #26292f8a;
    border-color: #26292f8a;
    box-shadow: 3px 3px 2px #161515d4;
    color: var(--navTextColor);

    &:hover:not([disabled]) {
      box-shadow: 4px 4px 2px #161515ed;
      color: #fff;
      background-color: #23272b;
      border-color: #1d2124;
    }
  }

  a,
  p {
    color: var(--navTextColor);
    padding: 0;
    font-size: 1rem !important;
    display: flex;
    transition: color 200ms;
    align-items: center;
    margin: 0 20px;

    &:hover {
      color: #ffffff;
    }

    svg {
      transition: color 200ms;
      display: flex;
      align-items: center;
      padding-right: 7px;
      display: flex !important;
    }
  }

  .linkWithIcon:not([disabled]) {
    svg {
      color: #720072;
    }

    &:hover svg {
      color: #ae02ae;
    }
  }

  .linkWithIcon[disabled] {
    opacity: 0.3;
    pointer-events: none;
  }
`;

export const VolumeEventOverlay = styled.div`
  position: absolute;
  width: ${({ type, hidechat, videowidth }) =>
    hidechat === "true" ? "100vw" : type === "live" ? `${videowidth}px` : "100vw"};
  height: 100%;
  bottom: ${({ type }) => (type === "live" ? "unset" : "70px")};
  cursor: ${({ showcursor }) => (showcursor ? "auto" : "none")};
  display: ${({ show }) => (show ? "block" : "none")};

  a,
  p {
    text-shadow: 0 0 2px black;
  }

  #PausePlay {
    color: #f4f4f49c;
    cursor: pointer;
    position: absolute;
    bottom: 10px;
    transition: color 150ms;
    margin: 5px 10px;

    &:hover {
      color: #ffffff;
    }
  }

  svg,
  p#showQualities {
    opacity: 0.7;
    transition: opacity 300ms;

    &:hover {
      opacity: 1;
    }
  }
`;

export const StyledVolumeSlider = styled.div`
  width: 230px;
  text-align: center;
  bottom: 10px;
  position: absolute;
  left: 50px;
  display: grid;
  grid-template-areas: "spacer text" "slider slider";
  grid-template-columns: 60px auto;
  margin: 5px 10px;

  h3 {
    margin-bottom: 0;
    grid-area: text;
    text-shadow: 0 0 5px black;
  }

  svg#icon {
    color: #f4f4f49c;
    margin-right: 15px;
    cursor: pointer;
  }

  &:hover {
    svg#icon {
      color: #ffffff;
    }
  }

  #BottomRow {
    display: flex;
    grid-area: slider;
  }

  .rangeslider-horizontal {
    height: 12px;
    border-radius: 6px;
  }

  .rangeslider {
    background-color: ${({ volumeMuted }) => (volumeMuted ? "#841010a1" : "#6b6b6b")};
    margin: 9px 0;
    width: calc(100% - 30px);
    cursor: pointer;
  }

  .rangeslider-horizontal .rangeslider__fill {
    /* background-color: #42b38e; */
    background-color: ${({ volumeMuted }) => (volumeMuted ? "#bd0202" : "#42b38e")};
    border-radius: 6px;
  }
`;

// export const PausePlay = styled(props => (props.ispaused === "true" ? FaPlay : FaPause)).attrs({
// export const PausePlay = styled(props => (props.ispaused === "true" ? FaPlay : FaPause)).attrs({
//   size: 30,
// })`
//   color: #f4f4f49c;
//   cursor: pointer;
//   position: absolute;
//   bottom: 10px;
//   transition: color 150ms;
//   margin: 5px 10px;

//   &:hover {
//     color: #ffffff;
//   }
// `;

// export const PausePlayOverlay = styled(props => (props.ispaused === "true" ? FaPlay : FaPause)).attrs({
//   size: 70,
// })`
//   color: white;
//   cursor: pointer;
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   justify-content: center;
//   display: flex !important;
//   align-items: center;
//   background: rgba(0, 0, 0, 0.5);
// `;

export const InfoDisplay = styled.div`
  display: grid;
  grid-template-areas: "logo name" "logo title" "logo game" "logo viewers" "logo uptime";
  grid-template-columns: 75px auto;
  /* width: 400px; */
  max-width: 500px;
  background: #00000080;
  padding: 15px 15px 5px 15px;
  border-radius: 10px;
  box-shadow: 5px 5px 10px #0000009c;
  position: absolute;

  p {
    margin: 0;
  }

  a {
    color: #ffffff;

    &:hover {
      text-decoration: underline;
    }
  }

  img {
    height: 65px;
    width: 65px;
    border-radius: 50%;
    grid-area: logo;
  }

  #name {
    grid-area: name;
    font-size: 1.3rem;
    font-weight: bold;
  }

  #title {
    grid-area: title;
  }

  #game {
    grid-area: game;
    width: max-content;
  }

  #viewers {
    grid-area: viewers;
    width: max-content;
  }

  #uptime {
    grid-area: uptime;
    width: max-content;
  }

  .twitchRedirect {
    margin-left: 10px;
  }
`;

// export const ButtonShowStats = styled(Icon).attrs({ icon: infoCircle, size: 26 })`
export const ButtonShowStats = styled(FaInfoCircle).attrs({ size: 24 })`
  position: absolute;
  bottom: 12px;
  margin: 0;
  font-weight: bold;
  left: 315px;
  font-size: 1.1rem;
  cursor: pointer;
  margin: 5px 10px;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.25) none repeat scroll 0% 0%;
  border-radius: 50%;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0px 5px 1px;

  &:hover {
    opacity: 1;
  }
`;

export const ButtonShowQualities = styled.p`
  position: absolute;
  bottom: 12px;
  margin: 0;
  font-weight: bold;
  left: 400px;
  font-size: 1.1rem;
  cursor: pointer;
  margin: 5px 10px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.25) none repeat scroll 0% 0%;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0px 5px 1px;

  &:hover {
    opacity: 1;
  }

  svg {
    margin-right: 7px;
  }
`;

export const QualitiesList = styled.ul`
  width: max-content;
  position: absolute;
  bottom: 50px;
  font-weight: bold;
  left: 415px;
  cursor: pointer;
  margin: 5px;
  list-style: none;
  background: #00000080;
  padding: 5px;
  border-radius: 10px;
  box-shadow: 5px 5px 10px #0000009c;

  li {
    padding: 2px;
    color: rgb(200, 200, 200);

    &:hover {
      color: #ffffff;
    }
  }
`;

export const PlaybackStats = styled.div`
  width: max-content;
  padding: 10px;
  border-radius: 10px;
  bottom: 80px;
  position: absolute;

  background: #00000080;
  border-radius: 10px;
  box-shadow: 5px 5px 10px #0000009c;
`;

// export const StyledHideChatButton = styled(({ hideChat }) =>
//   hideChat === "true" ? MdCompareArrows : FaWindowClose
// ).attrs({ size: 26, color: "red" })`

export const HideChatButton = styled(FaWindowClose).attrs({ size: 26, color: "red" })`
  position: absolute;
  bottom: 100px;
  opacity: 0.5;
  cursor: pointer;
  right: ${({ switched }) => (switched === "true" ? "unset" : "10px")};
  left: ${({ switched }) => (switched === "true" ? "10px" : "unset")};
  background: rgba(0, 0, 0, 0.25) none repeat scroll 0% 0%;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0px 5px 1px;
`;

export const OpenChatButton = styled(MdChat).attrs({ size: 26, color: "white" })`
  position: absolute;
  bottom: 100px;
  opacity: 0.5;
  cursor: pointer;
  right: ${({ switched }) => (switched === "true" ? "unset" : "10px")};
  left: ${({ switched }) => (switched === "true" ? "10px" : "unset")};
  background: rgba(0, 0, 0, 0.25) none repeat scroll 0% 0%;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0px 5px 1px;
`;

export const CreateClipButton = styled(MdMovieCreation).attrs({ size: 24, color: "white" })`
  position: absolute;
  left: 360px;
  bottom: 12px;
  opacity: 0.7;
  cursor: pointer;
  margin: 5px 10px;
  background: rgba(0, 0, 0, 0.25) none repeat scroll 0% 0%;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0px 5px 1px;
`;

export const ShowNavbarBtn = styled(Button)`
  display: flex;
  align-items: center;
  position: absolute;
  z-index: 1;
  padding: 4px;
  margin: 4px;
  cursor: pointer;
  opacity: 0.4;
  right: ${({ type }) => (type === "video" ? "10px" : "unset")};
  transition: opacity 200ms, transform 200ms;

  &:hover {
    opacity: 1;
  }
`;

export const NavigateBack = styled(Button)`
  left: 0;
  position: absolute;
`;

export const ResizeDevider = styled.div`
  height: 100%;
  cursor: w-resize;
  grid-area: devider;
  transition: background 500ms;
  background: ${({ resizeActive }) => (resizeActive ? "rgb(40,40,40)" : "unset")};
  display: flex;
  transform: translate3d(0,0,0);

  > div {
    transition: opacity 500ms, height 250ms;
    opacity: ${({ resizeActive }) => (resizeActive ? 1 : 0.2)};
    background: #ffffff;
    width: 1px;
    margin: auto;
    /* height: ${({ resizeActive, videowidth }) =>
      resizeActive ? `${(videowidth / 1.777777777777778).toFixed(0)}px` || "25%" : "5%"}; */
    height: ${({ resizeActive }) => (resizeActive ? "40%" : "10%")};
  }

  &:hover > div {
    transition: opacity 250ms, height 500ms;
    opacity: 1;
    height: 40%;
  }
`;

export const ChatOverlay = styled.div`
  height: 100%;
  width: ${({ videowidth }) => `calc(100vw - ${videowidth}px)`};
  position: absolute;
  transform: translate3d(0, 0, 0);
  grid-area: chat;
`;
