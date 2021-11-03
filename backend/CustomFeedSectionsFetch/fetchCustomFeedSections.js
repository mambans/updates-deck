'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const { validateAuthkey } = require('../authkey');
const client = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

module.exports = async ({ authkey }) => {
  const username = await validateAuthkey(authkey);

  if (username) {
    const res = await client
      .get({
        TableName: process.env.CUSTOM_FEED_SECTIONS,
        Key: { Username: username },
      })
      .promise();

    console.log('res', res);

    return res;
  }
};
