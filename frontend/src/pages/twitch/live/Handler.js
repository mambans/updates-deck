import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';

import getMyFollowedChannels from './../getMyFollowedChannels';
import getFollowedOnlineStreams from './GetFollowedStreams';
import NotificationsContext from './../../notifications/NotificationsContext';
import { AddCookie } from '../../../util';
import LiveStreamsPromise from './LiveStreamsPromise';
import OfflineStreamsPromise from './OfflineStreamsPromise';
import UpdatedStreamsPromise from './UpdatedStreamsPromise';
import useEventListenerMemo from '../../../hooks/useEventListenerMemo';
import useToken, { TwitchContext } from '../useToken';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { fetchAndAddTags } from '../fetchAndAddTags';
import FeedSectionsContext from '../../feedSections/FeedSectionsContext';
import { checkAgainstRules } from '../../feedSections/FeedSections';
import Alert from '../../../components/alert';
import useFetchSingelVod from '../vods/hooks/useFetchSingelVod';

const REFRESH_RATE = 25; // seconds

const Handler = ({ children }) => {
  const { addNotification } = useContext(NotificationsContext);
  const {
    autoRefreshEnabled,
    isEnabledOfflineNotifications,
    isEnabledUpdateNotifications,
    twitchAccessToken,
    updateNotischannels,
  } = useContext(TwitchContext);
  const { fetchLatestVod } = useFetchSingelVod();
  const validateToken = useToken();
  const { feedSections } = useContext(FeedSectionsContext) || {};
  const [refreshTimer, setRefreshTimer] = useState(20);
  const [liveStreamsState, setLiveStreamsState] = useState([]);
  const [nonFeedSectionLiveStreamsState, setNonFeedSectionLiveStreamsState] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    refreshing: false,
    error: null,
    loaded: false,
    lastLoaded: false,
  });
  const followedChannels = useRef([]);
  const liveStreams = useRef();
  const oldLiveStreams = useRef([]);
  const [newlyAddedStreams, setNewlyAddedStreams] = useState();
  // const [isInFocus, setIsInFocus] = useState();
  const isInFocus = useRef();
  const timer = useRef();
  const streamTags = useRef([]);
  const refreshAfterUnfollowTimer = useRef();
  // eslint-disable-next-line no-unused-vars
  const [documentTitle, setDocumentTitle] = useDocumentTitle(
    newlyAddedStreams?.length ? `(${newlyAddedStreams?.length}) Feed` : 'Feed'
  );
  const windowFocusHandler = () => (isInFocus.current = true);
  const windowBlurHandler = () => !autoRefreshEnabled && setNewlyAddedStreams([]);
  useEventListenerMemo('focus', windowFocusHandler, document);
  useEventListenerMemo('blur', windowBlurHandler);

  const refresh = useCallback(
    async ({ disableNotifications = false, forceValidateToken = false } = {}) => {
      setLoadingStates(({ loaded, lastLoaded }) => {
        return { refreshing: true, error: null, loaded: loaded, lastLoaded: lastLoaded };
      });
      try {
        if (isInFocus.current) setNewlyAddedStreams([]);
        isInFocus.current = false;
        followedChannels.current = await getMyFollowedChannels(forceValidateToken);

        if (followedChannels.current && followedChannels.current[0]) {
          AddCookie('Twitch-username', followedChannels.current[0].from_name);
        }
        const streams =
          Array.isArray(followedChannels.current) &&
          (await getFollowedOnlineStreams({
            followedchannels: followedChannels.current,
            disableNotifications: disableNotifications,
            previousStreams: oldLiveStreams.current,
          }));
        if (streams?.status === 200) {
          const newLiveStreams = [...(streams?.data || [])];
          const uniqueFilteredLiveStreams = uniqBy(newLiveStreams, 'user_id');
          const streamsTag_ids = uniqueFilteredLiveStreams.reduce((acc, curr) => {
            return [...acc, ...(curr?.tag_ids || [])];
          }, []);
          const tag_ids = streamsTag_ids.filter(
            (tag) => !streamTags.current.find(({ tag_id } = {}) => tag_id === tag)
          );
          const uniqueTags = [...new Set(tag_ids)];

          const fetchedStreamTags = uniqueTags?.length
            ? await fetchAndAddTags({
                tag_ids: uniqueTags,
              })
            : [];
          const tags = uniqBy(
            [...(streamTags.current || []), ...(fetchedStreamTags || [])],
            'tag_id'
          );
          streamTags.current = tags;

          const recentLiveStreams = (uniqueFilteredLiveStreams || []).filter(
            (s = {}) => Math.trunc((Date.now() - new Date(s?.started_at).getTime()) / 1000) <= 150
          );

          oldLiveStreams.current = liveStreams.current;
          const uniqueStreams = uniqBy(
            [...(uniqueFilteredLiveStreams || []), ...(recentLiveStreams || [])],
            'id'
          );

          const streamsWithTags = uniqueStreams?.map((stream = {}) => {
            const streams_tags = stream?.tag_ids?.map((id) => {
              return tags?.find(({ tag_id } = {}) => tag_id === id);
            });
            const tag_names = streams_tags?.map((tag) => tag?.localization_names?.['en-us']);

            return { ...stream, tag_names, tags: streams_tags };
          });

          const enabledFeedSections =
            feedSections &&
            Object.values?.(feedSections)?.filter(
              (f = {}) => f.enabled && f.excludeFromTwitch_enabled
            );

          await Promise.resolve(
            (() => {
              const orderedStreams = orderBy(streamsWithTags, (s) => s.viewer_count, 'desc');
              const nonFeedSectionLiveStreams = orderedStreams?.filter(
                (stream) =>
                  !enabledFeedSections?.some(({ rules } = {}) => checkAgainstRules(stream, rules))
              );

              liveStreams.current = orderedStreams;
              return { orderedStreams, nonFeedSectionLiveStreams };
            })()
          ).then(({ orderedStreams, nonFeedSectionLiveStreams } = {}) => {
            setTimeout(async () => {
              setLiveStreamsState(orderedStreams);
              setNonFeedSectionLiveStreamsState(nonFeedSectionLiveStreams);
              setLoadingStates({
                refreshing: false,
                error: null,
                loaded: true,
                lastLoaded: Date.now(),
              });
              if (
                !disableNotifications &&
                (nonFeedSectionLiveStreams?.length >= 1 || oldLiveStreams.current?.length >= 1)
              ) {
                await Promise.all([
                  await LiveStreamsPromise({
                    liveStreams: nonFeedSectionLiveStreams,
                    oldLiveStreams,
                    setNewlyAddedStreams,
                    fetchLatestVod,
                  }),

                  await OfflineStreamsPromise({
                    liveStreams,
                    oldLiveStreams,
                    isEnabledOfflineNotifications,
                    fetchLatestVod,
                  }),

                  await UpdatedStreamsPromise({
                    liveStreams: nonFeedSectionLiveStreams,
                    oldLiveStreams,
                    isEnabledUpdateNotifications,
                    updateNotischannels,
                  }),
                ]).then((res) => {
                  const flattenedArray = res.flat(3).filter((n) => n);
                  if (Boolean(flattenedArray?.length)) addNotification(flattenedArray);
                });
              }
            }, 0);
          });
        } else if (streams?.status === 201) {
          setLoadingStates({
            refreshing: false,
            error: streams.error,
            loaded: true,
            lastLoaded: Date.now(),
          });
        }
      } catch (error) {
        setLoadingStates({
          refreshing: false,
          error: error,
          loaded: true,
          lastLoaded: Date.now(),
        });
      }
    },
    [
      addNotification,
      isEnabledUpdateNotifications,
      isEnabledOfflineNotifications,
      updateNotischannels,
      setNewlyAddedStreams,
      feedSections,
      fetchLatestVod,
    ]
  );

  useEffect(() => {
    if (liveStreams?.current?.length) {
      const enabledFeedSections =
        feedSections &&
        Object.values?.(feedSections)?.filter((f = {}) => f.enabled && f.excludeFromTwitch_enabled);

      setNonFeedSectionLiveStreamsState(
        orderBy(liveStreams.current, (s) => s?.viewer_count, 'desc')?.filter(
          (stream) =>
            !enabledFeedSections?.some(({ rules } = {}) => checkAgainstRules(stream, rules))
        )
      );
    }
  }, [feedSections]);

  useEffect(() => {
    (async () => {
      try {
        const timeNow = new Date();
        if (!timer.current && validateToken) {
          if (autoRefreshEnabled) {
            setRefreshTimer(timeNow.setSeconds(timeNow.getSeconds() + REFRESH_RATE));
          }
          await refresh({ disableNotifications: true });
        }

        if (autoRefreshEnabled && !timer.current) {
          timer.current = setInterval(() => {
            const timeNow = new Date();
            setRefreshTimer(timeNow.setSeconds(timeNow.getSeconds() + REFRESH_RATE));
            refresh();
          }, REFRESH_RATE * 1000);
        } else if (!autoRefreshEnabled && timer.current) {
          clearInterval(timer.current);
          timer.current = null;
          setLoadingStates({ refreshing: false, loaded: true, error: null });
        }
      } catch (error) {
        setLoadingStates({ refreshing: false, error: error, loaded: true });
      }
    })();
  }, [refresh, autoRefreshEnabled, validateToken]);

  useEffect(() => {
    return () => {
      console.log('Unmounting');
      clearInterval(timer.current);
    };
  }, []);

  if (!twitchAccessToken) {
    return (
      <Alert
        title='Not authenticated/connected with Twitch.'
        message='No access token for Twitch available.'
        fill
      />
    );
  }

  return children({
    refreshing: loadingStates.refreshing,
    loaded: loadingStates.loaded,
    lastLoaded: loadingStates.lastLoaded,
    refreshTimer,
    followedChannels: followedChannels.current,
    error: loadingStates.error,
    oldLiveStreams: oldLiveStreams.current || [],
    liveStreams: liveStreamsState || [],
    nonFeedSectionLiveStreams: nonFeedSectionLiveStreamsState || [],
    // liveStreams: liveStreams.current || [],
    // nonFeedSectionLiveStreams: nonFeedSectionLiveStreams.current || [],
    refresh,
    newlyAddedStreams,
    REFRESH_RATE,
    autoRefreshEnabled,
    refreshAfterUnfollowTimer,
  });
};
export default Handler;
