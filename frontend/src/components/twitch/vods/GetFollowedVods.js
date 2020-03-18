import axios from "axios";
import _ from "lodash";

import getFollowedChannels from "./../GetFollowedChannels";
import Util from "../../../util/Util";
import reauthenticate from "./../reauthenticate";
import AddVideoExtraData from "../AddVideoExtraData";
import FetchMonitoredVodChannelsList from "./FetchMonitoredVodChannelsList";

const monitoredChannelNameToId = async (followedChannels, FollowedChannelVods) => {
  const vodChannelsWithoutFollow = [];
  let error;
  const vodChannels = await FollowedChannelVods.map(vod => {
    const channelFollowed = followedChannels.find(channel => channel.to_name.toLowerCase() === vod);
    if (channelFollowed) {
      return channelFollowed.to_id;
    } else {
      vodChannelsWithoutFollow.push(vod);
      return null;
    }
  }).filter(channel => {
    return channel !== null;
  });

  if (vodChannelsWithoutFollow.length > 0) {
    await axios
      .get(`https://api.twitch.tv/helix/users`, {
        params: {
          login: vodChannelsWithoutFollow,
          first: 100,
        },
        headers: {
          Authorization: `Bearer ${Util.getCookie("Twitch-access_token")}`,
          "Client-ID": process.env.REACT_APP_TWITCH_CLIENT_ID,
        },
      })
      .then(res => {
        res.data.data.map(channel => {
          vodChannels.push(channel.id);
          return null;
        });
      })
      .catch(err => {
        console.error(err);
        error = err;
      });
  }

  return { data: vodChannels, error: error };
};

const addVodEndTime = async followedStreamVods => {
  followedStreamVods.map(stream => {
    if (stream.type === "archive") {
      stream.endDate = Util.durationToMs(stream.duration, stream.published_at);
    } else {
      stream.endDate = new Date(stream.published_at);
    }
    return "";
  });
};

const SortAndAddExpire = async (followedStreamVods, vodExpire) => {
  let followedOrderedStreamVods = {};
  followedOrderedStreamVods.data = _.reverse(
    _.sortBy(followedStreamVods, stream => stream.endDate.getTime())
  );
  followedOrderedStreamVods.expire = new Date().setHours(new Date().getHours() + vodExpire);
  followedOrderedStreamVods.loaded = new Date();

  return followedOrderedStreamVods;
};

const axiosConfig = (method, channel, access_token = Util.getCookie("Twitch-access_token")) => {
  return {
    method: method,
    url: `https://api.twitch.tv/helix/videos?`,
    params: {
      user_id: channel,
      period: "month",
      first: 5,
      // type: "archive",
      type: "all",
    },
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Client-ID": process.env.REACT_APP_TWITCH_CLIENT_ID,
    },
  };
};

const fetchVodsFromMonitoredChannels = async (vodChannels, setTwitchToken, setRefreshToken) => {
  let followedStreamVods = [];

  const PromiseAllVods = await Promise.all(
    vodChannels.map(async channel => {
      followedStreamVods = await axios(axiosConfig("get", channel)).then(response => {
        return response.data.data;
      });

      return followedStreamVods;
    })
  ).catch(async () => {
    return await reauthenticate(setTwitchToken, setRefreshToken).then(async access_token => {
      const channelFetchedVods = [
        ...new Set(
          followedStreamVods.map(vod => {
            return vod.user_id;
          })
        ),
      ];

      const channelsIdsUnfetchedVods = await vodChannels.filter(channel => {
        return !channelFetchedVods.includes(channel);
      });

      return await Promise.all(
        channelsIdsUnfetchedVods.map(async channel => {
          return await axios(axiosConfig("get", channel, access_token)).then(response => {
            return response.data.data;
          });
        })
      );
    });
  });

  const AllVods = PromiseAllVods.flat(1);

  console.log("fetchVodsFromMonitoredChannels -> AllVods", AllVods);
  return AllVods;
};

async function getFollowedVods(
  forceRun,
  AuthKey,
  Username,
  twitchUserId,
  setRefreshToken,
  setTwitchToken
) {
  const thresholdDate = 1; // Number of months
  const vodExpire = 3; // Number of days

  try {
    const OnlyVodsAfterDate = new Date();
    OnlyVodsAfterDate.setDate(new Date().getDate() - thresholdDate);

    if (
      !localStorage.getItem(`Twitch-vods`) ||
      JSON.parse(localStorage.getItem("Twitch-vods")).expire <= new Date() ||
      forceRun
    ) {
      try {
        const followedChannels = await getFollowedChannels(twitchUserId);

        const FollowedChannelVods = await FetchMonitoredVodChannelsList(Username, AuthKey);

        const vodChannels = await monitoredChannelNameToId(followedChannels, FollowedChannelVods);

        const followedStreamVods = await fetchVodsFromMonitoredChannels(
          vodChannels.data,
          setTwitchToken,
          setRefreshToken
        );

        const videos = await AddVideoExtraData({
          data: {
            data: followedStreamVods,
          },
        });

        await addVodEndTime(videos.data);

        const followedOrderedStreamVods = await SortAndAddExpire(videos.data, vodExpire);

        localStorage.setItem(`Twitch-vods`, JSON.stringify(followedOrderedStreamVods));

        return {
          data: followedOrderedStreamVods,
          vodError: vodChannels.error,
        };
      } catch (error) {
        console.error(error);
        return {
          data: JSON.parse(localStorage.getItem("Twitch-vods")),
          error: error,
        };
      }
    }
    return { data: JSON.parse(localStorage.getItem("Twitch-vods")) };
  } catch (error) {
    console.error("message: ", error.message);
    return {
      data: JSON.parse(localStorage.getItem("Twitch-vods")),
      error: error,
    };
  }
}

export default getFollowedVods;
