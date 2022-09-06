import React, { useContext } from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';
import useInput from '../../hooks/useInput';
import ToolTip from '../../components/tooltip/ToolTip';
import { MdDelete, MdAdd } from 'react-icons/md';
import FeedSectionsContext from './FeedSectionsContext';
import { StyledListForm, StyledButton } from '../../components/styledComponents';
import Colors from '../../components/themes/Colors';
import ChannelSearchBar from '../twitch/searchbars/ChannelSearchBar';
import GameSearchBar from '../twitch/searchbars/GameSearchBar';

const StyledRule = styled.div`
  height: ${({ height }) => height}px;

  .searchbar {
    background: transparent;
  }

  &.ListForm-appear {
    opacity: 0;
    height: 0;
    /* margin: 0 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }

  &.ListForm-appear-active {
    opacity: 1;
    height: ${({ height }) => height}px;
    /* margin: 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }

  &.ListForm-appear-done {
    opacity: 1;
    height: ${({ height }) => height}px;
    /* margin: 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }

  &.ListForm-enter {
    opacity: 0;
    height: 0;
    /* margin: 0 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }

  &.ListForm-enter-done {
    opacity: 1;
    height: ${({ height }) => height}px;
    /* margin: 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }

  &.ListForm-enter-active {
    opacity: 1;
    height: ${({ height }) => height}px;
    /* margin: 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }

  &.ListForm-exit {
    opacity: 1;
    height: ${({ height }) => height}px;
    /* margin: 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }

  &.ListForm-exit-active {
    opacity: 0;
    height: 0;
    /* margin: 0 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }

  &.ListForm-exit-done {
    opacity: 0;
    height: 0;
    /* margin: 0 10px !important; */
    transition: opacity 250ms, height 500ms, margin-top 500ms, margin 500ms;
  }
`;

const InputsContainer = styled.div`
  display: flex;

  input {
    margin: 0 5px;
  }
`;

const Input = styled(Form.Control)`
  font-weight: ${({ value }) => value && '600'};
  color: ${({ value }) => value && '#ffffff'};

  &::placeholder {
    color: #373d44;
  }
`;

const Rule = ({ rule, height, id, index }) => {
  const { addFeedSectionRule, deleteFeedSectionRule } = useContext(FeedSectionsContext);

  const { value: title, bind: bindTitle, reset: resetTitle } = useInput(rule?.title || '');
  const {
    value: category,
    bind: bindCategory,
    reset: resetCategory,
  } = useInput(rule?.category || '');
  const {
    value: channel,
    bind: bindChannel,
    reset: resetChannel,
    // setValue: setChannel,
  } = useInput(rule?.channel || '');
  const {
    value: viewers,
    bind: bindViewers,
    reset: resetViewers,
  } = useInput(rule?.viewers || '', { type: 'number' });
  const { value: tag, bind: bindTag, reset: resetTag } = useInput(rule?.tag || '');

  const handleSubmit = (evt) => {
    console.log('Rule handleSubmit:', handleSubmit);
    evt.preventDefault();

    if (
      Boolean(title || category || channel || viewers || tag) &&
      Boolean(
        title?.toLowerCase() !== rule?.title?.toLowerCase() ||
          category?.toLowerCase() !== rule?.category?.toLowerCase() ||
          channel?.toLowerCase() !== rule?.channel?.toLowerCase() ||
          tag?.toLowerCase() !== rule?.tag?.toLowerCase() ||
          viewers !== rule?.viewers
      )
    ) {
      addFeedSectionRule(id, { title, category, channel, viewers, tag, id: rule?.id });
      if (!rule?.id) {
        resetTitle();
        resetCategory();
        resetChannel();
        resetViewers();
        resetTag();
      }
    }
  };

  const handleOnblur = (evt) => {
    if (rule?.id) handleSubmit(evt);
  };

  const handleAdd = (e) => {
    e?.preventDefault?.();
    if (!rule?.id && Boolean(title || category || channel || viewers || tag)) {
      addFeedSectionRule(id, { title, category, channel, tag, viewers });
      resetTitle();
      resetCategory();
      resetChannel();
      resetViewers();
      resetTag();
    }
  };
  const handleRemove = (e) => {
    e.preventDefault();
    deleteFeedSectionRule(id, rule);
  };

  const handleKeyDown = (ev) => ev.key === 'Enter1' && handleSubmit(ev);

  return (
    <StyledRule height={height}>
      <StyledListForm onSubmit={handleSubmit}>
        <Form.Group
          controlId='formGroupListName'
          style={{ marginBottom: '0' }}
          onKeyDown={handleKeyDown}
        >
          {/* <Form.Label>asd</Form.Label> */}
          <InputsContainer>
            {/* <InputGroup className='mb-3'> */}
            <Input
              type='text'
              placeholder='title..'
              name='title'
              {...bindTitle}
              onBlur={handleOnblur}
            />
            <GameSearchBar
              style={{
                minWidth: '200px',
                width: 'unset',
                margin: '0 5px',
                // zIndex: 9999 - parseInt(index),
                zIndex: String(9999 - parseInt(index)),
              }}
              {...bindCategory}
              placeholder={category || '...'}
            />
            <ChannelSearchBar
              style={{
                minWidth: '200px',
                width: 'unset',
                margin: '0 5px',
                // zIndex: 9999 - parseInt(index),
                zIndex: String(9999 - parseInt(index)),
              }}
              {...bindChannel}
              placeholder={channel || '...'}
              hideExtraButtons
              onSubmit={(value) => {
                handleAdd();
              }}
            />
            <Input type='text' placeholder='tag..' name='tag' {...bindTag} onBlur={handleOnblur} />
            <Input
              type='number'
              placeholder='viewers..'
              name='viewers'
              {...bindViewers}
              onBlur={handleOnblur}
            />
            <ToolTip
              delay={{ show: 500, hide: 0 }}
              toltip={`${rule?.id ? `Remove list` : `Add new list`}`}
            >
              {rule?.id ? (
                <StyledButton onClick={handleRemove} type='button'>
                  <MdDelete size={22} color={Colors.red} />
                </StyledButton>
              ) : (
                <StyledButton onClick={handleAdd} type='button'>
                  <MdAdd size={22} color={Colors.green} />
                </StyledButton>
              )}
            </ToolTip>
          </InputsContainer>
        </Form.Group>
      </StyledListForm>
    </StyledRule>
  );
};
export default Rule;
