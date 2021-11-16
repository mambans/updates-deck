const DynamoDB = require('aws-sdk/clients/dynamodb');
const { validateAuthkey } = require('../authkey');
const client = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

module.exports = async ({ authkey }) => {
  const username = await validateAuthkey(authkey);

  if (username) {
    return await client
      .update({
        TableName: process.env.TWITCH_DATA_TABLE,
        Key: { Username: username },
        UpdateExpression: `REMOVE #user, #refresh_token, #access_token`,
        ExpressionAttributeNames: {
          '#user': 'user',
          '#refresh_token': 'refresh_token',
          '#access_token': 'access_token',
        },
      })
      .promise();
  }
};
