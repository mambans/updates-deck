import React, { useRef, useState } from 'react';
import Schedule from '../schedule';
import { ChatWrapper, PlayerExtraButtons, StyledChat } from './StyledComponents';
import styled from 'styled-components';
import useEventListenerMemo from '../../../hooks/useEventListenerMemo';
import { GrStackOverflow } from 'react-icons/gr';
import { AiFillLock, AiFillUnlock } from 'react-icons/ai';
import { TransparentButton } from '../../../components/styledComponents';
import useKeyDown from '../../../hooks/useKeyDown';

const Chat = ({ chatAsOverlay, channelName, streamInfo, setChatAsOverlay, chatState }) => {
  const [dragging, setDragging] = useState();
  const [pos, setPos] = useState({ width: chatState.chatwidth });
  const [locked, setLocked] = useState();
  const overlayBackdropRef = useRef();
  const chatRef = useRef();
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const keydown = (e) => e.key === 'Escape' && setDragging(false);
  useEventListenerMemo('keydown', keydown, window, chatAsOverlay);

  const ctrlOrAlt = useKeyDown(['Control', 'Alt']);

  const onDragInit = (e) => {
    if (e.button === 0 && (!locked || ctrlOrAlt)) {
      setDragging(true);
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const chat = chatRef.current?.getBoundingClientRect();

      setStartPos({ x: mouseX - chat.left, y: mouseY - chat.top });
    }
  };

  const onDragMove = (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const chat = chatRef.current?.getBoundingClientRect();

    const x = mouseX - startPos.x;
    const y = mouseY - startPos.y;
    setPos((c) => ({
      ...c,
      x: Math.max(0, Math.min(x, window.innerWidth - chat.width)),
      y: Math.max(0, Math.min(y, window.innerHeight - chat.height)),
    }));
  };

  const onDragStop = (e) => {
    setDragging(false);
  };

  return (
    <>
      {chatAsOverlay && dragging && (
        <OverlayBackdrop ref={overlayBackdropRef} onMouseUp={onDragStop} onMouseMove={onDragMove} />
      )}
      <ChatWrapper
        ref={chatRef}
        pos={pos}
        dragging={dragging}
        id='chat'
        chatAsOverlay={chatAsOverlay}
        data-chatAsOverlay={chatAsOverlay}
      >
        <InnerWrapper
          onMouseDown={onDragInit}
          onMouseUp={onDragStop}
          locked={locked}
          data-chatAsOverlay={chatAsOverlay}
          onMouseMove={dragging ? onDragMove : () => {}}
        >
          <ResizeActionButtons
            setChatAsOverlay={setChatAsOverlay}
            chatAsOverlay={chatAsOverlay}
            locked={locked}
            setLocked={setLocked}
          />
          {!locked && chatAsOverlay && <ResizerAllSides setPos={setPos} target={chatRef.current} />}

          {chatAsOverlay && (!locked || ctrlOrAlt) && <DragOverlay />}
          <PlayerExtraButtons channelName={channelName}>
            <Schedule
              user={streamInfo?.user_name || channelName}
              user_id={streamInfo?.user_id}
              absolute={false}
              style={{ padding: 0, marginRight: '5px' }}
            />
          </PlayerExtraButtons>
          <StyledChat
            data-chatAsOverlay={chatAsOverlay}
            frameborder='0'
            scrolling='yes'
            theme='dark'
            id={channelName + '-chat'}
            src={`https://www.twitch.tv/embed/${channelName}/chat?darkpopout&parent=aiofeed.com`}
          />
        </InnerWrapper>
      </ChatWrapper>
    </>
  );
};
export default Chat;

const DragOverlay = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background: transparent;
`;
const InnerWrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  cursor: ${({ locked }) => (locked ? 'initial' : 'move')};
`;

const OverlayBackdrop = styled.div`
  position: fixed;
  cursor: ${({ cursor = 'move' }) => cursor};
  inset: 0;
  background: transparent;
  z-index: 99999;
`;

const ResizerIcon = styled.div`
  position: absolute;
  z-index: 2;

  width: 20px;
  height: 20px;
  transition: border 250ms;
  border-color: rgb(150, 150, 150);

  &.topleft {
    top: 0;
    left: 0;
    cursor: nw-resize;
    border-style: solid none none solid;
  }
  &.topright {
    top: 0;
    right: 0;
    cursor: ne-resize;
    border-style: solid solid none none;
  }
  &.bottomright {
    bottom: 0;
    right: 0;
    cursor: nw-resize;
    border-style: none solid solid none;
  }

  &.bottomleft {
    bottom: 0;
    left: 0;
    cursor: ne-resize;
    border-style: none none solid solid;
  }

  &:hover {
    border-color: #ffffff;
  }

  svg {
    transition: fill 250ms;
    transform: rotate(90deg);
    fill: ${({ active }) => (active ? 'rgb(255,255,255)' : 'rgba(255,255,255,0.3)')};

    &:hover {
      fill: ${({ active }) => (active ? 'rgb(255,255,255)' : 'rgba(255,255,255,0.5)')};
    }
  }
`;

const ResizerAllSides = ({ setPos, target }) => {
  const [active, setActive] = useState();

  const onMouseDown = (e, dir) => {
    if (e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      setActive(dir);
    }
  };
  const onMouseUp = () => {
    setActive(false);
  };

  const keydown = (e) => {
    if (e.key === 'Escape') setActive(false);
  };
  useEventListenerMemo('keydown', keydown, window, active);

  const onMouseMove = (e) => {
    const targetPos = target?.getBoundingClientRect();

    switch (active) {
      case 'topleft':
        setPos((c) => ({
          ...c,
          y: c.y - (targetPos.top - e.clientY),
          height: targetPos.height + (targetPos.top - e.clientY),
          width: targetPos.width + (targetPos.left - e.clientX),
          x: e.clientX,
        }));
        break;
      case 'topright':
        setPos((c) => {
          return {
            ...c,
            y: c.y - (targetPos.top - e.clientY),
            height: targetPos.height + (targetPos.top - e.clientY),
            width: targetPos.width + (e.clientX - targetPos.right),
          };
        });
        break;
      case 'bottomright':
        setPos((c) => ({
          ...c,
          height: targetPos.height + (e.clientY - targetPos.bottom),
          width: targetPos.width + (e.clientX - targetPos.right),
        }));
        break;
      case 'bottomleft':
        setPos((c) => ({
          ...c,
          height: targetPos.height + (e.clientY - targetPos.bottom),
          width: targetPos.width + (targetPos.left - e.clientX),
          x: e.clientX,
        }));
        break;
      default:
        break;
    }
  };

  const cursor = (() => {
    if (['topleft', 'bottomright'].includes(active)) return 'nw';
    if (['topright', 'bottomleft'].includes(active)) return 'ne';
  })();

  return (
    <>
      <Resizer
        onMouseDown={(e) => onMouseDown(e, 'topleft')}
        onMouseUp={onMouseUp}
        active={!!active}
        className={'topleft'}
      />
      <Resizer
        onMouseDown={(e) => onMouseDown(e, 'topright')}
        onMouseUp={onMouseUp}
        active={!!active}
        className={'topright'}
      />
      <Resizer
        onMouseDown={(e) => onMouseDown(e, 'bottomright')}
        onMouseUp={onMouseUp}
        active={!!active}
        className={'bottomright'}
      />
      <Resizer
        onMouseDown={(e) => onMouseDown(e, 'bottomleft')}
        onMouseUp={onMouseUp}
        active={!!active}
        className={'bottomleft'}
      />

      {!!active && (
        <OverlayBackdrop
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          cursor={`${cursor}-resize`}
        />
      )}
    </>
  );
};

const Resizer = ({ className, onMouseDown, active }) => {
  return (
    <>
      <ResizerIcon onMouseDown={onMouseDown} active={active} className={className} />
    </>
  );
};

const ResizeActionButtonsWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 30px;
  padding: 7px 5px;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  z-index: 999999;
`;

const ResizeActionButtons = ({ setChatAsOverlay, chatAsOverlay, locked, setLocked }) => {
  return (
    <ResizeActionButtonsWrapper>
      <TransparentButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setChatAsOverlay((c) => !c);
        }}
      >
        <GrStackOverflow size={20} />
      </TransparentButton>
      {chatAsOverlay && (
        <TransparentButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLocked((c) => !c);
          }}
        >
          {locked ? <AiFillLock size={20} fill='green' /> : <AiFillUnlock size={20} fill='red' />}
        </TransparentButton>
      )}
    </ResizeActionButtonsWrapper>
  );
};
