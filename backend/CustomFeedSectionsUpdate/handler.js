'use strict';

const updateCustomFeedSections = require('./updateCustomFeedSections');

exports.handler = async (event) => {
  try {
    const { data, name } = JSON.parse(event.body);

    if (!data) throw new Error('`Column value` is required');
    if (!name) throw new Error('`Column name` is required');
    // if (!authkey) throw new Error('`Authkey` is required');

    const res = await updateCustomFeedSections({
      data,
      name,
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
