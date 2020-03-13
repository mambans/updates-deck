import { CSSTransition } from "react-transition-group";
import { FaRegEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { FaTwitch } from "react-icons/fa";

import Alert from "react-bootstrap/Alert";
import Moment from "react-moment";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import React, { useRef, useState, useEffect, useContext } from "react";
import Tooltip from "react-bootstrap/Tooltip";

import { VideoTitle, ImageContainer, VideoContainer } from "./../sharedStyledComponents";
import FeedsContext from "./../feed/FeedsContext";
import StreamHoverIframe from "./StreamHoverIframe.js";
import styles from "./Twitch.module.scss";
import Util from "../../util/Util";
import FollowUnfollowBtn from "./FollowUnfollowBtn";

const HOVER_DELAY = 500; // 1000

function NewHighlightNoti({ data }) {
  if (data.newlyAddedStreams.includes(data.data.user_name)) {
    return (
      <FiAlertCircle
        size={22}
        style={{
          position: "absolute",
          display: "flex",
          color: "var(--newHighlight)",
          backgroundColor: "#00000042",
          borderRadius: "8px",
          margin: "5px",
        }}
      />
    );
  }
  return "";
}

function StreamEle(data) {
  const [isHovered, setIsHovered] = useState(false);
  const [channelIsHovered, setChannelIsHovered] = useState(false);
  const [unfollowError, setUnfollowError] = useState(null);
  const { twitchVideoHoverEnable } = useContext(FeedsContext);

  const streamHoverTimer = useRef();
  const ref = useRef();
  const refChannel = useRef();
  // const refUnfollowAlert = useRef();

  function UnfollowAlert() {
    if (unfollowError) {
      let alertType = "warning";
      if (unfollowError.includes("Failed")) {
        alertType = "warning";
      } else if (unfollowError.includes("Successfully")) {
        alertType = "success";
      }
      let resetError;

      clearTimeout(resetError);
      resetError = setTimeout(() => {
        setUnfollowError(null);
      }, 5000);
      // clearTimeout(refUnfollowAlert.current);
      // refUnfollowAlert.current = setTimeout(() => {
      //   setUnfollowError(null);
      // }, 6000);
      return (
        <CSSTransition
          in={unfollowError ? true : false}
          // key={stream.id}
          timeout={2500}
          classNames='fadeout-2500ms'
          unmountOnExit>
          <Alert
            variant={alertType}
            style={{
              width: "inherit",
              position: "absolute",
              margin: "0",
              padding: "5px",
              borderRadius: "10px 10px 0 0",
            }}
            className='unfollowErrorAlert'>
            <Alert.Heading
              style={{
                fontSize: "16px",
                textAlign: "center",
                marginBottom: "0",
              }}>
              {unfollowError}
              <Alert.Link href={"https://www.twitch.tv/" + data.data.user_name.toLowerCase()}>
                {data.data.user_name}
              </Alert.Link>
            </Alert.Heading>
          </Alert>
        </CSSTransition>
      );
    } else {
      return "";
    }
  }

  const handleMouseOver = () => {
    streamHoverTimer.current = setTimeout(function() {
      setIsHovered(true);
    }, HOVER_DELAY);
  };

  const handleMouseOut = () => {
    clearTimeout(streamHoverTimer.current);
    setIsHovered(false);
  };

  useEffect(() => {
    if (ref.current && twitchVideoHoverEnable) {
      const refEle = ref.current;
      refEle.addEventListener("mouseenter", handleMouseOver);
      refEle.addEventListener("mouseleave", handleMouseOut);

      return () => {
        refEle.removeEventListener("mouseenter", handleMouseOver);
        refEle.removeEventListener("mouseleave", handleMouseOut);
      };
    }
  }, [twitchVideoHoverEnable]);

  const handleMouseOverChannel = () => {
    setChannelIsHovered(true);
  };

  const handleMouseOutChannel = () => {
    setChannelIsHovered(false);
  };

  useEffect(() => {
    if (refChannel.current) {
      const refEle = refChannel.current;
      refEle.addEventListener("mouseenter", handleMouseOverChannel);
      refEle.addEventListener("mouseleave", handleMouseOutChannel);

      return () => {
        refEle.removeEventListener("mouseenter", handleMouseOverChannel);
        refEle.removeEventListener("mouseleave", handleMouseOutChannel);
      };
    }
  }, []);

  return (
    <VideoContainer key={data.data.id}>
      <UnfollowAlert></UnfollowAlert>

      <ImageContainer id={data.data.id} ref={ref} style={{ marginTop: "5px" }}>
        <NewHighlightNoti data={data}></NewHighlightNoti>
        {isHovered ? (
          <StreamHoverIframe
            id={data.data.id}
            data={data.data}
            setIsHovered={setIsHovered}></StreamHoverIframe>
        ) : null}
        <Link
          className={styles.img}
          to={{
            pathname: "/live/" + data.data.user_name.toLowerCase(),
            state: {
              p_uptime: data.data.started_at,
              p_title: data.data.title,
              p_game: data.data.game_name,
              p_viewers: data.data.viewers,
            },
          }}>
          {/* href={
                "https://player.twitch.tv/?volume=0.1&!muted&channel=" +
                data.data.user_name.toLowerCase()
              }> */}
          <img
            style={
              data.newlyAddedStreams.includes(data.data.user_name)
                ? { boxShadow: "white 0px 0px 3px 2px" }
                : null
            }
            src={
              // data.data.thumbnail_url.replace("{width}", 1280).replace("{height}", 720) +
              data.data.thumbnail_url.replace("{width}", 858).replace("{height}", 480) +
              `#` +
              new Date().getTime()
            }
            alt={styles.thumbnail}
          />
        </Link>
        <Moment className={styles.duration} durationFromNow>
          {data.data.started_at}
        </Moment>
        {/* {streamType(data.data.type)} */}
      </ImageContainer>
      {data.data.title.length > 50 ? (
        <OverlayTrigger
          key={"bottom"}
          placement={"bottom"}
          delay={{ show: 250, hide: 0 }}
          overlay={
            <Tooltip
              id={`tooltip-${"bottom"}`}
              style={{
                width: "336px",
              }}>
              {data.data.title}
            </Tooltip>
          }>
          <VideoTitle
            to={{
              pathname: "/live/" + data.data.user_name.toLowerCase(),
              state: {
                p_uptime: data.data.started_at,
                p_title: data.data.title,
                p_game: data.data.game_name,
                p_viewers: data.data.viewers,
              },
            }}>
            {Util.truncate(data.data.title, 60)}
          </VideoTitle>
        </OverlayTrigger>
      ) : (
        <VideoTitle
          to={{
            pathname: "/live/" + data.data.user_name.toLowerCase(),
            state: {
              p_uptime: data.data.started_at,
              p_title: data.data.title,
              p_game: data.data.game_name,
              p_viewers: data.data.viewers,
            },
          }}>
          {data.data.title}
        </VideoTitle>
      )}
      <div>
        <div className={styles.channelContainer} ref={refChannel}>
          <Link
            to={{
              pathname: `/channel/${data.data.user_name.toLowerCase()}`,
              state: {
                p_id: data.data.user_id,
              },
            }}
            style={{ gridRow: 1, paddingRight: "5px" }}>
            <img src={data.data.profile_img_url} alt='' className={styles.profile_img} />
          </Link>
          <Link
            to={{
              pathname: `/channel/${data.data.user_name.toLowerCase()}`,
              state: {
                p_id: data.data.user_id,
              },
            }}
            className={styles.channel}>
            {data.data.user_name}
          </Link>

          {channelIsHovered ? (
            <>
              <a
                alt=''
                href={"https://www.twitch.tv/" + data.data.user_name.toLowerCase()}
                style={{ gridRow: "1" }}>
                <FaTwitch size={20} style={{ color: "purple" }} />
              </a>
              <FollowUnfollowBtn
                style={{
                  gridRow: "1",
                  justifySelf: "right",
                  margin: "0",
                  marginRight: "8px",
                  height: "100%",
                }}
                size={22}
                channelName={data.data.user_name}
                id={data.data.user_id}
                alreadyFollowedStatus={true}
                refreshStreams={data.refresh}
              />
            </>
          ) : null}
        </div>
        <div className={styles.gameContainer}>
          <a
            className={styles.game_img}
            // href={"/twitch/top/" + data.data.game_name}
            href={"https://www.twitch.tv/directory/game/" + data.data.game_name}>
            <img
              src={data.data.game_img.replace("{width}", 130).replace("{height}", 173)}
              alt=''
              className={styles.game_img}
            />
          </a>
          <Link
            className={styles.game}
            // href={"https://www.twitch.tv/directory/game/" + data.data.game_name}
            to={"/game/" + data.data.game_name}>
            {data.data.game_name}
          </Link>
          <p className={styles.viewers} title='Viewers'>
            {Util.formatViewerNumbers(data.data.viewer_count)}
            <FaRegEye
              size={14}
              style={{
                color: "rgb(200, 200, 200)",
                paddingLeft: "5px",
                paddingTop: "3px",
                display: "flex",
                alignItems: "center",
              }}
            />
          </p>
        </div>
      </div>
    </VideoContainer>
  );
}

export default StreamEle;
