import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home/Home";
import Profile from "pages/Profile/Profile";
import Visualize from "pages/Visualize/Visualize";
import About from "pages/About/About";

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      <Route path="/profile(/:id)" component={Profile} />
      <Route path="/charts" component={Visualize} />
      <Route path="/about" component={About} />
    </Route>
  );
}
