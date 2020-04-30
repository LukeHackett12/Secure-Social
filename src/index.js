import React from "react";
import ReactDOM from "react-dom";
import { Route, HashRouter as Router } from "react-router-dom";

import "./assets/css/index.css";
import "./assets/bootstrap/css/bootstrap.min.css";
import "./assets/fonts/fontawesome-all.min.css";

import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Contacts from "./pages/Contacts";
import * as serviceWorker from "./serviceWorker";

const routing = (
  <Router>
    <div>
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/contacts" component={Contacts} />
    </div>
  </Router>
);
ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
