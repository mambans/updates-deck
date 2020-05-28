import React, { useState, useEffect, useCallback, useRef } from "react";
import { MdFormatListBulleted } from "react-icons/md";
import { CSSTransition } from "react-transition-group";

import {
  GameListUlContainer,
  SearchGameForm,
  SearchSubmitBtn,
  BackdropChannelList,
} from "./../categoryTopStreams/styledComponents";
import StyledLoadingList from "./../categoryTopStreams/LoadingList";
import ChannelListElement from "../channelList/ChannelListElement";
import AddVideoExtraData from "../AddVideoExtraData";
import GetFollowedChannels from "../GetFollowedChannels";

const scrollToIfNeeded = (parentDiv, childDiv, direction) => {
  const parentRect = parentDiv.getBoundingClientRect();
  const childRect = childDiv.getBoundingClientRect();

  const scrollDown =
    childRect.bottom + 20.5 >= parentRect.bottom || childRect.top + 20.5 >= parentRect.bottom;
  const scrollUp =
    childRect.top - 20.5 <= parentRect.top || childRect.bottom - 20.5 <= parentRect.top;

  if (scrollDown || scrollUp) {
    childDiv.scrollIntoView({ block: "nearest", inline: "nearest" });
    parentDiv.scrollBy({
      top: direction === "Down" && scrollDown ? +41 : direction === "Up" && scrollUp ? -41 : 0,
      behavior: "smooth",
    });
  }
};

const sortAlphaByProp = (a, b) => {
  var channelA = a.user_name.toLowerCase();
  var channelB = b.user_name.toLowerCase();
  return channelA.localeCompare(channelB);
};

const sortInputFirst = (input, data) => {
  let caseSensitive = [];
  let caseInsensitive = [];
  let others = [];

  data.forEach((element) => {
    if (element.user_name.slice(0, input.length) === input) {
      caseSensitive.push(element);
    } else if (element.user_name.slice(0, input.length).toLowerCase() === input.toLowerCase()) {
      caseInsensitive.push(element);
    } else {
      others.push(element);
    }
  });

  caseSensitive.sort(sortAlphaByProp);
  caseInsensitive.sort(sortAlphaByProp);
  others.sort(sortAlphaByProp);
  return [...caseSensitive, ...caseInsensitive, ...others];
};

export default () => {
  const [channels, setChannels] = useState();
  const [filteredChannels, setFilteredChannels] = useState();
  const [listIsOpen, setListIsOpen] = useState();
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef();
  const ulListRef = useRef();

  const useInput = (initialValue) => {
    const [value, setValue] = useState(initialValue);

    return {
      value,
      setValue,
      reset: () => setValue(""),
      bind: {
        value,
        onChange: (event) => {
          try {
            setCursor(0);
            setValue(event.target.value);
            if (listIsOpen && event.target.value && event.target.value !== "") {
              const filtered = channels.filter((channel) => {
                return channel.user_name
                  .toLowerCase()
                  .includes((event.target.value || value).toLowerCase());
              });
              if (filtered.length > 1) {
                const asd = sortInputFirst(event.target.value || value, filtered);
                setFilteredChannels(asd);
              } else {
                setFilteredChannels(filtered);
              }
            } else if (listIsOpen && !event.target.value) {
              setFilteredChannels(channels);
            } else if (!listIsOpen && event.target.value) {
              setListIsOpen(true);
            }
          } catch (error) {
            console.log("useInput -> error", error);
          }
        },
      },
      showValue: () => {
        return value;
      },
      returnChannel: () => {
        const foundChannel = filteredChannels.find((p_channel) => {
          return p_channel.user_name.toLowerCase().includes(value.toLowerCase());
        });
        if (foundChannel) {
          return foundChannel.user_name;
        } else {
          return value;
        }
      },
      manualSet: setValue,
    };
  };

  //eslint-disable-next-line
  const {
    value: channel,
    bind: bindChannel,
    reset: resetChannel,
    showValue,
    returnChannel,
    manualSet,
  } = useInput("");

  const channelObjectList = async (channelsList) => {
    try {
      return {
        data: {
          data: await channelsList.map((channel) => {
            return {
              user_id: channel.to_id || channel.user_id,
              user_name: channel.to_name || channel.user_name,
            };
          }),
        },
      };
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchFollowedChannels = useCallback(async () => {
    await GetFollowedChannels().then(async (res) => {
      if (res) {
        channelObjectList(res).then(async (res) => {
          await AddVideoExtraData(res, false).then(async (res) => {
            setChannels(res.data);
            setFilteredChannels(res.data);
          });
        });
      }
    });
  }, []);

  const handleArrowKey = (e) => {
    try {
      if (filteredChannels && filteredChannels.length >= 1) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCursor((cursor) => Math.min(Math.max(++cursor, 0), filteredChannels.length - 1));
          scrollToIfNeeded(ulListRef.current, document.querySelector(".selected"), "Down");
          manualSet(filteredChannels[cursor + 1].user_name);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setCursor((cursor) => Math.min(Math.max(--cursor, 0), filteredChannels.length - 1));
          scrollToIfNeeded(ulListRef.current, document.querySelector(".selected"), "Up");
          manualSet(filteredChannels[cursor - 1].user_name);
        }
      }
    } catch (error) {
      console.log("handleArrowKey -> error", error);
    }
  };

  useEffect(() => {
    const input = showValue();
    if (!channels && (listIsOpen || (input && input.length >= 1))) {
      fetchFollowedChannels();
    }
  }, [showValue, listIsOpen, fetchFollowedChannels, channels]);

  useEffect(() => {
    const inputField = inputRef.current;
    inputField.addEventListener("focus", () => {
      setListIsOpen(true);
    });

    return () => {
      inputField.removeEventListener("focus", () => {
        setListIsOpen(true);
      });
    };
  }, []);

  useEffect(() => {
    if (channels) {
      return () => {
        setFilteredChannels(channels || []);
      };
    }
  }, [channels]);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    resetChannel();
    window.open(`/${returnChannel()}/channel/`);
    setListIsOpen(false);
    inputRef.current.blur();
  };

  return (
    <>
      <SearchGameForm onSubmit={handleSubmit} open={listIsOpen} onKeyDown={handleArrowKey}>
        <input ref={inputRef} type='text' placeholder={"..."} {...bindChannel} spellcheck='false' />
        {channel && (
          <SearchSubmitBtn
            to={{
              pathname: `/${channel}/channel/`,
            }}
          />
        )}
        <MdFormatListBulleted
          id='ToggleListBtn'
          onClick={() => {
            resetChannel();
            setListIsOpen(!listIsOpen);
          }}
          size={42}
        />
        <CSSTransition
          in={listIsOpen}
          timeout={250}
          classNames='fade-250ms'
          onExited={() => {
            setChannels();
            setCursor(0);
          }}
          unmountOnExit>
          <GameListUlContainer ref={ulListRef}>
            {filteredChannels ? (
              <>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    margin: "9px 0",
                    color: "var(--VideoContainerLinks)",
                  }}>{`Total: ${filteredChannels.length}`}</p>

                {filteredChannels.map((channel, index) => {
                  return (
                    <ChannelListElement
                      key={channel.user_id}
                      data={channel}
                      selected={index === cursor}
                    />
                  );
                })}
              </>
            ) : (
              <StyledLoadingList amount={11} />
            )}
          </GameListUlContainer>
        </CSSTransition>
      </SearchGameForm>
      {listIsOpen && (
        <BackdropChannelList
          id='BackdropChannelList'
          onClick={() => {
            resetChannel();
            setListIsOpen(!listIsOpen);
          }}
        />
      )}
    </>
  );
};
