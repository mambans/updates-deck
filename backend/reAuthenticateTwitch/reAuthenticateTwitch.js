const DynamoDB = require('aws-sdk/clients/dynamodb');
const client = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const axios = require('axios');
const { validateAuthkey } = require('../authkey');
const { encrypt } = require('../crypto');

module.exports = async ({ refresh_token, authkey }) => {
  const username = await validateAuthkey(authkey);

  const res = await axios
    .post(
      `https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${encodeURI(
        refresh_token
      )}&client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${
        process.env.TWITCH_CLIENT_SECRET
      }&scope=channel:read:subscriptions+user:edit+user:read:broadcast+user_follows_edit+user:edit:follows&response_type=code`
    )
    .then(async (res) => res.data)
    .catch((e) => console.log('reAuthenticateTwitch -> e', e));

  if (username && res) {
    console.log('res.access_token:', res.access_token);
    const encrypted_AccessToken = await encrypt(res.access_token);
    console.log('encrypted_AccessToken:', encrypted_AccessToken);
    const encrypted_RefreshToken = await encrypt(res.refresh_token);

    await client
      .update({
        TableName: process.env.TWITCH_DATA_TABLE,
        Key: { Username: username },
        UpdateExpression: `set  #access_token = :access_token, #refresh_token = :refresh_token`,
        ExpressionAttributeNames: {
          '#access_token': 'access_token',
          '#refresh_token': 'refresh_token',
        },
        ExpressionAttributeValues: {
          ':access_token': encrypted_AccessToken,
          ':refresh_token': encrypted_RefreshToken,
        },
      })
      .promise();
  }

  return res;
};
