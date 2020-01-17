"use strict";

const login = require("./login");

const handler = async event => {
  try {
    const { username, password } = JSON.parse(event.body);
    if (!username) throw { statusCode: 422, message: "Username is required" };
    if (!password) throw { statusCode: 422, message: "Password is required" };
    // if (!username) throw new Error("`Username` is required");
    // if (!password) throw new Error("`Password` is required");

    // const res = await login({ username: "foobar", password: "password123" });
    const result = await login({ username, password }).then(res => {
      console.log("TCL: res", res);
      return {
        statusCode: res.statusCode,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(res.data),
      };
    });

    return result;
  } catch (e) {
    console.log("TCL: e", e);
    return {
      statusCode: e.statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(e),
    };
  }
};

exports.handler = handler;
