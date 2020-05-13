"use strict";

const reAuthenticateTwitch = require("./reAuthenticateTwitch");

exports.handler = async (event) => {
  try {
    const { refresh_token } = JSON.parse(event.body);

    if (!refresh_token) throw new Error("refresh_token` is required");

    const res = await reAuthenticateTwitch({
      refresh_token,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(res),
      headers: {
        "Access-Control-Allow-Origin": "https://aiofeed.com",
      },
    };
  } catch (e) {
    console.log("TCL: e", e);
    return {
      statusCode: 422,
      headers: {
        "Access-Control-Allow-Origin": "https://aiofeed.com",
      },
      // body: JSON.stringify(res.data),
    };
  }
};
