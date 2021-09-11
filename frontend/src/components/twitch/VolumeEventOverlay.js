import React, { useEffect, useState } from 'react';
import useEventListenerMemo from '../../hooks/useEventListenerMemo';
import { StyledVolumeEventOverlay, VolumeText } from './player/StyledComponents';
import toggleFullscreenFunc from './player/toggleFullscreenFunc';
import { FaVolumeMute } from 'react-icons/fa';
import { FaVolumeUp } from 'react-icons/fa';

const VolumeEventOverlay = React.forwardRef(
  (
    {
      children,
      show,
      type,
      id,
      hidechat,
      vodVolumeOverlayEnabled,
      chatwidth,
      showcursor,
      VolumeEventOverlayRef,
      player,
      videoElementRef,
      style,
      visiblyShowOnHover,
      showVolumeText,
      addEventListeners = false,
    },
    ref
  ) => {
    const [volumeText, setVolumeText] = useState();
    const [volumeMuted, setVolumeMuted] = useState(true);

    useEffect(() => {
      if (show) {
        setVolumeText(player.current?.getVolume() * 100);
        setVolumeMuted(player.current?.getMuted());
      }
    }, [show, player]);

    useEventListenerMemo(
      'wheel',
      scrollChangeVolumeEvent,
      VolumeEventOverlayRef.current,
      addEventListeners && window?.Twitch?.Player?.PLAYING
    );
    useEventListenerMemo(
      'keydown',
      keyboardEvents,
      window,
      addEventListeners && window?.Twitch?.Player?.READY
    );
    useEventListenerMemo(
      'dblclick',
      toggleFullScreen,
      VolumeEventOverlayRef.current,
      addEventListeners
    );
    useEventListenerMemo(
      'mousedown',
      mouseEvents,
      VolumeEventOverlayRef.current,
      addEventListeners && window?.Twitch?.Player?.PLAYING
    );

    function mouseEvents(e) {
      switch (e.button) {
        case 1:
          player.current.setMuted(!player.current.getMuted());
          setVolumeMuted(!player.current.getMuted());
          break;
        default:
          break;
      }
    }

    function keyboardEvents(e) {
      switch (e.key) {
        case 'f':
        case 'F':
          toggleFullScreen(e);
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          player.current?.setQuality('chunked');
          break;
        case ' ':
          e.preventDefault();
          player.current.isPaused() ? player.current.play() : player.current.pause();
          break;
        case 'm':
        case 'M':
          player.current.setMuted(!player.current.getMuted());
          setVolumeMuted(!player.current.getMuted());
          break;
        case 'ArrowDown':
          changeVolume('decrease', 0.05);
          break;
        case 'ArrowUp':
          changeVolume('increase', 0.05);
          break;
        default:
          break;
      }
    }

    function toggleFullScreen(event) {
      toggleFullscreenFunc({
        event,
        videoElementRef,
      });
    }

    function changeVolume(operator, amount) {
      setVolumeText((volumeText) => {
        const newVolume = Math.min(
          Math.max(
            operator === 'increase' ? volumeText / 100 + amount : volumeText / 100 - amount,
            0
          ),
          1
        );

        if (player.current.getMuted()) {
          player.current.setMuted(false);
          setVolumeMuted(false);
        }

        player.current.setVolume(newVolume);
        return newVolume * 100;
      });
    }

    function scrollChangeVolumeEvent(e) {
      if (e?.wheelDelta > 0 || e.deltaY < 0) {
        changeVolume('increase', 0.01);
      } else {
        changeVolume('decrease', 0.01);
      }
    }

    return (
      <StyledVolumeEventOverlay
        style={style}
        ref={ref}
        show={show}
        type={type}
        id={id}
        hidechat={hidechat}
        vodVolumeOverlayEnabled={vodVolumeOverlayEnabled}
        chatwidth={chatwidth}
        showcursor={showcursor}
        visiblyShowOnHover={visiblyShowOnHover}
      >
        {showVolumeText && (
          <VolumeText>
            {volumeMuted ? <FaVolumeMute size='2rem' /> : <FaVolumeUp size='2rem' />}
            {volumeText?.toFixed(0)}
          </VolumeText>
        )}
        {children}
      </StyledVolumeEventOverlay>
    );
  }
);
export default VolumeEventOverlay;
