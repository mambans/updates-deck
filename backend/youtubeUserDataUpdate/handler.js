'use strict';

const youtubeUserDataUpdate = require('./youtubeUserDataUpdate');

exports.handler = async (event) => {
  try {
    const { authkey, data, access_token, refresh_token } = JSON.parse(event.body);

    if (!authkey) throw new Error('`authkey` is required');

    const res = await youtubeUserDataUpdate({
      data,
      access_token,
      refresh_token,
      authkey,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(res),
      headers: {
        'Access-Control-Allow-Origin': 'https://aiofeed.com',
      },
    };
  } catch (e) {
    console.log('TCL: e', e);
    return {
      statusCode: 422,
      headers: {
        'Access-Control-Allow-Origin': 'https://aiofeed.com',
      },
      // body: JSON.stringify(res.data),
    };
  }
};
