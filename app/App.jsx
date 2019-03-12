import React, {Component} from "react";
import PropTypes from "prop-types";
import MainNav from "./components/MainNav";
import Footer from "./components/Footer";
import "./App.css";

export default class App extends Component {

  getChildContext() {
    return {
      router: this.props.router
    };
  }

  render() {
    const {children, location, router} = this.props;
    const path = location.pathname;
    // console.log(path);

    // MainNav config
    let compactNav = true;
    let solidBackground = false;

    if (path === "/") {
      compactNav = false;
    }
    if (path === "charts" || path === "about") {
      solidBackground = true;
    }

    return (
      <div className="outer-container">
        <MainNav compact={compactNav} bg={solidBackground} />
        <main className="main-container" role="main">
          { children }
        </main>
        <Footer />
      </div>
    );
  }

}

App.childContextTypes = {
  router: PropTypes.object
};
