import { CSSTransition, TransitionGroup } from "react-transition-group";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState, useCallback, useRef } from "react";

import FeedsContext from "./../feed/FeedsContext";
import StreamEle from "./StreamElement.js";
import styles from "./Twitch.module.scss";
import TwitchSidebar from "./sidebar/TwitchSidebar";
import Utilities from "../../utilities/Utilities";
import Header from "./Header";

function Twitch({ data }) {
  const [show, setShow] = useState(true);
  const resetTimer = useRef();

  const windowFocusHandler = useCallback(() => {
    document.title = "Notifies | Feed";
    // data.refresh();
    if (!resetTimer.current) {
      resetTimer.current = setTimeout(() => {
        data.resetNewlyAddedStreams();
      }, 5000);
    }
  }, [data]);

  const windowBlurHandler = useCallback(() => {
    // document.title = "Notifies | Feed";
    data.resetNewlyAddedStreams();
  }, [data]);

  const refresh = useCallback(async () => {
    await data.refresh();
  }, [data]);

  useEffect(() => {
    window.addEventListener("focus", windowFocusHandler);
    window.addEventListener("blur", windowBlurHandler);

    return () => {
      window.removeEventListener("blur", windowBlurHandler);
      window.removeEventListener("focus", windowFocusHandler);
      clearTimeout(resetTimer.current);
    };
  }, [data.liveStreams, windowBlurHandler, windowFocusHandler]);

  return (
    <>
      <Header data={data} refresh={refresh} />

      {data.error ? (
        show ? (
          <Alert
            variant='secondary'
            style={{
              ...Utilities.feedAlertWarning,
              width: "var(--feedsWidth)",
              margin: "var(--feedsMargin)",
            }}
            dismissible
            onClose={() => setShow(false)}>
            <Alert.Heading>{data.error}</Alert.Heading>
          </Alert>
        ) : null
      ) : (
        <>
          <TwitchSidebar
            onlineStreams={data.liveStreams}
            newlyAdded={data.newlyAddedStreams}
            REFRESH_RATE={data.REFRESH_RATE}
          />
          {data.liveStreams.length > 0 ? (
            <div
              className={styles.container}
              style={{
                marginTop: "0",
              }}>
              <TransitionGroup className='twitch-live' component={null}>
                {data.liveStreams.map(stream => {
                  return (
                    <CSSTransition
                      // in={true}
                      key={stream.id}
                      timeout={1000}
                      classNames='videoFade-1s'
                      unmountOnExit>
                      <FeedsContext.Consumer>
                        {feedProps => {
                          return (
                            <StreamEle
                              {...feedProps}
                              key={stream.id}
                              data={stream}
                              newlyAddedStreams={data.newlyAddedStreams}
                              newlyAdded={stream.newlyAdded}
                              refresh={refresh}
                              REFRESH_RATE={data.REFRESH_RATE}
                            />
                          );
                        }}
                      </FeedsContext.Consumer>
                    </CSSTransition>
                  );
                })}
              </TransitionGroup>
            </div>
          ) : show ? (
            <Alert
              variant='secondary'
              style={{
                ...Utilities.feedAlertWarning,
                width: "var(--feedsWidth)",
                margin: "var(--feedsMargin)",
              }}
              dismissible
              onClose={() => setShow(false)}>
              <Alert.Heading>No streams online at the momment</Alert.Heading>
            </Alert>
          ) : null}
        </>
      )}
    </>
  );
}

export default Twitch;
