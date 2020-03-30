import styled, { keyframes } from "styled-components";
import { MdFavorite } from "react-icons/md";
import { MdFavoriteBorder } from "react-icons/md";

export const HeaderContainerTwitchLive = styled.div`
  border-bottom: var(--subFeedHeaderBorder);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 7px;
  width: var(--feedsWidth) !important;
  margin: var(--feedsMargin);

  @media screen and (max-width: 2560px) {
    margin: 25px 0 0 360px;
    width: 82%;
  }

  @media screen and (max-width: 1920px) {
    width: 73.5%;
    margin: 25px 7.5% 0 19%;
  }
`;

export const StyledLoadmore = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: auto min-content auto;
  align-items: center;
  max-width: 100%;
  padding-bottom: 10px;

  div:not(#Button) {
    background: rgba(90, 92, 94, 0.67);
    height: 1px;
  }

  div#Button {
    width: max-content;
    cursor: pointer;
    margin: 0;
    font-weight: bold;
    color: #a4a4a4;
    /* text-shadow: 0px 0px 5px black; */
    padding: 0px 15px;
    transition: all 200ms;

    &:hover {
      color: white;
      padding: 0px 25px;
    }
  }
`;

const countdown = keyframes`
    from {
      stroke-dashoffset: 0px;
    }
    to {
      stroke-dashoffset: 67.8px;
    }
`;

export const StyledCountdownCircle = styled.div`
  position: relative;
  margin: auto;
  height: 24px;
  width: 24px;
  text-align: center;
  margin: 5px auto !important;

  div#countdown-number {
    display: inline-block;
    line-height: 24px;
    width: 24px;
    height: 24px;
    color: rgb(255, 255, 255);
    font-size: 13px;
    display: flex;
    justify-content: center;
  }

  svg {
    position: absolute;
    top: 0;
    right: 0;
    width: 24px;
    height: 24px;
    transform: rotateY(-180deg) rotateZ(-90deg);
  }

  svg circle {
    stroke-dasharray: 67.8px;
    stroke-dashoffset: 0px;
    stroke-linecap: round;
    stroke-width: 3px;
    stroke: white;
    fill: none;
    animation: ${countdown} 25s linear 1 forwards;
    /* animation: ${countdown} ${({ delay }) => delay || 25}s linear 1 forwards; */
    /* animation-delay: ${({ delay }) => delay || 0}s; */
    animation-delay:  0s;
  }


`;

export const HeaderLeftSubcontainer = styled.div`
  width: 300px;
  min-width: 300px;
  align-items: end;
  display: flex;
`;

export const pulse = keyframes`
  0% {background: #131416d1;}
  40% {background: #1f2024d1;}
  100% {background: #131416d1;}
`;

export const pulseLight = keyframes`
  0% {background: #36393fd1;}
  40% {background: #464d54;}
  100% {background: #36393fd1;}
`;

export const StyledLoadingBox = styled.div`
  display: grid;
  grid-template-areas: "video video" "title title" "info info";
  width: 336px;
  margin: 7px;
  max-height: 336px;
  margin-bottom: 15px;
  /* height: ${({ type }) => (type === "Vods" || type === "Clips" ? "unset" : "334px")}; */
  height: unset;

  transition: all 1s linear;

  div#video {
    grid-area: video;
    max-height: 189px;
    min-height: 189px;
    width: 336px;
    border-radius: 10px;
    background: #131416d1;
    animation: ${pulse} 2s linear infinite;
  }

  div div {
    background: #131416d1;
    border-radius: 10px;
  }

  div#title {
    color: var(--videoTitle);
    margin-top: 15px;
    margin-bottom: 5px;
    grid-area: title;
    font-size: 1.05 rem;
    max-width: 336px;
    overflow: hidden;
    height: 45px;
    line-height: 1.2;

    div {
      width: 200px;
      height: 20px;
    }
  }

  #details {
    height: ${({ type }) => (type === "Vods" ? "65px" : type === "Clips" ? "25px" : "75px")};
    /* height: 65px; */

    #channel {
      width: 100px;
      /* height: 20px; */
      height: ${({ type }) => (type === "Clips" ? "25px" : "20px")};
      /* margin: 7px 0; */
      margin: ${({ type }) => (type === "Clips" ? "0" : "7px 0")};
    }

    #game {
      width: 125px;
      height: 20px;
      margin: 21px 0 0 0;
      display: ${({ type }) => (type === "Clips" ? "none" : "block")};
    }
  }
`;

export const StyledLoadingList = styled.ul`
  li div {
    height: 15px;
    width: 100%;
    border-radius: 8px;
    background: #36393fd1;
    animation: ${pulseLight} 2s linear infinite;
  }
`;

export const FollowBtn = styled(MdFavoriteBorder)`
  cursor: pointer;
  color: red;
  transition: color 250ms, opacity 250ms;
  margin: 0 10px;
  opacity: 0;

  &:hover {
    color: green;
    opacity: 1;
  }
`;

export const UnfollowBtn = styled(MdFavorite)`
  cursor: pointer;
  color: green;
  transition: color 250ms, opacity 250ms;
  margin: 0 10px;
  opacity: 0;

  &:hover {
    color: red;
    opacity: 1;
  }
`;

export const ChannelNameDiv = styled.div`
  padding: 0 5px;
  font-weight: 700;
  height: 100%;
  grid-row: 1;
  display: flex;
  transition: color 250ms;
  width: max-content;

  .name {
    padding: 0 5px;
    color: var(--infoColorGrey);
    font-size: 1rem !important;
    display: flex;
    align-items: center;
    transition: color 250ms;

    &:hover {
      color: var(--channelHover);
    }
  }

  .twitchIcon {
    grid-row: 1;
    color: #710271;
    padding: 0px 10px;
    opacity: 0;
    transition: opacity 150ms;

    &:hover {
      color: #af2caf;
      opacity: 1;
    }
  }

  &:hover {
    .twitchIcon {
      opacity: 1;
    }
  }
`;

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: var(--feedsWidth);
  margin: var(--feedsMargin);
  margin-top: 0;
  padding-bottom: 50px;
  min-height: 400px;

  @media screen and (max-width: 2560px) {
    width: 82.5%;
    margin: 25px 0 0 360px;
  }
  @media screen and (max-width: 1920px) {
    width: 74%;
    margin: 25px 7.5% 0 19%;
  }
`;
