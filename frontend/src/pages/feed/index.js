import { CSSTransition } from 'react-transition-group';
import React, { useContext } from 'react';

import AccountContext from './../account/AccountContext';
import FeedsContext from './FeedsContext';
import NoFeedsEnable from './NoFeedsEnabled';
import { Vods } from '../twitch/vods';
import { Twitter } from '../twitter';
import { Youtube } from './../youtube';
import FeedsCenterContainer from './FeedsCenterContainer';
import Twitch from '../twitch/live';
import { MyLists } from '../myLists';
import FeedOrderSlider from './FeedOrderSlider';
import Alert from '../../components/alert';
import NavigationContext from '../navigation/NavigationContext';
// import useDocumentTitle from '../../hooks/useDocumentTitle';

const Feed = () => {
  // useDocumentTitle('Feed');
  const { enableTwitch, enableYoutube, enableTwitchVods, enableMyLists } = useContext(FeedsContext);
  const { user } = useContext(AccountContext);
  const { setShowSidebar } = useContext(NavigationContext);

  if (!user) {
    return (
      <Alert
        type='info'
        title='Login to continue'
        message='You are not logged with your AioFeed account.'
        onClick={() => setShowSidebar((c) => !c)}
      />
    );
  }

  return (
    <FeedsCenterContainer>
      <NoFeedsEnable />
      <Twitter />

      <div className='feed'>
        <FeedOrderSlider />
        <CSSTransition in={enableTwitch} classNames='fade-750ms' timeout={750} unmountOnExit appear>
          <Twitch />
        </CSSTransition>
        <CSSTransition
          in={enableYoutube}
          timeout={750}
          classNames='fade-750ms'
          unmountOnExit
          appear
        >
          <Youtube />
        </CSSTransition>

        <CSSTransition in={enableTwitchVods} classNames='fade-750ms' timeout={750} unmountOnExit>
          <Vods />
        </CSSTransition>

        <CSSTransition
          in={enableMyLists}
          timeout={750}
          classNames='fade-750ms'
          unmountOnExit
          appear
        >
          <MyLists />
        </CSSTransition>
      </div>
    </FeedsCenterContainer>
  );
};

export default Feed;
