import { Button } from "react-bootstrap";
import { GoSignOut } from "react-icons/go";
import React, { useContext, useState } from "react";
import { FaTwitch } from "react-icons/fa";
import { MdVideocam } from "react-icons/md";
import { FaYoutube } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FiSidebar } from "react-icons/fi";
import { MdAutorenew } from "react-icons/md";
import { TiFlash } from "react-icons/ti";
import { AiOutlineDisconnect } from "react-icons/ai";
import { FaRegWindowRestore } from "react-icons/fa";

import { AddCookie, getCookie } from "../../../util/Utils";
import AccountContext from "./../../account/AccountContext";
import ClearAllAccountCookiesStates from "./ClearAllAccountCookiesStates";
import DeleteAccountButton from "./DeleteAccountButton";
import FeedsContext from "./../../feed/FeedsContext";
import ReAuthenticateButton from "./ReAuthenticateButton";
import Themeselector from "./../../themes/Themeselector";
import ToggleButton from "./ToggleButton";
import UpdateProfileImg from "./UpdateProfileImg";
import UpdateTwitterListName from "./UpdateTwitterListName";
import disconnectYoutube from "./../../youtube/disconnectYoutube";
import disconnectTwitch from "./../../twitch/disconnectTwitch";
import {
  StyledProfileImg,
  StyledLogoutContiner,
  ShowAddFormBtn,
  CloseAddFormBtn,
  ProfileImgContainer,
  ToggleButtonsContainer,
  ToggleButtonsContainerHeader,
} from "./StyledComponent";

export default () => {
  const {
    username,
    setUsername,
    profileImage,
    setTwitchToken,
    setYoutubeToken,
    twitchToken,
    youtubeToken,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
  } = useContext(AccountContext);

  const {
    enableTwitch,
    setEnableTwitch,
    enableTwitchVods,
    setEnableTwitchVods,
    showTwitchSidebar,
    setShowTwitchSidebar,
    enableYoutube,
    setEnableYoutube,
    twitchVideoHoverEnable,
    setTwitchVideoHoverEnable,
    youtubeVideoHoverEnable,
    setYoutubeVideoHoverEnable,
    enableTwitter,
    setEnableTwitter,
    isEnabledOfflineNotifications,
    setIsEnabledOfflineNotifications,
    isEnabledUpdateNotifications,
    setIsEnabledUpdateNotifications,
  } = useContext(FeedsContext);
  const [showAddImage, setShowAddImage] = useState(false);

  function logout() {
    ClearAllAccountCookiesStates(setUsername);
  }

  return (
    <>
      <div style={{ minHeight: "calc(100% - 120px)" }}>
        <ProfileImgContainer>
          {showAddImage ? (
            <CloseAddFormBtn
              onClick={() => {
                setShowAddImage(false);
              }}
            />
          ) : (
            <ShowAddFormBtn
              onClick={() => {
                setShowAddImage(true);
              }}>
              Change Profile image
            </ShowAddFormBtn>
          )}
          {showAddImage && (
            <UpdateProfileImg
              close={() => {
                setShowAddImage(false);
              }}
            />
          )}
          <StyledProfileImg
            src={profileImage || `${process.env.PUBLIC_URL}/images/placeholder.webp`}
            alt=''
          />
        </ProfileImgContainer>
        <h1 style={{ fontSize: "2rem", textAlign: "center" }} title='Username'>
          {username}
        </h1>
        <p style={{ textAlign: "center" }} title='Email'>
          {getCookie("AioFeed_AccountEmail")}
        </p>
        <ToggleButtonsContainerHeader>Feeds</ToggleButtonsContainerHeader>
        <ToggleButtonsContainer>
          <ToggleButton
            setEnable={(value) => {
              setEnableTwitch(value);
              AddCookie("Twitch_FeedEnabled", value);
            }}
            enabled={enableTwitch}
            label='Twitch'
            tokenExists={twitchToken}
            tooltip={
              twitchToken
                ? (enableTwitch ? "Disable " : "Enable ") + ` Twitch feed`
                : `Need to connect/authenticate with a Twitch account first.`
            }
            icon={<FaTwitch size={24} color='rgb(169, 112, 255)' />}
          />

          <ToggleButton
            setEnable={(value) => {
              setEnableTwitter(value);
              AddCookie("Twitter_FeedEnabled", value);
            }}
            enabled={enableTwitter}
            label='Twitter'
            tokenExists={true}
            tooltip={(enableTwitter ? "Disable " : "Enable ") + ` Twitter feed`}
            icon={<FaTwitter size={24} color='rgb(29, 161, 242)' />}
            // tokenExists={twitterListName}
          />
          <ToggleButton
            setEnable={(value) => {
              setEnableYoutube(value);
              AddCookie("Youtube_FeedEnabled", value);
            }}
            enabled={enableYoutube}
            label='Youtube'
            tokenExists={youtubeToken}
            tooltip={
              youtubeToken
                ? (enableYoutube ? "Disable " : "Enable ") + ` Twitch feed`
                : `Need to connect/authenticate with a Youtube account first.`
            }
            icon={<FaYoutube size={24} color='rgb(255, 0, 0)' />}
          />
          <ToggleButton
            setEnable={(value) => {
              setEnableTwitchVods(value);
              AddCookie("TwitchVods_FeedEnabled", value);
            }}
            enabled={enableTwitchVods}
            label='TwitchVods'
            tokenExists={twitchToken}
            tooltip={
              twitchToken
                ? (enableTwitchVods ? "Disable " : "Enable ") + ` Twitch feed`
                : `Need to connect/authenticate with a Twitch account first.`
            }
            icon={<MdVideocam size={24} color='rgb(169, 112, 255)' />}
          />
        </ToggleButtonsContainer>
        <UpdateTwitterListName />
        <br />
        <ToggleButtonsContainerHeader>Settings</ToggleButtonsContainerHeader>
        <ToggleButtonsContainer buttonsperrow={3}>
          <ToggleButton
            setEnable={(value) => {
              setAutoRefreshEnabled(value);
              AddCookie("Twitch_AutoRefresh", value);
            }}
            enabled={autoRefreshEnabled}
            label='Twitch auto-refresh (25s)'
            tokenExists={twitchToken}
            tooltip={
              twitchToken
                ? (autoRefreshEnabled ? "Disable " : "Enable ") + `Twitch auto refresh`
                : `Need to connect/authenticate with a Twitch account first.`
            }
            icon={<MdAutorenew size={18} color='rgb(169, 112, 255)' />}
          />
          <ToggleButton
            setEnable={(value) => {
              setShowTwitchSidebar(value);
              AddCookie("Twitch_SidebarEnabled", value);
            }}
            enabled={showTwitchSidebar}
            label='Twitch sidebar'
            tokenExists={twitchToken}
            tooltip={
              twitchToken
                ? (showTwitchSidebar ? "Hide " : "Show ") + `Twitch Sidebar`
                : `Need to connect/authenticate with a Twitch account first.`
            }
            icon={<FiSidebar size={18} color='rgb(169, 112, 255)' />}
          />
          <ToggleButton
            setEnable={(value) => {
              setIsEnabledUpdateNotifications(value);
              AddCookie("Twitch_update_notifications", value);
            }}
            enabled={isEnabledUpdateNotifications}
            label='Twitch update notifications'
            tokenExists={twitchToken}
            tooltip={
              twitchToken
                ? (isEnabledUpdateNotifications ? "Disable " : "Enable ") +
                  `notifications for when streams title or game changes`
                : `Need to connect/authenticate with a Twitch account first.`
            }
            icon={<TiFlash size={18} color='rgb(169, 112, 255)' />}
          />
          <ToggleButton
            setEnable={(value) => {
              setIsEnabledOfflineNotifications(value);
              AddCookie("Twitch_offline_notifications", value);
            }}
            enabled={isEnabledOfflineNotifications}
            label='Twitch offline notifications'
            tokenExists={twitchToken}
            tooltip={
              twitchToken
                ? (isEnabledOfflineNotifications ? "Disable " : "Enable ") +
                  `notifications for when streams go offline`
                : `Need to connect/authenticate with a Twitch account first.`
            }
            icon={<AiOutlineDisconnect size={18} color='rgb(169, 112, 255)' />}
          />
          <ToggleButton
            setEnable={(value) => {
              setTwitchVideoHoverEnable(value);
              AddCookie("TwitchVideoHoverEnabled", value);
            }}
            enabled={twitchVideoHoverEnable}
            label='Twitch hover-video'
            tokenExists={twitchToken}
            tooltip={
              twitchToken
                ? (twitchVideoHoverEnable ? "Disable " : "Enable ") + `video on hover`
                : `Need to connect/authenticate with a Youtube account first.`
            }
            icon={
              <>
                <FaRegWindowRestore size={18} />
                <FaTwitch style={{ marginLeft: "5px" }} size={14} color='rgb(169, 112, 255)' />
              </>
            }
          />
          <ToggleButton
            setEnable={(value) => {
              setYoutubeVideoHoverEnable(value);
              AddCookie("YoutubeVideoHoverEnabled", value);
            }}
            enabled={youtubeVideoHoverEnable}
            label='Youtube hover-video'
            tokenExists={youtubeToken}
            tooltip={
              youtubeToken
                ? (youtubeVideoHoverEnable ? "Disable " : "Enable ") + `video on hover`
                : `Need to connect/authenticate with a Youtube account first.`
            }
            icon={
              <>
                <FaRegWindowRestore size={18} />
                <FaYoutube style={{ marginLeft: "5px" }} size={14} color='rgb(255, 0, 0)' />
              </>
            }
          />
        </ToggleButtonsContainer>
        <br />

        <ReAuthenticateButton
          disconnect={() => disconnectTwitch({ setTwitchToken, setEnableTwitch })}
          serviceName={"Twitch"}
        />
        <ReAuthenticateButton
          disconnect={() => disconnectYoutube({ setYoutubeToken, setEnableYoutube })}
          serviceName={"Youtube"}
        />
        <Themeselector />
      </div>
      <StyledLogoutContiner>
        <DeleteAccountButton />
        <Button style={{ width: "100%" }} label='logout' onClick={logout} variant='secondary'>
          Logout
          <GoSignOut size={24} style={{ marginLeft: "0.75rem" }} />
        </Button>
      </StyledLogoutContiner>
    </>
  );
};
