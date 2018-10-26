import React, {Component} from "react";
import PropTypes from "prop-types";
import MainNav from "components/MainNav";
import "./App.css";

export default class App extends Component {

  getChildContext() {
    return {
      router: this.props.router
    };
  }

  render() {
    const {children} = this.props;

    return (
      <div className="outer-container">

        <MainNav />

        {/* main content */}
        {/*<main className="main-container" role="main">
          { children }
        </main>*/}

        {/* footer */}
        {/*<footer role="contentinfo">
          Footer
        </footer>*/}
      </div>
    );
  }

}

App.childContextTypes = {
  router: PropTypes.object
};
