import { getLocalstorage } from '../../util';
import TwitchAPI from './API';

const getGameDetails = async (items = []) => {
  // Removes game id duplicates before sending game request.
  const gamesNonDuplicates = [
    ...new Set(
      items.map((channel) => {
        return channel?.game_id;
      })
    ),
  ].filter((game) => game);

  const cachedGameInfo = getLocalstorage('Twitch_game_details') || { data: [] };
  const filteredCachedGames = cachedGameInfo.data.filter((game) => game);
  const unCachedGameDetails = gamesNonDuplicates.filter((game) => {
    return !filteredCachedGames?.find((cachedGame) => cachedGame.id === game);
  });

  const games = cachedGameInfo?.expire > Date.now() ? unCachedGameDetails : gamesNonDuplicates;

  if (Array.isArray(games) && Boolean(games?.length)) {
    return TwitchAPI.getGames({
      id: games,
    })
      .then((res) => {
        const filteredOutNulls = res.data?.data.filter((game) => game);
        localStorage.setItem(
          'Twitch_game_details',
          JSON.stringify({
            data: [...(filteredCachedGames || []), ...(filteredOutNulls || [])],
            expire:
              cachedGameInfo?.expire > Date.now()
                ? cachedGameInfo.expire
                : Date.now() + 7 * 24 * 60 * 60 * 1000,
          })
        );
        return [...(filteredCachedGames || []), ...(filteredOutNulls || [])];
      })
      .catch((error) => {
        console.log(error);
        return filteredCachedGames;
      });
  }
  return filteredCachedGames;
};

/**
 * @param {Object} items - Object of Streams/Videos/Clips. (With items.data[] )
 * @async
 * @returns
 */
const fetchGameName = async ({ items }) => {
  const originalArray = items;

  const gameNames = await getGameDetails(originalArray.data);

  const objWithGameName = await originalArray.data.map((stream) => {
    const foundGame = gameNames.find((game) => {
      return game?.id === stream?.game_id;
    });
    stream.game_name = foundGame ? foundGame.name : '';
    return stream;
  });

  const finallObj = await objWithGameName.map((stream) => {
    const foundGame = gameNames.find((game) => {
      return game?.id === stream?.game_id;
    });
    stream.game_img = foundGame
      ? foundGame.box_art_url
      : stream.game_name === ''
      ? ''
      : `${process.env.PUBLIC_URL}/images/webp/placeholder.webp`;

    return stream;
  });

  return finallObj;
};
export default fetchGameName;
