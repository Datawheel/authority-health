import React, {Component} from "react";
import PropTypes from "prop-types";
import "./App.css";

export default class App extends Component {

  getChildContext() {
    return {
      router: this.props.router
    };
  }

  render() {
    return (
      <div>
        { this.props.children }
      </div>
    );
  }

}

App.childContextTypes = {
  router: PropTypes.object
};
