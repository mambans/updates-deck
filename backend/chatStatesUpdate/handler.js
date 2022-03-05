'use strict';

const chatStatesUpdate = require('./chatStatesUpdate');

exports.handler = async (event) => {
  try {
    const { data, authkey } = JSON.parse(event.body);
    console.log('data:', data);

    if (!data) throw new Error('`Data` is required');
    if (!id) throw new Error('`Id` is required');
    if (!authkey) throw new Error('`Authkey` is required');

    const res = await chatStatesUpdate({
      data,
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
