import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import AccountModal from "../account/AccountModal";
import AccountProvider from "./../account/AccountProvider";
import CreateAccountModal from "../account/CreateAccountModal";
import Feed from "../feed/Feed";
import FeedsProvider from "./../feed/FeedsProvider";
import Footer from "../footer/Footer";
import Home from "../home/Home";
import Legality from "../legality/Legality";
import LoginModal from "../account/LoginModal";
import NavigationBar from "../navigation/Navigation";
import NavigationProvider from "./../navigation/NavigationProvider";
import NoMatch from "./NoMatch";
import NotificationsProvider from "./../notifications/NotificationsProvider";
import Player from "./../twitch/player/Player";
import RenderTopStreams from "../twitch/top/RenderTopStreams";
import streamOnlineWebhook from "../twitch/Twitchwebhooks";
import style from "./Routes.module.scss";
import TwitchAuth from "../auth/TwitchAuth";
import TwitchAuthCallback from "../auth/TwitchAuthCallback";
import YoutubeAuth from "../auth/YoutubeAuth";
import YoutubeAuthCallback from "../auth/YoutubeAuthCallback";

const Routes = () => {
  return (
    <BrowserRouter>
      <NavigationProvider>
        <NotificationsProvider>
          <AccountProvider>
            <FeedsProvider>
              <NavigationBar fixed />
              <Route
                render={({ location }) => {
                  const { key } = location;

                  return (
                    <TransitionGroup component={null}>
                      <CSSTransition key={key} timeout={200} classNames='fade-02'>
                        <main id={style.contentContainer}>
                          <Switch location={location}>
                            <Route exact path='/' component={Home} />
                            <Route exact path='/index' component={Home} />
                            <Route exact path='/home' component={Home} />
                            <Route exact path='/feed' component={Feed} />
                            <Route path='/twitch/live/:channel'>
                              <Player />
                            </Route>
                            <Route path='/twitch/top/:category?'>
                              <RenderTopStreams />
                            </Route>
                            <Route
                              exact
                              path='/twitch/notifications'
                              component={streamOnlineWebhook}
                            />
                            <Route exact path='/auth/youtube' component={YoutubeAuth} />
                            <Route exact path='/auth/twitch' component={TwitchAuth} />
                            <Route
                              exact
                              path='/auth/twitch/callback'
                              render={() => {
                                return <TwitchAuthCallback />;
                              }}
                            />
                            <Route
                              exact
                              path='/auth/youtube/callback'
                              render={() => {
                                return <YoutubeAuthCallback />;
                              }}
                            />
                            <Route
                              exact
                              path='/account'
                              render={() => (
                                <div style={{ width: "1000px", margin: "auto", marginTop: "55px" }}>
                                  return <AccountModal></AccountModal>;
                                </div>
                              )}
                            />
                            <Route
                              exact
                              path='/account/create'
                              render={() => (
                                <div style={{ width: "1000px", margin: "auto", marginTop: "55px" }}>
                                  <CreateAccountModal />
                                </div>
                              )}
                            />
                            <Route
                              exact
                              path='/account/login'
                              render={() => (
                                <div style={{ width: "1000px", margin: "auto", marginTop: "55px" }}>
                                  <LoginModal />;
                                </div>
                              )}
                            />
                            <Route exact path='/legality' component={Legality} />

                            <Route component={NoMatch} />
                          </Switch>
                        </main>
                      </CSSTransition>
                    </TransitionGroup>
                  );
                }}
              />
              <Footer />
            </FeedsProvider>
          </AccountProvider>
        </NotificationsProvider>
      </NavigationProvider>
    </BrowserRouter>
  );
};

export default Routes;
