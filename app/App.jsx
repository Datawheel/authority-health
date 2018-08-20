import React, {Component} from "react";
import PropTypes from "prop-types";
import {Canon} from "datawheel-canon";
import "./App.css";

export default class App extends Component {

  getChildContext() {
    return {
      router: this.props.router
    };
  }

  render() {
    return (
      <Canon>
        { this.props.children }
      </Canon>
    );
  }

}

App.childContextTypes = {
  router: PropTypes.object
};
