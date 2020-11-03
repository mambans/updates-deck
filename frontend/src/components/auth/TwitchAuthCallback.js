import axios from 'axios';
import React, { useEffect, useState, useCallback, useContext } from 'react';

import { getCookie } from '../../util/Utils';
import AlertHandler from './../alert';
import AccountContext from './../account/AccountContext';
import NavigationContext from './../navigation/NavigationContext';
import LoadingIndicator from './../LoadingIndicator';
import FeedsContext from '../feed/FeedsContext';
import { AddCookie } from '../../util/Utils';
import API from '../twitch/API';
import useToken, { TwitchContext } from '../twitch/useToken';

function TwitchAuthCallback() {
  const [error, setError] = useState();
  const { autoRefreshEnabled } = useContext(TwitchContext);
  const { username } = useContext(AccountContext);
  const { setVisible, setFooterVisible } = useContext(NavigationContext);
  const { enableTwitch } = useContext(FeedsContext);
  const validateToken = useToken();

  const getAccessToken = useCallback(
    async (url) => {
      const authCode = url.searchParams.get('code');

      const requestAccessToken = await axios
        .put('https://44rg31jaa9.execute-api.eu-north-1.amazonaws.com/Prod/rerequest/twitch', {
          authCode: authCode,
        })
        .catch((error) => {
          console.log(error);
        });

      const accessToken = requestAccessToken.data.access_token;
      const refreshToken = requestAccessToken.data.refresh_token;
      AddCookie('Twitch-access_token', accessToken);
      AddCookie('Twitch-refresh_token', refreshToken);

      const MyTwitch = await validateToken().then(async () => {
        return API.getMe({ accessToken: accessToken }).then(async (res) => {
          AddCookie('Twitch-userId', res.data.data[0].id);
          AddCookie('Twitch-username', res.data.data[0].login);
          AddCookie('Twitch-profileImg', res.data.data[0].profile_image_url);

          if (username) {
            await axios
              .put(`https://44rg31jaa9.execute-api.eu-north-1.amazonaws.com/Prod/account/update`, {
                username: username,
                columnName: 'TwitchPreferences',
                columnValue: {
                  Username: res.data.data[0].login,
                  Id: res.data.data[0].id,
                  Profile: res.data.data[0].profile_image_url,
                  Token: accessToken,
                  Refresh_token: refreshToken,
                  AutoRefresh: autoRefreshEnabled,
                  enabled: enableTwitch,
                },
                authkey: getCookie(`AioFeed_AuthKey`),
              })
              .catch((e) => {
                console.error(e);
              });
          }

          return {
            Username: res.data.data[0].login,
            ProfileImg: res.data.data[0].profile_image_url,
          };
        });
      });

      return { token: accessToken, refresh_token: refreshToken, ...MyTwitch };
    },
    [username, autoRefreshEnabled, enableTwitch, validateToken]
  );

  useEffect(() => {
    setVisible(false);
    setFooterVisible(false);
    (async function () {
      try {
        const url = new URL(window.location.href);
        if (url.pathname === '/auth/twitch/callback') {
          if (url.searchParams.get('state') === getCookie('Twitch-myState')) {
            await getAccessToken(url)
              .then((res) => {
                console.log('successfully authenticated to Twitch.');
                window.opener.postMessage(
                  {
                    service: 'twitch',
                    token: res.token,
                    refresh_token: res.refresh_token,
                    username: res.Username,
                    profileImg: res.ProfileImg,
                  },
                  '*'
                );

                if (res.token) {
                  setTimeout(() => {
                    window.close();
                  }, 1);
                }
              })
              .catch((error) => {
                console.log('getAccessToken() failed');
                setError(error);
              });
          } else {
            setError({
              title: 'Twitch authentication failed.',
              message: "Request didn't come from this website.!",
            });
          }
        } else {
          setError({
            title: 'Twitch authentication failed.',
            message: 'Authenticate to Twitch failed.',
          });
        }
      } catch (error) {
        setError(error);
      }
    })();
  }, [getAccessToken, setVisible, setFooterVisible]);

  if (error) return <AlertHandler data={error} />;
  return <LoadingIndicator height={150} width={150} />;
}

export default TwitchAuthCallback;
