import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home/Home";
import Profile from "pages/Profile/Profile";
import Visualize from "pages/Visualize/Visualize";
import About from "pages/About/About";
import places from "utils/places";

/** */
function checkForId(nextState, replaceState) {
  if (!nextState.params.id) {

    const reqestedUrl = nextState.location.pathname;
    const randId = places[Math.floor(Math.random() * places.length)];

    const nextUrl = reqestedUrl.slice(-1) === "/"
      ? `${reqestedUrl}${randId}`
      : `${reqestedUrl}/${randId}`;

    replaceState(`/${nextUrl}`);

  }
}

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      <Route path="/profile(/:id)" onEnter={checkForId} component={Profile} />
      <Route path="/charts" component={Visualize} />
      <Route path="/about" component={About} />
    </Route>
  );
}
