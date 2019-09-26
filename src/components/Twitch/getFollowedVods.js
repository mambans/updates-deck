import axios from "axios";
import _ from "lodash";
import getFollowedChannels from "./GetFollowedChannels";

import Utilities from "./../../utilities/Utilities";

// async function getFollowedVods(FollowedChannels, forceRun) {
async function getFollowedVods(forceRun) {
  const thresholdDate = 1;
  const vodExpire = 3;

  try {
    // const reqVodChannels = await axios.get(`http://localhost:3100/notifies/vod-channels`);
    // const FollowedChannelVods = reqVodChannels.data.channels.map(channel => {
    //   return channel.name;
    // });

    const followedStreamVods = [];
    const today = new Date();
    const OnlyVodsAfterDate = new Date();
    OnlyVodsAfterDate.setDate(today.getDate() - thresholdDate);

    // const vodChannels = FollowedChannels.data.data
    //   .map(channel => {
    //     if (FollowedChannelVods.includes(channel.to_name.toLowerCase())) {
    //       return channel.to_id;
    //     }
    //     return null;
    //   })
    //   .filter(channel => {
    //     return channel !== null;
    //   });

    let response = null;
    if (
      !localStorage.getItem(`Twitch-vods`) ||
      JSON.parse(localStorage.getItem("Twitch-vods")).expire <= new Date() ||
      forceRun
    ) {
      try {
        const followedChannels = await getFollowedChannels();
        const reqVodChannels = await axios.get(`http://localhost:3100/notifies/vod-channels`);
        const FollowedChannelVods = reqVodChannels.data.channels.map(channel => {
          return channel.name;
        });

        const vodChannels = followedChannels.data.data
          .map(channel => {
            if (FollowedChannelVods.includes(channel.to_name.toLowerCase())) {
              return channel.to_id;
            }
            return null;
          })
          .filter(channel => {
            return channel !== null;
          });

        await Promise.all(
          vodChannels.map(async channel => {
            response = await axios.get(`https://api.twitch.tv/helix/videos?`, {
              params: {
                user_id: channel,
                first: 3,
                period: "week",
                type: "archive",
              },
              headers: {
                Authorization: `Bearer ${Utilities.getCookie("Twitch-access_token")}`,
                "Client-ID": process.env.REACT_APP_TWITCH_CLIENT_ID,
              },
            });

            response.data.data.forEach(vod => {
              followedStreamVods.push(vod);
            });
          })
        );

        let followedOrderedStreamVods = {};
        followedOrderedStreamVods.data = _.reverse(
          _.sortBy(followedStreamVods, d => d.published_at)
        );
        followedOrderedStreamVods.expire = new Date().setHours(new Date().getHours() + vodExpire);

        localStorage.setItem(
          `Twitch-vods`,
          JSON.stringify({
            data: followedOrderedStreamVods.data,
            expire: followedOrderedStreamVods.expire,
          })
        );
      } catch (error) {
        console.error(error.message);
        // return error;
      }
    }
    return { data: JSON.parse(localStorage.getItem("Twitch-vods")) };
  } catch (error) {
    console.error("message: ", error.message);
    return { data: JSON.parse(localStorage.getItem("Twitch-vods")), error: error };
  }
}

export default getFollowedVods;
