import { CSSTransition } from "react-transition-group";
import { useParams, useLocation, Link } from "react-router-dom";
import { MdSettings } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { MdVerticalAlignBottom } from "react-icons/md";
import { MdFullscreen } from "react-icons/md";
import { MdFullscreenExit } from "react-icons/md";
import { MdAccountCircle } from "react-icons/md";

import axios from "axios";
import Moment from "react-moment";
import React, { useContext, useEffect, useState, useRef, useCallback } from "react";

import {
  ButtonShowQualities,
  ButtonShowStats,
  InfoDisplay,
  PlaybackStats,
  PlayerNavbar,
  QualitiesList,
  StyledChat,
  ToggleSwitchChatSide,
  VideoAndChatContainer,
  VolumeEventOverlay,
} from "./StyledComponents";
import AccountContext from "../../account/AccountContext";
import NavigationContext from "./../../navigation/NavigationContext";
import PlayerEvents from "./PlayerEvents";
import VolumeSlider from "./VolumeSlider";

export default () => {
  const { id } = useParams();
  document.title = ` ${id} | Notifies`;
  const location = useLocation();
  const type = location.pathname.split("/")[1];
  const nameFromHash = location.hash !== "" ? location.hash.replace("#", "") : null;
  const { visible, setVisible, setFooterVisible, setShrinkNavbar } = useContext(NavigationContext);
  const [switched, setSwitched] = useState(false);
  const [volumeText, setVolumeText] = useState(0);
  const [volumeMuted, setVolumeMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [channelInfo, setChannelInfo] = useState();
  const [uptime, setUptime] = useState();
  const [viewers, setViewers] = useState();
  const [showPlaybackStats, setShowPlaybackStats] = useState();
  const [playbackStats, setPlaybackStats] = useState();
  const [showQualities, setShowQualities] = useState();
  const [qualities, setQualities] = useState();
  const [activeQuality, setActiveQuality] = useState();
  // const [playbackStats, setPlaybackStats] = useState();
  const volumeEventOverlayRef = useRef();
  const twitchPlayer = useRef();
  const PlayersatsTimer = useRef();
  const channelinfoTimer = useRef();
  const viewersTimer = useRef();
  const { twitchToken } = useContext(AccountContext);
  const OpenedDate = useRef();

  const fetchChannelInfo = useCallback(async () => {
    const channel = await axios
      .get(`https://api.twitch.tv/kraken/channels/${twitchPlayer.current.getChannelId()}`, {
        headers: {
          Authorization: `OAuth ${twitchToken}`,
          "Client-ID": process.env.REACT_APP_TWITCH_CLIENT_ID,
          Accept: "application/vnd.twitchtv.v5+json",
        },
      })
      .then(res => {
        return res.data;
      })
      .catch(error => {
        console.log("fetchChannelInfo channel: error", error);
      });

    setChannelInfo(channel);
  }, [twitchToken]);

  const fetchUptime = useCallback(async () => {
    await axios
      .get(`https://api.twitch.tv/helix/streams`, {
        params: {
          user_id: twitchPlayer.current.getChannelId(),
          first: 1,
        },
        headers: {
          Authorization: `Bearer ${twitchToken}`,
          "Client-ID": process.env.REACT_APP_TWITCH_CLIENT_ID,
        },
      })
      .then(res => {
        if (res.data.data[0] && res.data.data[0].started_at) {
          setUptime(res.data.data[0].started_at);
        }
        // return res.data.data[0]
      })
      .catch(error => {
        console.log("fetchChannelInfo stream: error", error);
      });
  }, [twitchToken]);

  const PausePlay = () => {
    if (twitchPlayer.current.isPaused()) {
      twitchPlayer.current.play();
      setIsPaused(false);
    } else {
      twitchPlayer.current.pause();
      setIsPaused(true);
    }

    return null;
  };

  const setOpenedTime = () => {
    if (!OpenedDate.current) {
      OpenedDate.current = new Date().getTime();
    }
  };

  useEffect(() => {
    window.addEventListener("focus", setOpenedTime);

    return () => {
      window.removeEventListener("focus", setOpenedTime);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    setShrinkNavbar("true");
    setVisible(false);
    setFooterVisible(false);

    twitchPlayer.current = new window.Twitch.Player("twitch-embed", {
      width: "100%",
      height: "100%",
      theme: "dark",
      layout: "video",
      channel: id && type === "live" ? id : null,
      video: id && type === "video" ? id : null,
      muted: false,
    });

    if (type === "live") {
      setTimeout(async () => {
        fetchChannelInfo();
        setViewers(twitchPlayer.current.getViewers());

        fetchUptime();
      }, 5000);

      if (!channelinfoTimer.current) {
        channelinfoTimer.current = setInterval(() => {
          fetchChannelInfo();
        }, 300000);
      }

      if (!viewersTimer.current) {
        viewersTimer.current = setInterval(() => {
          setViewers(twitchPlayer.current.getViewers());
        }, 60000);
      }
    }

    return () => {
      document.documentElement.style.overflow = "visible";
      setShrinkNavbar("false");
      setFooterVisible(true);
      clearInterval(PlayersatsTimer.current);
      clearInterval(channelinfoTimer.current);
      clearInterval(viewersTimer.current);
    };
  }, [
    setShrinkNavbar,
    setFooterVisible,
    setVisible,
    id,
    fetchChannelInfo,
    type,
    twitchToken,
    fetchUptime,
  ]);

  useEffect(() => {
    if (!uptime && viewers) fetchUptime();
  }, [fetchUptime, uptime, viewers]);

  const latencyColorValue = (name, value) => {
    if (name === "hlsLatencyBroadcaster" || name === "hlsLatencyEncoder") {
      if (value >= 10) {
        return "#f00";
      } else if (value >= 5) {
        return "#f66329";
      } else if (value >= 2.5) {
        return "#f6b029";
      } else {
        return "#4cf629";
      }
    } else {
      return "unset";
    }
  };

  const toggleFullscreen2 = TwitchPlayer => {
    const isFullScreen = TwitchPlayer.getFullscreen();
    TwitchPlayer.setFullscreen(!isFullScreen);
    TwitchPlayer.showPlayerControls(!isFullScreen);

    // if (TwitchPlayer.getFullscreen()) {
    //   document.exitFullscreen();
    // } else
    if (TwitchPlayer._bridge._iframe.requestFullScreen) {
      TwitchPlayer._bridge._iframe.requestFullScreen();
    } else if (TwitchPlayer._bridge._iframe.mozRequestFullScreen) {
      TwitchPlayer._bridge._iframe.mozRequestFullScreen();
    } else if (TwitchPlayer._bridge._iframe.webkitRequestFullScreen) {
      TwitchPlayer._bridge._iframe.webkitRequestFullScreen();
    }
  };

  if (type === "live") {
    return (
      <>
        <CSSTransition in={visible} timeout={300} classNames='fade-300ms' unmountOnExit>
          <PlayerNavbar>
            <Link to={`/channel/${id}`}>
              <MdAccountCircle size={20} />
              {id}'s channel page
            </Link>
          </PlayerNavbar>
        </CSSTransition>

        <VideoAndChatContainer
          style={{
            height: visible ? "calc(100vh - 75px)" : "100vh",
            top: visible ? "75px" : "0",
          }}
          switchedChatState={switched.toString()}>
          <div id='twitch-embed'>
            <VolumeEventOverlay ref={volumeEventOverlayRef} type='live' id='controls'>
              <InfoDisplay>
                {channelInfo ? (
                  <>
                    <img src={channelInfo.logo} alt=''></img>
                    <a id='name' href={channelInfo.url}>
                      {channelInfo.display_name}
                    </a>
                    <p id='title'>{channelInfo.status}</p>
                    <Link id='game' to={`/game/${channelInfo.game}`}>
                      Playing {channelInfo.game}
                    </Link>
                    <p id='viewers'>Viewers: {viewers}</p>
                    {uptime ? (
                      <p id='uptime'>
                        Uptime <Moment durationFromNow>{uptime}</Moment>
                      </p>
                    ) : (
                      <p id='uptime'>Offline</p>
                    )}
                  </>
                ) : null}
              </InfoDisplay>
              {isPaused ? (
                <FaPlay id='PausePlay' size={30} onClick={PausePlay} />
              ) : (
                <FaPause id='PausePlay' size={30} onClick={PausePlay} />
              )}
              <VolumeSlider
                volume={volumeText}
                setVolumeText={setVolumeText}
                TwitchPlayer={twitchPlayer.current}
                volumeMuted={volumeMuted}
                setVolumeMuted={setVolumeMuted}
                // onChange={Function}
                // onChangeComplete={Function}
              />
              {showPlaybackStats && playbackStats ? (
                <PlaybackStats>
                  {Object.keys(playbackStats).map(statName => {
                    return (
                      <div key={statName}>
                        <span>{`${statName}: `}</span>
                        <span
                          style={{
                            color: latencyColorValue(statName, playbackStats[statName]),
                          }}>
                          {playbackStats[statName]}
                        </span>
                      </div>
                    );
                  })}
                </PlaybackStats>
              ) : null}
              <ButtonShowStats
                onClick={() => {
                  if (!showPlaybackStats) {
                    document.querySelector("#controls").style.opacity = 1;
                  } else {
                    document.querySelector("#controls").style.opacity = 0;
                  }
                  setShowPlaybackStats(!showPlaybackStats);
                  setPlaybackStats(twitchPlayer.current.getPlaybackStats());

                  if (PlayersatsTimer.current) {
                    clearInterval(PlayersatsTimer);
                  } else {
                    PlayersatsTimer.current = setInterval(() => {
                      setPlaybackStats(twitchPlayer.current.getPlaybackStats());
                    }, 1500);
                  }
                }}
              />
              {showQualities && qualities ? (
                <QualitiesList>
                  {qualities.map(quality => {
                    return (
                      <li
                        key={quality.name}
                        onClick={() => {
                          twitchPlayer.current.setQuality(quality.group);
                          setActiveQuality(quality);
                          setShowQualities(false);
                        }}>
                        {quality.name}
                      </li>
                    );
                  })}
                </QualitiesList>
              ) : null}
              <ButtonShowQualities
                onClick={() => {
                  setShowQualities(!showQualities);
                  setQualities(twitchPlayer.current.getQualities());
                }}>
                {/* <Icon icon={ic_settings} size={26}></Icon> */}
                <MdSettings size={24} />
                {activeQuality
                  ? activeQuality.name
                  : twitchPlayer.current
                  ? twitchPlayer.current.getQuality().name
                  : null}
              </ButtonShowQualities>

              {true ? (
                <MdFullscreen
                  size={30}
                  style={{ position: "absolute", right: "12px", bottom: "12px", cursor: "pointer" }}
                  onClick={() => {
                    toggleFullscreen2(twitchPlayer.current);
                  }}
                />
              ) : (
                <MdFullscreenExit
                  size={30}
                  style={{ position: "absolute", right: "12px", bottom: "12px", cursor: "pointer" }}
                  onClick={() => {
                    toggleFullscreen2(twitchPlayer.current);
                  }}
                />
              )}

              <ToggleSwitchChatSide
                id='switchSides'
                switched={switched.toString()}
                onClick={() => {
                  setSwitched(!switched);
                }}
              />
            </VolumeEventOverlay>
            {twitchPlayer.current ? (
              <PlayerEvents
                volumeEventOverlayRef={volumeEventOverlayRef}
                setVolumeText={setVolumeText}
                setVolumeMuted={setVolumeMuted}
                TwitchPlayer={twitchPlayer.current}
                setIsPaused={setIsPaused}
                type='live'
                OpenedDate={OpenedDate}
              />
            ) : null}
          </div>
          <div id='chat'>
            <MdVerticalAlignBottom
              style={{
                transform: visible ? "rotateX(180deg)" : "unset",
              }}
              size={45}
              id='ToggleNavbarButton'
              title='Show navbar'
              onClick={() => {
                setVisible(!visible);
              }}
            />
            <StyledChat
              frameborder='0'
              scrolling='yes'
              theme='dark'
              id={id + "-chat"}
              src={`https://www.twitch.tv/embed/${id}/chat?darkpopout`}
            />
          </div>
        </VideoAndChatContainer>
      </>
    );
  } else if (type === "video") {
    return (
      <>
        <CSSTransition in={visible} timeout={300} classNames='fade-300ms' unmountOnExit>
          <PlayerNavbar>
            {nameFromHash ? (
              <Link to={`/channel/${nameFromHash}`}>
                <div id='icon'>
                  <MdAccountCircle size={20} />
                </div>
                {nameFromHash}'s channel page
              </Link>
            ) : null}
          </PlayerNavbar>
        </CSSTransition>

        <VideoAndChatContainer
          id='twitch-embed'
          style={{
            height: visible ? "calc(100vh - 75px)" : "100vh",
            top: visible ? "75px" : "0",
            display: "unset",
          }}>
          <MdVerticalAlignBottom
            style={{
              transform: visible ? "rotateX(180deg)" : "unset",
              right: "10px",
            }}
            size={45}
            id='ToggleNavbarButton'
            title='Show navbar'
            onClick={() => {
              setVisible(!visible);
            }}
          />
        </VideoAndChatContainer>
      </>
    );
  } else {
    return <p>Error?</p>;
  }
};
