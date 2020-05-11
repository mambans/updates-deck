const axios = require("axios");

const DynamoDB = require("aws-sdk/clients/dynamodb");
const client = new DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const AES = require("crypto-js/aes");
const enc = require("crypto-js/enc-utf8");

module.exports = async ({ code, authkey, username }) => {
  console.log("username", username);

  const AccountInfo = await client
    .get({
      TableName: process.env.USERNAME_TABLE,
      Key: { Username: username },
    })
    .promise();

  if (authkey !== AccountInfo.Item.AuthKey) throw new Error("Invalid AuthKey");
  if (code === "undefined" && !AccountInfo.Item.YoutubeRefreshToken) {
    throw new Error(
      "Invalid request, no refresh token found in database. Require an code={authorizationCode} as param for the first authtication."
    );
  }

  if (authkey === AccountInfo.Item.AuthKey) {
    if (code !== "undefined") {
      return await axios
        .post("https://oauth2.googleapis.com/token", {
          client_id: process.env.YOUTUBE_CLIENT_ID,
          client_secret: process.env.YOUTUBE_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: "https://aiofeed.com/auth/youtube/callback",
        })
        .then(async (res) => {
          const encrypted_AccessToken = await AES.encrypt(
            res.data.access_token,
            "AccessToken"
          ).toString();
          const encrypted_RefreshToken = await AES.encrypt(
            res.data.refresh_token,
            "RefreshToken"
          ).toString();

          await client
            .update({
              TableName: process.env.USERNAME_TABLE,
              Key: { Username: AccountInfo.Item.Username },
              UpdateExpression: `set #AccessToken = :Access_token, #RefreshToken = :Refresh_token`,
              ExpressionAttributeNames: {
                "#AccessToken": "YoutubeAccessToken",
                "#RefreshToken": "YoutubeRefreshToken",
              },
              ExpressionAttributeValues: {
                ":Access_token": encrypted_AccessToken,
                ":Refresh_token": encrypted_RefreshToken,
              },
            })
            .promise();
          // ConditionExpression: `AuthKey = ${authkey}`,

          return res.data;
        })
        .catch((error) => {
          console.log("error: ", error);
        });
    } else {
      const decryptedRefreshToken = await AES.decrypt(
        AccountInfo.Item.YoutubeRefreshToken,
        "RefreshToken"
      ).toString(enc);

      return await axios
        .post("https://oauth2.googleapis.com/token", {
          client_id: process.env.YOUTUBE_CLIENT_ID,
          client_secret: process.env.YOUTUBE_CLIENT_SECRET,
          refresh_token: decryptedRefreshToken,
          grant_type: "refresh_token",
        })
        .then(async (res) => {
          const encrypted_AccessToken = await AES.encrypt(
            res.data.access_token,
            "AccessToken"
          ).toString();

          await client
            .update({
              TableName: process.env.USERNAME_TABLE,
              Key: { Username: username },
              UpdateExpression: `set #AccessToken = :Access_token`,
              ExpressionAttributeNames: {
                "#AccessToken": "YoutubeAccessToken",
              },
              ExpressionAttributeValues: {
                ":Access_token": encrypted_AccessToken,
              },
            })
            .promise();

          return res.data;
        })
        .catch((error) => {
          console.log("Error: ", error);
        });
    }
  }
};
