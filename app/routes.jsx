import React from "react";
import {Route, IndexRoute, browserHistory} from "react-router";

import App from "./App";
import Home from "./pages/Home";
import Profile from "pages/Profile";
import Visualize from "components/Visualize";

export default function RouteCreate() {
  return (
    <Route path="/" component={App} history={browserHistory}>
      <IndexRoute component={Home} />
      <Route path="/profile(/:id)" component={Profile} />
      <Route path="/visualize" component={Visualize} />
    </Route>
  );
}
