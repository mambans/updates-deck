'use strict';

const { parseAuthorization } = require('../parseAuthorization');
const fetchCustomFeedSections = require('./fetchCustomFeedSections');

exports.handler = async (event) => {
  try {
    const { Authorization } = event.headers || {};
    const authData = await parseAuthorization(Authorization);
    const UserId = authData.sub;

    const res = await fetchCustomFeedSections({
      UserId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(res),
      headers: {
        'Access-Control-Allow-Origin': 'https://aiofeed.com',
      },
    };
  } catch (e) {
    return {
      statusCode: 422,
      headers: {
        'Access-Control-Allow-Origin': 'https://aiofeed.com',
      },
      body: JSON.stringify(e),
    };
  }
};
