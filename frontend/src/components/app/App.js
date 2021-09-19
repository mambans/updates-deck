import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import FeedsContext, { FeedsProvider } from '../feed/FeedsContext';
import NavigationContext, { NavigationProvider } from '../navigation/NavigationContext';
import { NotificationsProvider } from '../notifications/NotificationsContext';
import { ThemeProvider } from '../themes/ThemeContext';
import { FooterProvider } from '../footer/FooterContext';
import AccountContext, { AccountProvider } from '../account/AccountContext';
import CookieConsentAlert from './CookieConsentAlert';
import Routes from '../routes';
import ThemeContext from './../themes/ThemeContext';
import useEventListenerMemo from '../../hooks/useEventListenerMemo';
import { TwitchContext, TwitchProvider } from '../twitch/useToken';
import { YoutubeContext, YoutubeProvider } from '../youtube/useToken';
import { VodsProvider } from '../twitch/vods/VodsContext';
import API from '../navigation/API';

const AppContainer = styled.div`
  background-image: ${({ image }) => `url(/images/${image})`};
  background-color: var(--backgroundColor);
  object-fit: cover;
  background-position-x: center;
  background-position-y: center;
  background-size: var(--backgroundImgSize);
  background-repeat: var(--backgroundImgRepeat);
  background-attachment: fixed;

  scrollbar-color: var(--scrollbarColors) !important;
  scrollbar-width: thin !important;
`;

const AppRoutesContainer = () => {
  return (
    <ThemeProvider>
      <AccountProvider>
        <TwitchProvider>
          <YoutubeProvider>
            <NavigationProvider>
              <NotificationsProvider>
                <FeedsProvider>
                  <VodsProvider>
                    <FooterProvider>
                      <App />
                    </FooterProvider>
                  </VodsProvider>
                </FeedsProvider>
              </NotificationsProvider>
            </NavigationProvider>
          </YoutubeProvider>
        </TwitchProvider>
      </AccountProvider>
    </ThemeProvider>
  );
};

const App = () => {
  const { activeTheme } = useContext(ThemeContext);
  const { username, setAuthKey, setUsername, setEmail, setProfileImage } =
    useContext(AccountContext);
  const { setEnableTwitch, setEnableYoutube } = useContext(FeedsContext);
  const {
    setTwitchAccessToken,
    setTwitchRefreshToken,
    setTwitchUserId,
    setTwitchUsername,
    setTwitchProfileImage,
  } = useContext(TwitchContext);
  const { setYoutubeAccessToken, setYoutubeUsername, setYoutubeProfileImage } =
    useContext(YoutubeContext);
  const { setShowSidebar } = useContext(NavigationContext);

  useEffect(() => {
    (async () => {
      if (username) {
        const validated = await API.validateAccount(username).catch((e) => console.error(e));
        if (!validated?.data?.Username) {
          setAuthKey();
          setUsername();
          setEmail();
          setProfileImage();
          setShowSidebar(true);
          toast.warn('Expired login. Please login again');
        }
        return true;
      }
    })();
  }, [username, setAuthKey, setUsername, setEmail, setProfileImage, setShowSidebar]);

  useEventListenerMemo('message', receiveMessage, window, true, { capture: false });

  function receiveMessage(e) {
    if (e.origin.startsWith('https://aiofeed.com') && e.data?.token && e.data?.service) {
      if (e.data.service === 'twitch') {
        setTwitchAccessToken(e.data.token);
        setTwitchRefreshToken(e.data.refresh_token);
        setTwitchUsername(e.data.username);
        setTwitchUserId(e.data.userId);
        setTwitchProfileImage(e.data.profileImg);

        setEnableTwitch(true);
      } else if (e.data.service === 'youtube') {
        if (e.data.token) setYoutubeAccessToken(e.data.token);
        if (e.data.username) setYoutubeUsername(e.data.username);
        if (e.data.profileImg) setYoutubeProfileImage(e.data.profileImg);
        setEnableYoutube(true);
      }
    }
  }

  return (
    <AppContainer id='AppContainer' image={activeTheme.image}>
      <Routes />
      <CookieConsentAlert />
      <ToastContainer
        position='bottom-right'
        autoClose={3000}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
    </AppContainer>
  );
};

export default AppRoutesContainer;
