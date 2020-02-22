import React, { useEffect, useState, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import uniqid from "uniqid";

import Utilities from "../../utilities/Utilities";
import ErrorHandeling from "./../error/Error";

function TwitchAuth() {
  const [error, setError] = useState();

  const initiateAuth = useCallback(async () => {
    async function generateOrginState() {
      return uniqid();
    }

    async function setStateCookie() {
      document.cookie = `Twitch-myState=${orginState}; path=/`;
    }

    const orginState = await generateOrginState();
    await setStateCookie();

    window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.REACT_APP_TWITCH_CLIENT_ID}&redirect_uri=http://notifies.mambans.com.s3-website.eu-north-1.amazonaws.com/auth/twitch/callback&scope=channel:read:subscriptions+user:edit+user:read:broadcast+user_follows_edit&response_type=code&state=${orginState}`;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);

        url.href === "http://notifies.mambans.com.s3-website.eu-north-1.amazonaws.com/auth/twitch"
          ? await initiateAuth()
          : setError({ message: "Visit account page to authenticate with Twitch." });
      } catch (error) {
        setError(error);
      }
    })();
  }, [initiateAuth]);

  if (error) {
    return <ErrorHandeling data={error}></ErrorHandeling>;
  } else {
    return (
      <Spinner animation='border' role='status' style={Utilities.loadingSpinner}>
        <span className='sr-only'>Loading...</span>
      </Spinner>
    );
  }
}

export default TwitchAuth;
